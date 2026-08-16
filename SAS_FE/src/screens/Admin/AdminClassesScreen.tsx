import React, { useState, useEffect, useCallback } from 'react';
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
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import { classSectionService, ClassSectionResponse } from '../../api';

const AdminClassesScreen: React.FC = () => {
  const [sections, setSections] = useState<ClassSectionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadSections = useCallback(async (queryStr?: string) => {
    try {
      setLoading(true);
      const res = await classSectionService.listSections({
        q: queryStr !== undefined ? queryStr : searchQuery,
        limit: 50,
      });
      setSections(res.data);
    } catch (error: any) {
      console.log('Error loading class sections:', error);
      Alert.alert('Error', error.message || 'Failed to load classes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSections(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [loadSections, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSections();
  };

  const handleAddClass = () => {
    Alert.alert('Class Management', 'New class sections and semester assignments are synchronized automatically.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Campus Classes</Text>
          <Text style={styles.headerSubtitle}>Monitor active sections and lecturer assignments</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleAddClass} activeOpacity={0.85}>
          <AppIcon name="school-outline" size={14} color="#FFFFFF" />
          <Text style={styles.addBtnText}>New Class</Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search code, subject, lecturer..."
      />

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.centerText}>Loading class sections from campus database...</Text>
          </View>
        ) : sections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppIcon name="school-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No class sections found</Text>
            <Text style={styles.emptySubtitle}>Try changing your search term.</Text>
          </View>
        ) : (
          sections.map((item) => {
            const isSemesterActive = item.semester?.isActive;

            return (
              <View key={item.sectionId} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{item.subject?.code || 'SEC'}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      isSemesterActive ? styles.statusOngoing : styles.statusCompleted,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isSemesterActive ? styles.textOngoing : styles.textCompleted,
                      ]}
                    >
                      {isSemesterActive ? 'ACTIVE TERM' : 'ARCHIVED'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.subjectName}>{item.subject?.name || 'Class Subject'}</Text>

                <View style={styles.metaRow}>
                  <AppIcon name="school-outline" size={13} color="#64748B" />
                  <Text style={styles.metaText}>
                    Lecturer: {item.lecturer?.fullName || 'Assigned Lecturer'}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <AppIcon name="calendar-outline" size={13} color="#64748B" />
                  <Text style={styles.metaText}>
                    Semester: {item.semester?.semesterName || 'Academic Semester'}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <AppIcon name="ribbon-outline" size={13} color="#64748B" />
                  <Text style={styles.metaText}>Credits: {item.subject?.credit || 3} Units</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                  <Text style={styles.enrolledText}>
                    Instructor Contact: <Text style={styles.enrolledVal}>{item.lecturer?.email || 'N/A'}</Text>
                  </Text>

                  <View style={styles.rateBadge}>
                    <Text style={styles.rateText}>Biometric Enabled</Text>
                  </View>
                </View>
              </View>
            );
          })
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    color: '#4F46E5',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusOngoing: { backgroundColor: '#DCFCE7' },
  statusUpcoming: { backgroundColor: '#FEF3C7' },
  statusCompleted: { backgroundColor: '#F1F5F9' },
  statusText: { fontSize: 10, fontWeight: '700' },
  textOngoing: { color: '#15803D' },
  textUpcoming: { color: '#B45309' },
  textCompleted: { color: '#64748B' },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
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
  },
  enrolledText: {
    fontSize: 12,
    color: '#64748B',
  },
  enrolledVal: {
    fontWeight: '800',
    color: '#6366F1',
  },
  rateBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  rateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
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
});

export default AdminClassesScreen;
