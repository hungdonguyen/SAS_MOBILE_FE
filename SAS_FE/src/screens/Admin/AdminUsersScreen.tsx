import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import { userService, UserResponse, UserDetailResponse } from '../../api';

const AdminUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'lecturer'>('all');
  const [selectedUser, setSelectedUser] = useState<UserDetailResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'student' | 'lecturer'>('student');
  const [newDepartment, setNewDepartment] = useState('');

  const loadUsers = useCallback(async (search?: string, role?: string) => {
    try {
      setLoading(true);
      const res = await userService.listUsers({
        q: search !== undefined ? search : searchQuery,
        role: (role !== undefined ? role : roleFilter) === 'all' ? undefined : (role || roleFilter) as any,
        limit: 50,
      });
      setUsers(res.data);
    } catch (error: any) {
      console.log('Error loading users:', error);
      Alert.alert('Error', error.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, roleFilter]);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleUserCardPress = async (user: UserResponse) => {
    try {
      setIsDetailLoading(true);
      setSelectedUser(user as UserDetailResponse);
      const detail = await userService.getUserById(user.userId);
      setSelectedUser(detail);
    } catch (error) {
      // Fallback to item
      setSelectedUser(user as UserDetailResponse);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername.trim() || !newFullName.trim() || !newEmail.trim()) {
      Alert.alert('Validation Error', 'Please fill in Username, Full Name, and Email.');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await userService.createUser({
        username: newUsername.trim(),
        fullName: newFullName.trim(),
        email: newEmail.trim(),
        roleName: newRole,
        department: newDepartment.trim() || undefined,
      });

      setShowAddModal(false);
      setNewUsername('');
      setNewFullName('');
      setNewEmail('');
      setNewDepartment('');

      if (created.temporaryPassword) {
        Alert.alert(
          'User Created Successfully',
          `User ${created.fullName} has been registered.\n\nTemporary Password: ${created.temporaryPassword}\n\nPlease save this password securely.`
        );
      } else {
        Alert.alert('Success', `User ${created.fullName} has been created.`);
      }

      loadUsers();
    } catch (error: any) {
      Alert.alert('Creation Failed', error.message || 'Could not create user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = (user: UserDetailResponse) => {
    Alert.alert(
      'Reset Password',
      `Generate a new temporary password for ${user.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await userService.resetPassword(user.userId);
              Alert.alert(
                'Password Reset Complete',
                `New Temporary Password:\n\n${res.temporaryPassword}\n\nThe user must change this on their next login.`
              );
            } catch (error: any) {
              Alert.alert('Reset Failed', error.message || 'Unable to reset password.');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (user: UserDetailResponse) => {
    const newStatus = !user.isActive;
    const actionName = newStatus ? 'Reactivate' : 'Deactivate';

    Alert.alert(
      `${actionName} Account`,
      `Are you sure you want to ${actionName.toLowerCase()} account for ${user.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionName,
          style: newStatus ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await userService.updateUserStatus(user.userId, { isActive: newStatus });
              setSelectedUser({ ...user, isActive: newStatus });
              setUsers((prev) =>
                prev.map((u) => (u.userId === user.userId ? { ...u, isActive: newStatus } : u))
              );
              Alert.alert('Success', `User account is now ${newStatus ? 'active' : 'deactivated'}.`);
            } catch (error: any) {
              Alert.alert('Action Failed', error.message || 'Status update failed.');
            }
          },
        },
      ]
    );
  };

  const getInitials = (name?: string) => {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Screen Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>User Management</Text>
          <Text style={styles.headerSubtitle}>Manage students, lecturers, and biometric status</Text>
        </View>

        <TouchableOpacity
          style={styles.addUserBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.85}
        >
          <AppIcon name="add" size={16} color="#FFFFFF" />
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
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, roleFilter === 'student' && styles.filterPillActive]}
          onPress={() => setRoleFilter('student')}
        >
          <Text style={[styles.filterText, roleFilter === 'student' && styles.filterTextActive]}>
            Students
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, roleFilter === 'lecturer' && styles.filterPillActive]}
          onPress={() => setRoleFilter('lecturer')}
        >
          <Text style={[styles.filterText, roleFilter === 'lecturer' && styles.filterTextActive]}>
            Lecturers
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Cards List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.centerText}>Loading accounts from campus database...</Text>
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppIcon name="people-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptySubtitle}>Try changing your search term or role filter.</Text>
          </View>
        ) : (
          users.map((user) => {
            const isStudent = user.role === 'student';
            const isLecturer = user.role === 'lecturer';

            return (
              <TouchableOpacity
                key={user.userId}
                style={[styles.card, !user.isActive && styles.cardInactive]}
                onPress={() => handleUserCardPress(user)}
                activeOpacity={0.85}
              >
                <View style={styles.cardLeft}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: isStudent ? '#6366F1' : isLecturer ? '#0D9488' : '#3B82F6' },
                    ]}
                  >
                    <Text style={styles.avatarText}>{getInitials(user.fullName || user.username)}</Text>
                  </View>

                  <View style={styles.infoCol}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{user.fullName}</Text>
                      <View
                        style={[
                          styles.roleBadge,
                          isStudent ? styles.roleStudent : isLecturer ? styles.roleLecturer : styles.roleAdmin,
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleText,
                            isStudent ? styles.roleTextStudent : isLecturer ? styles.roleTextLecturer : styles.roleTextAdmin,
                          ]}
                        >
                          {user.role}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.userMetaText}>ID: {user.username}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>

                <View style={styles.cardRight}>
                  {user.hasFaceRegistered ? (
                    <View style={styles.faceRegBadge}>
                      <AppIcon name="checkmark-circle-outline" size={12} color="#0F766E" />
                      <Text style={styles.faceRegText}>Face OK</Text>
                    </View>
                  ) : (
                    <View style={styles.facePendingBadge}>
                      <AppIcon name="time-outline" size={12} color="#B45309" />
                      <Text style={styles.facePendingText}>No Face</Text>
                    </View>
                  )}
                  {!user.isActive && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveBadgeText}>Inactive</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* User Detail Modal */}
      {selectedUser && (
        <Modal visible transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>User Profile Details</Text>
                <TouchableOpacity onPress={() => setSelectedUser(null)}>
                  <AppIcon name="close-circle" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.modalAvatarRow}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>{getInitials(selectedUser.fullName)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalName}>{selectedUser.fullName}</Text>
                    <Text style={styles.modalSub}>{selectedUser.email}</Text>
                  </View>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Username / ID:</Text>
                  <Text style={styles.modalVal}>{selectedUser.username}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Role:</Text>
                  <Text style={styles.modalVal}>{selectedUser.role?.toUpperCase()}</Text>
                </View>
                {selectedUser.lecturerProfile?.department && (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Department:</Text>
                    <Text style={styles.modalVal}>{selectedUser.lecturerProfile.department}</Text>
                  </View>
                )}
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Face Biometrics:</Text>
                  <Text style={styles.modalVal}>
                    {selectedUser.studentProfile?.hasFaceData
                      ? `Registered (${selectedUser.studentProfile?.registeredAt ? selectedUser.studentProfile.registeredAt.substring(0, 10) : 'Active'})`
                      : selectedUser.hasFaceRegistered
                      ? 'Registered'
                      : 'Not Registered'}
                  </Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Account Status:</Text>
                  <Text style={selectedUser.isActive ? styles.statusActiveText : styles.statusInactiveText}>
                    {selectedUser.isActive ? 'Active Account' : 'Deactivated'}
                  </Text>
                </View>

                {/* Quick Action Buttons */}
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtnReset}
                    onPress={() => handleResetPassword(selectedUser)}
                    activeOpacity={0.8}
                  >
                    <AppIcon name="key-outline" size={14} color="#4F46E5" />
                    <Text style={styles.actionBtnResetText}>Reset Password</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtnToggle, !selectedUser.isActive && styles.actionBtnReactivate]}
                    onPress={() => handleToggleStatus(selectedUser)}
                    activeOpacity={0.8}
                  >
                    <AppIcon
                      name={selectedUser.isActive ? 'lock-closed-outline' : 'lock-open-outline'}
                      size={14}
                      color={selectedUser.isActive ? '#EF4444' : '#10B981'}
                    />
                    <Text
                      style={[
                        styles.actionBtnToggleText,
                        !selectedUser.isActive && styles.actionBtnReactivateText,
                      ]}
                    >
                      {selectedUser.isActive ? 'Deactivate' : 'Reactivate'}
                    </Text>
                  </TouchableOpacity>
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

      {/* Add User Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Account</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <AppIcon name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.addForm}>
              <Text style={styles.inputLabel}>Username / Student ID *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 21110045 or lec-105"
                placeholderTextColor="#94A3B8"
                value={newUsername}
                onChangeText={setNewUsername}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Nguyễn Văn A"
                placeholderTextColor="#94A3B8"
                value={newFullName}
                onChangeText={setNewFullName}
              />

              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. an.nv@eiu.edu.vn"
                placeholderTextColor="#94A3B8"
                value={newEmail}
                onChangeText={setNewEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Role</Text>
              <View style={styles.rolePickerRow}>
                <TouchableOpacity
                  style={[styles.roleSelectPill, newRole === 'student' && styles.roleSelectPillActive]}
                  onPress={() => setNewRole('student')}
                >
                  <Text style={[styles.roleSelectText, newRole === 'student' && styles.roleSelectTextActive]}>
                    Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.roleSelectPill, newRole === 'lecturer' && styles.roleSelectPillActive]}
                  onPress={() => setNewRole('lecturer')}
                >
                  <Text style={[styles.roleSelectText, newRole === 'lecturer' && styles.roleSelectTextActive]}>
                    Lecturer
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Department / Faculty (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Software Engineering"
                placeholderTextColor="#94A3B8"
                value={newDepartment}
                onChangeText={setNewDepartment}
              />

              <TouchableOpacity
                style={[styles.submitUserBtn, isSubmitting && styles.btnDisabled]}
                onPress={handleCreateUser}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitUserBtnText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  roleAdmin: { backgroundColor: '#DBEAFE' },
  roleText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  roleTextStudent: { color: '#4F46E5' },
  roleTextLecturer: { color: '#0F766E' },
  roleTextAdmin: { color: '#1D4ED8' },
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
    gap: 4,
  },
  cardInactive: {
    opacity: 0.65,
    backgroundColor: '#F8FAFC',
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
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inactiveBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EF4444',
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  centerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
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
    maxHeight: '90%',
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
    maxWidth: '60%',
    textAlign: 'right',
  },
  statusActiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  statusInactiveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  actionBtnReset: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnResetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  actionBtnToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionBtnToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  actionBtnReactivate: {
    backgroundColor: '#DCFCE7',
  },
  actionBtnReactivateText: {
    color: '#15803D',
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
  addForm: {
    gap: 10,
    paddingBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  formInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    fontSize: 14,
    color: '#0F172A',
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleSelectPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleSelectPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  roleSelectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  roleSelectTextActive: {
    color: '#4F46E5',
    fontWeight: '700',
  },
  submitUserBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  submitUserBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});

export default AdminUsersScreen;
