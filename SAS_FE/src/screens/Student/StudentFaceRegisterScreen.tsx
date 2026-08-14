import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera } from 'react-native-image-picker';
import AppIcon from '../../components/Icon/AppIcon';
import { studentApi } from '../../services/studentApi';

interface StudentFaceRegisterScreenProps {
  navigation: any;
}

const StudentFaceRegisterScreen: React.FC<StudentFaceRegisterScreenProps> = ({ navigation }) => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // ─── Open real front camera with permission ──────────────────────────────────
  const handleCaptureSelfie = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Quyền truy cập Camera',
            message:
              'SAS Mobile cần quyền Camera để chụp ảnh chân dung đăng ký nhận diện khuôn mặt.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Cho phép',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Quyền Camera bị từ chối',
            'Hãy bật quyền Camera trong Settings của ứng dụng để đăng ký khuôn mặt.',
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
        quality: 1.0,        // Maximum quality for biometric accuracy
        includeBase64: false, // We send the file URI via FormData
        saveToPhotos: false,
      },
      (response) => {
        if (response.didCancel) {
          return; // User cancelled — do nothing
        }
        if (response.errorCode) {
          Alert.alert(
            'Lỗi Camera',
            response.errorMessage || 'Không thể chụp ảnh. Vui lòng thử lại.',
          );
          return;
        }
        const asset = response.assets?.[0];
        if (!asset?.uri) {
          Alert.alert('Lỗi', 'Không nhận được ảnh từ camera. Vui lòng thử lại.');
          return;
        }
        setPhotoUri(asset.uri);
      },
    );
  };

  const handleRegisterBiometrics = async () => {
    if (!photoUri) {
      Alert.alert('Chưa có ảnh', 'Vui lòng chụp ảnh chân dung trước khi đăng ký.');
      return;
    }

    setIsRegistering(true);

    try {
      // Build multipart FormData with the real captured URI
      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        name: 'face_portrait.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await studentApi.registerFace(formData);

      Alert.alert(
        'Đăng ký khuôn mặt thành công!',
        response.message ||
          'Dữ liệu sinh trắc học khuôn mặt đã được lưu an toàn vào cơ sở dữ liệu.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (err: any) {
      console.log('Biometric registration error:', err);
      const errMsg =
        err.response?.data?.message ||
        'Đăng ký thất bại. Hãy đảm bảo ánh sáng tốt và nhìn thẳng vào camera.';
      Alert.alert('Đăng ký thất bại', errMsg);
    } finally {
      setIsRegistering(false);
    }
  };

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
        <Text style={styles.headerTitle}>Biometric Face Registration</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Instruction Card */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Photo Guidelines</Text>
          <Text style={styles.instructionsSubtitle}>
            Our AI uses InsightFace and MiniFASNetV2 to extract a 512-dimension biometric matrix.
          </Text>

          <View style={styles.guidelineList}>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineBullet}>✓</Text>
              <Text style={styles.guidelineText}>Đảm bảo ánh sáng tốt, không có bóng đổ nặng.</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineBullet}>✓</Text>
              <Text style={styles.guidelineText}>Nhìn thẳng vào camera, không nghiêng mặt.</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineBullet}>✓</Text>
              <Text style={styles.guidelineText}>
                Không đeo kính râm, kính màu hoặc khẩu trang.
              </Text>
            </View>
          </View>
        </View>

        {/* Viewfinder Frame */}
        <View style={styles.viewfinderCard}>
          <View style={styles.viewfinderOval}>
            {photoUri ? (
              <View style={styles.capturedState}>
                <AppIcon name="checkmark-circle-outline" size={56} color="#059669" />
                <Text style={styles.capturedStateTitle}>Ảnh đã chụp</Text>
                <Text style={styles.capturedStateSubtitle}>Sẵn sàng đăng ký AI</Text>
              </View>
            ) : (
              <View style={styles.unfilledState}>
                <AppIcon name="people-outline" size={64} color="#94A3B8" />
                <Text style={styles.unfilledStateText}>Căn khuôn mặt vào khung oval</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.captureBtn}
            onPress={handleCaptureSelfie}
            activeOpacity={0.85}
          >
            <AppIcon name="camera-outline" size={20} color="#FFFFFF" />
            <Text style={styles.captureBtnText}>
              {photoUri ? 'Chụp lại' : 'Chụp ảnh chân dung'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.submitRegisterBtn,
            (!photoUri || isRegistering) && styles.submitBtnDisabled,
          ]}
          onPress={handleRegisterBiometrics}
          disabled={!photoUri || isRegistering}
          activeOpacity={0.85}
        >
          {isRegistering ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <AppIcon name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitRegisterBtnText}>
                {!photoUri ? 'Chụp ảnh trước' : 'Đăng ký nhận diện khuôn mặt'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 36,
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  instructionsSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    marginBottom: 12,
    lineHeight: 18,
  },
  guidelineList: {
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guidelineBullet: {
    color: '#0D9488',
    fontWeight: '800',
    fontSize: 14,
  },
  guidelineText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
  },
  viewfinderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewfinderOval: {
    width: 220,
    height: 270,
    borderRadius: 110,
    backgroundColor: '#F8FAFC',
    borderWidth: 2.5,
    borderColor: '#0D9488',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  unfilledState: {
    alignItems: 'center',
  },
  unfilledStateText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  capturedState: {
    alignItems: 'center',
  },
  capturedStateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
    marginTop: 8,
  },
  capturedStateSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  captureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  captureBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  submitRegisterBtn: {
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
  submitRegisterBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default StudentFaceRegisterScreen;
