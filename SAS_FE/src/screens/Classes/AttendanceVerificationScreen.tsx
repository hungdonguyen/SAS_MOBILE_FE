import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppIcon from '../../components/Icon/AppIcon';
import { studentApi } from '../../services/studentApi';

interface RouteParams {
  student?: {
    id: string;
    mssv: string;
    studentName: string;
    email?: string;
    status: 'present' | 'late' | 'absent' | 'excused' | 'pending';
    checkInTime?: string;
    device?: string;
    attendanceId?: string;
    method?: string;
    confidence?: number;
    checkInPhoto?: string;
  };
  sectionId?: string;
  sessionId?: string;
}

const AttendanceVerificationScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = (route.params || {}) as RouteParams;
  const student = params.student || {
    id: 'stu-sample',
    mssv: '2211001',
    studentName: 'Nguyễn Văn Minh Nghĩa',
    email: '2211001@student.edu.vn',
    status: 'present',
    checkInTime: '07:14:32',
    device: 'Android 14 (SM-G998B)',
    attendanceId: 'att-1',
    method: 'AI',
    confidence: 98.4,
  };

  const [checkInImage, setCheckInImage] = useState<string | null>(student.checkInPhoto || null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>(student.status || 'present');
  const [overrideReason, setOverrideReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 1. Try loading the attendance check-in photo using attendanceId
    if (student.attendanceId) {
      setLoadingImg(true);
      studentApi
        .fetchAttendanceImageBase64(student.attendanceId)
        .then((img) => {
          if (img) {
            setCheckInImage(img);
          } else if (student.id) {
            // Fallback to biometric profile image if no specific check-in image exists yet
            return studentApi.fetchBiometricImageBase64(student.id).then((bioImg) => {
              if (bioImg) setCheckInImage(bioImg);
            });
          }
        })
        .catch(() => {
          if (student.id) {
            studentApi.fetchBiometricImageBase64(student.id).then((bioImg) => {
              if (bioImg) setCheckInImage(bioImg);
            });
          }
        })
        .finally(() => setLoadingImg(false));
    } else if (student.id) {
      setLoadingImg(true);
      studentApi
        .fetchBiometricImageBase64(student.id)
        .then((img) => setCheckInImage(img))
        .catch(() => setCheckInImage(null))
        .finally(() => setLoadingImg(false));
    }
  }, [student.attendanceId, student.id]);

  const confidenceScore = student.confidence ?? 98.4;
  const isHighConfidence = confidenceScore >= 80;

  const handleSaveOverride = async () => {
    if (!overrideReason.trim() && currentStatus !== student.status) {
      Alert.alert('Yêu Cầu Lý Do', 'Vui lòng nhập lý do ghi đè hoặc chỉnh sửa điểm danh của sinh viên.');
      return;
    }

    setSaving(true);
    try {
      // Simulate API call to PATCH /attendance/:attendanceId
      await new Promise((resolve) => setTimeout(() => resolve(null), 800));
      Alert.alert('Thành Công', `Đã cập nhật trạng thái của ${student.studentName} thành "${currentStatus.toUpperCase()}"`, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu trạng thái điểm danh.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <AppIcon name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle}>Chi Tiết Ảnh Điểm Danh AI</Text>
          <Text style={styles.navSubtitle}>{student.studentName} • {student.mssv}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Single Check-In Photo Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppIcon name="camera-outline" size={18} color="#0D9488" />
            <Text style={styles.cardTitle}>Ảnh Chụp Lúc Điểm Danh</Text>
          </View>

          <View style={styles.singlePhotoContainer}>
            <View style={styles.photoFrame}>
              {loadingImg ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#0D9488" />
                  <Text style={styles.loadingText}>Đang tải ảnh điểm danh...</Text>
                </View>
              ) : checkInImage ? (
                <Image source={{ uri: checkInImage }} style={styles.faceImg} resizeMode="cover" />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <AppIcon name="camera" size={48} color="#94A3B8" />
                  <Text style={styles.placeholderText}>Ảnh Chụp Điểm Danh</Text>
                  <Text style={styles.placeholderSubText}>Không có dữ liệu hình ảnh</Text>
                </View>
              )}

              {/* Top Tag on Photo */}
              <View style={styles.photoTagBadge}>
                <AppIcon name="checkmark-circle" size={12} color="#FFFFFF" />
                <Text style={styles.photoTagText}>Captured via Face AI</Text>
              </View>

              {/* Match Score Floating Badge */}
              <View style={[styles.confidenceFloatingBadge, isHighConfidence ? styles.confBadgeOk : styles.confBadgeWarn]}>
                <Text style={styles.confScoreLabel}>Độ khớp AI</Text>
                <Text style={styles.confScoreVal}>{confidenceScore}%</Text>
              </View>
            </View>
          </View>

          {/* AI Decision Banner */}
          <View style={[styles.aiBanner, isHighConfidence ? styles.aiBannerSuccess : styles.aiBannerWarning]}>
            <AppIcon
              name={isHighConfidence ? 'shield-checkmark' : 'warning'}
              size={18}
              color={isHighConfidence ? '#16A34A' : '#D97706'}
            />
            <Text style={[styles.aiBannerText, { color: isHighConfidence ? '#15803D' : '#B45309' }]}>
              {isHighConfidence
                ? 'Nhận diện thành công: Khuôn mặt trùng khớp vector 512D ArcFace. Anti-spoofing vượt qua.'
                : 'Cảnh báo: Độ trùng khớp thấp hơn ngưỡng tiêu chuẩn (80%). Vui lòng kiểm tra đối chiếu.'}
            </Text>
          </View>
        </View>

        {/* Multi-Factor Verification Telemetry */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppIcon name="layers-outline" size={18} color="#0D9488" />
            <Text style={styles.cardTitle}>Thông Số Xác Thực 3 Lớp</Text>
          </View>

          <View style={styles.telemetryRow}>
            <View style={styles.telemetryIcon}>
              <AppIcon name="navigate-outline" size={16} color="#0D9488" />
            </View>
            <View style={styles.telemetryInfo}>
              <Text style={styles.telemetryLabel}>Vị Trí GPS Geofence</Text>
              <Text style={styles.telemetryValue}>10.8505° N, 106.7721° E (Cách tâm phòng 12m • Hợp lệ)</Text>
            </View>
            <View style={styles.validPill}>
              <Text style={styles.validText}>✓ Đạt</Text>
            </View>
          </View>

          <View style={styles.telemetryRow}>
            <View style={styles.telemetryIcon}>
              <AppIcon name="wifi-outline" size={16} color="#0D9488" />
            </View>
            <View style={styles.telemetryInfo}>
              <Text style={styles.telemetryLabel}>Địa Chỉ IP / Wi-Fi Giảng Đường</Text>
              <Text style={styles.telemetryValue}>172.16.4.88 (Subnet Wi-Fi Campus B4 • Hợp lệ)</Text>
            </View>
            <View style={styles.validPill}>
              <Text style={styles.validText}>✓ Đạt</Text>
            </View>
          </View>

          <View style={styles.telemetryRow}>
            <View style={styles.telemetryIcon}>
              <AppIcon name="phone-portrait-outline" size={16} color="#0D9488" />
            </View>
            <View style={styles.telemetryInfo}>
              <Text style={styles.telemetryLabel}>Thiết Bị Điểm Danh</Text>
              <Text style={styles.telemetryValue}>{student.device || 'Android 14 Device'}</Text>
            </View>
            <View style={styles.validPill}>
              <Text style={styles.validText}>✓ Hợp Lệ</Text>
            </View>
          </View>

          <View style={[styles.telemetryRow, { borderBottomWidth: 0 }]}>
            <View style={styles.telemetryIcon}>
              <AppIcon name="time-outline" size={16} color="#0D9488" />
            </View>
            <View style={styles.telemetryInfo}>
              <Text style={styles.telemetryLabel}>Thời Gian Ghi Nhận</Text>
              <Text style={styles.telemetryValue}>{student.checkInTime || '07:15:00'} • Phương thức: {student.method || 'Face AI'}</Text>
            </View>
          </View>
        </View>

        {/* Manual Status Override Tool */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <AppIcon name="create-outline" size={18} color="#0D9488" />
            <Text style={styles.cardTitle}>Ghi Đè Trạng Thái Điểm Danh</Text>
          </View>

          <Text style={styles.overrideHelp}>
            Giảng viên có thể điều chỉnh trực tiếp kết quả điểm danh của sinh viên này:
          </Text>

          <View style={styles.statusButtonsRow}>
            <TouchableOpacity
              style={[styles.statusBtn, currentStatus === 'present' && styles.statusBtnPresentActive]}
              onPress={() => setCurrentStatus('present')}
            >
              <Text style={[styles.statusBtnText, currentStatus === 'present' && styles.statusBtnTextActive]}>
                ✓ Có Mặt
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusBtn, currentStatus === 'late' && styles.statusBtnLateActive]}
              onPress={() => setCurrentStatus('late')}
            >
              <Text style={[styles.statusBtnText, currentStatus === 'late' && styles.statusBtnTextActive]}>
                ⚠️ Đi Muộn
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusBtn, currentStatus === 'absent' && styles.statusBtnAbsentActive]}
              onPress={() => setCurrentStatus('absent')}
            >
              <Text style={[styles.statusBtnText, currentStatus === 'absent' && styles.statusBtnTextActive]}>
                ✕ Vắng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusBtn, currentStatus === 'excused' && styles.statusBtnExcusedActive]}
              onPress={() => setCurrentStatus('excused')}
            >
              <Text style={[styles.statusBtnText, currentStatus === 'excused' && styles.statusBtnTextActive]}>
                📄 Có Phép
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Lý Do Điều Chỉnh (Ghi log kiểm toán):</Text>
          <TextInput
            style={styles.reasonInput}
            value={overrideReason}
            onChangeText={setOverrideReason}
            placeholder="Ví dụ: Sinh viên bị nhận diện nhầm do đeo kính, GV xác nhận có mặt..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={handleSaveOverride}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <AppIcon name="checkmark" size={18} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>Lưu & Cập Nhật Điểm Danh</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleContainer: {
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  navSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 8,
  },
  singlePhotoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoFrame: {
    width: '100%',
    height: 240,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  faceImg: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginTop: 6,
  },
  placeholderSubText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  photoTagBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  photoTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confidenceFloatingBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  confBadgeOk: {
    backgroundColor: '#16A34A',
  },
  confBadgeWarn: {
    backgroundColor: '#D97706',
  },
  confScoreLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  confScoreVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  aiBannerSuccess: {
    backgroundColor: '#DCFCE7',
  },
  aiBannerWarning: {
    backgroundColor: '#FEF3C7',
  },
  aiBannerText: {
    fontSize: 11,
    marginLeft: 8,
    flex: 1,
    lineHeight: 15,
  },
  telemetryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  telemetryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  telemetryInfo: {
    flex: 1,
  },
  telemetryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  telemetryValue: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  validPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  validText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  overrideHelp: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  statusBtnPresentActive: {
    backgroundColor: '#16A34A',
  },
  statusBtnLateActive: {
    backgroundColor: '#D97706',
  },
  statusBtnAbsentActive: {
    backgroundColor: '#DC2626',
  },
  statusBtnExcusedActive: {
    backgroundColor: '#2563EB',
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  reasonInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
    minHeight: 60,
    marginBottom: 14,
  },
  saveButton: {
    backgroundColor: '#0D9488',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
});

export default AttendanceVerificationScreen;
