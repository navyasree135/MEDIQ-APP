import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';
import { bookAppointment, fetchPatientMe } from '@/lib/api';

export default function PaymentScreen() {
    const { token } = useAuth();
    const params = useLocalSearchParams();
    const doctorName = (params.doctorName as string) || 'Dr. Marcus Thorne';
    const doctorId = (params.doctorId as string) || '';
    const dateStr = (params.date as string) || 'Oct 24, 2023';
    const timeStr = (params.time as string) || '10:30 AM';
    const amount = (params.amount as string) || '2450';

    const [activeTab, setActiveTab] = useState<'upi' | 'others'>('upi');
    const [upiId, setUpiId] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [selectedQuickPay, setSelectedQuickPay] = useState<'gpay' | 'phonepe' | 'paytm' | null>(null);
    const [paying, setPaying] = useState(false);

    const handleVerify = () => {
        if (!upiId.trim()) return;
        setVerifying(true);
        setTimeout(() => {
            setVerifying(false);
            setIsVerified(true);
        }, 1200);
    };

    const handlePayNow = async () => {
        if (activeTab === 'upi' && !isVerified && !selectedQuickPay) {
            Alert.alert('Payment Selection Required', 'Please enter and verify a UPI ID or select one of the Quick Pay apps to proceed.');
            return;
        }

        if (!token) {
            Alert.alert('Error', 'You must be logged in to book an appointment.');
            return;
        }

        if (!doctorId) {
            Alert.alert('Error', 'Doctor information is missing. Please go back and try again.');
            return;
        }

        setPaying(true);
        try {
            // Fetch patient profile to get patient_id
            const patient = await fetchPatientMe(token);

            // Build a proper datetime from the date and time strings
            let scheduledAt: string;
            try {
                const parsedDate = new Date(`${dateStr || ''} ${timeStr || ''}`.trim());
                if (isNaN(parsedDate.getTime())) {
                    scheduledAt = new Date().toISOString();
                } else {
                    scheduledAt = parsedDate.toISOString();
                }
            } catch {
                scheduledAt = new Date().toISOString();
            }

            // Actually book the appointment via API
            await bookAppointment(token, {
                patient_id: patient.id,
                doctor_id: Number(doctorId),
                scheduled_at: scheduledAt,
                notes: `Payment via ${selectedQuickPay || 'UPI'}: ${upiId}`,
            });

            router.push({
                pathname: '/booking-confirmed',
                params: {
                    doctorName,
                    date: dateStr,
                    time: timeStr,
                }
            });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
            Alert.alert('Booking Failed', message);
        } finally {
            setPaying(false);
        }
    };

    const formattedAmount = Number(amount).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Payment</Text>
                    <Pressable style={styles.headerBtn}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#ffffff" />
                    </Pressable>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Amount Block */}
                    <View style={styles.amountContainer}>
                        <Text style={styles.amountLabel}>Total Amount</Text>
                        <Text style={styles.amountValue}>{formattedAmount}</Text>

                        {/* Consultation tag */}
                        <View style={styles.tagPill}>
                            <Ionicons name="checkmark-circle" size={14} color="#008080" />
                            <Text style={styles.tagText}>Consultation Fee + Labs</Text>
                        </View>
                    </View>

                    {/* Method Tabs */}
                    <View style={styles.tabContainer}>
                        <Pressable
                            style={[styles.tab, activeTab === 'upi' && styles.tabActive]}
                            onPress={() => setActiveTab('upi')}
                        >
                            <Text style={[styles.tabText, activeTab === 'upi' && styles.tabTextActive]}>UPI</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.tab, activeTab === 'others' && styles.tabActive]}
                            onPress={() => setActiveTab('others')}
                        >
                            <Text style={[styles.tabText, activeTab === 'others' && styles.tabTextActive]}>Others</Text>
                        </Pressable>
                    </View>

                    {activeTab === 'upi' ? (
                        <View style={styles.upiSection}>
                            {/* UPI Input */}
                            <Text style={styles.inputLabel}>Enter UPI ID</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    placeholder="example@upi"
                                    placeholderTextColor="#a3b5bc"
                                    style={styles.textInput}
                                    value={upiId}
                                    onChangeText={(val) => {
                                        setUpiId(val);
                                        setIsVerified(false);
                                    }}
                                    autoCapitalize="none"
                                />
                                <Pressable
                                    disabled={verifying || !upiId.trim()}
                                    onPress={handleVerify}
                                    style={styles.verifyBtn}
                                >
                                    {verifying ? (
                                        <ActivityIndicator size="small" color="#008080" />
                                    ) : (
                                        <Text style={[styles.verifyText, isVerified && { color: '#4caf50' }]}>
                                            {isVerified ? 'Verified ✓' : 'Verify'}
                                        </Text>
                                    )}
                                </Pressable>
                            </View>

                            {/* Quick Pay */}
                            <Text style={styles.quickPayLabel}>QUICK PAY</Text>
                            <View style={styles.quickPayGrid}>
                                {/* GPay */}
                                <Pressable
                                    style={[
                                        styles.quickCard,
                                        selectedQuickPay === 'gpay' && styles.quickCardSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedQuickPay('gpay');
                                        setIsVerified(false);
                                        setUpiId('gpay@okaxis');
                                        setIsVerified(true);
                                    }}
                                >
                                    <View style={styles.quickIconCircle}>
                                        <Ionicons name="logo-google" size={22} color="#4285F4" />
                                    </View>
                                    <Text style={styles.quickText}>GPay</Text>
                                </Pressable>

                                {/* PhonePe */}
                                <Pressable
                                    style={[
                                        styles.quickCard,
                                        selectedQuickPay === 'phonepe' && styles.quickCardSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedQuickPay('phonepe');
                                        setIsVerified(false);
                                        setUpiId('phonepe@ybl');
                                        setIsVerified(true);
                                    }}
                                >
                                    <View style={styles.quickIconCircle}>
                                        <Ionicons name="arrow-forward-circle" size={24} color="#5f259f" />
                                    </View>
                                    <Text style={styles.quickText}>PhonePe</Text>
                                </Pressable>

                                {/* Paytm */}
                                <Pressable
                                    style={[
                                        styles.quickCard,
                                        selectedQuickPay === 'paytm' && styles.quickCardSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedQuickPay('paytm');
                                        setIsVerified(false);
                                        setUpiId('paytm@paytm');
                                        setIsVerified(true);
                                    }}
                                >
                                    <View style={styles.quickIconCircle}>
                                        <Ionicons name="qr-code-outline" size={22} color="#00b9f5" />
                                    </View>
                                    <Text style={styles.quickText}>Paytm</Text>
                                </Pressable>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.othersSection}>
                            <Text style={styles.comingSoonText}>Net Banking and Cards are disabled for quick testing. Please use UPI payment options for booking.</Text>
                        </View>
                    )}

                    {/* Security Badge */}
                    <View style={styles.secureBadge}>
                        <Ionicons name="lock-closed" size={16} color="#008080" />
                        <Text style={styles.secureText}>Secured Payment</Text>
                    </View>

                    {/* Premium Security Illustration Card */}
                    <View style={styles.illustrationCard}>
                        <Ionicons name="shield-checkmark" size={48} color="#e3f3f5" />
                        <View style={styles.illustrationTextContainer}>
                            <Text style={styles.illTitle}>End-to-End Encryption</Text>
                            <Text style={styles.illDesc}>Your payment details are secure with industry-standard AES encryption protocols.</Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Pay Button */}
                <View style={styles.bottomBar}>
                    <Pressable
                        style={[styles.payBtn, paying && styles.payBtnDisabled]}
                        onPress={handlePayNow}
                        disabled={paying}
                    >
                        {paying ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <>
                                <Text style={styles.payText}>Pay Now</Text>
                                <Ionicons name="arrow-forward" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 18,
        backgroundColor: '#001a2c',
    },
    headerBtn: {
        padding: 5,
        marginTop: 33,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 30,
        marginRight:160
    },
    scrollContent: {
        paddingBottom: 110,
        paddingHorizontal: 20,
        paddingTop: 25,
    },
    amountContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    amountLabel: {
        fontSize: 14,
        color: '#6f7f79',
        fontWeight: '600',
    },
    amountValue: {
        fontSize: 36,
        fontWeight: '800',
        color: '#002b40',
        marginTop: 6,
    },
    tagPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#e3f3f5',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginTop: 10,
    },
    tagText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#008080',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 24,
        padding: 4,
        marginTop: 25,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    tabActive: {
        backgroundColor: '#008080',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#6f7f79',
    },
    tabTextActive: {
        color: '#ffffff',
    },
    upiSection: {
        marginTop: 25,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#002b40',
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6fafb',
        borderWidth: 1.5,
        borderColor: '#e8f2f4',
        borderRadius: 14,
        paddingHorizontal: 15,
        height: 52,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: '#002b40',
        fontWeight: '600',
    },
    verifyBtn: {
        paddingHorizontal: 10,
        justifyContent: 'center',
    },
    verifyText: {
        color: '#008080',
        fontWeight: '700',
        fontSize: 14,
    },
    quickPayLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#6f7f79',
        letterSpacing: 0.5,
        marginTop: 25,
        marginBottom: 15,
    },
    quickPayGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    quickCard: {
        flex: 1,
        backgroundColor: '#f6fafb',
        borderWidth: 1.5,
        borderColor: '#e8f2f4',
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickCardSelected: {
        borderColor: '#008080',
        backgroundColor: '#e3f3f5',
    },
    quickIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    quickText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#002b40',
        marginTop: 8,
    },
    othersSection: {
        marginTop: 30,
        backgroundColor: '#f6fafb',
        borderRadius: 14,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    comingSoonText: {
        fontSize: 13,
        color: '#6f7f79',
        lineHeight: 18,
        textAlign: 'center',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        marginTop: 30,
    },
    secureText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#008080',
    },
    illustrationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6fafb',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e8f2f4',
        padding: 16,
        marginTop: 20,
        gap: 15,
    },
    illustrationTextContainer: {
        flex: 1,
    },
    illTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#002b40',
    },
    illDesc: {
        fontSize: 11,
        color: '#6f7f79',
        lineHeight: 16,
        marginTop: 3,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f5f4',
        paddingBottom: Platform.OS === 'ios' ? 25 : 20,
    },
    payBtn: {
        backgroundColor: '#008080',
        height: 52,
        borderRadius: 26,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    payBtnDisabled: {
        opacity: 0.8,
    },
    payText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16,
    },
});
