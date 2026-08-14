import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import { lecturerSectionService } from '../../api/services/lecturerSectionService';
import { ClassSectionResponse } from '../../api/types/classSection.types';

interface FormattedClassItem {
  id: string; // sectionId
  classCode: string;
  subjectName: string;
  room: string;
  schedule: string;
  studentCount: number;
  semesterName: string;
  status: 'active' | 'completed';
}

interface ClassesListScreenProps {
  navigation: any;
}

const ClassesListScreen: React.FC<ClassesListScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');
  const [classes, setClasses] = useState<FormattedClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSections = async () => {
    try {
      const res = await lecturerSectionService.listSections({ limit: 50 });
      const rawData: ClassSectionResponse[] = res.data || [];

      const formatted: FormattedClassItem[] = rawData.map((sec) => {
        const schedules = sec.sectionSchedules || [];
        const rooms = Array.from(
          new Set(schedules.map((s) => s.roomCode).filter(Boolean))
        ).join(', ') || 'Room TBD';

        const scheduleFormatted = schedules.length > 0
          ? schedules
              .map(
                (s) =>
                  `${s.dayOfWeek} (${(s.startTime || '').slice(0, 5)} - ${(s.endTime || '').slice(0, 5)})`
              )
              .join(' • ')
          : 'Schedule TBD';

        const isActive = sec.semester?.isActive !== false;

        return {
          id: sec.sectionId,
          classCode: sec.subject?.code || 'SEC',
          subjectName: sec.subject?.name || 'Class Section',
          room: rooms,
          schedule: scheduleFormatted,
          studentCount: sec._count?.enrollments ?? 0,
          semesterName: sec.semester?.semesterName || 'Current Semester',
          status: isActive ? 'active' : 'completed',
        };
      });

      setClasses(formatted);
    } catch (e) {
      console.log('Error fetching lecturer sections:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSections();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSections();
  }, []);

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (filterTab !== 'all' && c.status !== filterTab) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.classCode.toLowerCase().includes(q) ||
        c.subjectName.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q)
      );
    });
  }, [classes, filterTab, searchQuery]);

  const activeCount = classes.filter((c) => c.status === 'active').length;
  const completedCount = classes.filter((c) => c.status === 'completed').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Classes Management</Text>
          <Text style={styles.headerSubtitle}>View and track attendance for your assigned classes</Text>
        </View>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search class code, subject, room..."
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterPill, filterTab === 'all' && styles.filterPillActive]}
          onPress={() => setFilterTab('all')}
        >
          <Text style={[styles.filterText, filterTab === 'all' && styles.filterTextActive]}>
            All ({classes.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filterTab === 'active' && styles.filterPillActive]}
          onPress={() => setFilterTab('active')}
        >
          <Text style={[styles.filterText, filterTab === 'active' && styles.filterTextActive]}>
            Active ({activeCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filterTab === 'completed' && styles.filterPillActive]}
          onPress={() => setFilterTab('completed')}
        >
          <Text style={[styles.filterText, filterTab === 'completed' && styles.filterTextActive]}>
            Completed ({completedCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Class Cards List */}
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
            <Text style={styles.loadingText}>Loading assigned classes...</Text>
          </View>
        ) : filteredClasses.length > 0 ? (
          filteredClasses.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate('ClassDetail', {
                  classId: item.id,
                  classCode: item.classCode,
                  subjectName: item.subjectName,
                  room: item.room,
                  schedule: item.schedule,
                })
              }
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeText}>{item.classCode}</Text>
                </View>

                <View style={styles.statusBadge}>
                  <AppIcon
                    name={item.status === 'active' ? 'checkmark-circle-outline' : 'time-outline'}
                    size={13}
                    color={item.status === 'active' ? '#0D9488' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      item.status === 'completed' && { color: '#64748B' },
                    ]}
                  >
                    {item.status === 'active' ? 'Active' : 'Completed'}
                  </Text>
                </View>
              </View>

              <Text style={styles.subjectTitle}>{item.subjectName}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <AppIcon name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{item.room}</Text>
                </View>
                <View style={styles.metaItem}>
                  <AppIcon name="people-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText}>{item.studentCount} Students</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <AppIcon name="time-outline" size={14} color="#64748B" />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.schedule}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <View style={styles.semesterTag}>
                  <AppIcon name="calendar-outline" size={12} color="#0D9488" />
                  <Text style={styles.semesterText}>{item.semesterName}</Text>
                </View>

                <TouchableOpacity
                  style={styles.detailsBtn}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate('ClassDetail', {
                      classId: item.id,
                      classCode: item.classCode,
                      subjectName: item.subjectName,
                      room: item.room,
                      schedule: item.schedule,
                    })
                  }
                >
                  <Text style={styles.detailsBtnText}>View Sessions & Attendance</Text>
                  <AppIcon name="chevron-forward-outline" size={14} color="#0D9488" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <AppIcon name="school-outline" size={36} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No classes found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'You have not been assigned to any class sections yet.'}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#0D9488',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F766E',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
  },
  subjectTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  semesterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  semesterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
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

export default ClassesListScreen;
