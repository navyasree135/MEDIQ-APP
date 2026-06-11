import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ApiError } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
    const { user, loading, authenticating, signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (loading) {
        return (
            <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color="#008080" />
            </View>
        );
    }

    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    const onSubmit = async () => {
        if (!email.trim() || !password) {
            setError('Email and password are required.');
            return;
        }

        setError(null);
        try {
            await signIn(email.trim(), password);
            router.replace('/(tabs)');
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Invalid email or password.');
            }
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#002b40" />
                </Pressable>
                <Text style={styles.headerTitle}>Sign In</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.logoSection}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="medical" size={40} color="#008080" />
                        </View>
                        <Text style={styles.logoText}>MediQ</Text>
                        <Text style={styles.tagline}>Your AI Health Companion</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to access your health dashboard and AI concierge.</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color="#6f7f79" style={styles.inputIcon} />
                                <TextInput
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    placeholder="name@example.com"
                                    placeholderTextColor="#999"
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color="#6f7f79" style={styles.inputIcon} />
                                <TextInput
                                    secureTextEntry
                                    placeholder="Enter your password"
                                    placeholderTextColor="#999"
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Pressable style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </Pressable>

                        <Pressable 
                            onPress={onSubmit} 
                            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]} 
                            disabled={authenticating}
                        >
                            {authenticating ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryButtonText}>Sign In</Text>}
                        </Pressable>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <Pressable onPress={() => router.push('/signup')}>
                                <Text style={styles.linkText}>Create Account</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loaderWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002b40',
    },
    content: {
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    logoSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f8f8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#002b40',
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 14,
        color: '#008080',
        fontWeight: '600',
        marginTop: 4,
    },
    formContainer: {
        backgroundColor: '#f6fafb',
        borderRadius: 30,
        padding: 25,
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#002b40',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6f7f79',
        lineHeight: 20,
        marginBottom: 25,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 13,
        color: '#002b40',
        fontWeight: '600',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 15,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 15,
        color: '#002b40',
    },
    errorText: {
        color: '#ff4d4d',
        fontSize: 13,
        marginTop: 5,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 25,
    },
    forgotPasswordText: {
        color: '#008080',
        fontSize: 13,
        fontWeight: '600',
    },
    primaryButton: {
        backgroundColor: '#008080',
        borderRadius: 15,
        height: 55,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 25,
    },
    footerText: {
        color: '#6f7f79',
        fontSize: 14,
    },
    linkText: {
        color: '#008080',
        fontSize: 14,
        fontWeight: '700',
    },
});
