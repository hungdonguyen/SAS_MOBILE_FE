import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import AttendanceStatusPicker from '../../components/AttendanceStatusPicker/AttendanceStatusPicker';
import { AttendanceStatus } from '../../types/classDetails';
import { lecturerSectionService } from '../../api/services/lecturerSectionService';
import { lecturerAttendanceService } from '../../api/services/lecturerAttendanceService';
import {
  ClassSectionDetailResponse,
  ClassSessionDto,
} from '../../api/types/classSection.types';
import { SessionAttendanceRecordDto } from '../../api/types/attendance.types';

interface ClassDetailScreenProps {
  navigation: any;
  route?: any;
}

interface LocalStudentItem {
  id: string; // studentId (UUID or student ID)
  mssv: string;
  attendanceId?: string;
  studentName: string;
  email: string;
  avatarInitials: string;
  device: string;
  checkInTime: string;
  method: 'AI' | 'Manual' | 'QRCode' | 'NFC' | '—';
  status: AttendanceStatus;
  isModified?: boolean;
  confidence?: number | null;
  ipAddress?: string | null;
  note?: string | null;
  isOverridden?: boolean;
}

const ClassDetailScreen: React.FC<ClassDetailScreenProps> = ({ navigation, route }) => {
  const initialClassId = route?.params?.classId || 'WP301';
  const initialClassCode = route?.params?.classCode || 'WP301';
  const initialSubjectName = route?.params?.subjectName || 'Course Details';
  const initialRoom = route?.params?.room || 'Campus Room';
  const targetSessionId = route?.params?.sessionId;

  const [sectionId, setSectionId] = useState<string>(initialClassId);
  const [sectionDetail, setSectionDetail] = useState<ClassSectionDetailResponse | null>(null);
  const [sessions, setSessions] = useState<ClassSessionDto[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(targetSessionId || '');
  const [students, setStudents] = useState<LocalStudentItem[]>([]);

  const [summary, setSummary] = useState({
    enrolledCount: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    excusedCount: 0,
    attendanceRate: 0,
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingSection, setLoadingSection] = useState<boolean>(true);
  const [loadingAttendance, setLoadingAttendance] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // ── Step 2: Load Session Attendance Roster ──────────────────────────────────
  const loadSessionRoster = useCallback(async (sessionId: string) => {
    if (!sessionId) return;
    setLoadingAttendance(true);
    try {
      const rosterRes = await lecturerAttendanceService.getSessionAttendance(sessionId);

      if (rosterRes) {
        const summaryData = rosterRes.summary;
        const total = summaryData?.totalStudents ?? summaryData?.enrolledCount ?? 0;
        const present = summaryData?.presentCount ?? 0;
        const late = summaryData?.lateCount ?? 0;
        const absent = summaryData?.absentCount ?? 0;
        const excused = summaryData?.excusedCount ?? 0;
        const calcRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

        setSummary({
          enrolledCount: total,
          presentCount: present,
          lateCount: late,
          absentCount: absent,
          excusedCount: excused,
          attendanceRate: summaryData?.attendanceRate ?? calcRate,
        });

        const rawList = rosterRes.students || (rosterRes as any).data || [];
        const mapped: LocalStudentItem[] = rawList.map((rec: any) => {
          let method: 'AI' | 'Manual' | 'QRCode' | 'NFC' | '—' = '—';
          if (rec.checkInMethod === 'SELF_CHECKIN' || rec.checkInMethod === 'AI') method = 'AI';
          else if (rec.checkInMethod === 'MANUAL') method = 'Manual';

          let status: AttendanceStatus = 'absent';
          if (rec.status === 'present' || rec.status === 'late' || rec.status === 'excused' || rec.status === 'pending') {
            status = rec.status;
          }

          const studentDisplayName = rec.name || rec.fullName || rec.username || rec.mssv || 'Student';
          const studentMssv = rec.mssv || rec.username || rec.studentId.slice(0, 8);
          const initials = studentDisplayName
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          const timeFormatted = rec.checkedInAt
            ? new Date(rec.checkedInAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—';

          return {
            id: rec.studentId,
            mssv: studentMssv,
            attendanceId: rec.attendanceId,
            studentName: studentDisplayName,
            email: rec.email || `${studentMssv}@campus.edu.vn`,
            avatarInitials: initials,
            device: rec.deviceInfo || '—',
            checkInTime: timeFormatted,
            method,
            status,
            isModified: false,
            confidence: rec.confidence ?? null,
            ipAddress: rec.ipAddress ?? null,
            note: rec.note ?? null,
            isOverridden: rec.isOverridden ?? false,
          };
        });

        setStudents(mapped);
      }
    } catch (e) {
      console.log('Error loading session roster:', e);
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  // ── Step 1: Load Class Section Metadata & Sessions List ─────────────────────
  const loadSectionAndSessions = useCallback(async () => {
    try {
      const incomingClassId = route?.params?.classId || sectionId;
      const incomingSessionId = route?.params?.sessionId || targetSessionId;
      let resolvedId = incomingClassId;

      // If classId passed is a code (not a UUID) or default sample 'WP301', resolve UUID first
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        resolvedId
      );

      if (!isUUID || resolvedId === 'WP301') {
        const sectionsRes = await lecturerSectionService.listSections({
          limit: 20,
        });
        const sectionList = sectionsRes.data || [];
        if (sectionList.length > 0) {
          const match = sectionList.find(
            (s) =>
              s.sectionId === resolvedId ||
              s.subject?.code === initialClassCode ||
              s.subject?.name === initialSubjectName
          );
          resolvedId = match ? match.sectionId : sectionList[0].sectionId;
          setSectionId(resolvedId);
        }
      }

      if (incomingSessionId) {
        setSelectedSessionId(incomingSessionId);
        loadSessionRoster(incomingSessionId);
      }

      const [detailRes, sessionsRes] = await Promise.allSettled([
        lecturerSectionService.getSectionById(resolvedId),
        lecturerSectionService.getSectionSessions(resolvedId, { limit: 100 }),
      ]);

      if (detailRes.status === 'fulfilled') {
        setSectionDetail(detailRes.value);
      }

      if (sessionsRes.status === 'fulfilled') {
        let rawSessList = sessionsRes.value.data || [];

        // Sort all sessions chronologically ascending (từ ngày đầu đến ngày cuối)
        const sessList = [...rawSessList].sort((a: any, b: any) => {
          const dateA = new Date(a.sessionDate || a.date).getTime();
          const dateB = new Date(b.sessionDate || b.date).getTime();
          return dateA - dateB;
        });

        // Smart Session Selection:
        if (sessList.length > 0) {
          const todayIso = new Date().toISOString().slice(0, 10);
          let selectedSess: any = null;

          // 1. Explicitly requested sessionId from navigation params
          if (incomingSessionId) {
            selectedSess = sessList.find((s) => s.sessionId === incomingSessionId);
          }

          // 2. Ongoing or Today's session
          if (!selectedSess) {
            selectedSess = sessList.find(
              (s: any) =>
                s.sessionStatus === 'ongoing' ||
                s.date === todayIso ||
                (s.sessionDate && (typeof s.sessionDate === 'string' ? s.sessionDate.slice(0, 10) : new Date(s.sessionDate).toISOString().slice(0, 10)) === todayIso)
            );
          }

          // 3. Most recent session with actual attendance check-ins
          if (!selectedSess) {
            selectedSess = sessList.find(
              (s: any) =>
                ((s.summary?.presentCount ?? s.attendanceSummary?.presentCount ?? 0) > 0) ||
                ((s.summary?.lateCount ?? s.attendanceSummary?.lateCount ?? 0) > 0)
            );
          }

          // 4. Default to first in list
          if (!selectedSess) {
            selectedSess = sessList[0];
          }

          const activeSessId = selectedSess ? selectedSess.sessionId : sessList[0].sessionId;
          const selectedTime = new Date(selectedSess?.sessionDate || selectedSess?.date || todayIso).getTime();

          // Sắp xếp: Đưa buổi được chọn lên đầu, các buổi tiếp theo trong tương lai gần nhất xếp sau, cuối cùng là các buổi trong quá khứ
          const upcomingOrFuture = sessList.filter((s: any) => {
            if (s.sessionId === activeSessId) return false;
            return new Date(s.sessionDate || s.date).getTime() >= selectedTime;
          });

          const pastSessions = sessList
            .filter((s: any) => {
              if (s.sessionId === activeSessId) return false;
              return new Date(s.sessionDate || s.date).getTime() < selectedTime;
            })
            .reverse(); // Buổi gần quá khứ nhất xếp trước

          const reordered = [
            ...(selectedSess ? [selectedSess] : []),
            ...upcomingOrFuture,
            ...pastSessions,
          ];

          setSessions(reordered);
          setSelectedSessionId(activeSessId);
          loadSessionRoster(activeSessId);
        }
      }
    } catch (e) {
      console.log('Error loading section details & sessions:', e);
    } finally {
      setLoadingSection(false);
      setRefreshing(false);
    }
  }, [sectionId, route?.params?.classId, route?.params?.sessionId, initialClassCode, initialSubjectName, targetSessionId, loadSessionRoster]);

  useFocusEffect(
    useCallback(() => {
      loadSectionAndSessions();
    }, [loadSectionAndSessions])
  );

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    loadSessionRoster(sessionId);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSectionAndSessions();
  }, [loadSectionAndSessions]);

  // ── Step 3: Handle Status Changes Locally ───────────────────────────────────
  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((item) =>
        item.id === studentId ? { ...item, status: newStatus, isModified: true } : item
      )
    );
  };

  const hasUnsavedChanges = useMemo(() => {
    return students.some((s) => s.isModified);
  }, [students]);

  // ── Step 4: Batch Save Changes to Backend ───────────────────────────────────
  const handleSaveChanges = async () => {
    if (!selectedSessionId) {
      Alert.alert('Notice', 'No active session selected.');
      return;
    }

    const modified = students.filter((s) => s.isModified);
    if (modified.length === 0) {
      Alert.alert('Info', 'No attendance modifications to save.');
      return;
    }

    setSaving(true);
    try {
      const recordsToOverride = modified.map((s) => ({
        studentId: s.id,
        status: s.status,
        reason: 'Lecturer manual adjustment from mobile app',
      }));

      await lecturerAttendanceService.batchOverrideAttendance(selectedSessionId, {
        records: recordsToOverride,
      });

      Alert.alert(
        'Save Success',
        `Successfully updated attendance records for ${modified.length} student(s).`
      );

      // Re-fetch session roster to reflect updated metrics
      await loadSessionRoster(selectedSessionId);
    } catch (err) {
      console.log('Error saving attendance changes:', err);
      Alert.alert('Save Failed', (err as any).message || 'Could not save attendance updates.');
    } finally {
      setSaving(false);
    }
  };

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

  const displayClassCode =
    sectionDetail?.subject?.code || initialClassCode || 'CLASS';
  const displaySubjectName =
    sectionDetail?.subject?.name || initialSubjectName || 'Course Details';
  const displayRoom =
    sectionDetail?.schedules?.[0]?.roomCode || initialRoom || 'Room TBD';

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
            <AppIcon
              name="chevron-forward-outline"
              size={20}
              color="#0F172A"
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.classTitle}>
              Class: <Text style={styles.classIdText}>{displayClassCode}</Text>
            </Text>
            <Text style={styles.classMetaSubtitle} numberOfLines={1}>
              {displaySubjectName} • {displayRoom}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveChangesBtn, saving && { opacity: 0.7 }]}
          onPress={handleSaveChanges}
          activeOpacity={0.85}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <AppIcon name="checkmark-circle-outline" size={14} color="#FFFFFF" />
              <Text style={styles.saveChangesText}>
                {hasUnsavedChanges ? 'Save changes *' : 'Save changes'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search student, ID, device..."
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0D9488"
            colors={['#0D9488']}
          />
        }
      >
        {/* Session List Horizontal Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Session List</Text>
              <Text style={styles.sectionSubtitle}>Select a session to view/edit attendance</Text>
            </View>
          </View>

          {loadingSection ? (
            <ActivityIndicator color="#0D9488" style={{ paddingVertical: 20 }} />
          ) : sessions.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sessionsHorizontalList}
            >
              {sessions.map((sess: any) => {
                const isSelected = sess.sessionId === selectedSessionId;
                const formattedDate = sess.date
                  ? sess.date
                  : sess.sessionDate
                  ? new Date(sess.sessionDate).toISOString().slice(0, 10)
                  : 'Date TBD';
                const presentCount = sess.summary?.presentCount ?? sess.attendanceSummary?.presentCount ?? 0;
                const lateCount = sess.summary?.lateCount ?? sess.attendanceSummary?.lateCount ?? 0;
                const absentCount = sess.summary?.absentCount ?? sess.attendanceSummary?.absentCount ?? 0;
                const rate = sess.summary?.attendanceRate ?? sess.attendanceSummary?.attendanceRate ?? 0;

                return (
                  <TouchableOpacity
                    key={sess.sessionId}
                    style={[
                      styles.sessionCard,
                      isSelected && styles.sessionCardSelected,
                    ]}
                    onPress={() => handleSelectSession(sess.sessionId)}
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
                        {formattedDate}
                      </Text>
                    </View>

                    <Text style={styles.sessionMetaText}>
                      Status: {sess.sessionStatus}
                    </Text>

                    <View style={styles.sessionStatsRow}>
                      <View style={styles.statMiniItem}>
                        <Text style={styles.statMiniIcon}>👤</Text>
                        <Text style={styles.statMiniVal}>
                          {presentCount}
                        </Text>
                      </View>
                      <View style={styles.statMiniItem}>
                        <Text style={styles.statMiniIcon}>⚠️</Text>
                        <Text style={styles.statMiniVal}>
                          {lateCount}
                        </Text>
                      </View>
                      <View style={styles.statMiniItem}>
                        <Text style={styles.statMiniIcon}>🚫</Text>
                        <Text style={styles.statMiniVal}>
                          {absentCount}
                        </Text>
                      </View>

                      <Text style={styles.sessionRateBadge}>
                        {rate}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <Text style={styles.noSessionsText}>
              No sessions generated for this class section yet.
            </Text>
          )}
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
              <Text style={styles.metricVal}>{summary.presentCount}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${summary.enrolledCount > 0 ? (summary.presentCount / summary.enrolledCount) * 100 : 0}%`,
                      backgroundColor: '#10B981',
                    },
                  ]}
                />
              </View>
              <Text style={styles.metricPercent}>
                {summary.enrolledCount > 0
                  ? Math.round((summary.presentCount / summary.enrolledCount) * 100)
                  : 0}%
              </Text>
            </View>

            {/* Late Metric */}
            <View style={styles.metricBox}>
              <View style={styles.metricHeaderRow}>
                <View style={[styles.dotIndicator, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.metricLabel}>Late</Text>
              </View>
              <Text style={styles.metricVal}>{summary.lateCount}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${summary.enrolledCount > 0 ? (summary.lateCount / summary.enrolledCount) * 100 : 0}%`,
                      backgroundColor: '#F59E0B',
                    },
                  ]}
                />
              </View>
              <Text style={styles.metricPercent}>
                {summary.enrolledCount > 0
                  ? Math.round((summary.lateCount / summary.enrolledCount) * 100)
                  : 0}%
              </Text>
            </View>

            {/* Absent Metric */}
            <View style={styles.metricBox}>
              <View style={styles.metricHeaderRow}>
                <View style={[styles.dotIndicator, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.metricLabel}>Absent</Text>
              </View>
              <Text style={styles.metricVal}>{summary.absentCount}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${summary.enrolledCount > 0 ? (summary.absentCount / summary.enrolledCount) * 100 : 0}%`,
                      backgroundColor: '#EF4444',
                    },
                  ]}
                />
              </View>
              <Text style={styles.metricPercent}>
                {summary.enrolledCount > 0
                  ? Math.round((summary.absentCount / summary.enrolledCount) * 100)
                  : 0}%
              </Text>
            </View>
          </View>
        </View>

        {/* Student Attendance List */}
        <View style={styles.studentsHeaderRow}>
          <Text style={styles.studentsHeaderTitle}>
            Student List ({filteredStudents.length})
          </Text>
          {hasUnsavedChanges && (
            <Text style={styles.unsavedBadge}>Unsaved changes</Text>
          )}
        </View>

        {loadingAttendance ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.loadingText}>Loading student attendance records...</Text>
          </View>
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const isAI = student.method === 'AI';
            const isManual = student.method === 'Manual';

            return (
              <View
                key={student.id}
                style={[
                  styles.studentCard,
                  student.isModified && styles.studentCardModified,
                ]}
              >
                {/* Student Top Row: Avatar, Name, ID - Tap to Verify AI & GPS */}
                <TouchableOpacity
                  style={styles.studentMainRow}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('AttendanceVerification', {
                      student,
                      sectionId,
                      sessionId: selectedSessionId || targetSessionId,
                    })
                  }
                >
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{student.avatarInitials}</Text>
                  </View>

                  <View style={styles.studentInfoCol}>
                    <View style={styles.nameIdRow}>
                      <Text style={styles.studentName}>{student.studentName}</Text>
                      <Text style={styles.studentIdBadge}>{student.mssv || student.id.slice(0, 8)}</Text>
                    </View>
                    <Text style={styles.studentEmail}>{student.email}</Text>
                  </View>

                  <View style={styles.verifyAiBadge}>
                    <AppIcon name="scan-outline" size={14} color="#0D9488" />
                    <Text style={styles.verifyAiText}>Verify AI</Text>
                  </View>
                </TouchableOpacity>

                {/* Details Row: Device, Time, Method Badge */}
                <View style={styles.studentMetaRow}>
                  <View style={styles.metaSubItem}>
                    <Text style={styles.metaLabel}>Device:</Text>
                    <Text style={styles.metaValue} numberOfLines={1}>
                      {student.device}
                    </Text>
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
                    onStatusChange={(newStatus) =>
                      handleStatusChange(student.id, newStatus)
                    }
                  />
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <AppIcon name="people-outline" size={32} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>
              {searchQuery
                ? `No students match "${searchQuery}"`
                : 'No student attendance records for this session.'}
            </Text>
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
  noSessionsText: {
    fontSize: 12,
    color: '#94A3B8',
    paddingVertical: 12,
    textAlign: 'center',
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
  unsavedBadge: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '700',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  studentCardModified: {
    borderColor: '#0D9488',
    borderWidth: 1.5,
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
  verifyAiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  verifyAiText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
  },
});

export default ClassDetailScreen;
