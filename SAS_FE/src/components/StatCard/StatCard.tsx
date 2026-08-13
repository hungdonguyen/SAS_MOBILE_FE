import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AppIcon from '../Icon/AppIcon';
import { StatMetric } from '../../types/dashboard';

interface StatCardProps {
  item: StatMetric;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ item, onPress }) => {
  const outlineColor = item.backgroundColor;
  // Light tint for icon background
  const badgeBg = item.backgroundColor + '1C'; // ~11% opacity hex tint

  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: outlineColor }]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>

        <View style={[styles.iconBadge, { backgroundColor: badgeBg }]}>
          <AppIcon
            name={item.iconName}
            size={20}
            color={outlineColor}
            type={item.iconType || 'ionicons'}
          />
        </View>
      </View>

      <View style={styles.bottomRow}>
        <AppIcon name="trending-up" size={13} color={outlineColor} />
        <Text style={styles.trendText}>{item.trend}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
});

export default StatCard;
