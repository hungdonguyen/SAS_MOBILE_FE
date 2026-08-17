import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import { AdminSubjectItem, AdminSemesterItem } from '../../types/adminTypes';

const INITIAL_SUBJECTS: AdminSubjectItem[] = [
  {
    id: 'sub-1',
    code: 'WP301',
    name: 'Lập Trình Web Nâng Cao',
    credit: 3,
    description: 'Phát triển ứng dụng Web Fullstack với NestJS và React',
    isActive: true,
    sectionsCount: 4,
  },
  {
    id: 'sub-2',
    code: 'MOB402',
    name: 'Lập Trình Di Động Đa Nền Tảng',
    credit: 3,
    description: 'Xây dựng ứng dụng di động React Native & Flutter',
    isActive: true,
    sectionsCount: 3,
  },
  {
    id: 'sub-3',
    code: 'AI501',
    name: 'Nhập Môn Thị Giác Máy Tính & AI',
    credit: 4,
    description: 'Deep Learning, Face Recognition ArcFace và OpenCV',
    isActive: true,
    sectionsCount: 2,
  },
  {
    id: 'sub-4',
    code: 'DB201',
    name: 'Hệ Quản Trị Cơ Sở Dữ Liệu',
    credit: 3,
    description: 'PostgreSQL, PostGIS, pgvector và tối ưu hóa truy vấn',
    isActive: true,
    sectionsCount: 5,
  },
  {
    id: 'sub-5',
    code: 'NET101',
    name: 'Mạng Máy Tính Cơ Bản',
    credit: 2,
    description: 'Giao thức mạng TCP/IP, Định tuyến CIDR và Bảo mật',
    isActive: false,
    sectionsCount: 0,
  },
];

const INITIAL_SEMESTERS: AdminSemesterItem[] = [
  {
    id: 'sem-1',
    code: 'FA25',
    semesterName: 'Học Kỳ 1 (2025 - 2026)',
    startDate: '2025-09-01',
    endDate: '2026-01-15',
    isActive: true,
    status: 'active',
    sectionsCount: 42,
  },
  {
    id: 'sem-2',
    code: 'SP26',
    semesterName: 'Học Kỳ 2 (2025 - 2026)',
    startDate: '2026-02-01',
    endDate: '2026-06-30',
    isActive: false,
    status: 'upcoming',
    sectionsCount: 38,
  },
  {
    id: 'sem-3',
    code: 'SU25',
    semesterName: 'Học Kỳ Hè 2025',
    startDate: '2025-06-15',
    endDate: '2025-08-30',
    isActive: false,
    status: 'closed',
    sectionsCount: 15,
  },
];

const AdminSubjectsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subjects' | 'semesters'>('subjects');
  const [searchQuery, setSearchQuery] = useState('');

  // Data state
  const [subjects, setSubjects] = useState<AdminSubjectItem[]>(INITIAL_SUBJECTS);
  const [semesters, setSemesters] = useState<AdminSemesterItem[]>(INITIAL_SEMESTERS);

  // Subject Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');
  const [subCredit, setSubCredit] = useState('3');
  const [subDesc, setSubDesc] = useState('');

  // Semester Modal
  const [isSemModalOpen, setIsSemModalOpen] = useState(false);
  const [semName, setSemName] = useState('');
  const [semCode, setSemCode] = useState('');
  const [semStart, setSemStart] = useState('2026-09-01');
  const [semEnd, setSemEnd] = useState('2027-01-15');

  // Filtered lists
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    const q = searchQuery.toLowerCase();
    return subjects.filter(
      (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }, [subjects, searchQuery]);

  const filteredSemesters = useMemo(() => {
    if (!searchQuery.trim()) return semesters;
    const q = searchQuery.toLowerCase();
    return semesters.filter(
      (s) =>
        s.semesterName.toLowerCase().includes(q) ||
        (s.code && s.code.toLowerCase().includes(q))
    );
  }, [semesters, searchQuery]);

  const handleAddSubject = () => {
    if (!subCode.trim() || !subName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập Mã môn học và Tên môn học.');
      return;
    }

    const newItem: AdminSubjectItem = {
      id: `sub-${Date.now()}`,
      code: subCode.trim().toUpperCase(),
      name: subName.trim(),
      credit: parseInt(subCredit, 10) || 3,
      description: subDesc.trim(),
      isActive: true,
      sectionsCount: 0,
    };

    setSubjects([newItem, ...subjects]);
    setIsSubModalOpen(false);
    setSubCode('');
    setSubName('');
    setSubDesc('');
    Alert.alert('Thành Công', `Đã thêm môn học "${newItem.name}" (${newItem.code})`);
  };

  const handleAddSemester = () => {
    if (!semName.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập Tên học kỳ.');
      return;
    }

    const newItem: AdminSemesterItem = {
      id: `sem-${Date.now()}`,
      code: semCode.trim().toUpperCase() || undefined,
      semesterName: semName.trim(),
      startDate: semStart.trim(),
      endDate: semEnd.trim(),
      isActive: false,
      status: 'upcoming',
      sectionsCount: 0,
    };

    setSemesters([newItem, ...semesters]);
    setIsSemModalOpen(false);
    setSemName('');
    setSemCode('');
    Alert.alert('Thành Công', `Đã tạo học kỳ "${newItem.semesterName}"`);
  };

  const handleToggleSubjectActive = (id: string) => {
    setSubjects(
      subjects.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleActivateSemester = (id: string) => {
    setSemesters(
      semesters.map((sem) => ({
        ...sem,
        isActive: sem.id === id,
        status: sem.id === id ? 'active' : sem.status === 'active' ? 'closed' : sem.status,
      }))
    );
    Alert.alert('Cập Nhật', 'Đã chuyển học kỳ này làm Học kỳ hiện tại của hệ thống.');
  };

  const handleDeleteSubject = (id: string, name: string) => {
    Alert.alert('Xóa Môn Học', `Bạn có chắc muốn xóa môn "${name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setSubjects(subjects.filter((s) => s.id !== id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Môn Học & Học Kỳ</Text>
            <Text style={styles.brandSubtitle}>Quản lý chương trình đào tạo & Kế hoạch học</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (activeTab === 'subjects') setIsSubModalOpen(true);
            else setIsSemModalOpen(true);
          }}
        >
          <AppIcon name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>
            {activeTab === 'subjects' ? 'Thêm Môn' : 'Thêm Kỳ'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sub-tabs Selector */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'subjects' && styles.tabButtonActive]}
          onPress={() => setActiveTab('subjects')}
        >
          <AppIcon
            name="book-outline"
            size={16}
            color={activeTab === 'subjects' ? '#6366F1' : '#64748B'}
          />
          <Text style={[styles.tabButtonText, activeTab === 'subjects' && styles.tabButtonTextActive]}>
            Môn Học ({subjects.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'semesters' && styles.tabButtonActive]}
          onPress={() => setActiveTab('semesters')}
        >
          <AppIcon
            name="calendar-outline"
            size={16}
            color={activeTab === 'semesters' ? '#6366F1' : '#64748B'}
          />
          <Text style={[styles.tabButtonText, activeTab === 'semesters' && styles.tabButtonTextActive]}>
            Học Kỳ ({semesters.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={activeTab === 'subjects' ? 'Tìm môn học theo mã hoặc tên...' : 'Tìm học kỳ...'}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'subjects' ? (
          /* SUBJECTS LIST */
          filteredSubjects.length > 0 ? (
            filteredSubjects.map((sub) => (
              <View key={sub.id} style={styles.itemCard}>
                <View style={styles.cardTopRow}>
                  <View style={styles.codeRow}>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeText}>{sub.code}</Text>
                    </View>
                    <View style={styles.creditBadge}>
                      <Text style={styles.creditText}>{sub.credit} Tín chỉ</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.statusPill, sub.isActive ? styles.statusPillActive : styles.statusPillInactive]}
                    onPress={() => handleToggleSubjectActive(sub.id)}
                  >
                    <Text style={[styles.statusPillText, sub.isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                      {sub.isActive ? '● Đang mở' : '○ Tạm đóng'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.subjectName}>{sub.name}</Text>
                {sub.description ? <Text style={styles.subjectDesc}>{sub.description}</Text> : null}

                <View style={styles.cardBottomRow}>
                  <View style={styles.sectionsCountBadge}>
                    <AppIcon name="school-outline" size={14} color="#6366F1" />
                    <Text style={styles.sectionsCountText}>{sub.sectionsCount || 0} Lớp học phần</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSubject(sub.id, sub.name)}
                  >
                    <AppIcon name="trash-outline" size={14} color="#DC2626" />
                    <Text style={styles.deleteText}>Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <AppIcon name="book-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyText}>Không tìm thấy môn học nào</Text>
            </View>
          )
        ) : (
          /* SEMESTERS LIST */
          filteredSemesters.length > 0 ? (
            filteredSemesters.map((sem) => (
              <View key={sem.id} style={[styles.itemCard, sem.isActive && styles.activeSemesterCard]}>
                <View style={styles.cardTopRow}>
                  <View style={styles.codeRow}>
                    {sem.code ? (
                      <View style={styles.semCodeBadge}>
                        <Text style={styles.semCodeText}>{sem.code}</Text>
                      </View>
                    ) : null}
                    <Text style={styles.semesterTitle}>{sem.semesterName}</Text>
                  </View>

                  {sem.isActive ? (
                    <View style={styles.currentActiveBadge}>
                      <AppIcon name="checkmark-circle" size={14} color="#16A34A" />
                      <Text style={styles.currentActiveText}>Học Kỳ Hiện Tại</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.activateBtn}
                      onPress={() => handleActivateSemester(sem.id)}
                    >
                      <Text style={styles.activateBtnText}>Đặt làm hiện tại</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.semesterDatesRow}>
                  <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>Bắt đầu:</Text>
                    <Text style={styles.dateVal}>{sem.startDate}</Text>
                  </View>
                  <AppIcon name="arrow-forward" size={14} color="#94A3B8" />
                  <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>Kết thúc:</Text>
                    <Text style={styles.dateVal}>{sem.endDate}</Text>
                  </View>
                  <View style={styles.semSectionsBadge}>
                    <Text style={styles.semSectionsText}>{sem.sectionsCount || 0} Lớp</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <AppIcon name="calendar-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyText}>Không tìm thấy học kỳ nào</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Modal Add Subject */}
      <Modal visible={isSubModalOpen} transparent animationType="fade" onRequestClose={() => setIsSubModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeaderTitle}>Thêm Môn Học Mới</Text>

            <Text style={styles.inputLabel}>Mã Môn Học (Ví dụ: CS101, WP301):</Text>
            <TextInput
              style={styles.modalInput}
              value={subCode}
              onChangeText={setSubCode}
              placeholder="WP301"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Tên Môn Học:</Text>
            <TextInput
              style={styles.modalInput}
              value={subName}
              onChangeText={setSubName}
              placeholder="Lập Trình Web Nâng Cao"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Số Tín Chỉ:</Text>
            <TextInput
              style={styles.modalInput}
              value={subCredit}
              onChangeText={setSubCredit}
              placeholder="3"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Mô Tả:</Text>
            <TextInput
              style={[styles.modalInput, { minHeight: 60 }]}
              value={subDesc}
              onChangeText={setSubDesc}
              placeholder="Nội dung tóm tắt môn học..."
              placeholderTextColor="#94A3B8"
              multiline
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsSubModalOpen(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddSubject}>
                <Text style={styles.modalSaveText}>Tạo Môn Học</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Add Semester */}
      <Modal visible={isSemModalOpen} transparent animationType="fade" onRequestClose={() => setIsSemModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeaderTitle}>Thêm Học Kỳ Mới</Text>

            <Text style={styles.inputLabel}>Tên Học Kỳ (Ví dụ: Học Kỳ 1 (2026 - 2027)):</Text>
            <TextInput
              style={styles.modalInput}
              value={semName}
              onChangeText={setSemName}
              placeholder="Học Kỳ 1 (2026 - 2027)"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Mã Học Kỳ (Tùy chọn, ví dụ: FA26):</Text>
            <TextInput
              style={styles.modalInput}
              value={semCode}
              onChangeText={setSemCode}
              placeholder="FA26"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Ngày Bắt Đầu (YYYY-MM-DD):</Text>
            <TextInput
              style={styles.modalInput}
              value={semStart}
              onChangeText={setSemStart}
              placeholder="2026-09-01"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Ngày Kết Thúc (YYYY-MM-DD):</Text>
            <TextInput
              style={styles.modalInput}
              value={semEnd}
              onChangeText={setSemEnd}
              placeholder="2027-01-15"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsSemModalOpen(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddSemester}>
                <Text style={styles.modalSaveText}>Tạo Học Kỳ</Text>
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  addButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#6366F1',
    fontWeight: '700',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  activeSemesterCard: {
    borderColor: '#6366F1',
    borderWidth: 1.5,
    backgroundColor: '#FAF5FF',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6366F1',
  },
  creditBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  creditText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillActive: {
    backgroundColor: '#DCFCE7',
  },
  statusPillInactive: {
    backgroundColor: '#F1F5F9',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#16A34A',
  },
  statusTextInactive: {
    color: '#94A3B8',
  },
  subjectName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subjectDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 10,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sectionsCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionsCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  semCodeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  semCodeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6366F1',
  },
  semesterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  currentActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  currentActiveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  activateBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activateBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
  },
  semesterDatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  dateCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  dateVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  semSectionsBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  semSectionsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 8,
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
  modalHeaderTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 12,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
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
    backgroundColor: '#6366F1',
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

export default AdminSubjectsScreen;
