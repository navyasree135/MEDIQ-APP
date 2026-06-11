import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';
import { fetchAppointments, updateAppointmentStatus } from '@/lib/api';
import type { Appointment } from '@/lib/types';

export default function MyAppointmentsScreen() {
    const { token } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

    const loadAppointments = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const list = await fetchAppointments(token);
            setAppointments(list);
        } catch (err) {
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            void loadAppointments();
        }, [loadAppointments])
    );

    const handleCancelAppointment = (id: number) => {
        Alert.alert(
            'Cancel Appointment',
            'Are you sure you want to cancel this appointment?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (!token) return;
                            await updateAppointmentStatus(token, id, 'cancelled');
                            Alert.alert('Success', 'Appointment has been cancelled successfully.');
                            void loadAppointments();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to cancel appointment.');
                        }
                    }
                }
            ]
        );
    };

    const handleViewDetails = (item: Appointment) => {
        const dateObj = new Date(item.scheduled_at);
        const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        router.push({
            pathname: '/appointment-details',
            params: {
                doctorName: item.doctor_name || 'Medical Specialist',
                specialty: item.specialty || 'General Practitioner',
                hospital: item.location || 'MediQ Healthcare Wing',
                date: dateStr,
                time: timeStr,
                tokenNumber: `#0${item.id}`,
                urgencyLevel: 'routine',
                instructions: JSON.stringify([
                    'Please arrive 10 minutes prior to your scheduled slot.',
                    'Bring your national ID card and insurance details.'
                ]),
                imageUrl: '',
            }
        });
    };

    const getFilteredAppointments = () => {
        return appointments.filter((appt) => {
            const status = appt.status.toLowerCase();
            if (selectedTab === 'upcoming') {
                return status === 'pending' || status === 'confirmed';
            }
            if (selectedTab === 'completed') {
                return status === 'completed';
            }
            if (selectedTab === 'cancelled') {
                return status === 'cancelled';
            }
            return false;
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loaderWrap}>
                    <ActivityIndicator size="large" color="#008080" />
                </View>
            </SafeAreaView>
        );
    }

    const filteredList = getFilteredAppointments();

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>My Appointments</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Segment Tabs */}
            <View style={styles.tabWrapper}>
                <View style={styles.tabContainer}>
                    <Pressable
                        style={[styles.tab, selectedTab === 'upcoming' && styles.tabActive]}
                        onPress={() => setSelectedTab('upcoming')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
                        onPress={() => setSelectedTab('completed')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>Completed</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tab, selectedTab === 'cancelled' && styles.tabActive]}
                        onPress={() => setSelectedTab('cancelled')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'cancelled' && styles.tabTextActive]}>Cancelled</Text>
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {filteredList.length > 0 ? (
                    filteredList.map((item) => {
                        const dateObj = new Date(item.scheduled_at);
                        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                        const isPending = item.status === 'pending';

                        return (
                            <View key={item.id} style={styles.appointmentCard}>
                                {/* Doctor Avatar & Title Row */}
                                <View style={styles.cardHeader}>
                                    <View style={[styles.doctorAvatar, { backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e8f2f4' }]}>
                                        <Ionicons name="person-circle-outline" size={44} color="#008080" />
                                    </View>
                                    <View style={styles.doctorInfo}>
                                        <Text style={styles.doctorName}>{item.doctor_name || 'Dr. Medical Specialist'}</Text>
                                        <Text style={styles.doctorSub}>{item.specialty || 'General Health'}</Text>
                                        <Text style={styles.clinicName}>{item.location || 'Main Medical Center'}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, item.status === 'confirmed' ? styles.badgeConfirmed : isPending ? styles.badgePending : styles.badgeDefault]}>
                                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                {/* Meta Grid (Date & Token) */}
                                <View style={styles.metaContainer}>
                                    <View style={styles.metaItem}>
                                        <Text style={styles.metaLabel}>DATE & TIME</Text>
                                        <View style={styles.metaValueRow}>
                                            <Ionicons name="calendar-outline" size={16} color="#6f7f79" />
                                            <Text style={styles.metaValue}>{dateStr}, {timeStr}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.metaItem}>
                                        <Text style={styles.metaLabel}>TOKEN NUMBER</Text>
                                        <View style={styles.metaValueRow}>
                                            <Ionicons name="ticket-outline" size={16} color="#6f7f79" />
                                            <Text style={styles.metaValue}>#0{item.id}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                {/* Action Buttons */}
                                <View style={styles.cardFooter}>
                                    {item.status !== 'cancelled' && item.status !== 'completed' && (
                                        <Pressable style={styles.cancelBtn} onPress={() => handleCancelAppointment(item.id)}>
                                            <Text style={styles.cancelBtnText}>Cancel</Text>
                                        </Pressable>
                                    )}
                                    <Pressable style={styles.detailsBtn} onPress={() => handleViewDetails(item)}>
                                        <Text style={styles.detailsBtnText}>View Details</Text>
                                    </Pressable>
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar" size={48} color="#bbd8ce" />
                        <Text style={styles.emptyText}>No appointments in this tab yet.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loaderWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        marginTop: 25,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 25,
    },
    tabWrapper: {
        paddingHorizontal: 20,
        paddingTop: 15,
        backgroundColor: '#ffffff',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 24,
        padding: 4,
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
        fontSize: 13,
        fontWeight: '700',
        color: '#6f7f79',
    },
    tabTextActive: {
        color: '#ffffff',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    appointmentCard: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    doctorAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#e8f2f4',
        marginRight: 15,
    },
    doctorInfo: {
        flex: 1,
        paddingRight: 80,
    },
    doctorName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#002b40',
    },
    doctorSub: {
        fontSize: 12,
        color: '#6f7f79',
        marginTop: 2,
    },
    clinicName: {
        fontSize: 11,
        color: '#a3b5bc',
        marginTop: 1,
        fontWeight: '500',
    },
    statusBadge: {
        position: 'absolute',
        right: 0,
        top: 0,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeConfirmed: {
        backgroundColor: '#e6fffa',
        borderWidth: 1,
        borderColor: '#319795',
    },
    badgePending: {
        backgroundColor: '#fffaf0',
        borderWidth: 1,
        borderColor: '#dd6b20',
    },
    badgeDefault: {
        backgroundColor: '#edf2f7',
        borderWidth: 1,
        borderColor: '#718096',
    },
    statusText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#002b40',
    },
    divider: {
        height: 1,
        backgroundColor: '#e8f2f4',
        marginVertical: 15,
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metaItem: {
        flex: 1,
    },
    metaLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#a3b5bc',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    metaValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    metaValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#002b40',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    cancelBtn: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#e8f2f4',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtnText: {
        color: '#dc2626',
        fontSize: 13,
        fontWeight: '700',
    },
    detailsBtn: {
        flex: 1.5,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#008080',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailsBtnText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        gap: 15,
    },
    emptyText: {
        fontSize: 14,
        color: '#6f7f79',
        fontWeight: '600',
    },
});
