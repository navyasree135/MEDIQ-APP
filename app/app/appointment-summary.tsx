import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, Image, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';
import { bookAppointment, fetchPatientMe } from '@/lib/api';

export default function AppointmentSummaryScreen() {
    const { token } = useAuth();
    const params = useLocalSearchParams();
    const doctorName = (params.doctorName as string) || 'Dr. Julian Thorne';
    const doctorId = (params.doctorId as string) || '';
    const dateStr = (params.date as string) || 'Oct 24, 2023';
    const timeStr = (params.time as string) || '10:30 AM';
    const hospital = (params.hospital as string) || '';
    const clinicAddress = (params.clinicAddress as string) || '';
    const [submitting, setSubmitting] = useState(false);

    const consultationFee = 2400;

    const handleConfirmAppointment = async () => {
        if (!token) {
            Alert.alert('Error', 'You must be logged in to book an appointment.');
            return;
        }

        setSubmitting(true);
        try {
            const patient = await fetchPatientMe(token);

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

            const docIdNum = Number(doctorId) || 1;

            await bookAppointment(token, {
                patient_id: patient.id,
                doctor_id: docIdNum,
                scheduled_at: scheduledAt,
                notes: 'Pay at hospital consultation',
            });

            router.push({
                pathname: '/booking-confirmed',
                params: {
                    doctorName,
                    doctorId: String(docIdNum),
                    hospital: hospital || clinicAddress,
                    clinicAddress,
                    date: dateStr,
                    time: timeStr,
                    amount: consultationFee.toString(),
                }
            });
        } catch (err: unknown) {
            console.error('Booking error:', err);
            const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
            Alert.alert('Booking Failed', message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>Appointment Summary</Text>
                <Pressable style={styles.headerBtn}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#ffffff" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Main Card */}
                <View style={styles.mainCard}>
                    {/* Doctor Info Row */}
                    <View style={styles.doctorRow}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200' }}
                            style={styles.doctorImage}
                        />
                        <View style={styles.doctorInfo}>
                            <Text style={styles.doctorName}>{doctorName}</Text>
                            <Text style={styles.doctorSpecialty}>Senior Cardiologist</Text>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={16} color="#ffa500" />
                                <Text style={styles.ratingText}>4.9 (120+ Reviews)</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Hospital Info Row */}
                    <View style={styles.infoRow}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="business" size={20} color="#008080" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoTitle}>{hospital || clinicAddress || 'Hospital'}</Text>
                        </View>
                    </View>


                    {/* Token Container */}
                    <View style={styles.tokenCard}>
                        <Text style={styles.tokenLabel}>YOUR TOKEN NUMBER</Text>
                        <Text style={styles.tokenValue}>A-42</Text>
                    </View>

                    {/* Fee Row */}
                    <View style={styles.feeRow}>
                        <Text style={styles.feeLabel}>Consultation Fee</Text>
                        <Text style={styles.feeValue}>₹{consultationFee.toLocaleString('en-IN')}.00</Text>
                    </View>
                </View>

                {/* Payment Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Payment Details</Text>
                    <View style={styles.paymentInfoCard}>
                        <View style={styles.paymentIconRow}>
                            <View style={styles.paymentIconCircle}>
                                <Ionicons name="cash-outline" size={26} color="#008080" />
                            </View>
                            <View style={styles.paymentTextBlock}>
                                <Text style={styles.paymentInfoTitle}>Pay at Hospital</Text>
                                <Text style={styles.paymentInfoDesc}>
                                    No advance payment required. Please complete your payment directly at the hospital reception after your consultation.
                                </Text>
                            </View>
                        </View>
                        <View style={styles.paymentNotice}>
                            <Ionicons name="information-circle-outline" size={16} color="#008080" style={{ marginRight: 6, marginTop: 1 }} />
                            <Text style={styles.paymentNoticeText}>
                                Accepted: Cash, Card, UPI — at the hospital counter.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Consultation Fee Summary */}
                <View style={styles.billCard}>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Consultation Fee</Text>
                        <Text style={styles.billValue}>₹{consultationFee.toLocaleString('en-IN')}.00</Text>
                    </View>
                    <View style={[styles.billRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: '#e8f2f4', paddingTop: 10 }]}>
                        <Text style={styles.totalLabel}>Amount to Pay at Hospital</Text>
                        <Text style={styles.totalValue}>₹{consultationFee.toLocaleString('en-IN')}.00</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Confirm Bar */}
            <View style={styles.bottomBar}>
                <Pressable
                    style={[styles.confirmBtn, submitting && { opacity: 0.7 }]}
                    onPress={() => void handleConfirmAppointment()}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <>
                            <Text style={styles.confirmText}>Confirm Appointment</Text>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
                        </>
                    )}
                </Pressable>
            </View>
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
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
        marginTop:30,
        marginRight:80
    },
    scrollContent: {
        paddingBottom: 110,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    mainCard: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    doctorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    doctorImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#e8f2f4',
    },
    doctorInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002b40',
    },
    doctorSpecialty: {
        fontSize: 14,
        color: '#6f7f79',
        marginTop: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 6,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#002b40',
    },
    divider: {
        height: 1,
        backgroundColor: '#e8f2f4',
        marginVertical: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e3f3f5',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#002b40',
    },
    infoSubtitle: {
        fontSize: 12,
        color: '#6f7f79',
        lineHeight: 18,
        marginTop: 3,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 12,
        padding: 12,
    },
    dateTimeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateTimeText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#002b40',
    },
    tokenCard: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 15,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    tokenLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#a3b5bc',
        letterSpacing: 1,
    },
    tokenValue: {
        fontSize: 32,
        fontWeight: '800',
        color: '#008080',
        marginTop: 5,
    },
    feeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    feeLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#002b40',
    },
    feeValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#008080',
    },
    section: {
        marginTop: 25,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: '#002b40',
        marginBottom: 15,
    },
    paymentInfoCard: {
        backgroundColor: '#f0fafa',
        borderWidth: 1.5,
        borderColor: '#b2dede',
        borderRadius: 16,
        padding: 18,
        gap: 14,
    },
    paymentIconRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
    },
    paymentIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e3f3f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentTextBlock: {
        flex: 1,
    },
    paymentInfoTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#002b40',
        marginBottom: 4,
    },
    paymentInfoDesc: {
        fontSize: 13,
        color: '#4a6670',
        lineHeight: 19,
    },
    paymentNotice: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#e3f3f5',
        borderRadius: 10,
        padding: 10,
    },
    paymentNoticeText: {
        flex: 1,
        fontSize: 12,
        color: '#006060',
        fontWeight: '600',
        lineHeight: 17,
    },
    billCard: {
        backgroundColor: '#f6fafb',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e8f2f4',
        padding: 15,
        marginTop: 25,
        gap: 8,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    billLabel: {
        fontSize: 13,
        color: '#6f7f79',
        fontWeight: '500',
    },
    billValue: {
        fontSize: 14,
        color: '#002b40',
        fontWeight: '600',
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#002b40',
    },
    totalValue: {
        fontSize: 15,
        fontWeight: '800',
        color: '#008080',
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
    confirmBtn: {
        backgroundColor: '#008080',
        height: 52,
        borderRadius: 26,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16,
    },
});
