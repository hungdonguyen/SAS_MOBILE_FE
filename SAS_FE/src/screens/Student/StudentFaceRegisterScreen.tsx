import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';
import FaceCamera from '../../components/FaceCamera';
import { studentApi } from '../../services/studentApi';
import { authStorage } from '../../services/authStorage';
import { getErrorMessage } from '../../utils/errors';

interface Props { navigation: any; }

type Step = 'guide' | 'camera' | 'uploading' | 'done' | 'error';

const StudentFaceRegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [step, setStep] = useState<Step>('guide');
  const [errorMsg, setErrorMsg] = useState('');
  const isUploading = step === 'uploading';

  // ── Called by FaceCamera when auto-capture fires ──────────────────────────
  const handleFaceCaptured = async (data: { base64: string; uri: string }) => {
    setStep('uploading');

    try {
      // Build FormData with real file URI exactly as backend expects: field name "file"
      const formData = new FormData();
      formData.append('file', {
        uri: data.uri,
        name: 'face.jpg',
        type: 'image/jpeg',
      } as any);

      await studentApi.registerFace(formData);

      // Update local storage so Profile reflects instantly
      authStorage.setHasRegisteredFace(true);
      setStep('done');
    } catch (err) {
      const msg = getErrorMessage(err);
      setErrorMsg(msg);
      setStep('error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <AppIcon name="chevron-back-outline" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký khuôn mặt</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Guide step */}
        {step === 'guide' && (
          <View>
            <View style={styles.guideCard}>
              <View style={styles.guideIconWrap}>
                <AppIcon name="scan-outline" size={42} color="#0D9488" />
              </View>
              <Text style={styles.guideTitle}>Đăng ký nhận diện khuôn mặt</Text>
              <Text style={styles.guideSubtitle}>
                Hệ thống sử dụng AI InsightFace + MiniFASNetV2 để xác minh danh tính khi điểm danh.
                Ảnh sẽ được mã hóa AES-256-GCM và lưu trữ bảo mật.
              </Text>

              <View style={styles.stepList}>
                {[
                  { icon: 'bulb-outline', text: 'Ngồi ở nơi đủ ánh sáng, không có bóng đổ' },
                  { icon: 'eye-outline', text: 'Nhìn thẳng vào camera, không nghiêng mặt' },
                  { icon: 'happy-outline', text: 'Biểu cảm bình thường, không đội mũ hay đeo kính' },
                  { icon: 'flash-outline', text: 'Ứng dụng tự động phát hiện và chụp ảnh — không cần bấm nút' },
                ].map((item, i) => (
                  <View key={i} style={styles.stepItem}>
                    <View style={styles.stepIconWrap}>
                      <AppIcon name={item.icon as any} size={16} color="#0D9488" />
                    </View>
                    <Text style={styles.stepText}>{item.text}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => setStep('camera')}
                activeOpacity={0.85}>
                <AppIcon name="scan-outline" size={18} color="#FFFFFF" />
                <Text style={styles.startBtnText}>Bắt đầu đăng ký</Text>
              </TouchableOpacity>
            </View>

            {/* Warning about re-registration */}
            {authStorage.getUser()?.hasRegisteredFace && (
              <View style={styles.warningBox}>
                <AppIcon name="information-circle-outline" size={16} color="#D97706" />
                <Text style={styles.warningText}>
                  Bạn đã có dữ liệu khuôn mặt. Đăng ký mới sẽ thay thế ảnh cũ.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Camera step — FaceCamera handles everything automatically */}
        {step === 'camera' && (
          <View style={styles.cameraCard}>
            <Text style={styles.cameraTitle}>📸 Đặt khuôn mặt vào khung oval</Text>
            <Text style={styles.cameraSubtitle}>
              AI sẽ tự động nhận diện và chụp ảnh. Không cần bấm nút.
            </Text>
            <FaceCamera
              onCapture={handleFaceCaptured}
              isProcessing={isUploading}
              countdownSeconds={3}
              facing="front"
            />

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setStep('guide')}
              activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>← Quay lại hướng dẫn</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Uploading Modal */}
        <Modal visible={step === 'uploading'} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.uploadingCard}>
              <ActivityIndicator size="large" color="#0D9488" />
              <Text style={styles.uploadingTitle}>Đang đăng ký khuôn mặt...</Text>
              <Text style={styles.uploadingSubtitle}>
                AI đang xử lý và mã hóa ảnh của bạn. Vui lòng chờ.
              </Text>
            </View>
          </View>
        </Modal>

        {/* Done state */}
        {step === 'done' && (
          <View style={styles.resultCard}>
            <View style={styles.successIconWrap}>
              <AppIcon name="checkmark-circle-outline" size={56} color="#059669" />
            </View>
            <Text style={styles.resultTitle}>Đăng ký thành công! 🎉</Text>
            <Text style={styles.resultDesc}>
              Khuôn mặt đã được mã hóa và lưu trữ bảo mật. Bạn có thể điểm danh bằng khuôn mặt ngay bây giờ.
            </Text>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => navigation.replace('StudentHome')}
              activeOpacity={0.85}>
              <Text style={styles.doneBtnText}>Hoàn tất</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Error state */}
        {step === 'error' && (
          <View style={styles.resultCard}>
            <View style={styles.errorIconWrap}>
              <AppIcon name="close-circle" size={56} color="#DC2626" />
            </View>
            <Text style={styles.resultTitle}>Đăng ký thất bại</Text>
            <Text style={styles.resultDesc}>{errorMsg}</Text>
            <View style={styles.errorBtns}>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => setStep('camera')}
                activeOpacity={0.85}>
                <Text style={styles.retryBtnText}>Thử lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backBtn2}
                onPress={() => navigation.goBack()}
                activeOpacity={0.85}>
                <Text style={styles.backBtn2Text}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f6ff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  scroll: { padding: 16, paddingBottom: 40 },
  guideCard: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  guideIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  guideTitle: {
    fontSize: 18, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 8,
  },
  guideSubtitle: {
    fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 19, marginBottom: 20,
  },
  stepList: { width: '100%', gap: 12, marginBottom: 24 },
  stepItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepIconWrap: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center',
  },
  stepText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 19 },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#2563eb', paddingVertical: 14, paddingHorizontal: 32,
    borderRadius: 12, width: '100%', justifyContent: 'center',
    shadowColor: '#2563eb', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  startBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  warningBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a',
    borderRadius: 12, padding: 12,
  },
  warningText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },
  cameraCard: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  cameraTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 4 },
  cameraSubtitle: { fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 16, lineHeight: 17 },
  cancelBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 10 },
  cancelBtnText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  modalBackdrop: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.65)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  uploadingCard: {
    backgroundColor: '#ffffff', borderRadius: 20, padding: 32,
    alignItems: 'center', width: '100%', maxWidth: 300,
  },
  uploadingTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginTop: 16 },
  uploadingSubtitle: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 8, lineHeight: 18 },
  resultCard: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  successIconWrap: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  errorIconWrap: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  resultTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 10 },
  resultDesc: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 19, marginBottom: 20 },
  doneBtn: {
    width: '100%', backgroundColor: '#22c55e', paddingVertical: 14, borderRadius: 12, alignItems: 'center',
  },
  doneBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  errorBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  retryBtn: { flex: 1, backgroundColor: '#ef4444', paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  retryBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  backBtn2: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  backBtn2Text: { color: '#64748b', fontSize: 14, fontWeight: '700' },
});

export default StudentFaceRegisterScreen;
