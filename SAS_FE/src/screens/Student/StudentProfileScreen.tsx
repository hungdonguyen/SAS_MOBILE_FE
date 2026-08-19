import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AppIcon from '../../components/Icon/AppIcon';
import { authStorage } from '../../services/authStorage';
import { apiConfig } from '../../services/apiConfig';
import { studentApi } from '../../services/studentApi';
import { NavigationService } from '../../services/navigationService';

const StudentProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [user, setUser] = useState(authStorage.getUser());
  const [faceImageBase64, setFaceImageBase64] = useState<string | null>(null);
  const [loadingFace, setLoadingFace] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
    rate: '0%',
  });

  // Modal State for IP Config
  const [isIpModalVisible, setIsIpModalVisible] = useState(false);
  const [customIpInput, setCustomIpInput] = useState(apiConfig.getBaseUrl() || '');

  const loadProfileData = useCallback(async () => {
    const currentUser = authStorage.getUser();
    setUser(currentUser);

    if (currentUser?.userId) {
      // Fetch Face Image if registered
      if (currentUser.hasRegisteredFace) {
        setLoadingFace(true);
        try {
          const img = await studentApi.fetchBiometricImageBase64(currentUser.userId);
          setFaceImageBase64(img);
        } catch {
          // ignore error
        } finally {
          setLoadingFace(false);
        }
      }

      // Fetch Attendance Stats
      try {
        const history = await studentApi.getStudentHistory();
        if (history && history.length > 0) {
          const total = history.length;
          const present = history.filter((h) => h.status === 'present').length;
          const late = history.filter((h) => h.status === 'late').length;
          const absent = history.filter((h) => h.status === 'absent').length;
          const attended = present + late;
          const rate = Math.round((attended / total) * 100) + '%';
          setStats({ total, present, late, absent, rate });
        }
      } catch {
        // use default stats
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  const handleSaveIp = async () => {
    const trimmed = customIpInput.trim();
    if (!trimmed) {
      apiConfig.resetDefault();
      setIsIpModalVisible(false);
      Alert.alert('Reset Successful', `Restored default URL: ${apiConfig.getBaseUrl()}`);
      return;
    }

    try {
      apiConfig.setBaseUrl(trimmed);
      setIsIpModalVisible(false);
      Alert.alert('Saved Successfully', `New Backend Host: ${apiConfig.getBaseUrl()}`);
    } catch {
      Alert.alert('Error', 'Could not save IP address.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await studentApi.logout();
          NavigationService.reset('Login');
        },
      },
    ]);
  };

  const initials = (user?.fullName || user?.username || 'ST')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Student Profile</Text>
          <Text style={styles.headerSubtitle}>Manage account & biometric face recognition</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.fullName || user?.username || 'Student'}</Text>
              <Text style={styles.userSub}>ID: {user?.username || '—'}</Text>
              <Text style={styles.userEmail}>{user?.email || `${user?.username || 'stu'}@student.edu.vn`}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>🎓 Regular Student</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Biometric Face ID Status Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBadge}>
              <AppIcon name="shield-checkmark-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.sectionTitle}>Biometric Verification (Face AI)</Text>
          </View>

          <View style={styles.biometricContent}>
            {user?.hasRegisteredFace ? (
              <View style={styles.faceRegisteredRow}>
                <View style={styles.faceImageWrapper}>
                  {loadingFace ? (
                    <ActivityIndicator size="small" color="#2563EB" />
                  ) : faceImageBase64 ? (
                    <Image source={{ uri: faceImageBase64 }} style={styles.faceImage} />
                  ) : (
                    <View style={styles.facePlaceholder}>
                      <AppIcon name="person" size={28} color="#2563EB" />
                    </View>
                  )}
                </View>
                <View style={styles.faceStatusInfo}>
                  <View style={styles.statusBadgeSuccess}>
                    <AppIcon name="checkmark-circle" size={14} color="#16A34A" />
                    <Text style={styles.statusTextSuccess}>Face Biometrics Registered</Text>
                  </View>
                  <Text style={styles.faceDesc}>
                    512D ArcFace biometric embedding is active for 3-factor attendance check-in.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.faceUnregisteredBox}>
                <View style={styles.statusBadgeWarning}>
                  <AppIcon name="alert-circle" size={14} color="#D97706" />
                  <Text style={styles.statusTextWarning}>Face Not Registered</Text>
                </View>
                <Text style={styles.faceUnregisteredDesc}>
                  You must register your face biometrics to check in for classes.
                </Text>
                <TouchableOpacity
                  style={styles.registerNowButton}
                  onPress={() => navigation.navigate('StudentFaceRegister')}
                >
                  <AppIcon name="camera" size={16} color="#FFFFFF" />
                  <Text style={styles.registerNowText}>Register Face Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Academic Stats Summary */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBadge}>
              <AppIcon name="bar-chart-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.sectionTitle}>Attendance Overview</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{stats.rate}</Text>
              <Text style={styles.statLbl}>Attendance Rate</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: '#16A34A' }]}>{stats.present}</Text>
              <Text style={styles.statLbl}>On Time</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: '#D97706' }]}>{stats.late}</Text>
              <Text style={styles.statLbl}>Late</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: '#DC2626' }]}>{stats.absent}</Text>
              <Text style={styles.statLbl}>Absent</Text>
            </View>
          </View>
        </View>

        {/* System Settings & Network */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBadge}>
              <AppIcon name="settings-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.sectionTitle}>Connection & System Settings</Text>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setCustomIpInput(apiConfig.getBaseUrl() || '');
              setIsIpModalVisible(true);
            }}
          >
            <View style={styles.settingLeft}>
              <AppIcon name="globe-outline" size={18} color="#64748B" />
              <View style={styles.settingTexts}>
                <Text style={styles.settingTitle}>Backend API Host</Text>
                <Text style={styles.settingDesc} numberOfLines={1}>
                  {apiConfig.getBaseUrl()}
                </Text>
              </View>
            </View>
            <AppIcon name="chevron-forward-outline" size={16} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('StudentHistoryTab')}
          >
            <View style={styles.settingLeft}>
              <AppIcon name="calendar-outline" size={18} color="#64748B" />
              <View style={styles.settingTexts}>
                <Text style={styles.settingTitle}>Attendance History</Text>
                <Text style={styles.settingDesc}>View detailed attendance history for all sessions</Text>
              </View>
            </View>
            <AppIcon name="chevron-forward-outline" size={16} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <AppIcon name="log-out-outline" size={18} color="#DC2626" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Smart Attendance System v2.0 • Build 2026</Text>
      </ScrollView>

      {/* IP Configuration Modal */}
      <Modal
        visible={isIpModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsIpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Backend Host Configuration</Text>
            <Text style={styles.modalDesc}>
              Enter Backend Server IP (e.g., http://192.168.1.13:3001 or http://10.0.2.2:3001)
            </Text>

            <TextInput
              style={styles.ipInput}
              value={customIpInput}
              onChangeText={setCustomIpInput}
              placeholder="http://192.168.1.xxx:3001"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsIpModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveIp}>
                <Text style={styles.modalSaveText}>Save Settings</Text>
              </TouchableOpacity>
            </View>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  profileCard: {
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  userSub: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  biometricContent: {
    marginTop: 4,
  },
  faceRegisteredRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faceImageWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  faceImage: {
    width: '100%',
    height: '100%',
  },
  facePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceStatusInfo: {
    flex: 1,
  },
  statusBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  statusTextSuccess: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    marginLeft: 4,
  },
  faceDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  reRegisterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  reRegisterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 4,
  },
  faceUnregisteredBox: {
    padding: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusBadgeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusTextWarning: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 4,
  },
  faceUnregisteredDesc: {
    fontSize: 12,
    color: '#78350F',
    marginBottom: 10,
    lineHeight: 16,
  },
  registerNowButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  registerNowText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 3,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  statLbl: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  settingTexts: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  settingDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 16,
  },
  ipInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    marginBottom: 16,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default StudentProfileScreen;
