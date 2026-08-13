import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import { AdminUserItem, AdminUserRole } from '../../types/adminTypes';

const MOCK_ADMIN_USERS: AdminUserItem[] = [
  {
    id: 'u-1',
    username: '21110001',
    fullName: 'Nguyễn Văn An',
    email: 'an.nv@eiu.edu.vn',
    role: 'student',
    department: 'Software Engineering',
    faceRegistered: true,
    registeredAt: '2026-01-15',
    avatarInitials: 'NA',
  },
  {
    id: 'u-2',
    username: '21110002',
    fullName: 'Trần Thị Bích',
    email: 'bich.tb@eiu.edu.vn',
    role: 'student',
    department: 'Computer Science',
    faceRegistered: true,
    registeredAt: '2026-02-10',
    avatarInitials: 'TB',
  },
  {
    id: 'u-3',
    username: '21110003',
    fullName: 'Lê Minh Châu',
    email: 'chau.lm@eiu.edu.vn',
    role: 'student',
    department: 'Software Engineering',
    faceRegistered: false,
    avatarInitials: 'LC',
  },
  {
    id: 'u-4',
    username: 'lec-101',
    fullName: 'TS. Nguyễn Văn A',
    email: 'a.nguyen@eiu.edu.vn',
    role: 'lecturer',
    department: 'Faculty of IT',
    faceRegistered: true,
    registeredAt: '2025-09-01',
    avatarInitials: 'NA',
  },
  {
    id: 'u-5',
    username: 'lec-102',
    fullName: 'ThS. Trần Thị B',
    email: 'b.tran@eiu.edu.vn',
    role: 'lecturer',
    department: 'Faculty of IT',
    faceRegistered: true,
    registeredAt: '2025-09-05',
    avatarInitials: 'TB',
  },
];

const AdminUsersScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'lecturer'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);

  const filteredUsers = MOCK_ADMIN_USERS.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.fullName.toLowerCase().includes(q) ||
      user.username.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  const handleAddUser = () => {
    Alert.alert('Add User', 'Opening new user creation dialog.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>Manage students, lecturers, and biometric data</Text>
        </View>

        <TouchableOpacity style={styles.addUserBtn} onPress={handleAddUser} activeOpacity={0.85}>
          <AppIcon name="people-outline" size={15} color="#FFFFFF" />
          <Text style={styles.addUserBtnText}>Add User</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search user name, ID, email..."
      />

      {/* Role Filter Tabs */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterPill, roleFilter === 'all' && styles.filterPillActive]}
          onPress={() => setRoleFilter('all')}
        >
          <Text style={[styles.filterText, roleFilter === 'all' && styles.filterTextActive]}>
            All ({MOCK_ADMIN_USERS.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, roleFilter === 'student' && styles.filterPillActive]}
          onPress={() => setRoleFilter('student')}
        >
          <Text style={[styles.filterText, roleFilter === 'student' && styles.filterTextActive]}>
            Students (3)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, roleFilter === 'lecturer' && styles.filterPillActive]}
          onPress={() => setRoleFilter('lecturer')}
        >
          <Text style={[styles.filterText, roleFilter === 'lecturer' && styles.filterTextActive]}>
            Lecturers (2)
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Cards List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredUsers.map((user) => {
          const isStudent = user.role === 'student';

          return (
            <TouchableOpacity
              key={user.id}
              style={styles.card}
              onPress={() => setSelectedUser(user)}
              activeOpacity={0.85}
            >
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: isStudent ? '#6366F1' : '#0D9488' },
                  ]}
                >
                  <Text style={styles.avatarText}>{user.avatarInitials}</Text>
                </View>

                <View style={styles.infoCol}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{user.fullName}</Text>
                    <View
                      style={[
                        styles.roleBadge,
                        isStudent ? styles.roleStudent : styles.roleLecturer,
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          isStudent ? styles.roleTextStudent : styles.roleTextLecturer,
                        ]}
                      >
                        {user.role}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.userMetaText}>ID: {user.username} • {user.department}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                {user.faceRegistered ? (
                  <View style={styles.faceRegBadge}>
                    <AppIcon name="checkmark-circle-outline" size={12} color="#0F766E" />
                    <Text style={styles.faceRegText}>Face OK</Text>
                  </View>
                ) : (
                  <View style={styles.facePendingBadge}>
                    <AppIcon name="time-outline" size={12} color="#B45309" />
                    <Text style={styles.facePendingText}>Pending</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* User Detail Modal */}
      {selectedUser && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>User Profile Details</Text>
                <TouchableOpacity onPress={() => setSelectedUser(null)}>
                  <AppIcon name="close-circle" size={22} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.modalAvatarRow}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>{selectedUser.avatarInitials}</Text>
                  </View>
                  <View>
                    <Text style={styles.modalName}>{selectedUser.fullName}</Text>
                    <Text style={styles.modalSub}>{selectedUser.email}</Text>
                  </View>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Username/ID:</Text>
                  <Text style={styles.modalVal}>{selectedUser.username}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Role:</Text>
                  <Text style={styles.modalVal}>{selectedUser.role.toUpperCase()}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Department:</Text>
                  <Text style={styles.modalVal}>{selectedUser.department}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Face Biometrics:</Text>
                  <Text style={styles.modalVal}>
                    {selectedUser.faceRegistered
                      ? `Registered (${selectedUser.registeredAt})`
                      : 'Not Registered Yet'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedUser(null)}
              >
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 4,
  },
  addUserBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#6366F1',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  roleStudent: { backgroundColor: '#EEF2FF' },
  roleLecturer: { backgroundColor: '#CCFBF1' },
  roleText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  roleTextStudent: { color: '#4F46E5' },
  roleTextLecturer: { color: '#0F766E' },
  userMetaText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  userEmail: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  faceRegBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  faceRegText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F766E',
  },
  facePendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  facePendingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    gap: 12,
    marginBottom: 20,
  },
  modalAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  modalName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  modalVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalCloseBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default AdminUsersScreen;
