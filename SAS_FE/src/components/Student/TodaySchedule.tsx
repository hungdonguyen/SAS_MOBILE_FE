import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppIcon from '../Icon/AppIcon';
import { theme } from '../../theme/colors';
import { TodaySessionDto } from '../../types/studentTypes';

interface TodayScheduleProps {
  sessions: TodaySessionDto[];
}

export default function TodaySchedule({ sessions }: TodayScheduleProps) {
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'present':
        return { bgColor: theme.colors.softSuccess, color: theme.colors.textSuccess, label: 'Present' };
      case 'late':
        return { bgColor: theme.colors.softWarning, color: theme.colors.textWarning, label: 'Late' };
      case 'absent':
        return { bgColor: theme.colors.softDanger, color: theme.colors.textDanger, label: 'Absent' };
      default:
        return { bgColor: theme.colors.softNeutral, color: theme.colors.textSecondary, label: 'Not Checked In' };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Schedule</Text>
        <Text style={styles.sessionCount}>{sessions.length} sessions</Text>
      </View>

      <View style={styles.list}>
        {sessions.map((session) => {
          const status = session.attendanceStatus || session.status || 'pending';
          const config = getStatusConfig(status as string);
          
          return (
            <View key={session.sessionId} style={styles.card}>
              <View style={styles.subjectRow}>
                <AppIcon name="book-outline" size={16} color="#3b82f6" />
                <Text style={styles.subjectText} numberOfLines={1}>
                  {session.subjectName || session.subject_name || 'No subject'}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <AppIcon name="time-outline" size={14} color={theme.colors.textMuted} />
                  <Text style={styles.detailText}>{session.startTime || session.start_time || '--:--'} - {session.endTime || session.end_time || '--:--'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <AppIcon name="business-outline" size={14} color={theme.colors.textMuted} />
                  <Text style={styles.detailText}>{session.roomName || session.room_name || 'No room'}</Text>
                </View>
              </View>

              <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
                  <View style={[styles.statusDot, { backgroundColor: config.color }]} />
                  <Text style={[styles.statusText, { color: config.color }]}>
                    {config.label}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  sessionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  }
});
