import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Pressable,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';

export default function VerifyPhoneScreen() {
    const { signIn } = useAuth();
    const params = useLocalSearchParams();
    const email = useMemo(
        () => (typeof params.email === 'string' ? params.email : ''),
        [params.email],
    );
    const password = useMemo(
        () => (typeof params.password === 'string' ? params.password : ''),
        [params.password],
    );
    const [otp, setOtp] = useState(['', '', '', '']);
    const [error, setError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value.replace(/[^0-9]/g, '');
        setOtp(newOtp);
        setError(null);
    };

    const onVerify = async () => {
        const code = otp.join('');
        if (code.length !== 4) {
            setError('Please enter the 4-digit code.');
            return;
        }

        if (!email || !password) {
            setError('Unable to sign in. Please go back and try again.');
            return;
        }

        setVerifying(true);
        setError(null);

        try {
            await signIn(email, password);
            router.replace('/continue-profile');
        } catch (err) {
            setError('Failed to verify OTP. Please try signing in again.');
        } finally {
            setVerifying(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </Pressable>
                <Text style={styles.headerTitle}>Verify Phone</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="phone-portrait-outline" size={40} color="#008080" />
                        </View>
                    </View>

                    <Text style={styles.title}>Enter the 4-digit OTP</Text>
                    <Text style={styles.subtitle}>Sent to +91 XXXXXX</Text>

                    <View style={styles.otpContainer}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                style={styles.otpInput}
                                maxLength={1}
                                keyboardType="number-pad"
                                value={digit}
                                onChangeText={(value) => handleOtpChange(value, index)}
                            />
                        ))}
                    </View>

                    <Pressable 
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                        onPress={onVerify}
                        disabled={verifying}
                    >
                        {verifying ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.primaryButtonText}>Verify</Text>
                        )}
                    </Pressable>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <Text style={styles.resendText}>Resend OTP in <Text style={styles.timer}>00:45</Text></Text>

                    <View style={styles.securityInfo}>
                        <Ionicons name="shield-checkmark-outline" size={16} color="#6f7f79" />
                        <Text style={styles.securityText}>
                            Your security is our priority. MediQ uses 256-bit encryption to ensure your personal health data remains private and protected.
                        </Text>
                    </View>
                </View>
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
        flex: 1,
        paddingHorizontal: 25,
        alignItems: 'center',
        paddingTop: 40,
    },
    iconContainer: {
        marginBottom: 30,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f0f8f8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#002b40',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6f7f79',
        marginBottom: 30,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 40,
    },
    otpInput: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 12,
        backgroundColor: '#f6fafb',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '700',
        color: '#002b40',
    },
    primaryButton: {
        backgroundColor: '#008080',
        borderRadius: 15,
        height: 55,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    resendText: {
        fontSize: 14,
        color: '#6f7f79',
    },
    errorText: {
        color: '#d32f2f',
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 14,
    },
    timer: {
        color: '#008080',
        fontWeight: '700',
    },
    securityInfo: {
        flexDirection: 'row',
        marginTop: 'auto',
        marginBottom: 30,
        paddingHorizontal: 10,
        gap: 10,
    },
    securityText: {
        flex: 1,
        fontSize: 12,
        color: '#6f7f79',
        lineHeight: 18,
    },
});
