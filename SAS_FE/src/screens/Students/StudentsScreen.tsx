import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import { lecturerSectionService } from '../../api/services/lecturerSectionService';

interface StudentItem {
  id: string;
  name: string;
  email: string;
  classCode: string;
  avatarInitials: string;
  attendanceRate: number;
  status: 'Good' | 'Warning' | 'Critical';
}

const StudentsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStudents = async () => {
    try {
      // 1. Fetch lecturer's assigned sections
      const sectionsRes = await lecturerSectionService.listSections({ limit: 20 });
      const sections = sectionsRes.data || [];

      // 2. Fetch enrolled students for each section in parallel
      const studentPromises = sections.map(async (sec) => {
        try {
          const studentsRes = await lecturerSectionService.getSectionStudents(
            sec.sectionId,
            { limit: 100 }
          );
          const enrolledList = studentsRes.data || [];

          return enrolledList.map((st: any) => {
            const rate = Math.round(
              st.attendanceStats?.attendanceRate ?? st.attendanceRate ?? 100
            );
            let status: 'Good' | 'Warning' | 'Critical' = 'Good';
            if (rate < 65) status = 'Critical';
            else if (rate < 80) status = 'Warning';

            const displayName = st.name || st.fullName || st.username || 'Student';
            const mssv = st.mssv || st.username || st.studentId.slice(0, 8);
            const initials = displayName
              .split(' ')
              .map((w: string) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();

            return {
              id: mssv,
              name: displayName,
              email: st.email || `${mssv}@campus.edu.vn`,
              classCode: sec.subject?.code || 'CLASS',
              avatarInitials: initials,
              attendanceRate: rate,
              status,
            };
          });
        } catch {
          return [];
        }
      });

      const results = await Promise.allSettled(studentPromises);
      const allStudents: StudentItem[] = [];

      results.forEach((res) => {
        if (res.status === 'fulfilled') {
          allStudents.push(...res.value);
        }
      });

      // Deduplicate or keep per-class entries
      setStudents(allStudents);
    } catch (e) {
      console.log('Error fetching students directory:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.classCode.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Students Directory</Text>
        <Text style={styles.headerSubtitle}>Monitor student attendance across all your classes</Text>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by student name, ID, class..."
      />

      <ScrollView
        contentContainerStyle={styles.listContent}
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D9488" />
            <Text style={styles.loadingText}>Loading enrolled students...</Text>
          </View>
        ) : filtered.length > 0 ? (
          filtered.map((student, idx) => {
            const isGood = student.status === 'Good';
            const isWarn = student.status === 'Warning';

            return (
              <View key={`${student.id}-${student.classCode}-${idx}`} style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{student.avatarInitials}</Text>
                  </View>

                  <View style={styles.infoCol}>
                    <View style={styles.nameRow}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.classCode}>{student.classCode}</Text>
                    </View>
                    <Text style={styles.studentId}>ID: {student.id}</Text>
                    <Text style={styles.email} numberOfLines={1}>{student.email}</Text>
                  </View>
                </View>

                <View style={styles.cardRight}>
                  <Text style={styles.rateVal}>{student.attendanceRate}%</Text>
                  <View
                    style={[
                      styles.statusTag,
                      isGood
                        ? styles.tagGood
                        : isWarn
                        ? styles.tagWarn
                        : styles.tagCritical,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        isGood
                          ? styles.tagTextGood
                          : isWarn
                          ? styles.tagTextWarn
                          : styles.tagTextCritical,
                      ]}
                    >
                      {student.status}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <AppIcon name="people-outline" size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No students found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'No students enrolled in your assigned sections yet.'}
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0D9488',
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
  studentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  classCode: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  studentId: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  email: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rateVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagGood: { backgroundColor: '#DCFCE7' },
  tagWarn: { backgroundColor: '#FEF3C7' },
  tagCritical: { backgroundColor: '#FEE2E2' },
  tagText: { fontSize: 10, fontWeight: '700' },
  tagTextGood: { color: '#15803D' },
  tagTextWarn: { color: '#B45309' },
  tagTextCritical: { color: '#991B1B' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default StudentsScreen;
