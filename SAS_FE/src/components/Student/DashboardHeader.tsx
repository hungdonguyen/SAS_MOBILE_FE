import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppIcon from '../Icon/AppIcon';
import { theme } from '../../theme/colors';

interface DashboardHeaderProps {
  user: {
    username?: string;
    studentCode?: string;
    email?: string;
  } | null;
  onLogout: () => void;
  onSwitchLanguage?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, onLogout, onSwitchLanguage }) => {
  const initial = (user?.username || 'ST').slice(0, 2).toUpperCase();
  const fullName = (user as any)?.fullName || user?.username || 'Student';
  const studentCode = user?.username || 'N/A';
  const email = user?.email || 'No email';

  return (
    <LinearGradient
      colors={[theme.colors.blueGradientStart, theme.colors.blueGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.headerRow}>
        {/* Left: Avatar + Greeting */}
        <View style={styles.userInfoCol}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.onlineDot} />
          </View>
          
          <View style={styles.greetingCol}>
            <Text style={styles.helloText}>HELLO</Text>
            <Text style={styles.nameText}>{fullName}</Text>
            
            <View style={styles.tagsContainer}>
              <View style={styles.idTag}>
                <View style={styles.idLabelBox}>
                  <Text style={styles.idLabelText}>Id</Text>
                </View>
                <Text style={styles.idValueText}>{studentCode}</Text>
              </View>
              
              <View style={styles.emailTag}>
                <AppIcon name="mail-outline" size={12} color="#EFF6FF" />
                <Text style={styles.emailText} numberOfLines={1}>{email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Right: Actions */}
        <View style={styles.actionsRow}>

          <TouchableOpacity 
            style={styles.actionBtn} 
            activeOpacity={0.7}
            onPress={onLogout}
          >
            <AppIcon name="log-out-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 80, // Extra padding at bottom for the overlapping card
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfoCol: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4ade80',
    borderWidth: 2,
    borderColor: theme.colors.blueGradientEnd,
  },
  greetingCol: {
    paddingTop: 2,
    flex: 1,
  },
  helloText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(219, 234, 254, 0.7)', // blue-100/70
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  tagsContainer: {
    gap: 8,
  },
  idTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    gap: 6,
  },
  idLabelBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  idLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1,
  },
  idValueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  emailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.9,
  },
  emailText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#EFF6FF', // blue-50
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DashboardHeader;
