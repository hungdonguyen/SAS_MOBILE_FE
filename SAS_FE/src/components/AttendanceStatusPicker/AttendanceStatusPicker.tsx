import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AttendanceStatus } from '../../types/classDetails';

interface AttendanceStatusPickerProps {
  currentStatus: AttendanceStatus;
  onStatusChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
}

const STATUS_CONFIG: Array<{
  key: AttendanceStatus;
  label: string;
  activeBg: string;
  activeText: string;
}> = [
  { key: 'present', label: 'Present', activeBg: '#10B981', activeText: '#FFFFFF' },
  { key: 'late', label: 'Late', activeBg: '#F59E0B', activeText: '#FFFFFF' },
  { key: 'absent', label: 'Absent', activeBg: '#EF4444', activeText: '#FFFFFF' },
  { key: 'excused', label: 'Excused', activeBg: '#6366F1', activeText: '#FFFFFF' },
];

const AttendanceStatusPicker: React.FC<AttendanceStatusPickerProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      {STATUS_CONFIG.map((option) => {
        const isSelected = currentStatus === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.pill,
              isSelected
                ? { backgroundColor: option.activeBg, borderColor: option.activeBg }
                : styles.pillInactive,
            ]}
            onPress={() => !disabled && onStatusChange(option.key)}
            activeOpacity={0.8}
            disabled={disabled}
          >
            <Text
              style={[
                styles.pillText,
                isSelected
                  ? { color: option.activeText, fontWeight: '700' }
                  : styles.pillTextInactive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 54,
  },
  pillInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pillTextInactive: {
    color: '#94A3B8',
  },
});

export default AttendanceStatusPicker;
