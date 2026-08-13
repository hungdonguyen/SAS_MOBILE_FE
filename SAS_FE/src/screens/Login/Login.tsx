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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

axios.defaults.withCredentials = true;

const Login = () => {
    const navigation = useNavigation<any>();
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

    const handleLoginAxios = async () => {
        setMessage(null);
        setLoading(true);

        try {
            // Note: 10.0.2.2 chỉ dùng cho Android Emulator.
            // Nếu dùng iOS Simulator thì dùng localhost hoặc 127.0.0.1
            // Nếu test máy thật thì phải dùng IP LAN (vd: 192.168.1.X)
            const response = await axios.post('http://10.0.2.2:3001/auth/login', {
                username: id,
                password,
            }, {
                // Bắt buộc để React Native nhận được HttpOnly Cookie (access_token)
                withCredentials: true
            });

            // Lấy thông tin từ backend gửi về
            const { userId, role, hasRegisteredFace } = response.data;

            // TODO: Lưu userId, role, hasRegisteredFace vào Redux / Zustand
            console.log('Login Success:', response.data);

            setMessage({ text: 'Login successful! Redirecting...', type: 'success' });

            // Điều hướng sang Home
            setTimeout(() => {
                navigation.navigate('Home');
            }, 500);

        } catch (error: any) {
            console.log(error);
            // Get error message from backend (if any)
            const errorMessage = error.response?.data?.message || 'Wrong ID or Password';
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior="padding" style={styles.keyboardView}>
                <View style={styles.header}>
                    <Image
                        source={require('../../../assets/images/logo.png')}
                        style={styles.logo}
                    />
                    <Text style={styles.title}>Welcome to Smart Attendance System</Text>
                    <Text style={styles.subtitle}>Please enter your credentials</Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        style={[styles.input, message?.type === 'error' && styles.inputError]}
                        placeholder="ID"
                        placeholderTextColor="#999"
                        value={id}
                        onChangeText={(text) => {
                            setId(text);
                            if (message) setMessage(null);
                        }}
                    />
                    <TextInput
                        style={[styles.input, message?.type === 'error' && styles.inputError]}
                        placeholder="Password"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (message) setMessage(null);
                        }}
                        secureTextEntry
                    />

                    {message && (
                        <View style={[
                            styles.messageContainer,
                            message.type === 'success' ? styles.successContainer : styles.errorContainer
                        ]}>
                            <Text style={[
                                styles.messageText,
                                message.type === 'success' ? styles.successText : styles.errorText
                            ]}>
                                {message.text}
                            </Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    onPress={() => handleLoginAxios()}
                    style={[styles.button, loading && styles.buttonDisabled]}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>

                {/* Quick Role Navigation Shortcuts for UI Prototype */}
                <View style={styles.demoRoleSection}>
                    <Text style={styles.demoRoleTitle}>Quick Preview Modes:</Text>
                    <View style={styles.demoRoleRow}>
                        <TouchableOpacity
                            style={styles.lecturerModeBtn}
                            onPress={() => navigation.navigate('Home')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.lecturerModeText}>Lecturer Mode</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.adminModeBtn}
                            onPress={() => navigation.navigate('AdminHome')}
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
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    form: {
        marginBottom: 10,
    },
    logo: {
        width: 500,
        height: 159,
        resizeMode: 'contain',
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderRadius: 8,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f9f9f9',
    },
    inputError: {
        borderColor: '#e02424',
        backgroundColor: '#fff8f8',
    },
    messageContainer: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        marginBottom: 15,
    },
    errorContainer: {
        backgroundColor: '#fde8e8',
        borderColor: '#f8b4b4',
        borderWidth: 1,
    },
    successContainer: {
        backgroundColor: '#def7ec',
        borderColor: '#bcf0da',
        borderWidth: 1,
    },
    messageText: {
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    errorText: {
        color: '#c81e1e',
    },
    successText: {
        color: '#03543f',
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#80bdff',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    demoRoleSection: {
        marginTop: 24,
        alignItems: 'center',
    },
    demoRoleTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    demoRoleRow: {
        flexDirection: 'row',
        gap: 12,
    },
    lecturerModeBtn: {
        backgroundColor: '#F0FDFA',
        borderWidth: 1,
        borderColor: '#0D9488',
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 20,
    },
    lecturerModeText: {
        color: '#0D9488',
        fontSize: 12,
        fontWeight: '700',
    },
    adminModeBtn: {
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#6366F1',
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 20,
    },
    adminModeText: {
        color: '#6366F1',
        fontSize: 12,
        fontWeight: '700',
    },
});

export default Login;
