import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Platform, SafeAreaView, Image } from 'react-native';
import AppIcon from '../Icon/AppIcon';
import { theme } from '../../theme/colors';

export default function LocationGuide() {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(Platform.OS === 'ios' ? 'ios' : 'android');

  // We could add full guide steps here. Keeping it simple for UI mapping.

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.triggerBtn}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.triggerContent}>
          <View style={styles.iconBox}>
            <AppIcon name="location-outline" size={20} color="#2563eb" />
          </View>
          <View style={styles.triggerTextCol}>
            <Text style={styles.triggerTitle}>Enable GPS / Location Services</Text>
            <Text style={styles.triggerSub}>Tap to view instructions</Text>
          </View>
        </View>
        <View style={styles.caretBox}>
          <AppIcon name="chevron-forward" size={16} color="#60a5fa" />
        </View>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalHeaderIcon}>
                  <AppIcon name="location" size={16} color="#2563eb" />
                </View>
                <Text style={styles.modalTitle}>GPS Guide</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <AppIcon name="close" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.introBox}>
                <Text style={styles.introText}>
                  Please ensure precise location is enabled for the app to verify your attendance within the campus area.
                </Text>
              </View>

              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'android' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('android')}
                >
                  <AppIcon name="logo-android" size={16} color={activeTab === 'android' ? theme.colors.textPrimary : theme.colors.textMuted} />
                  <Text style={[styles.tabText, activeTab === 'android' && styles.tabTextActive]}>Android</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'ios' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('ios')}
                >
                  <AppIcon name="logo-apple" size={16} color={activeTab === 'ios' ? theme.colors.textPrimary : theme.colors.textMuted} />
                  <Text style={[styles.tabText, activeTab === 'ios' && styles.tabTextActive]}>iPhone</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
                  <Text style={styles.stepTitle}>Open Settings &gt; Location</Text>
                </View>
                <Text style={styles.stepDesc}>Ensure location services are turned on and set to High Accuracy or Precise Location.</Text>
                {activeTab === 'android' ? (
                  <Image source={require('../../assets/AndroidGuide/AndroidSetting.jpg')} style={styles.guideImg} />
                ) : (
                  <Image source={require('../../assets/IOSGuide/IOSSetting.jpg')} style={styles.guideImg} />
                )}
              </View>
              
              <View style={styles.stepCard}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
                  <Text style={styles.stepTitle}>Grant App Permissions</Text>
                </View>
                <Text style={styles.stepDesc}>Find this app in settings and select "Allow while using app".</Text>
                {activeTab === 'android' ? (
                  <Image source={require('../../assets/AndroidGuide/Androidlocatin.jpg')} style={styles.guideImg} />
                ) : (
                  <Image source={require('../../assets/IOSGuide/IOSSafari.jpg')} style={styles.guideImg} />
                )}
              </View>
              
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  triggerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  triggerTextCol: {
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#dbeafe', // blue-100
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  triggerSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563eb', // blue-600
    marginTop: 2,
  },
  caretBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.surfaceBg,
    borderRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceBorder,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 16,
  },
  introBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  introText: {
    fontSize: 12.5,
    color: '#1e40af', // blue-800
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceInput,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.surfaceCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    color: theme.colors.textPrimary,
  },
  stepCard: {
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  stepDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    paddingLeft: 36,
  },
  guideImg: {
    width: '100%',
    height: 180,
    resizeMode: 'contain',
    marginTop: 12,
    borderRadius: 8,
  }
});
