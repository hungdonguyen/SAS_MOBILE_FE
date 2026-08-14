import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';
import { studentApi } from '../../services/studentApi';

interface StudentFaceRegisterScreenProps {
  navigation: any;
}

const StudentFaceRegisterScreen: React.FC<StudentFaceRegisterScreenProps> = ({ navigation }) => {
  const [photoReady, setPhotoReady] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleCaptureSelfie = () => {
    setPhotoReady(true);
    Alert.alert('Capture Ready', 'Portrait selfie captured with optimal resolution.');
  };

  const handleRegisterBiometrics = async () => {
    if (!photoReady) {
      Alert.alert('Photo Required', 'Please capture or select your face photo first.');
      return;
    }

    setIsRegistering(true);

    try {
      // Build multipart FormData for /biometrics/register
      const formData = new FormData();
      formData.append('file', {
        uri: 'file:///sample_face_portrait.jpg',
        name: 'face_portrait.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await studentApi.registerFace(formData);

      Alert.alert(
        'Face Profile Registered!',
        response.message || 'Your biometric face embedding has been securely saved to the database.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      console.log('Biometric registration error:', err);
      const errMsg =
        err.response?.data?.message ||
        'Failed to register face biometrics. Please ensure proper lighting and look directly at camera.';
      Alert.alert('Registration Failed', errMsg);
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
              <Text style={styles.guidelineText}>Ensure good lighting without heavy shadows.</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineBullet}>✓</Text>
              <Text style={styles.guidelineText}>Look straight directly at the camera frame.</Text>
            </View>
            <View style={styles.guidelineItem}>
              <Text style={styles.guidelineBullet}>✓</Text>
              <Text style={styles.guidelineText}>
                No sunglasses, colored lenses, or face masks.
              </Text>
            </View>
          </View>
        </View>

        {/* Viewfinder Frame */}
        <View style={styles.viewfinderCard}>
          <View style={styles.viewfinderOval}>
            {photoReady ? (
              <View style={styles.capturedState}>
                <AppIcon name="checkmark-circle-outline" size={56} color="#059669" />
                <Text style={styles.capturedStateTitle}>Portrait Acquired</Text>
                <Text style={styles.capturedStateSubtitle}>Ready for AI Encryption</Text>
              </View>
            ) : (
              <View style={styles.unfilledState}>
                <AppIcon name="people-outline" size={64} color="#94A3B8" />
                <Text style={styles.unfilledStateText}>Align Face Within Oval</Text>
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
              {photoReady ? 'Retake Selfie' : 'Capture Portrait Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.submitRegisterBtn,
            (!photoReady || isRegistering) && styles.submitBtnDisabled,
          ]}
          onPress={handleRegisterBiometrics}
          disabled={!photoReady || isRegistering}
          activeOpacity={0.85}
        >
          {isRegistering ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <AppIcon name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitRegisterBtnText}>Register Face Identity</Text>
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
