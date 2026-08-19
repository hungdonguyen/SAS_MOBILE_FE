import React, { useState, useEffect } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { studentApi } from '../../services/studentApi';
import { getErrorMessage } from '../../utils/errors';
import { authStorage as studentAuthStorage } from '../../services/authStorage';
import { apiConfig } from '../../services/apiConfig';

const Login: React.FC = () => {
  const navigation = useNavigation<any>();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  // Server configuration state
  const [serverUrl, setServerUrl] = useState(apiConfig.getBaseUrl());
  const [isServerModalVisible, setIsServerModalVisible] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(apiConfig.getBaseUrl());
  const [pingStatus, setPingStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');
  const [pingMessage, setPingMessage] = useState<string | null>(null);

  useEffect(() => {
    setServerUrl(apiConfig.getBaseUrl());
    setCustomUrlInput(apiConfig.getBaseUrl());
  }, []);

  const handleTestConnection = async (testUrl?: string) => {
    const target = (testUrl || customUrlInput).trim().replace(/\/+$/, '');
    if (!target) return;

    setPingStatus('checking');
    setPingMessage('Testing server connection...');

    try {
      // Send test request to server
      await axios.get(`${target}/auth/me`, {
        timeout: 4000,
        validateStatus: (status) => status < 500,
      });
      setPingStatus('success');
      setPingMessage('✅ Connected to Server successfully!');
    } catch (e: any) {
      setPingStatus('failed');
      setPingMessage(`❌ Connection failed: ${e.message || 'Network Timeout'}`);
    }
  };

  const handleSaveServerUrl = () => {
    const trimmed = customUrlInput.trim().replace(/\/+$/, '');
    if (!trimmed) {
      apiConfig.resetDefault();
      setServerUrl(apiConfig.getBaseUrl());
      setCustomUrlInput(apiConfig.getBaseUrl());
    } else {
      apiConfig.setBaseUrl(trimmed);
      setServerUrl(trimmed);
    }
    setIsServerModalVisible(false);
    setPingStatus('idle');
    setPingMessage(null);
    setMessage({
      text: `Updated Server URL: ${apiConfig.getBaseUrl()}`,
      type: 'success',
    });
  };

  const handleResetServerUrl = () => {
    apiConfig.resetDefault();
    const def = apiConfig.getBaseUrl();
    setServerUrl(def);
    setCustomUrlInput(def);
    setIsServerModalVisible(false);
    setPingStatus('idle');
    setPingMessage(null);
    setMessage({
      text: `Restored default Server: ${def}`,
      type: 'success',
    });
  };

  const handleLogin = async () => {
    if (!id.trim() || !password.trim()) {
      setMessage({ text: 'Please enter both Username/ID and Password', type: 'error' });
      return;
    }

    setMessage(null);
    setLoading(true);

    try {
      const normalizedUsername = id.trim().toLowerCase();
      const data = await studentApi.login(normalizedUsername, password);

      setMessage({
        text: `Welcome, ${id.trim()}! Role: ${data.role || 'user'}`,
        type: 'success',
      });

      // Role-based dynamic routing
      const userRole = (data.role || '').toLowerCase();
      if (userRole === 'admin') {
        navigation.navigate('AdminHome');
      } else if (userRole === 'lecturer' || userRole === 'teacher') {
        navigation.navigate('Home');
      } else {
        if (data.hasRegisteredFace === false) {
          navigation.navigate('StudentFaceRegister');
        } else {
          navigation.navigate('StudentHome');
        }
      }
    } catch (error: any) {
      console.log('Login error:', error);
      let errorMessage = getErrorMessage(error);
      if (errorMessage.includes('Unable to connect to server')) {
        errorMessage = `Unable to connect to server (${apiConfig.getBaseUrl()}). Tap '⚙️ Server' above to check IP settings.`;
      }
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Server Indicator Badge */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.serverBadge}
          onPress={() => {
            setCustomUrlInput(apiConfig.getBaseUrl());
            setPingStatus('idle');
            setPingMessage(null);
            setIsServerModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.serverBadgeDot}>●</Text>
          <Text style={styles.serverBadgeText} numberOfLines={1}>
            Server: {serverUrl}
          </Text>
          <Text style={styles.serverBadgeIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Smart Attendance System</Text>
          <Text style={styles.subtitle}>Enter your institutional credentials</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, message?.type === 'error' && styles.inputError]}
            placeholder="Username or Student ID"
            placeholderTextColor="#94A3B8"
            value={id}
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(text) => {
              setId(text);
              if (message) setMessage(null);
            }}
          />
          <TextInput
            style={[styles.input, message?.type === 'error' && styles.inputError]}
            placeholder="Password"
            placeholderTextColor="#94A3B8"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (message) setMessage(null);
            }}
            secureTextEntry
          />

          {message && (
            <View
              style={[
                styles.messageContainer,
                message.type === 'success' ? styles.successContainer : styles.errorContainer,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.type === 'success' ? styles.successText : styles.errorText,
                ]}
              >
                {message.text}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Quick Role Preview Modes */}
        <View style={styles.demoRoleSection}>
          <Text style={styles.demoRoleTitle}>Quick Preview Modes:</Text>
          <View style={styles.demoRoleRow}>
            <TouchableOpacity
              style={styles.studentModeBtn}
              onPress={() => {
                studentAuthStorage.setUser({
                  userId: 'demo-student-id',
                  username: 'student.demo',
                  role: 'student',
                  hasRegisteredFace: true,
                });
                navigation.navigate('StudentHome');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.studentModeText}>Student (Live API)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.lecturerModeBtn}
              onPress={() => {
                studentAuthStorage.setUser({
                  userId: 'demo-lecturer-id',
                  username: 'lec_nguyen',
                  role: 'lecturer',
                  hasRegisteredFace: false,
                });
                navigation.navigate('Home');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.lecturerModeText}>Lecturer Mode</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adminModeBtn}
              onPress={() => {
                navigation.navigate('AdminHome');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.adminModeText}>Admin Mode</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modal Server Configuration */}
      <Modal
        visible={isServerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsServerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚙️ Server Configuration</Text>
            <Text style={styles.modalSubtitle}>
              Select a quick preset or enter your backend server URL:
            </Text>

            {/* Presets */}
            <Text style={styles.presetLabel}>Quick Presets:</Text>
            <View style={styles.presetList}>
              <TouchableOpacity
                style={styles.presetItem}
                onPress={() => {
                  setCustomUrlInput('http://10.0.2.2:3001');
                  handleTestConnection('http://10.0.2.2:3001');
                }}
              >
                <Text style={styles.presetName}>Android Emulator</Text>
                <Text style={styles.presetUrl}>http://10.0.2.2:3001</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetItem}
                onPress={() => {
                  setCustomUrlInput('http://192.168.1.13:3001');
                  handleTestConnection('http://192.168.1.13:3001');
                }}
              >
                <Text style={styles.presetName}>Physical Device (Wi-Fi LAN)</Text>
                <Text style={styles.presetUrl}>http://192.168.1.13:3001</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.presetItem}
                onPress={() => {
                  setCustomUrlInput('http://localhost:3001');
                  handleTestConnection('http://localhost:3001');
                }}
              >
                <Text style={styles.presetName}>Localhost / ADB Reverse</Text>
                <Text style={styles.presetUrl}>http://localhost:3001</Text>
              </TouchableOpacity>
            </View>

            {/* Input URL */}
            <Text style={styles.inputLabel}>Backend Base URL:</Text>
            <TextInput
              style={styles.modalInput}
              value={customUrlInput}
              onChangeText={(text) => {
                setCustomUrlInput(text);
                setPingStatus('idle');
                setPingMessage(null);
              }}
              placeholder="http://192.168.1.13:3001"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Test Connection Button */}
            <TouchableOpacity
              style={styles.testBtn}
              onPress={() => handleTestConnection()}
              disabled={pingStatus === 'checking'}
            >
              {pingStatus === 'checking' ? (
                <ActivityIndicator size="small" color="#0D9488" />
              ) : (
                <Text style={styles.testBtnText}>⚡ Test Connection</Text>
              )}
            </TouchableOpacity>

            {pingMessage && (
              <View
                style={[
                  styles.pingResultBox,
                  pingStatus === 'success' ? styles.pingSuccess : styles.pingError,
                ]}
              >
                <Text
                  style={[
                    styles.pingResultText,
                    pingStatus === 'success' ? styles.pingSuccessText : styles.pingErrorText,
                  ]}
                >
                  {pingMessage}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalResetBtn}
                onPress={handleResetServerUrl}
              >
                <Text style={styles.modalResetText}>Reset Default</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsServerModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveServerUrl}
              >
                <Text style={styles.modalSaveText}>Save Configuration</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  serverBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    maxWidth: '90%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  serverBadgeDot: {
    color: '#10B981',
    fontSize: 10,
    marginRight: 5,
  },
  serverBadgeText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    flexShrink: 1,
  },
  serverBadgeIcon: {
    fontSize: 12,
    marginLeft: 6,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 240,
    height: 90,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  form: {
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  inputError: {
    borderColor: '#F87171',
    backgroundColor: '#FEF2F2',
  },
  messageContainer: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  successContainer: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
  },
  successText: {
    color: '#15803D',
  },
  button: {
    backgroundColor: '#0D9488',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  demoRoleSection: {
    marginTop: 28,
    alignItems: 'center',
  },
  demoRoleTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoRoleRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  studentModeBtn: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  studentModeText: {
    color: '#0D9488',
    fontSize: 11,
    fontWeight: '800',
  },
  lecturerModeBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  lecturerModeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  adminModeBtn: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  adminModeText: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '700',
  },

  // Server Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 18,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  presetList: {
    gap: 6,
    marginBottom: 14,
  },
  presetItem: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  presetName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0D9488',
  },
  presetUrl: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 10,
  },
  testBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  testBtnText: {
    color: '#0D9488',
    fontSize: 12,
    fontWeight: '700',
  },
  pingResultBox: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  pingSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
  },
  pingError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
  },
  pingResultText: {
    fontSize: 12,
    fontWeight: '600',
  },
  pingSuccessText: {
    color: '#15803D',
  },
  pingErrorText: {
    color: '#B91C1C',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  modalResetBtn: {
    marginRight: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  modalResetText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  modalCancelText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: '#0D9488',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default Login;
