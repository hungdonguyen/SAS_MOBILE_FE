import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import AttendanceStatusPicker from '../../components/AttendanceStatusPicker/AttendanceStatusPicker';
import {
  ClassDetailsData,
  ClassSession,
  StudentAttendanceRecord,
  AttendanceStatus,
} from '../../types/classDetails';

// Initial Mock Data reflecting the provided reference image (image_input_0.png)
const MOCK_CLASS_DETAILS: ClassDetailsData = {
  classId: 'WP301',
  subjectName: 'Web Programming',
  room: 'A3-201',
  scheduleInfo: 'Thứ 3, Thứ 5 • 07:30 - 09:30',
  totalEnrolled: 32,
  sessions: [
    {
      id: 'sess-1',
      date: '2026-08-12',
      dayOfWeek: 'Thứ 5',
      timeRange: '07:30 - 09:30',
      presentCount: 28,
      lateCount: 2,
      absentCount: 2,
      excusedCount: 0,
      attendanceRate: 88,
    },
    {
      id: 'sess-2',
      date: '2026-05-10',
      dayOfWeek: 'Thứ 3',
      timeRange: '07:30 - 09:30',
      presentCount: 30,
      lateCount: 1,
      absentCount: 1,
      excusedCount: 0,
      attendanceRate: 94,
    },
    {
      id: 'sess-3',
      date: '2026-05-05',
      dayOfWeek: 'Thứ 5',
      timeRange: '07:30 - 09:30',
      presentCount: 29,
      lateCount: 0,
      absentCount: 3,
      excusedCount: 0,
      attendanceRate: 91,
    },
    {
      id: 'sess-4',
      date: '2026-05-03',
      dayOfWeek: 'Thứ 3',
      timeRange: '07:30 - 09:30',
      presentCount: 31,
      lateCount: 1,
      absentCount: 0,
      excusedCount: 0,
      attendanceRate: 97,
    },
    {
      id: 'sess-5',
      date: '2026-05-29',
      dayOfWeek: 'Thứ 5',
      timeRange: '07:30 - 09:30',
      presentCount: 27,
      lateCount: 3,
      absentCount: 2,
      excusedCount: 0,
      attendanceRate: 84,
    },
  ],
  students: [
    {
      id: '21110001',
      studentName: 'Nguyễn Văn An',
      email: 'an.nv@eiu.edu.vn',
      avatarInitials: 'NA',
      device: 'iPhone 15',
      checkInTime: '07:32',
      method: 'AI',
      status: 'present',
    },
    {
      id: '21110002',
      studentName: 'Trần Thị Bích',
      email: 'bich.tb@eiu.edu.vn',
      avatarInitials: 'TB',
      device: 'Samsung S24',
      checkInTime: '07:28',
      method: 'AI',
      status: 'present',
    },
    {
      id: '21110003',
      studentName: 'Lê Minh Châu',
      email: 'chau.lm@eiu.edu.vn',
      avatarInitials: 'LC',
      device: 'Pixel 8',
      checkInTime: '07:45',
      method: 'AI',
      status: 'late',
    },
    {
      id: '21110004',
      studentName: 'Phạm Đức Dũng',
      email: 'dung.pd@eiu.edu.vn',
      avatarInitials: 'PD',
      device: '—',
      checkInTime: '—',
      method: '—',
      status: 'absent',
    },
    {
      id: '21110005',
      studentName: 'Hoàng Thị Vy',
      email: 'vy.ht@eiu.edu.vn',
      avatarInitials: 'HV',
      device: 'iPhone 14',
      checkInTime: '07:30',
      method: 'AI',
      status: 'present',
    },
    {
      id: '21110006',
      studentName: 'Võ Quốc Phong',
      email: 'phong.vq@eiu.edu.vn',
      avatarInitials: 'VP',
      device: 'Xiaomi 14',
      checkInTime: '07:35',
      method: 'AI',
      status: 'present',
    },
    {
      id: '21110007',
      studentName: 'Ngô Thanh Tâm',
      email: 'tam.nt@eiu.edu.vn',
      avatarInitials: 'NT',
      device: '—',
      checkInTime: '—',
      method: '—',
      status: 'absent',
    },
    {
      id: '21110008',
      studentName: 'Đỗ Hồng Hạnh',
      email: 'hanh.dh@eiu.edu.vn',
      avatarInitials: 'DH',
      device: 'iPhone 15 Pro',
      checkInTime: '07:31',
      method: 'AI',
      status: 'present',
    },
    {
      id: '21110009',
      studentName: 'Bùi Anh Tuấn',
      email: 'tuan.ba@eiu.edu.vn',
      avatarInitials: 'BT',
      device: 'Samsung A54',
      checkInTime: '07:50',
      method: 'Manual',
      status: 'late',
    },
    {
      id: '21110010',
      studentName: 'Lý Thị Mai',
      email: 'mai.lt@eiu.edu.vn',
      avatarInitials: 'LM',
      device: 'OPPO Reno',
      checkInTime: '07:29',
      method: 'AI',
      status: 'present',
    },
  ],
};

interface ClassDetailScreenProps {
  navigation: any;
  route?: any;
}

const ClassDetailScreen: React.FC<ClassDetailScreenProps> = ({ navigation, route }) => {
  const classData = MOCK_CLASS_DETAILS;
  const classId = route?.params?.classId || classData.classId;

  const [selectedSessionId, setSelectedSessionId] = useState<string>('sess-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [students, setStudents] = useState<StudentAttendanceRecord[]>(classData.students);

  const selectedSession = useMemo(() => {
    return classData.sessions.find((s) => s.id === selectedSessionId) || classData.sessions[0];
  }, [selectedSessionId]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.device.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((item) => (item.id === studentId ? { ...item, status: newStatus } : item))
    );
  };

  const handleSaveChanges = () => {
    Alert.alert('Save Changes', 'Attendance updates saved successfully for ' + selectedSession.date + '.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top App Header */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <AppIcon name="chevron-forward-outline" size={20} color="#0F172A" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>

          <View>
            <Text style={styles.classTitle}>
              Class details: <Text style={styles.classIdText}>{classId}</Text>
            </Text>
            <Text style={styles.classMetaSubtitle}>
              {classData.subjectName} • {classData.room} • {classData.scheduleInfo}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveChangesBtn}
          onPress={handleSaveChanges}
          activeOpacity={0.85}
        >
          <AppIcon name="checkmark-circle-outline" size={14} color="#FFFFFF" />
          <Text style={styles.saveChangesText}>Save changes</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search student, ID, device..."
      />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Session List Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Session List</Text>
              <Text style={styles.sectionSubtitle}>Select a session to view/edit attendance</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sessionsHorizontalList}
          >
            {classData.sessions.map((sess) => {
              const isSelected = sess.id === selectedSessionId;
              return (
                <TouchableOpacity
                  key={sess.id}
                  style={[
                    styles.sessionCard,
                    isSelected && styles.sessionCardSelected,
                  ]}
                  onPress={() => setSelectedSessionId(sess.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.sessionDateRow}>
                    <AppIcon
                      name="calendar-outline"
                      size={15}
                      color={isSelected ? '#0D9488' : '#64748B'}
                    />
                    <Text
                      style={[
                        styles.sessionDateText,
                        isSelected && styles.sessionDateTextSelected,
                      ]}
                    >
                      {sess.date}
                    </Text>
                  </View>
                  <Text style={styles.sessionMetaText}>
                    {sess.dayOfWeek} • {sess.timeRange}
                  </Text>

                  <View style={styles.sessionStatsRow}>
                    <View style={styles.statMiniItem}>
                      <Text style={styles.statMiniIcon}>👤</Text>
                      <Text style={styles.statMiniVal}>{sess.presentCount}</Text>
                    </View>
                    <View style={styles.statMiniItem}>
                      <Text style={styles.statMiniIcon}>⚠️</Text>
                      <Text style={styles.statMiniVal}>{sess.lateCount}</Text>
                    </View>
                    <View style={styles.statMiniItem}>
                      <Text style={styles.statMiniIcon}>🚫</Text>
                      <Text style={styles.statMiniVal}>{sess.absentCount}</Text>
                    </View>

                    <Text style={styles.sessionRateBadge}>{sess.attendanceRate}%</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Attendance Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <AppIcon name="trending-up" size={16} color="#0D9488" />
            <Text style={styles.summaryTitle}>Attendance Summary</Text>
          </View>

          <View style={styles.summaryMetricsRow}>
            {/* Present Metric */}
            <View style={styles.metricBox}>
              <View style={styles.metricHeaderRow}>
                <View style={[styles.dotIndicator, { backgroundColor: '#10B981' }]} />
                <Text style={styles.metricLabel}>Present</Text>
              </View>
              <Text style={styles.metricVal}>145</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '91%', backgroundColor: '#10B981' }]} />
              </View>
              <Text style={styles.metricPercent}>91%</Text>
            </View>

            {/* Late Metric */}
            <View style={styles.metricBox}>
              <View style={styles.metricHeaderRow}>
                <View style={[styles.dotIndicator, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.metricLabel}>Late</Text>
              </View>
              <Text style={styles.metricVal}>7</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '4%', backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={styles.metricPercent}>4%</Text>
            </View>

            {/* Absent Metric */}
            <View style={styles.metricBox}>
              <View style={styles.metricHeaderRow}>
                <View style={[styles.dotIndicator, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.metricLabel}>Absent</Text>
              </View>
              <Text style={styles.metricVal}>8</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '5%', backgroundColor: '#EF4444' }]} />
              </View>
              <Text style={styles.metricPercent}>5%</Text>
            </View>
          </View>
        </View>

        {/* Student Attendance List */}
        <View style={styles.studentsHeaderRow}>
          <Text style={styles.studentsHeaderTitle}>
            Student List ({filteredStudents.length})
          </Text>
          <Text style={styles.sessionActiveDateLabel}>
            Session: {selectedSession.date}
          </Text>
        </View>

        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const isAI = student.method === 'AI';
            const isManual = student.method === 'Manual';

            return (
              <View key={student.id} style={styles.studentCard}>
                {/* Student Top Row: Avatar, Name, ID */}
                <View style={styles.studentMainRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{student.avatarInitials}</Text>
                  </View>

                  <View style={styles.studentInfoCol}>
                    <View style={styles.nameIdRow}>
                      <Text style={styles.studentName}>{student.studentName}</Text>
                      <Text style={styles.studentIdBadge}>{student.id}</Text>
                    </View>
                    <Text style={styles.studentEmail}>{student.email}</Text>
                  </View>
                </View>

                {/* Details Row: Device, Time, Method Badge */}
                <View style={styles.studentMetaRow}>
                  <View style={styles.metaSubItem}>
                    <Text style={styles.metaLabel}>Device:</Text>
                    <Text style={styles.metaValue}>{student.device}</Text>
                  </View>

                  <View style={styles.metaSubItem}>
                    <Text style={styles.metaLabel}>Time:</Text>
                    <Text style={styles.metaValue}>{student.checkInTime}</Text>
                  </View>

                  <View style={styles.metaSubItem}>
                    <Text style={styles.metaLabel}>Method:</Text>
                    {isAI ? (
                      <View style={styles.methodBadgeAI}>
                        <Text style={styles.methodTextAI}>AI</Text>
                      </View>
                    ) : isManual ? (
                      <View style={styles.methodBadgeManual}>
                        <Text style={styles.methodTextManual}>Manual</Text>
                      </View>
                    ) : (
                      <Text style={styles.metaValue}>—</Text>
                    )}
                  </View>
                </View>

                {/* Status Toggle Bar */}
                <View style={styles.statusPickerWrapper}>
                  <AttendanceStatusPicker
                    currentStatus={student.status}
                    onStatusChange={(newStatus) => handleStatusChange(student.id, newStatus)}
                  />
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <AppIcon name="people-outline" size={32} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No students match "{searchQuery}"</Text>
          </View>
        )}
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  classTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  classIdText: {
    color: '#0D9488',
    fontWeight: '800',
  },
  classMetaSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  saveChangesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 4,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  saveChangesText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sessionsHorizontalList: {
    gap: 10,
    paddingVertical: 4,
  },
  sessionCard: {
    width: 175,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  sessionCardSelected: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  sessionDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sessionDateText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  sessionDateTextSelected: {
    color: '#0D9488',
  },
  sessionMetaText: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 8,
  },
  sessionStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statMiniItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statMiniIcon: {
    fontSize: 10,
  },
  statMiniVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  sessionRateBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D9488',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryMetricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  barTrack: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  metricPercent: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'right',
  },
  exportActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  excelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  excelBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  pdfBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0D9488',
    gap: 6,
  },
  pdfBtnText: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '700',
  },
  studentsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  studentsHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  sessionActiveDateLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  studentMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  studentInfoCol: {
    flex: 1,
  },
  nameIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  studentIdBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  studentEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  studentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  metaSubItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  methodBadgeAI: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  methodTextAI: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '800',
  },
  methodBadgeManual: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  methodTextManual: {
    color: '#0369A1',
    fontSize: 10,
    fontWeight: '800',
  },
  statusPickerWrapper: {
    alignItems: 'flex-end',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 8,
  },
});

export default ClassDetailScreen;
