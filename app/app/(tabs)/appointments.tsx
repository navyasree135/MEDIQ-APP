import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, Platform, Alert, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '@/hooks/use-auth';
import { 
    fetchAppointments, 
    updateAppointmentStatus, 
    fetchPatientById, 
    fetchPatientPrescriptions, 
    fetchPatientLabTests 
} from '@/lib/api';
import type { Appointment, PatientProfile, Prescription, LabTest } from '@/lib/types';

export default function AppointmentsScreen() {
    const { token, user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

    // Patient records modal state (Doctor console only)
    const [isPatientModalVisible, setIsPatientModalVisible] = useState(false);
    const [loadingPatientData, setLoadingPatientData] = useState(false);
    const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
    const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([]);
    const [patientLabTests, setPatientLabTests] = useState<LabTest[]>([]);

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
                            // Doctor updates directly, patient will also map to cancelled
                            if (user?.role === 'doctor') {
                                await updateAppointmentStatus(token, id, 'cancelled');
                            } else {
                                // Default system-level fallback: allow patient cancellation via update status
                                await updateAppointmentStatus(token, id, 'cancelled');
                            }
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

    const handleConfirmAppointment = async (id: number) => {
        try {
            if (!token) return;
            await updateAppointmentStatus(token, id, 'confirmed');
            Alert.alert('Success', 'Appointment has been confirmed.');
            void loadAppointments();
        } catch (err) {
            Alert.alert('Error', 'Failed to confirm appointment.');
        }
    };

    const handleCompleteAppointment = async (id: number) => {
        try {
            if (!token) return;
            await updateAppointmentStatus(token, id, 'completed');
            Alert.alert('Success', 'Appointment marked as completed.');
            void loadAppointments();
        } catch (err) {
            Alert.alert('Error', 'Failed to complete appointment.');
        }
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

    const handleViewRecords = async (patientId: number) => {
        if (!token) return;
        setIsPatientModalVisible(true);
        setLoadingPatientData(true);
        setPatientProfile(null);
        setPatientPrescriptions([]);
        setPatientLabTests([]);

        try {
            const [profile, rx, tests] = await Promise.all([
                fetchPatientById(token, patientId),
                fetchPatientPrescriptions(token, patientId).catch(() => []),
                fetchPatientLabTests(token, patientId).catch(() => [])
            ]);
            setPatientProfile(profile);
            setPatientPrescriptions(rx);
            setPatientLabTests(tests);
        } catch (err) {
            console.error('Failed to load patient records:', err);
            Alert.alert('Error', 'Could not load patient medical records.');
        } finally {
            setLoadingPatientData(false);
        }
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

    const renderPatientCard = (item: Appointment) => {
        const dateObj = new Date(item.scheduled_at);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const isPending = item.status === 'pending';

        return (
            <View key={item.id} style={styles.appointmentCard}>
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
    };

    const renderDoctorCard = (item: Appointment) => {
        const dateObj = new Date(item.scheduled_at);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const isPending = item.status === 'pending';
        const isConfirmed = item.status === 'confirmed';

        return (
            <View key={item.id} style={styles.appointmentCard}>
                <View style={styles.cardHeader}>
                    <View style={[styles.doctorAvatar, { backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e8f2f4' }]}>
                        <Ionicons name="person-outline" size={32} color="#008080" />
                    </View>
                    <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>{item.patient_name || 'Patient Profile'}</Text>
                        <Text style={styles.clinicName}>Contact: {item.patient_phone || 'Not provided'}</Text>
                        {item.notes ? (
                            <Text style={styles.patientNotes} numberOfLines={2}>Notes: "{item.notes}"</Text>
                        ) : null}
                    </View>
                    <View style={[styles.statusBadge, isConfirmed ? styles.badgeConfirmed : isPending ? styles.badgePending : styles.badgeDefault]}>
                        <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.metaContainer}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>SCHEDULED FOR</Text>
                        <View style={styles.metaValueRow}>
                            <Ionicons name="calendar-outline" size={16} color="#6f7f79" />
                            <Text style={styles.metaValue}>{dateStr}, {timeStr}</Text>
                        </View>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>APPOINTMENT ID</Text>
                        <View style={styles.metaValueRow}>
                            <Ionicons name="finger-print-outline" size={16} color="#6f7f79" />
                            <Text style={styles.metaValue}>#{item.id}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Doctor-Specific Control buttons */}
                <View style={styles.cardFooter}>
                    <Pressable style={styles.viewRecordsBtn} onPress={() => handleViewRecords(item.patient_id)}>
                        <Ionicons name="folder-open-outline" size={14} color="#008080" style={{ marginRight: 4 }} />
                        <Text style={styles.viewRecordsBtnText}>Patient File</Text>
                    </Pressable>

                    <View style={{ flexDirection: 'row', gap: 8, flex: 1.5, justifyContent: 'flex-end' }}>
                        {isPending && (
                            <Pressable style={styles.confirmActionBtn} onPress={() => handleConfirmAppointment(item.id)}>
                                <Text style={styles.confirmActionBtnText}>Confirm</Text>
                            </Pressable>
                        )}
                        {isConfirmed && (
                            <Pressable style={styles.completeActionBtn} onPress={() => handleCompleteAppointment(item.id)}>
                                <Text style={styles.completeActionBtnText}>Complete</Text>
                            </Pressable>
                        )}
                        {(isPending || isConfirmed) && (
                            <Pressable style={styles.cancelActionBtn} onPress={() => handleCancelAppointment(item.id)}>
                                <Ionicons name="close-circle-outline" size={16} color="#dc2626" />
                            </Pressable>
                        )}
                    </View>
                </View>
            </View>
        );
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
    const isDoctor = user?.role === 'doctor';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.screenHeader}>
                <Text style={styles.screenTitle}>{isDoctor ? 'Practice Console' : 'My Appointments'}</Text>
                <Text style={styles.screenSubtitle}>
                    {isDoctor ? 'Manage and review your patient schedule' : 'Track and manage your upcoming checkups'}
                </Text>
            </View>

            {/* Segment Tabs */}
            <View style={styles.tabWrapper}>
                <View style={styles.tabContainer}>
                    <Pressable
                        style={[styles.tab, selectedTab === 'upcoming' && styles.tabActive]}
                        onPress={() => setSelectedTab('upcoming')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'upcoming' && styles.tabTextActive]}>
                            {isDoctor ? 'Active schedule' : 'Upcoming'}
                        </Text>
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
                    filteredList.map((item) => (isDoctor ? renderDoctorCard(item) : renderPatientCard(item)))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-clear-outline" size={54} color="#bbd8ce" />
                        <Text style={styles.emptyText}>No appointments found in this category.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Patient Records Modal (Doctor View Only) */}
            <Modal
                visible={isPatientModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsPatientModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Patient Health Record</Text>
                                <Text style={styles.modalSubtitleText}>Official Clinical Background Details</Text>
                            </View>
                            <Pressable onPress={() => setIsPatientModalVisible(false)} style={styles.closeModalBtn}>
                                <Ionicons name="close" size={24} color="#002b40" />
                            </Pressable>
                        </View>

                        {loadingPatientData ? (
                            <View style={styles.modalLoaderContainer}>
                                <ActivityIndicator size="large" color="#008080" />
                                <Text style={styles.modalLoaderText}>Fetching medical database records...</Text>
                            </View>
                        ) : patientProfile ? (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                                
                                {/* Patient Info Card */}
                                <View style={styles.patientSummaryCard}>
                                    <View style={styles.patientAvatarWrapper}>
                                        <Ionicons name="person-circle" size={64} color="#008080" />
                                    </View>
                                    <View style={styles.patientTextInfo}>
                                        <Text style={styles.patientNameText}>{patientProfile.full_name}</Text>
                                        <Text style={styles.patientDetailText}>DOB: {patientProfile.date_of_birth || 'N/A'}</Text>
                                        <Text style={styles.patientDetailText}>Gender: {patientProfile.gender || 'N/A'}</Text>
                                        <Text style={styles.patientDetailText}>Phone: {patientProfile.phone || 'N/A'}</Text>
                                    </View>
                                </View>

                                {/* Demographics Grid */}
                                <View style={styles.demographicsGrid}>
                                    <View style={styles.demographicsCard}>
                                        <Text style={styles.demoLabel}>BLOOD GROUP</Text>
                                        <Text style={styles.demoValue}>{patientProfile.blood_group || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.demographicsCard}>
                                        <Text style={styles.demoLabel}>LAST CLINIC VISIT</Text>
                                        <Text style={styles.demoValue}>{patientProfile.last_visit || 'N/A'}</Text>
                                    </View>
                                </View>

                                {/* Clinical Notes (Allergies / Conditions) */}
                                <View style={styles.clinicalNotesSection}>
                                    <Text style={styles.sectionLabelTitle}>CLINICAL INDICATIONS & NOTES</Text>
                                    
                                    <View style={styles.noteBox}>
                                        <Text style={styles.noteLabel}>CHRONIC CONDITIONS</Text>
                                        <Text style={styles.noteValue}>{patientProfile.conditions || 'None diagnosed / reported.'}</Text>
                                    </View>

                                    <View style={[styles.noteBox, { marginTop: 10 }]}>
                                        <Text style={styles.noteLabel}>KNOWN ALLERGIES</Text>
                                        <Text style={styles.noteValue}>{patientProfile.allergies || 'No known environmental or drug allergies.'}</Text>
                                    </View>
                                </View>

                                {/* Emergency Contact */}
                                <View style={styles.emergencyContactCard}>
                                    <Ionicons name="warning-outline" size={18} color="#008080" />
                                    <View style={{ marginLeft: 10 }}>
                                        <Text style={styles.emergencyLabel}>EMERGENCY CONTACT</Text>
                                        <Text style={styles.emergencyValue}>
                                            {patientProfile.emergency_contact_name || 'Not Listed'} - {patientProfile.emergency_contact_phone || 'N/A'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Diagnostic Lab Reports Section */}
                                <View style={styles.clinicalNotesSection}>
                                    <Text style={styles.sectionLabelTitle}>PATIENT UPLOADED LAB REPORTS</Text>
                                    {patientLabTests.length > 0 ? (
                                        patientLabTests.map((report) => (
                                            <View key={report.id} style={styles.reportRow}>
                                                <Ionicons 
                                                    name={report.file_name?.endsWith('.pdf') ? "document-text-outline" : "image-outline"} 
                                                    size={20} 
                                                    color="#008080" 
                                                />
                                                <View style={{ flex: 1, marginLeft: 10 }}>
                                                    <Text style={styles.reportName}>{report.test_name}</Text>
                                                    <Text style={styles.reportSub}>Lab: {report.lab_name} • {report.order_date}</Text>
                                                    {report.file_name ? (
                                                        <Text style={styles.reportFileText}>Filename: {report.file_name}</Text>
                                                    ) : null}
                                                </View>
                                                <Pressable style={styles.viewFileBtn} onPress={() => Alert.alert('Lab Report', `Accessing files: ${report.file_name || 'report.pdf'}`)}>
                                                    <Text style={styles.viewFileBtnText}>View</Text>
                                                </Pressable>
                                            </View>
                                        ))
                                    ) : (
                                        <Text style={styles.noDataText}>No lab reports uploaded by patient yet.</Text>
                                    )}
                                </View>

                                {/* Prescription History */}
                                <View style={styles.clinicalNotesSection}>
                                    <Text style={styles.sectionLabelTitle}>ACTIVE & PAST PRESCRIPTIONS</Text>
                                    {patientPrescriptions.length > 0 ? (
                                        patientPrescriptions.map((rx) => {
                                            let meds = [];
                                            try {
                                                meds = JSON.parse(rx.medicines_json);
                                            } catch {
                                                meds = [];
                                            }
                                            return (
                                                <View key={rx.id} style={styles.prescriptionBox}>
                                                    <View style={styles.rxHeader}>
                                                        <Ionicons name="medical-outline" size={16} color="#008080" />
                                                        <Text style={styles.rxDoctor}>{rx.doctor_name} ({rx.specialty})</Text>
                                                        <Text style={styles.rxDate}>{rx.date}</Text>
                                                    </View>
                                                    <Text style={styles.rxHospital}>Clinic: {rx.hospital}</Text>
                                                    
                                                    <View style={styles.medicinesList}>
                                                        {meds.map((med: any, idx: number) => (
                                                            <Text key={idx} style={styles.medicineBullet}>
                                                                • {med.name} - {med.dosage} ({med.frequency} for {med.duration})
                                                            </Text>
                                                        ))}
                                                    </View>
                                                </View>
                                            );
                                        })
                                    ) : (
                                        <Text style={styles.noDataText}>No prescriptions on record for this patient.</Text>
                                    )}
                                </View>

                            </ScrollView>
                        ) : (
                            <View style={styles.modalErrorContainer}>
                                <Text style={styles.errorText}>No clinical profile records match this patient.</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
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
    screenHeader: {
        paddingHorizontal: 20,
        paddingTop: 45,
        paddingBottom: 10,
        backgroundColor: '#ffffff',
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#002b40',
    },
    screenSubtitle: {
        fontSize: 13,
        color: '#6f7f79',
        fontWeight: '500',
        marginTop: 4,
    },
    tabWrapper: {
        paddingHorizontal: 20,
        paddingTop: 10,
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
        marginTop: 2,
        fontWeight: '600',
    },
    patientNotes: {
        fontSize: 11,
        color: '#008080',
        fontStyle: 'italic',
        marginTop: 4,
        fontWeight: '600',
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
        alignItems: 'center',
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
    // Doctor console style utilities
    viewRecordsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#008080',
        backgroundColor: '#ffffff',
        paddingHorizontal: 12,
        height: 36,
        borderRadius: 18,
    },
    viewRecordsBtnText: {
        color: '#008080',
        fontSize: 12,
        fontWeight: '700',
    },
    confirmActionBtn: {
        backgroundColor: '#008080',
        paddingHorizontal: 14,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmActionBtnText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    completeActionBtn: {
        backgroundColor: '#319795',
        paddingHorizontal: 14,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    completeActionBtnText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    cancelActionBtn: {
        borderWidth: 1.5,
        borderColor: '#fed7d7',
        backgroundColor: '#fff5f5',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
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
    // Patient record modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 43, 64, 0.45)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 20,
        height: '92%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        borderBottomWidth: 1.5,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 15,
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#002b40',
    },
    modalSubtitleText: {
        fontSize: 12,
        color: '#718096',
        fontWeight: '600',
        marginTop: 2,
    },
    closeModalBtn: {
        padding: 4,
    },
    modalLoaderContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    modalLoaderText: {
        fontSize: 14,
        color: '#718096',
        fontWeight: '600',
    },
    patientSummaryCard: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    patientAvatarWrapper: {
        marginRight: 15,
    },
    patientTextInfo: {
        flex: 1,
    },
    patientNameText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 4,
    },
    patientDetailText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
        marginTop: 2,
    },
    demographicsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 15,
    },
    demographicsCard: {
        flex: 1,
        backgroundColor: '#f0fdfa',
        borderWidth: 1,
        borderColor: '#b2f5ea',
        borderRadius: 12,
        padding: 12,
    },
    demoLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#008080',
        letterSpacing: 0.5,
    },
    demoValue: {
        fontSize: 14,
        fontWeight: '800',
        color: '#004d40',
        marginTop: 4,
    },
    clinicalNotesSection: {
        marginTop: 20,
    },
    sectionLabelTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#475569',
        letterSpacing: 0.8,
        marginBottom: 10,
    },
    noteBox: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
    },
    noteLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#64748b',
    },
    noteValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0f172a',
        marginTop: 4,
    },
    emergencyContactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffaf0',
        borderWidth: 1,
        borderColor: '#feebc8',
        borderRadius: 12,
        padding: 12,
        marginTop: 15,
    },
    emergencyLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#c05621',
    },
    emergencyValue: {
        fontSize: 13,
        fontWeight: '700',
        color: '#7b341e',
        marginTop: 2,
    },
    reportRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    reportName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
    },
    reportSub: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 2,
        fontWeight: '500',
    },
    reportFileText: {
        fontSize: 11,
        color: '#008080',
        fontWeight: '600',
        marginTop: 2,
    },
    viewFileBtn: {
        backgroundColor: '#e6f7f7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    viewFileBtnText: {
        color: '#008080',
        fontSize: 12,
        fontWeight: '700',
    },
    noDataText: {
        fontSize: 13,
        color: '#64748b',
        fontStyle: 'italic',
        paddingLeft: 4,
    },
    prescriptionBox: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    rxHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    rxDoctor: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0f172a',
        flex: 1,
        marginLeft: 6,
    },
    rxDate: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
    },
    rxHospital: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 2,
        marginLeft: 22,
        fontWeight: '500',
    },
    medicinesList: {
        marginTop: 8,
        marginLeft: 22,
        gap: 4,
    },
    medicineBullet: {
        fontSize: 12,
        color: '#334155',
        fontWeight: '600',
    },
    modalErrorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#dc2626',
        fontWeight: '600',
    },
});
