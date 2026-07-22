import { router } from 'expo-router';
import React, { useState } from 'react';
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
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { resetPassword, ApiError } from '@/lib/api';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const validatePassword = (pass: string): string | null => {
        if (pass.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        if (!/[A-Z]/.test(pass)) {
            return 'Password must contain at least 1 uppercase letter (e.g. A-Z).';
        }
        if (!/[0-9]/.test(pass)) {
            return 'Password must contain at least 1 number (e.g. 0-9).';
        }
        if (!/[!@#$%^&*(),.?":{}|<>\-_\\\/+=;']/.test(pass)) {
            return 'Password must contain at least 1 special character (e.g. @, #, $, !).';
        }
        return null;
    };

    const handleReset = async () => {
        const cleanEmail = email.trim();
        if (!cleanEmail) {
            setError('Please enter your registered email address.');
            return;
        }
        if (!newPassword) {
            setError('Please enter a new password.');
            return;
        }

        const passErr = validatePassword(newPassword);
        if (passErr) {
            setError(passErr);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match. Please check and try again.');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const res = await resetPassword(cleanEmail, newPassword);
            setSuccessMessage(res.message || 'Password reset successfully!');
            setTimeout(() => {
                router.replace('/login');
            }, 2000);
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else if (err instanceof Error) {
                setError(err.message || 'Failed to reset password.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
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
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {/* Top Header */}
                    <View style={styles.headerRow}>
                        <Pressable onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#002b40" />
                        </Pressable>
                    </View>

                    <View style={styles.titleSection}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="key-outline" size={32} color="#008080" />
                        </View>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>
                            Enter your account email address and specify your new password below.
                        </Text>
                    </View>

                    <View style={styles.card}>
                        {error ? (
                            <View style={styles.errorBanner}>
                                <Ionicons name="alert-circle-outline" size={18} color="#dc2626" style={{ marginRight: 6 }} />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        {successMessage ? (
                            <View style={styles.successBanner}>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#059669" style={{ marginRight: 8 }} />
                                <Text style={styles.successText}>{successMessage} Redirecting to login...</Text>
                            </View>
                        ) : null}

                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="mail-outline" size={20} color="#6f7f79" style={styles.inputIcon} />
                                <TextInput
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    placeholder="your.email@example.com"
                                    placeholderTextColor="#a3b5bc"
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        {/* New Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="lock-closed-outline" size={20} color="#6f7f79" style={styles.inputIcon} />
                                <TextInput
                                    secureTextEntry
                                    placeholder="At least 8 characters"
                                    placeholderTextColor="#a3b5bc"
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                />
                            </View>
                            {newPassword.length > 0 && (() => {
                                const hasMinLen = newPassword.length >= 8;
                                const hasUpper = /[A-Z]/.test(newPassword);
                                const hasNumber = /[0-9]/.test(newPassword);
                                const hasSpecial = /[!@#$%^&*(),.?":{}|<>\-_\\\/+=;']/.test(newPassword);
                                const score = [hasMinLen, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
                                const label = score === 4 ? 'Strong' : score >= 2 ? 'Medium' : 'Weak';
                                const color = score === 4 ? '#059669' : score >= 2 ? '#d97706' : '#dc2626';

                                return (
                                    <View style={styles.strengthBox}>
                                        <Text style={styles.strengthTitleText}>
                                            Password strength:{' '}
                                            <Text style={{ color, fontWeight: '800' }}>{label}</Text>
                                        </Text>
                                        <Text style={styles.strengthSubText}>
                                            Use at least 8 characters, one uppercase letter, one special character, and one number in your password.
                                        </Text>
                                    </View>
                                );
                            })()}
                        </View>

                        {/* Confirm New Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm New Password</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="shield-checkmark-outline" size={20} color="#6f7f79" style={styles.inputIcon} />
                                <TextInput
                                    secureTextEntry
                                    placeholder="Re-enter new password"
                                    placeholderTextColor="#a3b5bc"
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>
                        </View>

                        <Pressable
                            onPress={() => void handleReset()}
                            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, loading && { opacity: 0.7 }]}
                            disabled={loading || !!successMessage}
                        >
                            {loading ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Update Password</Text>
                            )}
                        </Pressable>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Remembered your password? </Text>
                            <Pressable onPress={() => router.push('/login')}>
                                <Text style={styles.linkText}>Back to Sign In</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6fafb',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backBtn: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#e6f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#002b40',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6f7f79',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#e8f2f4',
        shadowColor: '#002b40',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fecaca',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
    },
    errorText: {
        color: '#dc2626',
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    successBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ecfdf5',
        borderWidth: 1,
        borderColor: '#a7f3d0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 16,
    },
    successText: {
        color: '#047857',
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6f7f79',
        letterSpacing: 0.5,
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#e8f2f4',
        borderRadius: 14,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 14,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 14,
        color: '#002b40',
    },
    primaryButton: {
        backgroundColor: '#008080',
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#008080',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '800',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#6f7f79',
        fontSize: 14,
    },
    linkText: {
        color: '#008080',
        fontWeight: '700',
        fontSize: 14,
    },
    strengthBox: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 8,
    },
    strengthTitleText: {
        fontSize: 13,
        color: '#334155',
        fontWeight: '600',
        marginBottom: 4,
    },
    strengthSubText: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 18,
    },
});
