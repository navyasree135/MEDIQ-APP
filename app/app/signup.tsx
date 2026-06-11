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
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ApiError } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import type { SignUpPayload } from '@/lib/types';

export default function SignupScreen() {
    const { user, loading, authenticating, signUp, signIn } = useAuth();
    const [signingUp, setSigningUp] = useState(false);

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'patient' | 'doctor'>('patient');
    const [specialty, setSpecialty] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (loading) {
        return (
            <SafeAreaView style={styles.loaderWrap}>
                <ActivityIndicator size="large" color="#1d6d5b" />
            </SafeAreaView>
        );
    }

    if (user && !signingUp) {
        return <Redirect href="/(tabs)" />;
    }

    const onSubmit = async () => {
        if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        if (role === 'doctor' && !specialty.trim()) {
            setError('Please enter your medical specialty.');
            return;
        }

        setError(null);
        setSigningUp(true);
        try {
            await signUp({
                full_name: fullName.trim(),
                email: email.trim(),
                password: password.trim(),
                role: role,
                specialty: role === 'doctor' ? specialty.trim() : undefined,
            });
            
            // Auto login after signup
            await signIn(email.trim(), password.trim());
            if (role === 'doctor') {
                router.replace('/(tabs)');
            } else {
                router.replace('/continue-profile');
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError('Unable to create account. Please try again.');
            }
        } finally {
            setSigningUp(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </Pressable>
                <Text style={styles.headerTitle}>Create Account</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800' }} 
                        style={styles.heroImage} 
                        resizeMode="cover" 
                    />

                    <View style={styles.textContainer}>
                        <Text style={styles.title}>Join MediQ</Text>
                        <Text style={styles.subtitle}>Sign up to start your personalized health journey.</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Register As</Text>
                        <View style={styles.roleRow}>
                            <Pressable
                                style={[styles.roleTab, role === 'patient' && styles.roleTabActive]}
                                onPress={() => setRole('patient')}
                            >
                                <Text style={[styles.roleTabText, role === 'patient' && styles.roleTabTextActive]}>Patient</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.roleTab, role === 'doctor' && styles.roleTabActive]}
                                onPress={() => setRole('doctor')}
                            >
                                <Text style={[styles.roleTabText, role === 'doctor' && styles.roleTabTextActive]}>Doctor</Text>
                            </Pressable>
                        </View>

                        {role === 'doctor' && (
                            <>
                                <Text style={styles.label}>Medical Specialty</Text>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="medical-outline" size={20} color="#6f7f79" style={styles.inputIcon} />
                                    <TextInput
                                        placeholder="E.g. Cardiologist, Pediatrician..."
                                        placeholderTextColor="#999"
                                        style={styles.input}
                                        value={specialty}
                                        onChangeText={setSpecialty}
                                    />
                                </View>
                            </>
                        )}

                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#6f7f79" style={styles.inputIcon} />
                            <TextInput
                                placeholder="Enter your full name"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color="#6f7f79" style={styles.inputIcon} />
                            <TextInput
                                placeholder="+1 (555) 000-0000"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>

                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputContainer}>
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

                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="lock-closed-outline" size={20} color="#6f7f79" style={styles.inputIcon} />
                            <TextInput
                                secureTextEntry
                                placeholder="Enter a secure password"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Pressable
                            onPress={onSubmit}
                            disabled={signingUp || authenticating}
                            style={({ pressed }) => [
                                styles.primaryButton,
                                (pressed || signingUp || authenticating) && styles.buttonPressed,
                            ]}
                        >
                            {signingUp || authenticating ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <>
                                    <Text style={styles.primaryButtonText}>Sign Up</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                                </>
                            )}
                        </Pressable>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Pressable onPress={() => router.push('/login')}>
                                <Text style={styles.linkText}>Login</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002b40',
    },
    loaderWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexGrow: 1,
    },
    heroImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#f0f0f0',
    },
    textContainer: {
        padding: 25,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#002b40',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6f7f79',
        textAlign: 'center',
        lineHeight: 22,
    },
    form: {
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    label: {
        fontSize: 14,
        color: '#002b40',
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 12,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#002b40',
    },
    errorText: {
        color: '#ff4d4d',
        fontSize: 14,
        marginTop: 10,
    },
    primaryButton: {
        backgroundColor: '#008080',
        borderRadius: 15,
        height: 55,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
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
    roleRow: {
        flexDirection: 'row',
        backgroundColor: '#f6fafb',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e8f2f4',
        padding: 4,
        marginBottom: 10,
    },
    roleTab: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleTabActive: {
        backgroundColor: '#008080',
    },
    roleTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6f7f79',
    },
    roleTabTextActive: {
        color: '#fff',
        fontWeight: '700',
    },
});

