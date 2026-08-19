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
    name: 'Advanced Web Programming',
    credit: 3,
    description: 'Fullstack Web Application Development with NestJS and React',
    isActive: true,
    sectionsCount: 4,
  },
  {
    id: 'sub-2',
    code: 'MOB402',
    name: 'Cross-Platform Mobile Development',
    credit: 3,
    description: 'Mobile App Development with React Native & Flutter',
    isActive: true,
    sectionsCount: 3,
  },
  {
    id: 'sub-3',
    code: 'AI501',
    name: 'Introduction to Computer Vision & AI',
    credit: 4,
    description: 'Deep Learning, ArcFace Recognition, and OpenCV',
    isActive: true,
    sectionsCount: 2,
  },
  {
    id: 'sub-4',
    code: 'DB201',
    name: 'Database Management Systems',
    credit: 3,
    description: 'PostgreSQL, PostGIS, pgvector, and Query Optimization',
    isActive: true,
    sectionsCount: 5,
  },
  {
    id: 'sub-5',
    code: 'NET101',
    name: 'Computer Networks Fundamentals',
    credit: 2,
    description: 'TCP/IP Protocols, CIDR Routing, and Network Security',
    isActive: false,
    sectionsCount: 0,
  },
];

const INITIAL_SEMESTERS: AdminSemesterItem[] = [
  {
    id: 'sem-1',
    code: 'FA25',
    semesterName: 'Semester 1 (2025 - 2026)',
    startDate: '2025-09-01',
    endDate: '2026-01-15',
    isActive: true,
    status: 'active',
    sectionsCount: 42,
  },
  {
    id: 'sem-2',
    code: 'SP26',
    semesterName: 'Semester 2 (2025 - 2026)',
    startDate: '2026-02-01',
    endDate: '2026-06-30',
    isActive: false,
    status: 'upcoming',
    sectionsCount: 38,
  },
  {
    id: 'sem-3',
    code: 'SU25',
    semesterName: 'Summer Semester 2025',
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
      Alert.alert('Missing Information', 'Please enter Subject Code and Name.');
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
    Alert.alert('Success', `Subject "${newItem.name}" (${newItem.code}) added successfully`);
  };

  const handleAddSemester = () => {
    if (!semName.trim()) {
      Alert.alert('Missing Information', 'Please enter Semester Name.');
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
    Alert.alert('Success', `Semester "${newItem.semesterName}" created successfully`);
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
    Alert.alert('Updated', 'Set this semester as the active system semester.');
  };

  const handleDeleteSubject = (id: string, name: string) => {
    Alert.alert('Delete Subject', `Are you sure you want to delete subject "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
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
            <Text style={styles.brandTitle}>Subjects & Semesters</Text>
            <Text style={styles.brandSubtitle}>Manage curriculum & academic calendar</Text>
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
            {activeTab === 'subjects' ? 'Add Subject' : 'Add Semester'}
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
            Subjects ({subjects.length})
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
            Semesters ({semesters.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={activeTab === 'subjects' ? 'Search subject by code or name...' : 'Search semester...'}
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
                      <Text style={styles.creditText}>{sub.credit} Credits</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.statusPill, sub.isActive ? styles.statusPillActive : styles.statusPillInactive]}
                    onPress={() => handleToggleSubjectActive(sub.id)}
                  >
                    <Text style={[styles.statusPillText, sub.isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                      {sub.isActive ? '● Active' : '○ Inactive'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.subjectName}>{sub.name}</Text>
                {sub.description ? <Text style={styles.subjectDesc}>{sub.description}</Text> : null}

                <View style={styles.cardBottomRow}>
                  <View style={styles.sectionsCountBadge}>
                    <AppIcon name="school-outline" size={14} color="#6366F1" />
                    <Text style={styles.sectionsCountText}>{sub.sectionsCount || 0} Sections</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteSubject(sub.id, sub.name)}
                  >
                    <AppIcon name="trash-outline" size={14} color="#DC2626" />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <AppIcon name="book-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyText}>No subjects found</Text>
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
                      <Text style={styles.currentActiveText}>Current Active Semester</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.activateBtn}
                      onPress={() => handleActivateSemester(sem.id)}
                    >
                      <Text style={styles.activateBtnText}>Set as Active</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.semesterDatesRow}>
                  <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>Start:</Text>
                    <Text style={styles.dateVal}>{sem.startDate}</Text>
                  </View>
                  <AppIcon name="arrow-forward" size={14} color="#94A3B8" />
                  <View style={styles.dateCol}>
                    <Text style={styles.dateLabel}>End:</Text>
                    <Text style={styles.dateVal}>{sem.endDate}</Text>
                  </View>
                  <View style={styles.semSectionsBadge}>
                    <Text style={styles.semSectionsText}>{sem.sectionsCount || 0} Sections</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <AppIcon name="calendar-outline" size={36} color="#CBD5E1" />
              <Text style={styles.emptyText}>No semesters found</Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Modal Add Subject */}
      <Modal visible={isSubModalOpen} transparent animationType="fade" onRequestClose={() => setIsSubModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeaderTitle}>Add New Subject</Text>

            <Text style={styles.inputLabel}>Subject Code (e.g., CS101, WP301):</Text>
            <TextInput
              style={styles.modalInput}
              value={subCode}
              onChangeText={setSubCode}
              placeholder="WP301"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Subject Name:</Text>
            <TextInput
              style={styles.modalInput}
              value={subName}
              onChangeText={setSubName}
              placeholder="Advanced Web Programming"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Credits:</Text>
            <TextInput
              style={styles.modalInput}
              value={subCredit}
              onChangeText={setSubCredit}
              placeholder="3"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Description:</Text>
            <TextInput
              style={[styles.modalInput, { minHeight: 60 }]}
              value={subDesc}
              onChangeText={setSubDesc}
              placeholder="Course syllabus summary..."
              placeholderTextColor="#94A3B8"
              multiline
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsSubModalOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddSubject}>
                <Text style={styles.modalSaveText}>Create Subject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Add Semester */}
      <Modal visible={isSemModalOpen} transparent animationType="fade" onRequestClose={() => setIsSemModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeaderTitle}>Add New Semester</Text>

            <Text style={styles.inputLabel}>Semester Name (e.g., Semester 1 (2026 - 2027)):</Text>
            <TextInput
              style={styles.modalInput}
              value={semName}
              onChangeText={setSemName}
              placeholder="Semester 1 (2026 - 2027)"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Semester Code (Optional, e.g., FA26):</Text>
            <TextInput
              style={styles.modalInput}
              value={semCode}
              onChangeText={setSemCode}
              placeholder="FA26"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD):</Text>
            <TextInput
              style={styles.modalInput}
              value={semStart}
              onChangeText={setSemStart}
              placeholder="2026-09-01"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>End Date (YYYY-MM-DD):</Text>
            <TextInput
              style={styles.modalInput}
              value={semEnd}
              onChangeText={setSemEnd}
              placeholder="2027-01-15"
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsSemModalOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddSemester}>
                <Text style={styles.modalSaveText}>Create Semester</Text>
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
