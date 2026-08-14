import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AppIcon from '../../components/Icon/AppIcon';
import { authStorage } from '../../services/authStorage';
import { studentApi } from '../../services/studentApi';
import { apiConfig } from '../../services/apiConfig';

const StudentProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const user = authStorage.getUser();

  const [apiUrl, setApiUrl] = useState(apiConfig.getBaseUrl());
  const [hasFace, setHasFace] = useState(Boolean(user?.hasRegisteredFace));

  const handleSaveApiUrl = () => {
    if (!apiUrl.trim()) {
      apiConfig.resetDefault();
      setApiUrl(apiConfig.getBaseUrl());
    } else {
      apiConfig.setBaseUrl(apiUrl);
    }
    Alert.alert('Configuration Saved', `Backend API URL updated to: ${apiConfig.getBaseUrl()}`);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your student account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await studentApi.logout();
          navigation.navigate('Login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Profile & Settings</Text>
        <Text style={styles.headerSubtitle}>Manage credentials & live backend connectivity</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBig}>
            <Text style={styles.avatarBigText}>
              {(user?.username || 'ST').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.studentName}>{user?.username || 'Student Account'}</Text>
            <Text style={styles.studentId}>User ID: {user?.userId || 'N/A'}</Text>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>ROLE: STUDENT</Text>
            </View>
          </View>
        </View>

        {/* Biometrics Card */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <AppIcon name="people-outline" size={18} color="#0D9488" />
            <Text style={styles.cardTitle}>Biometric Identity</Text>
          </View>

          <View style={styles.biometricStatusRow}>
            <View style={styles.bioStatusLeft}>
              <View
                style={[
                  styles.statusDot,
                  hasFace ? styles.dotGreen : styles.dotAmber,
                ]}
              />
              <Text style={styles.bioStatusText}>
                {hasFace ? 'Face Identity Enrolled' : 'Not Registered'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.bioActionBtn}
              onPress={() => navigation.navigate('StudentFaceRegister')}
              activeOpacity={0.8}
            >
              <Text style={styles.bioActionBtnText}>
                {hasFace ? 'Update Face' : 'Register Now'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.bioHelpText}>
            Used for 3-layer anti-spoofing attendance checks via MiniFASNetV2 and InsightFace.
          </Text>
        </View>

        {/* Backend API Configuration */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <AppIcon name="settings-outline" size={18} color="#0D9488" />
            <Text style={styles.cardTitle}>Backend API Host Configuration</Text>
          </View>
          <Text style={styles.configDesc}>
            Configure the NestJS backend host IP for live testing (e.g. 10.0.2.2 for Android Emulator, localhost for iOS, or LAN IP for physical device).
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
              <Text style={styles.saveConfigText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <AppIcon name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Smart Attendance System • Mobile Student Client v1.0.0</Text>
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
  studentId: {
    fontSize: 12,
    color: '#64748B',
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
