import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';

interface DisputeItem {
  id: string;
  studentName: string;
  studentId: string;
  classCode: string;
  sessionDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const MOCK_DISPUTES: DisputeItem[] = [
  {
    id: 'd1',
    studentName: 'Lê Minh Châu',
    studentId: '21110003',
    classCode: 'WP301',
    sessionDate: '2026-08-12',
    reason: 'Camera recognition missed my check-in due to low light at room A3-201.',
    status: 'pending',
    submittedAt: '2026-08-12 10:15',
  },
  {
    id: 'd2',
    studentName: 'Phạm Đức Dũng',
    studentId: '21110004',
    classCode: 'SE201',
    sessionDate: '2026-08-10',
    reason: 'Medical appointment letter attached. Requesting excused absence.',
    status: 'pending',
    submittedAt: '2026-08-10 14:30',
  },
  {
    id: 'd3',
    studentName: 'Bùi Anh Tuấn',
    studentId: '21110009',
    classCode: 'WP301',
    sessionDate: '2026-08-05',
    reason: 'Device battery died right before manual entry window closed.',
    status: 'approved',
    submittedAt: '2026-08-05 09:40',
  },
];

const DisputesScreen: React.FC = () => {
  const [disputes, setDisputes] = useState<DisputeItem[]>(MOCK_DISPUTES);

  const handleAction = (id: string, newStatus: 'approved' | 'rejected') => {
    setDisputes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    Alert.alert(
      newStatus === 'approved' ? 'Dispute Approved' : 'Dispute Rejected',
      `Attendance dispute status updated.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Disputes</Text>
        <Text style={styles.headerSubtitle}>Review and resolve attendance appeal requests from students</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {disputes.map((item) => {
          const isPending = item.status === 'pending';
          const isApproved = item.status === 'approved';

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.classBadge}>
                  <Text style={styles.classText}>{item.classCode}</Text>
                </View>
                <Text style={styles.dateText}>Session: {item.sessionDate}</Text>
              </View>

              <View style={styles.studentRow}>
                <Text style={styles.studentName}>{item.studentName}</Text>
                <Text style={styles.studentId}>({item.studentId})</Text>
              </View>

              <Text style={styles.reasonText}>{item.reason}</Text>

              <View style={styles.footerRow}>
                <Text style={styles.submittedText}>Submitted: {item.submittedAt}</Text>

                {isPending ? (
                  <View style={styles.actionBtns}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleAction(item.id, 'rejected')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.rejectText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleAction(item.id, 'approved')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.approveText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.statusPill,
                      isApproved ? styles.pillApproved : styles.pillRejected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isApproved ? styles.textApproved : styles.textRejected,
                      ]}
                    >
                      {isApproved ? 'Approved' : 'Rejected'}
                    </Text>
                  </View>
                )}
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
    paddingTop: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  classBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  classText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F766E',
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  studentId: {
    fontSize: 12,
    color: '#64748B',
  },
  reasonText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  submittedText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  rejectText: {
    color: '#991B1B',
    fontSize: 12,
    fontWeight: '700',
  },
  approveBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0D9488',
  },
  approveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillApproved: { backgroundColor: '#DCFCE7' },
  pillRejected: { backgroundColor: '#FEE2E2' },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  textApproved: { color: '#15803D' },
  textRejected: { color: '#991B1B' },
});

export default DisputesScreen;
