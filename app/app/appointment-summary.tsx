import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function AppointmentSummaryScreen() {
    const params = useLocalSearchParams();
    const doctorName = (params.doctorName as string) || 'Dr. Marcus Thorne';
    const doctorId = (params.doctorId as string) || '';
    const dateStr = (params.date as string) || 'Oct 24, 2023';
    const timeStr = (params.time as string) || '10:30 AM';

    const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');

    const consultationFee = 2400;
    const serviceFee = 50;
    const totalPayable = consultationFee + serviceFee;

    const handleConfirmAndPay = () => {
        router.push({
            pathname: '/payment',
            params: {
                doctorName,
                doctorId,
                date: dateStr,
                time: timeStr,
                amount: totalPayable.toString(),
            }
        });
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
                            <Text style={styles.infoTitle}>Metropol Medical Center</Text>
                            <Text style={styles.infoSubtitle}>4522 Innovation Parkway, Floor 4, Suite 200, North District</Text>
                        </View>
                    </View>

                    {/* Date/Time Row */}
                    <View style={styles.dateTimeContainer}>
                        <View style={styles.dateTimeItem}>
                            <Ionicons name="calendar-outline" size={18} color="#008080" />
                            <Text style={styles.dateTimeText}>{dateStr}</Text>
                        </View>
                        <View style={styles.dateTimeItem}>
                            <Ionicons name="time-outline" size={18} color="#008080" />
                            <Text style={styles.dateTimeText}>{timeStr}</Text>
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

                {/* Payment Method Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Payment Method</Text>
                    <View style={styles.methodGrid}>
                        {/* Credit Card Card */}
                        <Pressable
                            style={[
                                styles.methodCard,
                                paymentMethod === 'card' && styles.methodCardSelected,
                            ]}
                            onPress={() => setPaymentMethod('card')}
                        >
                            <View style={styles.methodIconCircle}>
                                <Ionicons name="card" size={24} color="#008080" />
                            </View>
                            <Text style={styles.methodName}>Credit Card</Text>
                            <View style={[styles.radioOuter, paymentMethod === 'card' && styles.radioOuterSelected]}>
                                {paymentMethod === 'card' && <Ionicons name="checkmark-circle" size={18} color="#008080" />}
                            </View>
                        </Pressable>

                        {/* UPI Card */}
                        <Pressable
                            style={[
                                styles.methodCard,
                                paymentMethod === 'upi' && styles.methodCardSelected,
                            ]}
                            onPress={() => setPaymentMethod('upi')}
                        >
                            <View style={styles.methodIconCircle}>
                                <Ionicons name="wallet" size={24} color="#008080" />
                            </View>
                            <Text style={styles.methodName}>UPI / Wallet</Text>
                            <View style={[styles.radioOuter, paymentMethod === 'upi' && styles.radioOuterSelected]}>
                                {paymentMethod === 'upi' && <Ionicons name="checkmark-circle" size={18} color="#008080" />}
                            </View>
                        </Pressable>
                    </View>
                </View>

                {/* Subtotal details card */}
                <View style={styles.billCard}>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Subtotal</Text>
                        <Text style={styles.billValue}>₹{consultationFee.toLocaleString('en-IN')}.00</Text>
                    </View>
                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Service Fee</Text>
                        <Text style={styles.billValue}>₹{serviceFee.toLocaleString('en-IN')}.00</Text>
                    </View>
                    <View style={[styles.billRow, { marginTop: 10, borderTopWidth: 1, borderTopColor: '#e8f2f4', paddingTop: 10 }]}>
                        <Text style={styles.totalLabel}>Total Payable</Text>
                        <Text style={styles.totalValue}>₹{totalPayable.toLocaleString('en-IN')}.00</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Confirm Bar */}
            <View style={styles.bottomBar}>
                <Pressable style={styles.confirmBtn} onPress={handleConfirmAndPay}>
                    <Text style={styles.confirmText}>Confirm & Pay</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
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
    methodGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    methodCard: {
        flex: 1,
        backgroundColor: '#f6fafb',
        borderWidth: 1.5,
        borderColor: '#e8f2f4',
        borderRadius: 16,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    methodCardSelected: {
        borderColor: '#008080',
        backgroundColor: '#e3f3f5',
    },
    methodIconCircle: {
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
    },
    methodName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#002b40',
        marginTop: 10,
    },
    radioOuter: {
        marginTop: 10,
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: '#a3b5bc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: '#008080',
        borderWidth: 0,
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
        fontSize: 15,
        fontWeight: '700',
        color: '#002b40',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#002b40',
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
