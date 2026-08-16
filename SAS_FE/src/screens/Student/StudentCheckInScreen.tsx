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

  // ─── Check-in flow ────────────────────────────────────────────────────────
  const [step, setStep] = useState<CheckInStep>('camera');
  const [submittingMsg, setSubmittingMsg] = useState('Đang gửi dữ liệu điểm danh...');
  const [result, setResult] = useState<{
    success: boolean;
    title: string;
    description: string;
    statusText?: string;
    confidence?: number;
  } | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestGps = useCallback(async () => {
    setGpsStatus('acquiring');

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Quyền truy cập vị trí',
          message: 'SAS Mobile cần GPS để xác minh bạn đang trong khuôn viên trường.',
          buttonPositive: 'Cho phép',
          buttonNegative: 'Từ chối',
          buttonNeutral: 'Hỏi lại sau',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setGpsStatus('denied');
        return;
      }
    }

    Geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus('ready');
      },
      (_err) => {
        setGpsStatus('error');
        Alert.alert('Lỗi GPS', 'Không lấy được tọa độ. Bật GPS và thử lại.', [
          { text: 'Thử lại', onPress: requestGps },
          { text: 'Bỏ qua', style: 'cancel' },
        ]);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, []);

  // ── Acquire GPS on mount ──────────────────────────────────────────────────
  useEffect(() => {
    requestGps();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [requestGps]);

  // ── Called by FaceCamera when face auto-captured ──────────────────────────
  const handleFaceCaptured = async (data: { base64: string; uri: string }) => {
    if (!session) { Alert.alert('Lỗi', 'Không tìm thấy thông tin buổi học.'); return; }

    if (gpsStatus !== 'ready' || !gpsCoords) {
      Alert.alert(
        'GPS chưa sẵn sàng',
        'Đang chờ lấy tọa độ. Thử lại sau vài giây.',
        [{ text: 'Thử lại GPS', onPress: requestGps }, { text: 'OK', style: 'cancel' }],
      );
      return;
    }

    setStep('submitting');
    setSubmittingMsg('Đang gửi dữ liệu điểm danh lên server...');

    try {
      const queued = await studentApi.submitCheckIn({
        sessionId: session.sessionId,
        checkInMethod: 'FACE_SCAN',
        gpsLat: gpsCoords.lat,
        gpsLng: gpsCoords.lng,
        imageBase64: data.base64,
      });

      const jobId = queued.jobId;
      setSubmittingMsg('Đang xác minh Network IP, GPS và AI khuôn mặt...');

      let attempts = 0;
      const maxAttempts = 15;

      pollingRef.current = setInterval(async () => {
        attempts++;

        if (attempts > maxAttempts) {
          clearInterval(pollingRef.current!);
          setStep('result');
          setResult({
            success: false,
            title: 'Quá thời gian chờ',
            description: 'AI xử lý quá lâu. Vui lòng thử lại.',
          });
          return;
        }

        try {
          const status: JobStatusResponse = await studentApi.getJobStatus(jobId);

          if (status.status === 'completed') {
            clearInterval(pollingRef.current!);
            const isLate = status.result?.status === 'late';
            setStep('result');
            setResult({
              success: true,
              title: isLate ? 'Điểm danh muộn' : 'Điểm danh thành công!',
              description: `Đã xác nhận điểm danh ${session.subjectName} (${session.roomName}).`,
              statusText: isLate ? 'LATE' : 'PRESENT',
              confidence: status.result?.confidence
                ? Math.round(status.result.confidence * 100)
                : 98,
            });
          } else if (status.status === 'failed') {
            clearInterval(pollingRef.current!);
            setStep('result');
            setResult({
              success: false,
              title: 'Xác minh thất bại',
              description: status.error || 'Khuôn mặt không khớp hoặc phát hiện gian lận.',
            });
          } else {
            setSubmittingMsg(`AI đang phân tích dữ liệu... (${attempts}s)`);
          }
        } catch (pollErr: any) {
          if (attempts >= 5) {
            clearInterval(pollingRef.current!);
            setStep('result');
            setResult({
              success: false,
              title: 'Lỗi kết nối',
              description: pollErr.response?.data?.message || 'Không nhận được kết quả từ server.',
            });
          }
        }
      }, 1500);
    } catch (err: any) {
      setStep('camera');
      Alert.alert('Lỗi', err.response?.data?.message || 'Gửi điểm danh thất bại. Kiểm tra kết nối.');
    }
  };

  // ─── GPS status row ───────────────────────────────────────────────────────
  const gpsColor = gpsStatus === 'ready' ? '#059669' : gpsStatus === 'acquiring' ? '#D97706' : '#DC2626';
  const gpsText =
    gpsStatus === 'ready' ? `${gpsCoords?.lat.toFixed(4)}, ${gpsCoords?.lng.toFixed(4)} ✓`
    : gpsStatus === 'acquiring' ? 'Đang lấy tọa độ GPS...'
    : gpsStatus === 'denied' ? 'Quyền GPS bị từ chối'
    : 'Lỗi GPS — nhấn để thử lại';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="chevron-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điểm danh 3 lớp</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Session card */}
        <View style={styles.sessionCard}>
          <Text style={styles.subjectName}>{session?.subjectName || 'Buổi học'}</Text>
          <Text style={styles.subjectCode}>{session?.subjectCode}</Text>
          <View style={styles.sessionMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Phòng</Text>
              <Text style={styles.metaVal}>{session?.roomName}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Thời gian</Text>
              <Text style={styles.metaVal}>{session?.startTime} – {session?.endTime}</Text>
            </View>
          </View>
        </View>

        {/* 3-layer checklist */}
        <View style={styles.layersCard}>
          <Text style={styles.cardTitle}>3 lớp xác minh</Text>

          <View style={styles.layerRow}>
            <Text style={styles.layerEmoji}>🌐</Text>
            <View style={styles.layerInfo}>
              <Text style={styles.layerTitle}>1. Mạng campus (IP)</Text>
              <Text style={styles.layerDesc}>Server tự động kiểm tra subnet</Text>
            </View>
            <AppIcon name="checkmark-circle-outline" size={18} color="#059669" />
          </View>

          <TouchableOpacity
            style={styles.layerRow}
            onPress={gpsStatus !== 'ready' ? requestGps : undefined}
            activeOpacity={gpsStatus !== 'ready' ? 0.7 : 1}>
            <Text style={styles.layerEmoji}>📍</Text>
            <View style={styles.layerInfo}>
              <Text style={styles.layerTitle}>2. GPS Geofence</Text>
              <Text style={[styles.layerDesc, { color: gpsColor }]}>{gpsText}</Text>
            </View>
            {gpsStatus === 'acquiring' ? (
              <ActivityIndicator size="small" color="#D97706" />
            ) : (
              <AppIcon
                name={gpsStatus === 'ready' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                size={18}
                color={gpsColor}
              />
            )}
          </TouchableOpacity>

          <View style={[styles.layerRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.layerEmoji}>👤</Text>
            <View style={styles.layerInfo}>
              <Text style={styles.layerTitle}>3. AI khuôn mặt (Auto)</Text>
              <Text style={styles.layerDesc}>Nhìn vào camera — tự động chụp</Text>
            </View>
            <AppIcon name="hardware-chip-outline" size={18} color="#7C3AED" />
          </View>
        </View>

        {/* Face Camera — auto detect & capture, no button */}
        <View style={styles.cameraCard}>
          <FaceCamera
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
            <Text style={styles.processingTitle}>Đang xác minh điểm danh</Text>
            <Text style={styles.processingMsg}>{submittingMsg}</Text>
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
      <Modal visible={step === 'result'} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.resultCard}>
            <View style={[styles.resultIcon, result?.success ? styles.iconSuccess : styles.iconError]}>
              <AppIcon
                name={result?.success ? 'checkmark-circle-outline' : 'close-circle'}
                size={44}
                color={result?.success ? '#059669' : '#DC2626'}
              />
            </View>
            <Text style={styles.resultTitle}>{result?.title}</Text>
            <Text style={styles.resultDesc}>{result?.description}</Text>

            {result?.success && result.confidence && (
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  AI Confidence: {result.confidence}%
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.resultBtn, result?.success ? styles.btnSuccess : styles.btnError]}
              onPress={() => {
                if (result?.success) {
                  navigation.goBack();
                } else {
                  setStep('camera');
                  setResult(null);
                }
              }}
              activeOpacity={0.85}>
              <Text style={styles.resultBtnText}>
                {result?.success ? 'Xong & Quay lại' : 'Thử lại'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  scroll: { padding: 16, paddingBottom: 40 },
  sessionCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0',
  },
  subjectName: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  subjectCode: { fontSize: 13, fontWeight: '700', color: '#0D9488', marginTop: 2, marginBottom: 10 },
  sessionMeta: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  metaItem: { flex: 1 },
  metaLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', textTransform: 'uppercase' },
  metaVal: { fontSize: 13, fontWeight: '700', color: '#334155', marginTop: 2 },
  layersCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0',
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  layerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  layerEmoji: { fontSize: 18, width: 28, textAlign: 'center' },
  layerInfo: { flex: 1 },
  layerTitle: { fontSize: 13, fontWeight: '700', color: '#0F172A' },
  layerDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  cameraCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.6)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  processingCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 28,
    alignItems: 'center', width: '100%', maxWidth: 320,
  },
  processingTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginTop: 16 },
  processingMsg: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 18 },
  resultCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24,
    alignItems: 'center', width: '100%', maxWidth: 340,
  },
  resultIcon: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  iconSuccess: { backgroundColor: '#DCFCE7' },
  iconError: { backgroundColor: '#FEE2E2' },
  resultTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  resultDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 8, lineHeight: 19 },
  confidenceBadge: {
    backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: '#BBF7D0', marginTop: 10,
  },
  confidenceText: { fontSize: 12, fontWeight: '700', color: '#15803D' },
  resultBtn: {
    width: '100%', paddingVertical: 12, borderRadius: 10,
    alignItems: 'center', marginTop: 20,
  },
  btnSuccess: { backgroundColor: '#0D9488' },
  btnError: { backgroundColor: '#DC2626' },
  resultBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});

export default StudentCheckInScreen;
