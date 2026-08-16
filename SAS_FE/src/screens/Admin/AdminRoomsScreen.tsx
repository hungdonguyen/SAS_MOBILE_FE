import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import { roomService, RoomResponse } from '../../api';

const AdminRoomsScreen: React.FC = () => {
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New room form state
  const [newRoomCode, setNewRoomCode] = useState('');
  const [newBuilding, setNewBuilding] = useState('Building A');
  const [newFloor, setNewFloor] = useState('1');
  const [newRadius, setNewRadius] = useState('30');
  const [newLat, setNewLat] = useState('11.0528');
  const [newLng, setNewLng] = useState('106.6661');

  const loadRooms = useCallback(async (queryStr?: string) => {
    try {
      setLoading(true);
      const res = await roomService.listRooms({
        q: queryStr !== undefined ? queryStr : searchQuery,
        limit: 50,
      });
      setRooms(res.data);
    } catch (error: any) {
      console.log('Error loading rooms:', error);
      Alert.alert('Error', error.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadRooms(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [loadRooms, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRooms();
  };

  const handleCreateRoom = async () => {
    if (!newRoomCode.trim() || !newBuilding.trim()) {
      Alert.alert('Validation Error', 'Please enter Room Code and Building name.');
      return;
    }

    const floorNum = parseInt(newFloor, 10) || 1;
    const radiusNum = parseInt(newRadius, 10) || 30;
    const latNum = parseFloat(newLat) || 11.0528;
    const lngNum = parseFloat(newLng) || 106.6661;

    try {
      setIsSubmitting(true);
      await roomService.createRoom({
        room: newRoomCode.trim(),
        building: newBuilding.trim(),
        floor: floorNum,
        radius: radiusNum,
        latitude: latNum,
        longitude: lngNum,
        isActive: true,
      });

      setShowAddModal(false);
      setNewRoomCode('');
      Alert.alert('Success', `Room ${newRoomCode} registered successfully.`);
      loadRooms();
    } catch (error: any) {
      Alert.alert('Creation Error', error.message || 'Failed to create room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleRoomStatus = (room: RoomResponse) => {
    const newStatus = !room.isActive;
    Alert.alert(
      `${newStatus ? 'Activate' : 'Deactivate'} Room`,
      `Set room ${room.room} to ${newStatus ? 'Active' : 'Inactive'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await roomService.updateRoom(room.roomId, { isActive: newStatus });
              setRooms((prev) =>
                prev.map((r) => (r.roomId === room.roomId ? { ...r, isActive: newStatus } : r))
              );
            } catch (error: any) {
              Alert.alert('Update Failed', error.message || 'Could not update room status.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Rooms Management</Text>
          <Text style={styles.headerSubtitle}>Monitor room allocation and geofence</Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.85}
        >
          <AppIcon name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Room</Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search room code, building..."
      />

      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
        }
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.centerText}>Loading rooms from campus database...</Text>
          </View>
        ) : rooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppIcon name="location-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No rooms found</Text>
            <Text style={styles.emptySubtitle}>Tap "Add Room" to register a new campus room.</Text>
          </View>
        ) : (
          rooms.map((room) => {
            return (
              <TouchableOpacity
                key={room.roomId}
                style={[styles.card, !room.isActive && styles.cardInactive]}
                onPress={() => handleToggleRoomStatus(room)}
                activeOpacity={0.85}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.roomCodeBadge}>
                    <Text style={styles.roomCodeText}>{room.room}</Text>
                  </View>

                  <View style={[styles.activePill, room.isActive ? styles.pillActive : styles.pillInactive]}>
                    <Text style={[styles.activePillText, room.isActive ? styles.textActive : styles.textInactive]}>
                      {room.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.buildingText}>
                    {room.building} • Floor {room.floor}
                  </Text>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Geofence Radius:</Text>
                    <Text style={styles.detailVal}>{room.radius || 30}m</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>GPS Point:</Text>
                    <Text style={styles.detailVal}>
                      {room.latitude ? `${room.latitude.toFixed(4)}, ${room.longitude.toFixed(4)}` : 'Campus GPS'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Add Room Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Room</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <AppIcon name="close-circle" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.addForm}>
              <Text style={styles.inputLabel}>Room Code * (e.g. A3-201)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. A3-201 or B4-105"
                placeholderTextColor="#94A3B8"
                value={newRoomCode}
                onChangeText={setNewRoomCode}
                autoCapitalize="characters"
              />

              <Text style={styles.inputLabel}>Building *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Building A"
                placeholderTextColor="#94A3B8"
                value={newBuilding}
                onChangeText={setNewBuilding}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Floor</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="1"
                    placeholderTextColor="#94A3B8"
                    value={newFloor}
                    onChangeText={setNewFloor}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Radius (m)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="30"
                    placeholderTextColor="#94A3B8"
                    value={newRadius}
                    onChangeText={setNewRadius}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Latitude</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="11.0528"
                    placeholderTextColor="#94A3B8"
                    value={newLat}
                    onChangeText={setNewLat}
                    keyboardType="numeric"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Longitude</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="106.6661"
                    placeholderTextColor="#94A3B8"
                    value={newLng}
                    onChangeText={setNewLng}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
                onPress={handleCreateRoom}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Create Room</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pillActive: {
    backgroundColor: '#DCFCE7',
  },
  pillInactive: {
    backgroundColor: '#FEE2E2',
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  textActive: {
    color: '#15803D',
  },
  textInactive: {
    color: '#EF4444',
  },
  cardInactive: {
    opacity: 0.65,
    backgroundColor: '#F8FAFC',
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
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  centerText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  addForm: {
    gap: 10,
    paddingBottom: 10,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  formInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    fontSize: 14,
    color: '#0F172A',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  submitBtn: {
    backgroundColor: '#6366F1',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.6,
  },
});

export default AdminRoomsScreen;
