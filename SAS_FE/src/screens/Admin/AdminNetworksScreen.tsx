import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIcon from '../../components/Icon/AppIcon';
import SearchBar from '../../components/SearchBar/SearchBar';
import { AdminNetworkItem } from '../../types/adminTypes';

const INITIAL_NETWORKS: AdminNetworkItem[] = [
  {
    id: 'net-1',
    networkName: 'Wi-Fi Giảng Đường Khu A',
    ipAddress: '172.16.0.0/16',
    description: 'Dải mạng phủ sóng toàn bộ các phòng học tòa nhà A1 - A4',
    isActive: true,
    createdAt: '2025-08-10',
  },
  {
    id: 'net-2',
    networkName: 'Wi-Fi Giảng Đường Khu B & Hội Trường',
    ipAddress: '172.18.0.0/16',
    description: 'Dải mạng các phòng học tòa B và Hội trường trung tâm',
    isActive: true,
    createdAt: '2025-08-10',
  },
  {
    id: 'net-3',
    networkName: 'Phòng Máy Tính Thực Hành IT Lab',
    ipAddress: '192.168.100.0/24',
    description: 'Dải IP cố định cho các phòng máy thực hành Lab 101 - Lab 105',
    isActive: true,
    createdAt: '2025-09-01',
  },
  {
    id: 'net-4',
    networkName: 'Môi Trường Android Emulator (Dev & Test)',
    ipAddress: '10.0.2.2/32',
    description: 'Dải IP NAT mặc định của Android Studio Emulator',
    isActive: true,
    createdAt: '2025-09-15',
  },
  {
    id: 'net-5',
    networkName: 'Wi-Fi Thư Viện & Khu Tự Học',
    ipAddress: '172.20.0.0/16',
    description: 'Khu vực tự học (Tạm tắt điểm danh ngoài giờ học)',
    isActive: false,
    createdAt: '2025-10-01',
  },
];

const AdminNetworksScreen: React.FC = () => {
  const [networks, setNetworks] = useState<AdminNetworkItem[]>(INITIAL_NETWORKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [netName, setNetName] = useState('');
  const [netIp, setNetIp] = useState('');
  const [netDesc, setNetDesc] = useState('');

  const activeCount = useMemo(() => networks.filter((n) => n.isActive).length, [networks]);
  const inactiveCount = useMemo(() => networks.filter((n) => !n.isActive).length, [networks]);

  const filteredNetworks = useMemo(() => {
    return networks.filter((item) => {
      if (filterActive === 'active' && !item.isActive) return false;
      if (filterActive === 'inactive' && item.isActive) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        item.networkName.toLowerCase().includes(q) ||
        item.ipAddress.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    });
  }, [networks, searchQuery, filterActive]);

  const handleToggleActive = (id: string) => {
    setNetworks(
      networks.map((n) => (n.id === id ? { ...n, isActive: !n.isActive } : n))
    );
  };

  const handleAddNetwork = () => {
    if (!netName.trim() || !netIp.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập Tên mạng và Địa chỉ IP / CIDR.');
      return;
    }

    const newNet: AdminNetworkItem = {
      id: `net-${Date.now()}`,
      networkName: netName.trim(),
      ipAddress: netIp.trim(),
      description: netDesc.trim(),
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setNetworks([newNet, ...networks]);
    setIsAddModalOpen(false);
    setNetName('');
    setNetIp('');
    setNetDesc('');
    Alert.alert('Thành Công', `Đã thêm dải mạng "${newNet.networkName}" (${newNet.ipAddress})`);
  };

  const handleDeleteNetwork = (id: string, name: string) => {
    Alert.alert('Xóa Dải Mạng', `Bạn có chắc muốn xóa "${name}" khỏi danh sách trắng điểm danh?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setNetworks(networks.filter((n) => n.id !== id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Dải Mạng Điểm Danh</Text>
            <Text style={styles.brandSubtitle}>Cấu hình IP Wi-Fi & Subnet CIDR trường</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => setIsAddModalOpen(true)}>
          <AppIcon name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Thêm Mạng</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Metric Summary */}
      <View style={styles.metricsRow}>
        <TouchableOpacity
          style={[styles.metricCard, filterActive === 'all' && styles.metricCardActive]}
          onPress={() => setFilterActive('all')}
        >
          <Text style={styles.metricVal}>{networks.length}</Text>
          <Text style={styles.metricLbl}>Tất cả dải IP</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.metricCard, filterActive === 'active' && styles.metricCardActive]}
          onPress={() => setFilterActive('active')}
        >
          <Text style={[styles.metricVal, { color: '#16A34A' }]}>{activeCount}</Text>
          <Text style={styles.metricLbl}>Đang cho phép</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.metricCard, filterActive === 'inactive' && styles.metricCardActive]}
          onPress={() => setFilterActive('inactive')}
        >
          <Text style={[styles.metricVal, { color: '#64748B' }]}>{inactiveCount}</Text>
          <Text style={styles.metricLbl}>Tạm vô hiệu</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm theo tên Wi-Fi hoặc dải IP (172.16.x.x)..."
        />
      </View>

      {/* Network Cards List */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredNetworks.length > 0 ? (
          filteredNetworks.map((net) => (
            <View key={net.id} style={styles.networkCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.netTitleCol}>
                  <View style={styles.iconTitleRow}>
                    <View style={[styles.wifiIconCircle, net.isActive ? styles.wifiIconActive : styles.wifiIconInactive]}>
                      <AppIcon
                        name="wifi"
                        size={16}
                        color={net.isActive ? '#6366F1' : '#94A3B8'}
                      />
                    </View>
                    <Text style={styles.networkName}>{net.networkName}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.statusBadge, net.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive]}
                  onPress={() => handleToggleActive(net.id)}
                >
                  <Text style={[styles.statusText, net.isActive ? styles.statusTextActive : styles.statusTextInactive]}>
                    {net.isActive ? '● Đang Kích Hoạt' : '○ Tắt'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* IP / CIDR Box */}
              <View style={styles.ipBadgeRow}>
                <View style={styles.ipCodeBox}>
                  <AppIcon name="globe-outline" size={13} color="#6366F1" />
                  <Text style={styles.ipCodeText}>{net.ipAddress}</Text>
                </View>
                <Text style={styles.cidrHint}>CIDR Subnet</Text>
              </View>

              {net.description ? (
                <Text style={styles.networkDesc}>{net.description}</Text>
              ) : null}

              <View style={styles.cardFooterRow}>
                <Text style={styles.createdDateText}>Tạo ngày: {net.createdAt || '2025-08-01'}</Text>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteNetwork(net.id, net.networkName)}
                >
                  <AppIcon name="trash-outline" size={14} color="#DC2626" />
                  <Text style={styles.deleteBtnText}>Xóa Dải Mạng</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <AppIcon name="wifi-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Không tìm thấy dải IP nào</Text>
            <Text style={styles.emptySubtitle}>Thử thay đổi từ khóa tìm kiếm hoặc thêm mới dải mạng.</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal Add Network */}
      <Modal visible={isAddModalOpen} transparent animationType="fade" onRequestClose={() => setIsAddModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Thêm Dải Mạng Cho Phép</Text>
            <Text style={styles.modalSubtitle}>
              Sinh viên kết nối IP thuộc dải này sẽ vượt qua lớp xác thực Network Validation.
            </Text>

            <Text style={styles.inputLabel}>Tên Dải Mạng / Vị Trí:</Text>
            <TextInput
              style={styles.modalInput}
              value={netName}
              onChangeText={setNetName}
              placeholder="Wi-Fi Tòa Nhà B..."
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Địa Chỉ IP hoặc Dải CIDR (Ví dụ: 172.16.0.0/16):</Text>
            <TextInput
              style={styles.modalInput}
              value={netIp}
              onChangeText={setNetIp}
              placeholder="172.16.0.0/16"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Mô Tả Chi Tiết:</Text>
            <TextInput
              style={[styles.modalInput, { minHeight: 60 }]}
              value={netDesc}
              onChangeText={setNetDesc}
              placeholder="Khu vực phòng học, phủ sóng..."
              placeholderTextColor="#94A3B8"
              multiline
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setIsAddModalOpen(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAddNetwork}>
                <Text style={styles.modalSaveText}>Lưu Dải Mạng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  addButton: {
    backgroundColor: '#6366F1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricCardActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  metricVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#6366F1',
  },
  metricLbl: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  networkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  netTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wifiIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wifiIconActive: {
    backgroundColor: '#EEF2FF',
  },
  wifiIconInactive: {
    backgroundColor: '#F1F5F9',
  },
  networkName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeInactive: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextActive: {
    color: '#16A34A',
  },
  statusTextInactive: {
    color: '#94A3B8',
  },
  ipBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ipCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  ipCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
    fontFamily: 'monospace',
  },
  cidrHint: {
    fontSize: 11,
    color: '#94A3B8',
  },
  networkDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  createdDateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 12,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  modalCancelText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default AdminNetworksScreen;
