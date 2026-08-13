import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';

interface AdminProfileScreenProps {
  navigation?: any;
}

const AdminProfileScreen: React.FC<AdminProfileScreenProps> = ({ navigation }) => {
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Admin mode?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          if (navigation) navigation.navigate('Login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Profile & Settings</Text>
        <Text style={styles.headerSubtitle}>System Administrator account overview</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Admin Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBig}>
            <Text style={styles.avatarText}>AD</Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.adminName}>System Administrator</Text>
            <Text style={styles.adminRole}>Super Admin • IT Management</Text>
            <Text style={styles.adminEmail}>admin.system@eiu.edu.vn</Text>
          </View>
        </View>

        {/* System Details Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role Scope:</Text>
            <Text style={styles.infoVal}>Campus System Manager</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Active Campus Nodes:</Text>
            <Text style={styles.infoVal}>Buildings A, B, C, D</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>AI Services Status:</Text>
            <Text style={styles.infoValStatus}>Connected (v2.4.0)</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <AppIcon name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out Admin Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>SmartAttend Admin Mobile v1.0.0</Text>
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
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    gap: 14,
  },
  avatarBig: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  profileMeta: {
    flex: 1,
  },
  adminName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  adminRole: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  adminEmail: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 2,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  infoValStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
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

export default AdminProfileScreen;
