import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AppIcon from '../../components/Icon/AppIcon';
import { authStorage } from '../../services/authStorage';
import { studentApi } from '../../services/studentApi';
import { apiConfig } from '../../services/apiConfig';
import { MeResponse } from '../../types/studentTypes';

const StudentProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [apiUrl, setApiUrl] = useState(apiConfig.getBaseUrl());
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [faceImageBase64, setFaceImageBase64] = useState<string | null>(null);
  const [loadingFaceImage, setLoadingFaceImage] = useState(false);

  const fetchFaceImage = useCallback(async (userId: string) => {
    setLoadingFaceImage(true);
    const base64 = await studentApi.fetchBiometricImageBase64(userId);
    setFaceImageBase64(base64);
    setLoadingFaceImage(false);
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const me = await studentApi.getMe();
      setProfile(me);
      if (me.hasRegisteredFace !== undefined) {
        authStorage.setHasRegisteredFace(Boolean(me.hasRegisteredFace));
      }
      // Fetch face image if registered
      if (me.hasRegisteredFace && me.userId) {
        fetchFaceImage(me.userId);
      } else {
        setFaceImageBase64(null);
      }
    } catch (err: any) {
      console.log('getMe error:', err);
      const cached = authStorage.getUser();
      if (cached) {
        setProfile({
          userId: cached.userId,
          username: cached.username,
          email: null,
          fullName: null,
          role: cached.role,
          isActive: true,
          hasRegisteredFace: cached.hasRegisteredFace,
        });
        if (cached.hasRegisteredFace) {
          fetchFaceImage(cached.userId);
        }
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [fetchFaceImage]);

  // ─── Fetch fresh profile and face image on every screen focus ──────────────
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile]),
  );

  const handleSaveApiUrl = () => {
    if (!apiUrl.trim()) {
      apiConfig.resetDefault();
      setApiUrl(apiConfig.getBaseUrl());
    } else {
      apiConfig.setBaseUrl(apiUrl);
    }
    Alert.alert('Đã lưu cấu hình', `Backend API URL: ${apiConfig.getBaseUrl()}`);
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất tài khoản sinh viên không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await studentApi.logout();
          // Reset entire navigation stack — prevents back-button returning to Dashboard
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const displayName = profile?.fullName || profile?.username || authStorage.getUser()?.username || 'Student';
  const userId = profile?.userId || authStorage.getUser()?.userId || '';
  const hasFace = Boolean(profile?.hasRegisteredFace ?? authStorage.getUser()?.hasRegisteredFace);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ & Cài đặt</Text>
        <Text style={styles.headerSubtitle}>Quản lý tài khoản & kết nối backend</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {loadingProfile ? (
            <ActivityIndicator color="#0D9488" />
          ) : (
            <>
              <View style={styles.avatarBig}>
                <Text style={styles.avatarBigText}>
                  {displayName.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileMeta}>
                <Text style={styles.studentName}>{displayName}</Text>
                {profile?.email ? (
                  <Text style={styles.studentEmail}>{profile.email}</Text>
                ) : null}
                <Text style={styles.studentId}>ID: {userId || 'N/A'}</Text>
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>ROLE: STUDENT</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Biometrics Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <AppIcon name="people-outline" size={18} color="#0D9488" />
            <Text style={styles.cardTitle}>Nhận diện khuôn mặt (Biometric)</Text>
          </View>

          {/* Face reference image preview — loaded via Axios with proper Bearer header */}
          {hasFace ? (
            <View style={styles.facePreviewWrapper}>
              {loadingFaceImage ? (
                <View style={styles.facePreviewPlaceholder}>
                  <ActivityIndicator color="#0D9488" />
                  <Text style={styles.faceLoadingText}>Đang tải ảnh...</Text>
                </View>
              ) : faceImageBase64 ? (
                <Image
                  source={{ uri: faceImageBase64 }}
                  style={styles.facePreviewImage}
                />
              ) : (
                <View style={styles.facePreviewPlaceholder}>
                  <AppIcon name="people-outline" size={40} color="#94A3B8" />
                  <Text style={styles.faceLoadingText}>Không tải được ảnh</Text>
                </View>
              )}
              <View style={styles.facePreviewOverlay}>
                <AppIcon name="checkmark-circle-outline" size={18} color="#059669" />
                <Text style={styles.facePreviewLabel}>Ảnh đăng ký hiện tại</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.biometricStatusRow}>
            <View style={styles.bioStatusLeft}>
              <View style={[styles.statusDot, hasFace ? styles.dotGreen : styles.dotAmber]} />
              <Text style={styles.bioStatusText}>
                {hasFace ? 'Đã đăng ký khuôn mặt' : 'Chưa đăng ký'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.bioActionBtn}
              onPress={() => navigation.navigate('StudentFaceRegister')}
              activeOpacity={0.8}
            >
              <Text style={styles.bioActionBtnText}>
                {hasFace ? 'Cập nhật' : 'Đăng ký ngay'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.bioHelpText}>
            Dùng AI InsightFace + MiniFASNetV2 để xác minh khi điểm danh.
          </Text>
        </View>

        {/* Backend API Configuration */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <AppIcon name="settings-outline" size={18} color="#0D9488" />
            <Text style={styles.cardTitle}>Cấu hình Backend API</Text>
          </View>
          <Text style={styles.configDesc}>
            Nhập IP NestJS backend để kết nối (10.0.2.2 cho Android Emulator, localhost cho iOS, hoặc IP LAN cho thiết bị thật).
          </Text>

          <View style={styles.configInputRow}>
            <TextInput
              style={styles.configInput}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="http://10.0.2.2:3001"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.saveConfigBtn}
              onPress={handleSaveApiUrl}
              activeOpacity={0.8}
            >
              <Text style={styles.saveConfigText}>Lưu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <AppIcon name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Smart Attendance System • Mobile v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    minHeight: 80,
  },
  avatarBig: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBigText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  profileMeta: {
    flex: 1,
  },
  studentName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  studentId: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  roleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  facePreviewWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  facePreviewPlaceholder: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  faceLoadingText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  facePreviewImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    backgroundColor: '#F1F5F9',
  },
  facePreviewOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  facePreviewLabel: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '600',
  },
  biometricStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  bioStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotGreen: { backgroundColor: '#10B981' },
  dotAmber: { backgroundColor: '#F59E0B' },
  bioStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  bioActionBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bioActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bioHelpText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 8,
  },
  deleteFaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  deleteFaceBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  configDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 10,
  },
  configInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  configInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  saveConfigBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 10,
  },
  saveConfigText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default StudentProfileScreen;
