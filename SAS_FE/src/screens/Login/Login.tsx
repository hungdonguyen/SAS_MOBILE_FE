import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { studentApi } from '../../services/studentApi';
import { authStorage as studentAuthStorage } from '../../services/authStorage';
import { apiConfig } from '../../services/apiConfig';

const Login: React.FC = () => {
  const navigation = useNavigation<any>();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const handleLogin = async () => {
    if (!id.trim() || !password.trim()) {
      setMessage({ text: 'Please enter both Username/ID and Password', type: 'error' });
      return;
    }

    setMessage(null);
    setLoading(true);

    try {
      // Use studentApi.login() — hits the real NestJS backend for ALL roles
      const data = await studentApi.login(id.trim(), password);

      setMessage({
        text: `Welcome, ${id.trim()}! Role: ${data.role || 'user'}`,
        type: 'success',
      });

      // Role-based dynamic routing — navigate immediately, no artificial delay
      const userRole = (data.role || '').toLowerCase();
      if (userRole === 'admin') {
        navigation.navigate('AdminHome');
      } else if (userRole === 'lecturer' || userRole === 'teacher') {
        navigation.navigate('Home');
      } else {
        // Student role: live API flow
        navigation.navigate('StudentHome');
      }
    } catch (error: any) {
      console.log('Login error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Login failed. Ensure backend NestJS is running on ${apiConfig.getBaseUrl()}`;
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
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
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.8}
            >
              <Text style={styles.lecturerModeText}>Lecturer (Mock)</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
});

export default Login;
