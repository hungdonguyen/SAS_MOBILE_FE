import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import { AdminRoomItem } from '../../types/adminTypes';

const MOCK_ADMIN_ROOMS: AdminRoomItem[] = [
  {
    id: 'r-1',
    roomCode: 'A3-201',
    building: 'Building A',
    floor: 3,
    capacity: 50,
    cameraIp: '192.168.1.101',
    cameraStatus: 'online',
    isActive: true,
  },
  {
    id: 'r-2',
    roomCode: 'A2-105',
    building: 'Building A',
    floor: 2,
    capacity: 30,
    cameraIp: '192.168.1.102',
    cameraStatus: 'online',
    isActive: true,
  },
  {
    id: 'r-3',
    roomCode: 'B1-401',
    building: 'Building B',
    floor: 4,
    capacity: 40,
    cameraIp: '192.168.1.105',
    cameraStatus: 'offline',
    isActive: true,
  },
  {
    id: 'r-4',
    roomCode: 'C3-102',
    building: 'Building C',
    floor: 1,
    capacity: 60,
    cameraIp: '192.168.1.108',
    cameraStatus: 'online',
    isActive: true,
  },
  {
    id: 'r-5',
    roomCode: 'D2-204',
    building: 'Building D',
    floor: 2,
    capacity: 45,
    cameraIp: '192.168.1.112',
    cameraStatus: 'maintenance',
    isActive: false,
  },
];

const AdminRoomsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_ADMIN_ROOMS.filter(
    (r) =>
      r.roomCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.building.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddRoom = () => {
    Alert.alert('Add Room', 'Opening room registration modal.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Rooms Management</Text>
          <Text style={styles.headerSubtitle}>Monitor room allocation and capacity</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleAddRoom} activeOpacity={0.85}>
          <AppIcon name="location-outline" size={14} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Room</Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search room code, building..."
      />

      <ScrollView contentContainerStyle={styles.listContent}>
        {filtered.map((room) => {
          return (
            <View key={room.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.roomCodeBadge}>
                  <Text style={styles.roomCodeText}>{room.roomCode}</Text>
                </View>

                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>{room.isActive ? 'Active' : 'Inactive'}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.buildingText}>
                  {room.building} • Floor {room.floor}
                </Text>
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Capacity:</Text>
                  <Text style={styles.detailVal}>{room.capacity} seats</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 4,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  roomCodeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roomCodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4F46E5',
  },
  activePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  metaRow: {
    marginBottom: 8,
  },
  buildingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
});

export default AdminRoomsScreen;
