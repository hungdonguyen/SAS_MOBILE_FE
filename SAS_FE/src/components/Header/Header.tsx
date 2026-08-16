import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AppIcon from '../Icon/AppIcon';

interface HeaderProps {
  lecturerName: string;
  role: string;
  avatarUrl?: string;
  currentDate: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  lecturerName,
  role,
  avatarUrl,
  currentDate,
  onLogout,
}) => {
  const initials = lecturerName
    ? lecturerName
        .trim()
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'LC';

  return (
    <View style={styles.container}>
      {/* Top Navbar Row */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>S</Text>
          </View>
          <View>
            <Text style={styles.brandName}>SmartAttend</Text>
            <Text style={styles.brandRole}>{role}</Text>
          </View>
        </View>

        <View style={styles.userActions}>
          <TouchableOpacity style={styles.langPill} activeOpacity={0.7}>
            <Text style={styles.langText}>🇬🇧</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <AppIcon name="moon-outline" size={18} color="#475569" />
          </TouchableOpacity>

          {/* User Profile Avatar */}
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.iconBtn} onPress={onLogout} activeOpacity={0.7}>
            <AppIcon name="log-out-outline" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title & Date Section */}
      <View style={styles.titleRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Overview of today's teaching schedule</Text>
        </View>

        <View style={styles.actionBlock}>
          <View style={styles.dateBadge}>
            <AppIcon name="calendar-outline" size={13} color="#64748B" />
            <Text style={styles.dateText}>{currentDate}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 20,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 20,
  },
  brandRole: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'capitalize',
    marginTop: -2,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langText: {
    fontSize: 14,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarContainer: {
    marginLeft: 2,
    marginRight: 2,
  },
  avatarImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  avatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  titleRow: {
    marginTop: 4,
    gap: 12,
  },
  titleBlock: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  actionBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
});

export default Header;
