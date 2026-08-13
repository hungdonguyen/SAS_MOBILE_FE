import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AppIcon from '../Icon/AppIcon';
import { ScheduleItem } from '../../types/dashboard';

interface ScheduleCardProps {
  item: ScheduleItem;
  onPressAttendance?: (item: ScheduleItem) => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ item, onPressAttendance }) => {
  const progressRatio = item.totalCapacity > 0 ? item.checkedInCount / item.totalCapacity : 0;
  const progressPercent = `${Math.min(Math.max(progressRatio * 100, 0), 100)}%`;

  const isOngoing = item.status === 'ongoing';

  return (
    <View style={styles.card}>
      {/* Card Header: Class Code & Status Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.classCodeBadge}>
          <Text style={styles.classCodeText}>{item.classId}</Text>
        </View>

        <View
          style={[
            styles.statusPill,
            isOngoing ? styles.statusOngoing : styles.statusUpcoming,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isOngoing ? styles.dotOngoing : styles.dotUpcoming,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isOngoing ? styles.statusTextOngoing : styles.statusTextUpcoming,
            ]}
          >
            {isOngoing ? 'Ongoing' : 'Upcoming'}
          </Text>
        </View>
      </View>

      {/* Subject Title */}
      <Text style={styles.subjectName}>{item.subjectName}</Text>

      {/* Room & Time Details Row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <AppIcon name="location-outline" size={14} color="#64748B" />
          <Text style={styles.metaText}>
            {item.room} {item.building ? `(${item.building})` : ''}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <AppIcon name="time-outline" size={14} color="#64748B" />
          <Text style={styles.metaText}>{item.timeFormatted}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Footer: Class Size Progress & Attendance Action Button */}
      <View style={styles.cardFooter}>
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressTitle}>Class Size</Text>
            <Text style={styles.progressValue}>
              <Text style={styles.checkedCount}>{item.checkedInCount}</Text>/
              {item.totalCapacity}
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: progressPercent as any }]} />
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onPressAttendance && onPressAttendance(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionBtnText}>Attendance</Text>
          <AppIcon name="chevron-forward-outline" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  classCodeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  classCodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusOngoing: {
    backgroundColor: '#DCFCE7',
  },
  statusUpcoming: {
    backgroundColor: '#FEF3C7',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOngoing: {
    backgroundColor: '#16A34A',
  },
  dotUpcoming: {
    backgroundColor: '#D97706',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextOngoing: {
    color: '#15803D',
  },
  statusTextUpcoming: {
    color: '#B45309',
  },
  subjectName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressContainer: {
    flex: 1,
  },
  progressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  checkedCount: {
    fontWeight: '800',
    color: '#0D9488',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0D9488',
    borderRadius: 3,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D9488',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 4,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ScheduleCard;
