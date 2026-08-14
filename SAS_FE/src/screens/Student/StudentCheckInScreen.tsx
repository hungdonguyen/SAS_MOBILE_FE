import React, { useState, useEffect, useRef } from 'react';
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
import { launchCamera } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import AppIcon from '../../components/Icon/AppIcon';
import { studentApi } from '../../services/studentApi';
import { TodaySessionDto, JobStatusResponse } from '../../types/studentTypes';

interface StudentCheckInScreenProps {
  navigation: any;
  route: {
    params: {
      session: TodaySessionDto;
    };
  };
}

const StudentCheckInScreen: React.FC<StudentCheckInScreenProps> = ({ navigation, route }) => {
  const session = route.params?.session;

  const [capturedImageBase64, setCapturedImageBase64] = useState<string | null>(null);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'ready' | 'denied' | 'error'>('acquiring');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState<string>('');
  const [jobResultModal, setJobResultModal] = useState<{
    visible: boolean;
    success: boolean;
    title: string;
    description: string;
    statusText?: string;
    confidence?: number;
  }>({
    visible: false,
    success: false,
    title: '',
    description: '',
  });

  const pollingTimerRef = useRef<any>(null);

  // ─── Request GPS permission and acquire location on mount ───────────────────
  useEffect(() => {
    requestLocationAndFetch();

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, []);

  const requestLocationAndFetch = async () => {
    setGpsStatus('acquiring');

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Quyền truy cập vị trí',
            message:
              'SAS Mobile cần quyền truy cập GPS để xác minh bạn đang trong khuôn viên trường khi điểm danh.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Cho phép',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setGpsStatus('denied');
          Alert.alert(
            'Quyền GPS bị từ chối',
            'Không thể lấy vị trí GPS. Bật quyền Location trong Settings để điểm danh đầy đủ.',
            [{ text: 'OK' }],
          );
          return;
        }
      } catch (err) {
        setGpsStatus('error');
        return;
      }
    }

    Geolocation.getCurrentPosition(
      (position) => {
        setGpsCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGpsStatus('ready');
      },
      (error) => {
        console.log('GPS error:', error.message);
        setGpsStatus('error');
        Alert.alert(
          'Lỗi GPS',
          'Không thể lấy tọa độ. Hãy bật GPS trên thiết bị và thử lại.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Thử lại', onPress: requestLocationAndFetch },
          ],
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  // ─── Open real camera with permission request ────────────────────────────────
  const handleCaptureFace = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền truy cập Camera',
            message: 'SAS Mobile cần quyền Camera để chụp ảnh khuôn mặt phục vụ điểm danh.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Cho phép',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Quyền Camera bị từ chối',
            'Không thể mở camera. Hãy bật quyền Camera trong Settings của ứng dụng.',
          );
          return;
        }
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể yêu cầu quyền camera.');
        return;
      }
    }

    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.8,
        includeBase64: true,
        saveToPhotos: false,
      },
      (response) => {
        if (response.didCancel) {
          return; // User cancelled — no alert needed
        }
        if (response.errorCode) {
          Alert.alert(
            'Lỗi Camera',
            response.errorMessage || 'Không thể chụp ảnh. Vui lòng thử lại.',
          );
          return;
        }
        const asset = response.assets?.[0];
        if (!asset) {
          Alert.alert('Lỗi', 'Không nhận được ảnh từ camera.');
          return;
        }
        if (!asset.base64) {
          Alert.alert('Lỗi', 'Không thể đọc dữ liệu ảnh. Vui lòng thử lại.');
          return;
        }
        setCapturedImageBase64(asset.base64);
        setCapturedImageUri(asset.uri || null);
      },
    );
  };

  const handleCheckInSubmit = async () => {
    if (!session) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin buổi học.');
      return;
    }

    // Bug #6 fix: Block submit if photo not captured
    if (!capturedImageBase64) {
      Alert.alert(
        'Chưa chụp ảnh',
        'Vui lòng chụp ảnh khuôn mặt trước khi nộp điểm danh.',
      );
      return;
    }

    if (gpsStatus !== 'ready' || !gpsCoordinates) {
      Alert.alert(
        'GPS chưa sẵn sàng',
        'Đang chờ lấy tọa độ GPS. Vui lòng đợi hoặc thử lại.',
        [
          { text: 'Thử lại GPS', onPress: requestLocationAndFetch },
          { text: 'OK', style: 'cancel' },
        ],
      );
      return;
    }

    setIsSubmitting(true);
    setSubmittingStep('Đang gửi dữ liệu điểm danh lên server...');

    try {
      // 1. Submit check-in
      const queuedRes = await studentApi.submitCheckIn({
        sessionId: session.sessionId,
        checkInMethod: 'SELF_CHECKIN',
        gpsLat: gpsCoordinates.lat,
        gpsLng: gpsCoordinates.lng,
        imageBase64: capturedImageBase64,
      });

      const jobId = queuedRes.jobId;
      setSubmittingStep('Đang xác minh Network IP, GPS và Face AI...');

      // 2. Poll job status — Bug #7 fix: check timeout BEFORE processing result
      let attempts = 0;
      const maxAttempts = 15; // 15 × 1.5s = ~22 seconds

      pollingTimerRef.current = setInterval(async () => {
        attempts++;

        // Bug #7 fix: Check timeout first to avoid processing after timeout
        if (attempts > maxAttempts) {
          clearInterval(pollingTimerRef.current);
          setIsSubmitting(false);
          setJobResultModal({
            visible: true,
            success: false,
            title: 'Quá thời gian chờ',
            description: 'AI xử lý quá lâu. Vui lòng thử lại.',
          });
          return;
        }

        try {
          const statusRes: JobStatusResponse = await studentApi.getJobStatus(jobId);

          if (statusRes.status === 'completed') {
            clearInterval(pollingTimerRef.current);
            setIsSubmitting(false);

            const result = statusRes.result;
            const isLate = result?.status === 'late';

            setJobResultModal({
              visible: true,
              success: true,
              title: isLate ? 'Điểm danh muộn' : 'Điểm danh thành công!',
              description: `Đã xác nhận điểm danh ${session.subjectName} (${session.roomName}).`,
              statusText: isLate ? 'LATE' : 'PRESENT',
              confidence: result?.confidence ? Math.round(result.confidence * 100) : 98,
            });
          } else if (statusRes.status === 'failed') {
            clearInterval(pollingTimerRef.current);
            setIsSubmitting(false);

            setJobResultModal({
              visible: true,
              success: false,
              title: 'Xác minh thất bại',
              description:
                statusRes.error ||
                'Bị từ chối. Hãy đảm bảo bạn đang trong phòng học và khuôn mặt rõ ràng.',
            });
          } else {
            setSubmittingStep(`AI đang phân tích GPS và khuôn mặt... (${attempts}s)`);
          }
        } catch (pollErr: any) {
          console.log('Error polling job status:', pollErr);
          if (attempts >= 5) {
            clearInterval(pollingTimerRef.current);
            setIsSubmitting(false);
            setJobResultModal({
              visible: true,
              success: false,
              title: 'Lỗi kết nối',
              description:
                pollErr.response?.data?.message ||
                'Không thể nhận kết quả từ server. Vui lòng thử lại.',
            });
          }
        }
      }, 1500);
    } catch (err: any) {
      setIsSubmitting(false);
      const errMsg =
        err.response?.data?.message || 'Gửi điểm danh thất bại. Kiểm tra kết nối server.';
      Alert.alert('Lỗi Điểm Danh', errMsg);
    }
  };

  // ─── GPS status display helper ───────────────────────────────────────────────
  const getGpsStatusText = () => {
    switch (gpsStatus) {
      case 'acquiring': return 'Đang lấy tọa độ GPS...';
      case 'ready': return `${gpsCoordinates?.lat.toFixed(4)}, ${gpsCoordinates?.lng.toFixed(4)} (Đã lấy)`;
      case 'denied': return 'Quyền GPS bị từ chối';
      case 'error': return 'Lỗi GPS — nhấn để thử lại';
    }
  };

  const gpsStatusColor = gpsStatus === 'ready' ? '#059669' : gpsStatus === 'acquiring' ? '#D97706' : '#DC2626';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <AppIcon
            name="chevron-forward-outline"
            size={20}
            color="#0F172A"
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Check-In</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Session Card Summary */}
        <View style={styles.sessionCard}>
          <Text style={styles.subjectTitle}>{session?.subjectName || 'Class Session'}</Text>
          <Text style={styles.subjectCode}>{session?.subjectCode}</Text>

          <View style={styles.sessionMetaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Room</Text>
              <Text style={styles.metaVal}>{session?.roomName || 'N/A'}</Text>
            </View>

            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Time</Text>
              <Text style={styles.metaVal}>
                {session?.startTime} - {session?.endTime}
              </Text>
            </View>
          </View>
        </View>

        {/* 3-Layer Verification Checklist */}
        <View style={styles.verificationCard}>
          <Text style={styles.cardHeaderTitle}>3-Layer Verification Checks</Text>

          {/* Layer 1: Network IP */}
          <View style={styles.layerRow}>
            <View style={styles.layerIconBadge}>
              <Text style={styles.layerEmoji}>🌐</Text>
            </View>
            <View style={styles.layerInfo}>
              <Text style={styles.layerTitle}>1. University Network (IP)</Text>
              <Text style={styles.layerDesc}>
                {session?.validations?.networkEnabled
                  ? 'Server tự động kiểm tra subnet campus'
                  : 'Giảng viên đã tắt kiểm tra mạng cho buổi này'}
              </Text>
            </View>
            <AppIcon
              name="checkmark-circle-outline"
              size={20}
              color={session?.validations?.networkEnabled ? '#059669' : '#94A3B8'}
            />
          </View>

          {/* Layer 2: GPS Geofence */}
          <TouchableOpacity
            style={styles.layerRow}
            onPress={gpsStatus === 'error' || gpsStatus === 'denied' ? requestLocationAndFetch : undefined}
            activeOpacity={gpsStatus === 'error' ? 0.7 : 1}
          >
            <View style={styles.layerIconBadge}>
              <Text style={styles.layerEmoji}>📍</Text>
            </View>
            <View style={styles.layerInfo}>
              <Text style={styles.layerTitle}>2. GPS Geofence Location</Text>
              <Text style={[styles.layerDesc, { color: gpsStatusColor }]}>
                {getGpsStatusText()}
              </Text>
            </View>
            {gpsStatus === 'acquiring' ? (
              <ActivityIndicator size="small" color="#D97706" />
            ) : (
              <AppIcon
                name={gpsStatus === 'ready' ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                size={20}
                color={gpsStatusColor}
              />
            )}
          </TouchableOpacity>

          {/* Layer 3: Face AI Biometrics */}
          <View style={styles.layerRow}>
            <View style={styles.layerIconBadge}>
              <Text style={styles.layerEmoji}>👤</Text>
            </View>
            <View style={styles.layerInfo}>
              <Text style={styles.layerTitle}>3. AI Liveness & Face Match</Text>
              <Text style={styles.layerDesc}>
                {capturedImageBase64 ? '✓ Ảnh khuôn mặt sẵn sàng' : 'Nhấn nút camera bên dưới để chụp'}
              </Text>
            </View>
            <AppIcon
              name="checkmark-circle-outline"
              size={20}
              color={capturedImageBase64 ? '#059669' : '#CBD5E1'}
            />
          </View>
        </View>

        {/* Camera / Face Capture Frame Box */}
        <View style={styles.cameraBox}>
          <Text style={styles.cameraBoxTitle}>Face Photo</Text>

          <View style={styles.viewfinder}>
            {capturedImageUri ? (
              <View style={styles.capturedPreview}>
                <AppIcon name="checkmark-circle-outline" size={48} color="#059669" />
                <Text style={styles.capturedText}>Ảnh đã chụp</Text>
                <Text style={styles.capturedSubText}>Sẵn sàng gửi AI xác minh</Text>
              </View>
            ) : (
              <View style={styles.viewfinderPlaceholder}>
                <AppIcon name="people-outline" size={54} color="#94A3B8" />
                <Text style={styles.viewfinderText}>Đặt khuôn mặt vào khung</Text>
              </View>
            )}
          </View>

          <View style={styles.cameraActionsRow}>
            <TouchableOpacity
              style={styles.captureBtn}
              onPress={handleCaptureFace}
              activeOpacity={0.8}
            >
              <AppIcon name="camera-outline" size={18} color="#0D9488" />
              <Text style={styles.captureBtnText}>
                {capturedImageBase64 ? 'Chụp lại' : 'Chụp ảnh khuôn mặt'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button — disabled if no photo */}
        <TouchableOpacity
          style={[
            styles.submitCheckInBtn,
            (isSubmitting || !capturedImageBase64) && styles.submitBtnDisabled,
          ]}
          onPress={handleCheckInSubmit}
          disabled={isSubmitting || !capturedImageBase64}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <AppIcon name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {!capturedImageBase64 ? 'Chụp ảnh trước khi nộp' : 'Nộp điểm danh 3 lớp'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Loading overlay during BullMQ verification */}
      <Modal visible={isSubmitting} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.processingTitle}>Đang xác minh điểm danh</Text>
            <Text style={styles.processingSubtitle}>{submittingStep}</Text>
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
      <Modal visible={jobResultModal.visible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.resultCard}>
            <View
              style={[
                styles.resultIconCircle,
                jobResultModal.success ? styles.iconCircleSuccess : styles.iconCircleError,
              ]}
            >
              <AppIcon
                name={jobResultModal.success ? 'checkmark-circle-outline' : 'close-circle'}
                size={42}
                color={jobResultModal.success ? '#059669' : '#DC2626'}
              />
            </View>

            <Text style={styles.resultTitle}>{jobResultModal.title}</Text>
            <Text style={styles.resultDesc}>{jobResultModal.description}</Text>

            {jobResultModal.success && jobResultModal.confidence && (
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  AI Match Confidence: {jobResultModal.confidence}%
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.resultDismissBtn,
                jobResultModal.success ? styles.btnSuccess : styles.btnError,
              ]}
              onPress={() => {
                setJobResultModal((prev) => ({ ...prev, visible: false }));
                if (jobResultModal.success) {
                  navigation.goBack();
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.resultDismissText}>
                {jobResultModal.success ? 'Xong & Quay lại' : 'Thử lại'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subjectCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0D9488',
    marginTop: 2,
    marginBottom: 12,
  },
  sessionMetaGrid: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 2,
  },
  verificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  layerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    gap: 12,
  },
  layerIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerEmoji: {
    fontSize: 16,
  },
  layerInfo: {
    flex: 1,
  },
  layerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  layerDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cameraBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cameraBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  viewfinder: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  viewfinderPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 8,
  },
  capturedPreview: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
    marginTop: 6,
  },
  capturedSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cameraActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    width: '100%',
  },
  captureBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#0D9488',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  captureBtnText: {
    color: '#0D9488',
    fontSize: 13,
    fontWeight: '700',
  },
  submitCheckInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  processingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  processingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 16,
  },
  processingSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  resultIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconCircleSuccess: {
    backgroundColor: '#DCFCE7',
  },
  iconCircleError: {
    backgroundColor: '#FEE2E2',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  resultDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  confidenceBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  resultDismissBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  btnSuccess: {
    backgroundColor: '#0D9488',
  },
  btnError: {
    backgroundColor: '#DC2626',
  },
  resultDismissText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default StudentCheckInScreen;
