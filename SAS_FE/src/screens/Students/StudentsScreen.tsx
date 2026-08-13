import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';

interface StudentItem {
  id: string;
  name: string;
  email: string;
  classCode: string;
  avatarInitials: string;
  attendanceRate: number;
  status: 'Good' | 'Warning' | 'Critical';
}

const MOCK_STUDENTS: StudentItem[] = [
  {
    id: '21110001',
    name: 'Nguyễn Văn An',
    email: 'an.nv@eiu.edu.vn',
    classCode: 'WP301',
    avatarInitials: 'NA',
    attendanceRate: 94,
    status: 'Good',
  },
  {
    id: '21110002',
    name: 'Trần Thị Bích',
    email: 'bich.tb@eiu.edu.vn',
    classCode: 'WP301',
    avatarInitials: 'TB',
    attendanceRate: 88,
    status: 'Good',
  },
  {
    id: '21110003',
    name: 'Lê Minh Châu',
    email: 'chau.lm@eiu.edu.vn',
    classCode: 'SE201',
    avatarInitials: 'LC',
    attendanceRate: 75,
    status: 'Warning',
  },
  {
    id: '21110004',
    name: 'Phạm Đức Dũng',
    email: 'dung.pd@eiu.edu.vn',
    classCode: 'WP301',
    avatarInitials: 'PD',
    attendanceRate: 60,
    status: 'Critical',
  },
  {
    id: '21110005',
    name: 'Hoàng Thị Vy',
    email: 'vy.ht@eiu.edu.vn',
    classCode: 'DB301',
    avatarInitials: 'HV',
    attendanceRate: 98,
    status: 'Good',
  },
];

const StudentsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.classCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.map((student) => {
          const isGood = student.status === 'Good';
          const isWarn = student.status === 'Warning';

          return (
            <View key={student.id} style={styles.card}>
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
                  <Text style={styles.email}>{student.email}</Text>
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
        })}
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
});

export default StudentsScreen;
