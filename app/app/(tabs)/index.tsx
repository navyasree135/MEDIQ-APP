import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
    SafeAreaView,
} from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';


import { useAuth } from '@/hooks/use-auth';
import { fetchAppointments, fetchPatientMe, fetchPrescriptions, fetchLabTests } from '@/lib/api';
import type { Appointment, PatientProfile, Prescription, LabTest } from '@/lib/types';

export default function HomeScreen() {
    const { token, user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const localParams = useLocalSearchParams();



    const loadSummary = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            if (user?.role === 'doctor') {
                const aptResult = await fetchAppointments(token);
                setAppointments(aptResult);
            } else {
                const [aptResult, patientResult, rxResult, labResult] = await Promise.all([
                    fetchAppointments(token),
                    fetchPatientMe(token).catch(() => null),
                    fetchPrescriptions(token).catch(() => []),
                    fetchLabTests(token).catch(() => []),
                ]);
                setAppointments(aptResult);
                setPatientProfile(patientResult);
                setPrescriptions(rxResult);
                setLabTests(labResult);
            }
        } catch (err) {
            setError('Could not load details.');
        } finally {
            setLoading(false);
        }
    }, [token, user]);

    useFocusEffect(
        useCallback(() => {
            void loadSummary();
        }, [loadSummary]),
    );

    const isDoctor = user?.role === 'doctor';

    // Calculate doctor stats
    const todayAppointments = useMemo(() => {
        const todayStr = new Date().toDateString();
        return appointments.filter(a => new Date(a.scheduled_at).toDateString() === todayStr);
    }, [appointments]);

    const pendingApprovals = useMemo(() => {
        return appointments.filter(a => a.status === 'pending');
    }, [appointments]);

    const upcomingVisits = useMemo(() => {
        return appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
    }, [appointments]);

    if (loading) {
        return (
            <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color="#008080" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                
                {/* Greeting Section */}
                <View style={styles.greetingSection}>
                    <View style={styles.greetingTextContainer}>
                        <Text style={styles.welcomeBack}>Welcome back,</Text>
                        <Text style={styles.greetingName}>
                            {isDoctor ? `Dr. ${user?.full_name || 'Specialist'}` : `Good Morning ${user?.full_name?.split(' ')[0] || 'User'}`}
                        </Text>
                    </View>
                </View>

                {isDoctor ? (
                    // Doctor Console Dashboard
                    <>
                        <View style={styles.healthSummaryCard}>
                            <View style={styles.summaryHeader}>
                                <Text style={styles.summaryTitle}>Practice Summary</Text>
                                <Ionicons name="stats-chart" size={20} color="#008080" />
                            </View>
                            <View style={styles.summaryContent}>
                                <View>
                                    <Text style={styles.summaryLabel}>TOTAL PATIENTS</Text>
                                    <Text style={styles.bloodGroup}>{appointments.length}</Text>
                                </View>
                                <View style={{ marginLeft: 20 }}>
                                    <Text style={styles.summaryLabel}>TODAY'S SCHEDULE</Text>
                                    <Text style={styles.lastVisit}>{todayAppointments.length} Booked</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.metricsGrid}>
                            <Pressable style={styles.metricCard} onPress={() => router.push('/(tabs)/appointments')}>
                                <View style={styles.metricIconCircle}>
                                    <Ionicons name="calendar-outline" size={24} color="#008080" />
                                </View>
                                <Text style={styles.metricTitle}>Active Schedule</Text>
                                <Text style={styles.metricSubtitle}>
                                    {appointments.filter(a => a.status === 'confirmed').length} CONFIRMED
                                </Text>
                            </Pressable>
                            <Pressable style={styles.metricCard} onPress={() => router.push('/(tabs)/appointments')}>
                                <View style={[styles.metricIconCircle, { backgroundColor: '#fffaf0' }]}>
                                    <Ionicons name="alert-circle-outline" size={24} color="#dd6b20" />
                                </View>
                                <Text style={styles.metricTitle}>Pending Approvals</Text>
                                <Text style={styles.metricSubtitle}>{pendingApprovals.length} REQUESTS</Text>
                            </Pressable>
                        </View>

                        <View style={styles.reportsSection}>
                            <View style={styles.reportsHeader}>
                                <Text style={styles.sectionTitle}>Next Patient Visits</Text>
                                <Pressable onPress={() => router.push('/(tabs)/appointments')}>
                                    <Text style={styles.viewAll}>VIEW ALL</Text>
                                </Pressable>
                            </View>

                            {upcomingVisits.length > 0 ? (
                                upcomingVisits.slice(0, 5).map((visit) => {
                                    let dateDisplay = 'Scheduled Visit';
                                    try {
                                        let explicitTime = '';
                                        if (visit.notes && visit.notes.includes('Slot: ')) {
                                            const match = visit.notes.match(/Slot:\s*([0-9]{1,2}:[0-9]{2}\s*(?:AM|PM))/i);
                                            if (match) explicitTime = match[1];
                                        }

                                        const rawStr = String(visit.scheduled_at).replace('Z', '');
                                        const dateObj = new Date(rawStr);
                                        if (!isNaN(dateObj.getTime())) {
                                            const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                            const timeStr = explicitTime || dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                                            dateDisplay = `${dateStr} at ${timeStr}`;
                                        } else {
                                            dateDisplay = visit.scheduled_at;
                                        }
                                    } catch {
                                        dateDisplay = visit.scheduled_at || 'Scheduled Visit';
                                    }

                                    return (
                                        <Pressable 
                                            key={visit.id} 
                                            style={[styles.reportItem, { marginBottom: 10 }]} 
                                            onPress={() => router.push('/(tabs)/appointments')}
                                        >
                                            <View style={styles.reportIconCircle}>
                                                <Ionicons name="person-outline" size={20} color="#008080" />
                                            </View>
                                            <View style={styles.reportInfo}>
                                                <Text style={styles.reportTitle}>{visit.patient_name || 'Patient File'}</Text>
                                                <Text style={styles.reportDate}>
                                                    {dateDisplay} • Status: {visit.status.toUpperCase()}
                                                </Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color="#6f7f79" />
                                        </Pressable>
                                    );
                                })
                            ) : (
                                <View style={styles.emptyCard}>
                                    <Text style={styles.emptyCardText}>No upcoming consultations booked.</Text>
                                </View>
                            )}
                        </View>
                    </>
                ) : (
                    // Patient Dashboard
                    <>
                        <View style={styles.healthSummaryCard}>
                            <View style={styles.summaryHeader}>
                                <Text style={styles.summaryTitle}>Health Summary</Text>
                                <Ionicons name="stats-chart" size={20} color="#008080" />
                            </View>
                            <View style={styles.summaryContent}>
                                <View>
                                    <Text style={styles.summaryLabel}>BLOOD GROUP</Text>
                                    <Text style={styles.bloodGroup}>{patientProfile?.blood_group || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.metricsGrid}>
                            <Pressable style={styles.metricCard} onPress={() => router.push('/my-appointments')}>
                                <View style={styles.metricIconCircle}>
                                    <Ionicons name="calendar-outline" size={22} color="#008080" />
                                </View>
                                <Text style={styles.metricTitle}>My Appointments</Text>
                                <Text style={styles.metricSubtitle}>{appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length} UPCOMING</Text>
                            </Pressable>
                            <Pressable style={styles.metricCard} onPress={() => router.push('/prescriptions-list')}>
                                <View style={[styles.metricIconCircle, { backgroundColor: '#eefaf6' }]}>
                                    <Ionicons name="medical-outline" size={22} color="#008080" />
                                </View>
                                <Text style={styles.metricTitle}>My Prescriptions</Text>
                                <Text style={styles.metricSubtitle}>{prescriptions.length} ACTIVE</Text>
                            </Pressable>
                            <Pressable style={styles.metricCard} onPress={() => router.push('/report-explainer')}>
                                <View style={[styles.metricIconCircle, { backgroundColor: '#e6f7f7' }]}>
                                    <Ionicons name="cloud-upload-outline" size={22} color="#008080" />
                                </View>
                                <Text style={styles.metricTitle}>Upload Rx</Text>
                                <Text style={styles.metricSubtitle}>AI EXPLAIN</Text>
                            </Pressable>
                        </View>

                        <View style={styles.reportsSection}>
                            <View style={styles.reportsHeader}>
                                <Text style={styles.sectionTitle}>Recent Reports</Text>
                                <Pressable onPress={() => router.push('/lab-tests')}>
                                    <Text style={styles.viewAll}>VIEW ALL</Text>
                                </Pressable>
                            </View>

                            {labTests.length > 0 ? (
                                labTests.slice(0, 2).map((test) => (
                                    <Pressable key={test.id} style={[styles.reportItem, { marginBottom: 10 }]} onPress={() => router.push('/lab-tests')}>
                                        <View style={styles.reportIconCircle}>
                                            <Ionicons name="document-text-outline" size={20} color="#008080" />
                                        </View>
                                        <View style={styles.reportInfo}>
                                            <Text style={styles.reportTitle}>{test.test_name}</Text>
                                            <Text style={styles.reportDate}>
                                                {test.status.toUpperCase()}{test.lab_name ? ` • ${test.lab_name}` : ''}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="#6f7f79" />
                                    </Pressable>
                                ))
                            ) : (
                                <View style={styles.emptyCard}>
                                    <Text style={styles.emptyCardText}>No reports uploaded yet.</Text>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loaderWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    greetingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 50,
        marginBottom: 25,
        backgroundColor: '#004d4d',
        padding: 20,
        borderRadius: 25,
    },
    greetingTextContainer: {
        flex: 1,
    },
    welcomeBack: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
    },
    greetingName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        marginTop: 4,
    },
    healthSummaryCard: {
        backgroundColor: '#e0f7f5',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#b2e4d5',
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#008080',
    },
    summaryContent: {
        flexDirection: 'row',
        gap: 40,
    },
    summaryLabel: {
        fontSize: 11,
        color: '#006655',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    bloodGroup: {
        fontSize: 22,
        fontWeight: '700',
        color: '#004d40',
        marginTop: 4,
    },
    lastVisit: {
        fontSize: 14,
        fontWeight: '600',
        color: '#004d40',
        marginTop: 4,
    },
    metricsGrid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
    },
    metricCard: {
        flex: 1,
        backgroundColor: '#f6fafb',
        borderRadius: 20,
        padding: 15,
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    metricIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#eefaf6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    metricTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#002b40',
        marginBottom: 4,
    },
    metricSubtitle: {
        fontSize: 11,
        color: '#6f7f79',
        fontWeight: '700',
    },
    reportsSection: {
        marginBottom: 20,
    },
    reportsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002b40',
    },
    viewAll: {
        fontSize: 12,
        fontWeight: '700',
        color: '#008080',
    },
    reportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6fafb',
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    reportIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    reportInfo: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#002b40',
    },
    reportDate: {
        fontSize: 11,
        color: '#6f7f79',
        fontWeight: '700',
        marginTop: 2,
    },
    floatingAssistantBtn: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#008080',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    floatingAssistantImg: {
        width: 20,
        height: 20,
        tintColor: '#fff',
    },
    emptyCard: {
        backgroundColor: '#f6fafb',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    emptyCardText: {
        fontSize: 13,
        color: '#6f7f79',
        fontWeight: '600',
    },
});
