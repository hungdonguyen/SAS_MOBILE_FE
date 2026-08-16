import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppIcon from '../Icon/AppIcon';
import { theme } from '../../theme/colors';
import { TodaySessionDto } from '../../types/studentTypes';

interface TimeStatusCardProps {
  sessions: TodaySessionDto[];
  onCheckInPress: (session: TodaySessionDto) => void;
}

export default function TimeStatusCard({ sessions, onCheckInPress }: TimeStatusCardProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  // Simplified logic for finding active/upcoming session
  // In a real app we'd parse startTime. For now, we find the first pending session.
  const activeSession = sessions.find(s => (s.attendanceStatus || s.status) === 'pending');
  
  const hasSuccessfulCheckin = sessions.some(s => ['present', 'late', 'excused'].includes(s.attendanceStatus || s.status || ''));
  const isCheckedIn = sessions.length > 0 && hasSuccessfulCheckin && !activeSession;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          {/* Left Side */}
          <View style={styles.infoCol}>
            <Text style={styles.dateText}>{dateStr}</Text>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{hours}:{minutes}</Text>
              <Text style={styles.secondsText}>:{seconds}</Text>
            </View>

            <View style={styles.statusCol}>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: isCheckedIn ? theme.colors.spPresent : theme.colors.spAbsent }]} />
                <Text style={[styles.statusText, { color: isCheckedIn ? '#065f46' : theme.colors.spAbsent }]}>
                  {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                </Text>
              </View>

              <View style={styles.nextClassRow}>
                <AppIcon name="book-outline" size={14} color="#3b82f6" />
                {activeSession ? (
                  <Text style={styles.nextClassText}>
                    Next: <Text style={styles.nextClassBold}>{activeSession.subjectName}</Text>
                  </Text>
                ) : (
                  <Text style={styles.noMoreClassText}>No more classes today</Text>
                )}
              </View>
            </View>
          </View>

          {/* Right Side */}
          {activeSession ? (
            <View style={styles.actionCol}>
              <TouchableOpacity
                style={styles.actionBtnWrapper}
                activeOpacity={0.8}
                onPress={() => onCheckInPress(activeSession)}
              >
                <LinearGradient
                  colors={['#3b82f6', '#1e40af']}
                  style={styles.actionBtn}
                >
                  <AppIcon name="scan-outline" size={26} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.actionLabel}>Check In</Text>
            </View>
          ) : (
            <View style={styles.actionCol}>
              <View style={styles.actionBtnDisabled}>
                <AppIcon name="scan-outline" size={26} color={theme.colors.textMuted} />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: -50, // Overlap the header
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  card: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  timeText: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -1,
  },
  secondsText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  statusCol: {
    marginTop: 6,
    gap: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nextClassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextClassText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  nextClassBold: {
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  noMoreClassText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textMuted,
  },
  actionCol: {
    alignItems: 'center',
    marginLeft: 12,
  },
  actionBtnWrapper: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 6,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDisabled: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceInput,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563eb',
  },
});
