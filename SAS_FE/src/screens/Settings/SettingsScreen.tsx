import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AppIcon from '../../components/Icon/AppIcon';
import { authService } from '../../api/services/authService';
import { authStorage } from '../../api/storage';
import { apiConfig } from '../../api/config';
import { CurrentUserResponse } from '../../api/types/auth.types';

interface SettingsScreenProps {
  navigation?: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const navigation = useNavigation<any>();
  const [profile, setProfile] = useState<CurrentUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiUrl, setApiUrl] = useState(apiConfig.getBaseUrl());

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await authService.getMe();
      setProfile(data);
    } catch (e) {
      console.log('Error fetching lecturer profile:', e);
      const cached = authStorage.getUser();
      if (cached) {
        setProfile({
          userId: cached.userId,
          username: cached.username,
          fullName: cached.fullName || cached.username,
          email: cached.email || 'lecturer@campus.edu.vn',
          role: cached.role,
          avatarUrl: cached.avatarUrl || null,
          isActive: true,
          createdAt: null,
          hasRegisteredFace: cached.hasRegisteredFace,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiUrl = () => {
    if (!apiUrl.trim()) {
      apiConfig.resetDefault();
      setApiUrl(apiConfig.getBaseUrl());
    } else {
      apiConfig.setBaseUrl(apiUrl);
    }
    Alert.alert('Configuration Saved', `Backend API URL: ${apiConfig.getBaseUrl()}`);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);
  };

  const displayName = profile?.fullName || profile?.username || authStorage.getUser()?.username || 'Lecturer';
  const email = profile?.email || `${profile?.username || 'lecturer'}@campus.edu.vn`;
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your lecturer profile and account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Lecturer Profile Card */}
        <View style={styles.profileCard}>
          {loading ? (
            <ActivityIndicator color="#0D9488" />
          ) : (
            <>
              <View style={styles.avatarBig}>
                <Text style={styles.avatarText}>{initials || 'LC'}</Text>
              </View>
              <View style={styles.profileMeta}>
                <Text style={styles.lecturerName}>{displayName}</Text>
                <Text style={styles.lecturerRole}>Lecturer • Smart Attendance System</Text>
                <Text style={styles.lecturerEmail}>{email}</Text>
                <View style={styles.roleTag}>
                  <Text style={styles.roleTagText}>ROLE: LECTURER</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Backend API Configuration */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <AppIcon name="settings-outline" size={18} color="#0D9488" />
            <Text style={styles.cardTitle}>Backend API Host Configuration</Text>
          </View>
          <Text style={styles.configDesc}>
            Configure NestJS backend host IP (10.0.2.2 for Android Emulator, localhost for iOS, or LAN IP for physical device).
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

        <Text style={styles.versionText}>Smart Attendance System • Lecturer Mobile v1.0.0</Text>
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 14,
    minHeight: 90,
  },
  avatarBig: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  profileMeta: {
    flex: 1,
  },
  lecturerName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  lecturerRole: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  lecturerEmail: {
    fontSize: 12,
    color: '#0D9488',
    marginTop: 2,
    fontWeight: '600',
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
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
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 20,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#CBD5E1',
  },
});

export default SettingsScreen;
