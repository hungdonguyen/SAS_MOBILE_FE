import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import AppIcon from '../../components/Icon/AppIcon';
import FaceCamera from '../../components/FaceCamera';
import { studentApi } from '../../services/studentApi';
import { getErrorMessage } from '../../utils/errors';
import { TodaySessionDto, JobStatusResponse } from '../../types/studentTypes';

interface Props {
  navigation: any;
  route: { params: { session: TodaySessionDto } };
}

type CheckInStep = 'camera' | 'submitting' | 'result';

const StudentCheckInScreen: React.FC<Props> = ({ navigation, route }) => {
  const session = route.params?.session;

  // ─── GPS ──────────────────────────────────────────────────────────────────
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'ready' | 'denied' | 'error'>('acquiring');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const gpsCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const gpsStatusRef = useRef<'acquiring' | 'ready' | 'denied' | 'error'>('acquiring');

  // ─── Check-in flow ────────────────────────────────────────────────────────
  const [step, setStep] = useState<CheckInStep>('camera');
  const [submittingMsg, setSubmittingMsg] = useState('Submitting attendance data...');
  const [result, setResult] = useState<{
    success: boolean;
    title: string;
    description?: string;
    statusText?: string;
    confidence?: number;
  } | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cameraRef = useRef<any>(null);

  const onGpsSuccess = useCallback((pos: any) => {
    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    console.log('[GPS] Acquired coords:', coords.lat, coords.lng);
    gpsCoordsRef.current = coords;
    gpsStatusRef.current = 'ready';
    setGpsCoords(coords);
    setGpsStatus('ready');
  }, []);

  const requestGps = useCallback(async () => {
    setGpsStatus('acquiring');
    gpsStatusRef.current = 'acquiring';

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
        const fineGranted =
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;
        const coarseGranted =
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;

        if (!fineGranted && !coarseGranted) {
          gpsStatusRef.current = 'denied';
          setGpsStatus('denied');
          return;
        }
      } catch (permErr) {
        console.log('[GPS] Permission error:', permErr);
        gpsStatusRef.current = 'error';
        setGpsStatus('error');
        return;
      }
    }

    // 1. Fetch immediately via low accuracy / cached / mock location
    Geolocation.getCurrentPosition(
      onGpsSuccess,
      () => {
        // 2. Fallback to high accuracy if needed
        Geolocation.getCurrentPosition(
          onGpsSuccess,
          (err) => {
            console.log('[GPS] All position requests failed:', err);
            gpsStatusRef.current = 'error';
            setGpsStatus('error');
          },
          { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 },
        );
      },
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 300000 },
    );
  }, [onGpsSuccess]);

  // ── Acquire GPS on mount & continuous tracking ────────────────────────────
  useEffect(() => {
    requestGps();

    let watchId: number | null = null;
    try {
      watchId = Geolocation.watchPosition(
        onGpsSuccess,
        (err) => console.log('[GPS watch update]', err?.message),
        { enableHighAccuracy: false, distanceFilter: 1, interval: 2000, fastestInterval: 1000 },
      );
    } catch (e) {
      console.log('[GPS] watchPosition error:', e);
    }

    return () => {
      if (watchId !== null) Geolocation.clearWatch(watchId);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [requestGps, onGpsSuccess]);

  // ── Called by FaceCamera when face auto-captured ──────────────────────────
  const handleFaceCaptured = async (data: { base64: string; uri: string }) => {
    if (!session) { Alert.alert('Error', 'Class session not found.'); return; }

    let targetCoords = gpsCoordsRef.current;

    // If GPS is not ready yet, give it up to 3 seconds to resolve before failing
    if (!targetCoords) {
      setStep('submitting');
      setSubmittingMsg('Acquiring GPS coordinates...');
      for (let i = 0; i < 6; i++) {
        await new Promise<void>((resolve) => setTimeout(resolve, 500));
        if (gpsCoordsRef.current) {
          targetCoords = gpsCoordsRef.current;
          break;
        }
      }
    }

    if (!targetCoords) {
      setStep('camera');
      Alert.alert(
        'GPS Not Ready',
        'GPS coordinates not acquired yet. Please check device location services or set location in emulator and try again.',
        [
          {
            text: 'Retry',
            onPress: () => {
              cameraRef.current?.reset();
              requestGps();
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => cameraRef.current?.reset(),
          },
        ],
      );
      return;
    }

    setStep('submitting');
    setSubmittingMsg('Submitting attendance data to server...');

    try {
      const queued = await studentApi.submitCheckIn({
        sessionId: session.sessionId,
        gpsLat: targetCoords.lat,
        gpsLng: targetCoords.lng,
        imageBase64: data.base64,
      });

      const jobId = queued.jobId;
      setSubmittingMsg('Verifying Network IP, GPS, and Face Biometrics...');

      let attempts = 0;
      const maxAttempts = 15;

      pollingRef.current = setInterval(async () => {
        attempts++;

        if (attempts > maxAttempts) {
          clearInterval(pollingRef.current!);
          setStep('result');
          setResult({
            success: false,
            title: 'Request Timed Out',
            description: 'AI processing took too long. Please try again.',
          });
          return;
        }

        try {
          const status = await studentApi.getJobStatus(jobId);

          if (status.status === 'present' || status.attendanceStatus === 'present' || status.attendanceStatus === 'late') {
            clearInterval(pollingRef.current!);
            const isLate = status.attendanceStatus === 'late';
            setStep('result');
            setResult({
              success: true,
              title: isLate ? 'Checked In (Late)' : 'Checked In Successfully!',
              statusText: isLate ? 'LATE' : 'PRESENT',
              confidence: status.result?.confidence
                ? Math.round(status.result.confidence * 100)
                : 98,
            });
          } else if (status.status === 'absent' || status.status === 'failed') {
            clearInterval(pollingRef.current!);
            
            const reason = status.failureReason || status.error || '';
            
            const errorMap: Record<string, string> = {
              'SESSION_NOT_FOUND': 'Class session not found',
              'NOT_ENROLLED': 'You are not enrolled in this section',
              'IP_NOT_ALLOWED': 'Network IP not allowed (outside campus network)',
              'OUT_OF_RANGE': 'GPS location outside classroom geofence',
              'GPS_MISSING': 'GPS location data missing',
              'INVALID_COORDS': 'Invalid GPS coordinates',
              'ROOM_NOT_FOUND': 'Classroom coordinates not configured',
              'LIVENESS_FAILED': 'Anti-spoofing failed / non-live photo detected',
              'LOW_SIMILARITY': 'Face does not match registered profile',
              'FACE_NOT_FOUND': 'No face detected in photo',
              'MULTIPLE_FACES': 'Multiple faces detected in photo',
              'NOT_REGISTERED': 'Biometric profile not registered',
              'FACE_NOT_REGISTERED': 'Biometric profile not registered',
              'FACE_IMAGE_MISSING': 'Face capture image missing',
              'AI_ERROR': 'AI Facial Recognition processing error',
              'AiServiceUnavailableException': 'AI Service is currently unavailable. Please try again later',
              'TIMEOUT': 'Processing timed out',
              'UNKNOWN_ERROR': 'Unknown error',
            };

            setStep('result');
            setResult({
              success: false,
              title: 'Verification Failed',
              description: errorMap[reason] || reason || 'Face verification failed or spoofing detected.',
            });
          } else {
            setSubmittingMsg(`AI is analyzing data... (${attempts}s)`);
          }
        } catch (pollErr) {
          if (attempts >= 5) {
            clearInterval(pollingRef.current!);
            setStep('result');
            setResult({
              success: false,
              title: 'Connection Error',
              description: getErrorMessage(pollErr),
            });
          }
        }
      }, 1500);
    } catch (err) {
      setStep('camera');
      Alert.alert('Error', getErrorMessage(err), [
        { text: 'OK', onPress: () => cameraRef.current?.reset() }
      ]);
    }
  };

  if (step === 'result') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#ffffff' }]}>
        <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', paddingTop: 60 }} showsVerticalScrollIndicator={false}>
          {/* Main Icon */}
          <View style={{ marginBottom: 32 }}>
            <View style={[styles.resultIcon, result?.success ? styles.iconSuccess : styles.iconError]}>
              <AppIcon
                name={result?.success ? 'checkmark-circle' : 'warning'}
                size={56}
                color={result?.success ? '#10B981' : '#EF4444'}
              />
            </View>
          </View>

          {/* Title & Description */}
          <Text style={[styles.resultTitle, { color: result?.success ? '#064E3B' : '#7F1D1D' }]}>
            {result?.title}
          </Text>
          <Text style={[styles.resultDesc, { color: result?.success ? '#047857' : '#B91C1C', marginBottom: 32 }]}>
            {result?.description}
          </Text>

          {/* Info Card */}
          <View style={[
            styles.infoCard, 
            result?.success ? { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' } : { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }
          ]}>
            <View style={styles.infoRow}>
              <AppIcon name="book-outline" size={20} color={result?.success ? '#059669' : '#DC2626'} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: result?.success ? '#047857' : '#F87171' }]}>Subject</Text>
                <Text style={[styles.infoValue, { color: result?.success ? '#064E3B' : '#450A0A' }]}>{session?.subjectName || '—'}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: result?.success ? '#BBF7D0' : '#FECACA' }]} />

            <View style={styles.infoRow}>
              <AppIcon name="time-outline" size={20} color={result?.success ? '#059669' : '#DC2626'} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: result?.success ? '#047857' : '#F87171' }]}>Time</Text>
                <Text style={[styles.infoValue, { color: result?.success ? '#064E3B' : '#450A0A' }]}>{new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ width: '100%', marginTop: 32, gap: 12 }}>
            {!result?.success && (
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setStep('camera');
                  setResult(null);
                  cameraRef.current?.reset();
                }}
                activeOpacity={0.8}
              >
                <AppIcon name="refresh-outline" size={20} color="#FFFFFF" />
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.backHistoryBtn, result?.success ? { borderColor: '#3B82F6' } : { borderColor: '#E2E8F0' }]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <AppIcon name="calendar-outline" size={20} color={result?.success ? '#2563EB' : '#64748B'} />
              <Text style={[styles.backHistoryBtnText, result?.success ? { color: '#2563EB' } : { color: '#64748B' }]}>
                Back to Attendance History
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="chevron-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Face Attendance Check-In</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Face Camera — auto detect & capture, no button */}
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <FaceCamera
            ref={cameraRef}
            onCapture={handleFaceCaptured}
            isProcessing={step === 'submitting'}
            countdownSeconds={3}
            facing="front"
          />
        </View>
      </ScrollView>

      {/* Submitting overlay */}
      <Modal visible={step === 'submitting'} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.processingTitle}>Verifying Attendance</Text>
            <Text style={styles.processingMsg}>{submittingMsg}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f6ff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  scroll: { padding: 16, paddingBottom: 40 },

  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.6)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  processingCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 28,
    alignItems: 'center', width: '100%', maxWidth: 320,
  },
  processingTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginTop: 16 },
  processingMsg: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 18 },
  resultCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 24,
    alignItems: 'center', width: '100%', maxWidth: 340,
  },
  resultIcon: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  iconSuccess: { backgroundColor: '#d1fae5' },
  iconError: { backgroundColor: '#fee2e2' },
  resultTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  resultDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 19 },
  confidenceBadge: {
    backgroundColor: '#f0fdf4', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0', marginTop: 10,
  },
  confidenceText: { fontSize: 12, fontWeight: '700', color: '#15803d' },
  resultBtn: {
    width: '100%', paddingVertical: 12, borderRadius: 10,
    alignItems: 'center', marginTop: 20,
  },
  btnSuccess: { backgroundColor: '#22c55e' },
  btnError: { backgroundColor: '#ef4444' },
  resultBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  infoCard: {
    width: '100%', borderRadius: 20, borderWidth: 1, padding: 20,
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  infoTextContainer: { flex: 1, marginLeft: 12 },
  infoLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '800' },
  divider: { height: 1, width: '100%', marginVertical: 16 },
  retryBtn: {
    width: '100%', height: 52, borderRadius: 16, backgroundColor: '#2563EB',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  retryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  backHistoryBtn: {
    width: '100%', height: 52, borderRadius: 16, borderWidth: 2, backgroundColor: 'transparent',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  backHistoryBtnText: { fontSize: 15, fontWeight: '700' },
});

export default StudentCheckInScreen;
