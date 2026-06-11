import React from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, Image, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

interface QueueItem {
    patientName: string;
    urgencyLevel: 'urgent' | 'priority' | 'routine';
    bookingTime: number; // timestamp
    isActive: boolean;
}

export default function AppointmentDetailsScreen() {
    const params = useLocalSearchParams();
    
    // Fallback defaults matching wireframe
    const doctorName = (params.doctorName as string) || 'Dr. Julianne Sterling';
    const specialty = (params.specialty as string) || 'Senior Cardiologist';
    const hospital = (params.hospital as string) || 'City General Hospital';
    const dateStr = (params.date as string) || 'Tuesday, Oct 24';
    const timeStr = (params.time as string) || '10:30 AM';
    const tokenNumber = (params.tokenNumber as string) || 'MQ-2910-X';
    const urgencyLevel = (params.urgencyLevel as 'urgent' | 'priority' | 'routine') || 'priority';
    const imageUrl = (params.imageUrl as string) || 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200';
    
    const instructions: string[] = params.instructions 
        ? JSON.parse(params.instructions as string) 
        : ['Fast for at least 8 hours before the test.', 'Bring your previous ECG reports.'];

    // DYNAMIC TRIAGE-BASED PRIORITY QUEUE CALCULATION ALGORITHM
    // 1. We mock other registered bookings in the system for this doctor:
    const mockQueue: QueueItem[] = [
        { patientName: 'Patient A (Routine)', urgencyLevel: 'routine', bookingTime: Date.now() - 120000, isActive: false },
        { patientName: 'Patient B (Priority)', urgencyLevel: 'priority', bookingTime: Date.now() - 60000, isActive: false },
        { patientName: 'Patient C (Routine)', urgencyLevel: 'routine', bookingTime: Date.now() - 10000, isActive: false },
        { patientName: 'Active User', urgencyLevel: urgencyLevel, bookingTime: Date.now(), isActive: true }
    ];

    // 2. Triage sorting function:
    //    - First priority: Urgency Level (Urgent > Priority > Routine)
    //    - Second priority: Booking sequence (Earliest booked goes first)
    const sortedQueue = [...mockQueue].sort((a, b) => {
        const urgencyWeight = { urgent: 3, priority: 2, routine: 1 };
        const weightA = urgencyWeight[a.urgencyLevel];
        const weightB = urgencyWeight[b.urgencyLevel];

        if (weightA !== weightB) {
            return weightB - weightA; // Higher weight comes first
        }
        return a.bookingTime - b.bookingTime; // Earlier comes first
    });

    // 3. Find our position in queue
    const activeIndex = sortedQueue.findIndex(item => item.isActive);
    const queuePosition = activeIndex !== -1 ? activeIndex + 1 : 4;

    // 4. Calculate Est. Wait Time (e.g. 10 - 12 mins per patient in queue)
    const minutesPerPatient = 12;
    const estWaitTime = queuePosition * minutesPerPatient;

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>Appointment Details</Text>
                <Pressable style={styles.headerBtn}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#ffffff" />
                </Pressable>
            </View>

            {/* Confirmed Banner */}
            <View style={styles.confirmedBanner}>
                <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                <Text style={styles.confirmedText}>Confirmed</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Dynamic Queue Status Card */}
                <View style={styles.queueCard}>
                    <View style={styles.queueLeft}>
                        <Text style={styles.queueLabel}>QUEUE STATUS</Text>
                        <Text style={styles.queueValue}>
                            {queuePosition < 10 ? `0${queuePosition}` : queuePosition}
                        </Text>
                        <Text style={styles.queueSub}>Position in Queue</Text>
                    </View>

                    <View style={styles.queueDivider} />

                    <View style={styles.queueRight}>
                        <View style={styles.liveIndicatorContainer}>
                            <View style={styles.liveIndicatorPulse} />
                            <Text style={styles.liveIndicatorText}>Live Update</Text>
                        </View>
                        <Text style={styles.waitValue}>~{estWaitTime} Mins</Text>
                        <Text style={styles.queueSub}>Est. Wait Time</Text>
                    </View>
                </View>

                {/* Intelligent AI Alert detailing queue position priority */}
                <View style={styles.aiPriorityAlert}>
                    <Ionicons name="sparkles" size={18} color="#008080" />
                    <Text style={styles.aiAlertText}>
                        {urgencyLevel === 'urgent' && 'Triage Alert: Highly urgent symptoms detected. Position escalated to priority rank #1.'}
                        {urgencyLevel === 'priority' && 'Triage Alert: Priority symptoms detected. Place adjusted ahead of routine visits.'}
                        {urgencyLevel === 'routine' && 'Triage Alert: Standard routine consultation. Queue arranged by booking timeline.'}
                    </Text>
                </View>

                {/* Doctor Profile Card */}
                <View style={styles.doctorCard}>
                    <View style={[styles.doctorAvatar, { backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e8f2f4' }]}>
                        <Ionicons name="person-circle-outline" size={56} color="#008080" />
                    </View>
                    <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>{doctorName}</Text>
                        <Text style={styles.doctorSpecialty}>{specialty}</Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#ffa500" />
                            <Text style={styles.ratingText}>4.9 (2,400+ reviews)</Text>
                        </View>
                    </View>
                    <Pressable 
                        style={styles.chatShortcutBtn} 
                        onPress={() => router.push({ pathname: '/(tabs)/chat', params: { presetMsg: `Hello ${doctorName}, I have a question regarding my upcoming visit.` } })}
                    >
                        <Ionicons name="chatbox-ellipses" size={20} color="#008080" />
                    </Pressable>
                </View>

                {/* Main Details Info Block */}
                <View style={styles.detailsBlockCard}>
                    {/* Date/Time Row */}
                    <View style={styles.detailsRow}>
                        <View style={styles.detailsIconCircle}>
                            <Ionicons name="calendar-outline" size={20} color="#008080" />
                        </View>
                        <View style={styles.detailsTextContainer}>
                            <Text style={styles.detailsLabel}>DATE & TIME</Text>
                            <Text style={styles.detailsValue}>{dateStr} • {timeStr}</Text>
                        </View>
                    </View>

                    <View style={styles.detailsDivider} />

                    {/* Token Number Row */}
                    <View style={styles.detailsRow}>
                        <View style={styles.detailsIconCircle}>
                            <Ionicons name="ticket-outline" size={20} color="#008080" />
                        </View>
                        <View style={styles.detailsTextContainer}>
                            <Text style={styles.detailsLabel}>TOKEN NUMBER</Text>
                            <Text style={styles.detailsValue}>{tokenNumber}</Text>
                        </View>
                    </View>

                    <View style={styles.detailsDivider} />

                    {/* Location Hospital details Row */}
                    <View style={styles.detailsRow}>
                        <View style={styles.detailsIconCircle}>
                            <Ionicons name="business-outline" size={20} color="#008080" />
                        </View>
                        <View style={styles.detailsTextContainer}>
                            <Text style={styles.detailsLabel}>LOCATION</Text>
                            <Text style={styles.detailsValue}>{hospital}</Text>
                            <Text style={styles.detailsSubVal}>4th Floor, Cardiac Wing, Block B</Text>
                        </View>
                        <Pressable style={styles.mapLinkBtn} onPress={() => Alert.alert('Map', 'Launching hospital clinic map layout...')}>
                            <Ionicons name="map-outline" size={16} color="#008080" style={{ marginRight: 4 }} />
                            <Text style={styles.mapLinkText}>Map</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Patient Instructions Card */}
                <View style={styles.instructionsCard}>
                    <View style={styles.instructionsAccentBar} />
                    <View style={styles.instructionsContent}>
                        <View style={styles.instructionsHeader}>
                            <Ionicons name="information-circle-outline" size={20} color="#002b40" />
                            <Text style={styles.instructionsTitle}>Patient Instructions</Text>
                        </View>
                        {instructions.map((inst, index) => (
                            <Text key={index} style={styles.instructionBullet}>
                                •  {inst}
                            </Text>
                        ))}
                    </View>
                </View>

                {/* Open Queue Tracker FAB & Cancel Actions */}
                <View style={styles.actionBlock}>
                    <Pressable 
                        style={styles.trackerBtn} 
                        onPress={() => router.push({
                            pathname: '/queue-tracker',
                            params: {
                                doctorName,
                                tokenNumber,
                                hospital,
                                urgencyLevel,
                            }
                        })}
                    >
                        <Ionicons name="stats-chart" size={18} color="#ffffff" />
                        <Text style={styles.trackerText}>Open Queue Tracker</Text>
                    </Pressable>

                    <Pressable 
                        style={styles.cancelBtn} 
                        onPress={() => {
                            Alert.alert('Cancel Appointment', 'Do you wish to cancel this appointment?', [
                                { text: 'No' },
                                { text: 'Yes, Cancel', onPress: () => router.replace('/my-appointments') }
                            ]);
                        }}
                    >
                        <Text style={styles.cancelText}>Cancel Appointment</Text>
                    </Pressable>
                </View>

            </ScrollView>
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
        marginTop:24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginTop:24,
        marginRight:70,
    },
    confirmedBanner: {
        backgroundColor: '#00cc99',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 6,
    },
    confirmedText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 14,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    queueCard: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
    },
    queueLeft: {
        flex: 1,
        alignItems: 'center',
    },
    queueDivider: {
        width: 1,
        backgroundColor: '#e8f2f4',
        marginVertical: 5,
    },
    queueRight: {
        flex: 1,
        alignItems: 'center',
    },
    queueLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#a3b5bc',
        letterSpacing: 0.5,
    },
    queueValue: {
        fontSize: 36,
        fontWeight: '900',
        color: '#002b40',
        marginTop: 4,
    },
    queueSub: {
        fontSize: 11,
        color: '#6f7f79',
        fontWeight: '600',
        marginTop: 2,
    },
    liveIndicatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    liveIndicatorPulse: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#00cc99',
    },
    liveIndicatorText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#00cc99',
        textTransform: 'uppercase',
    },
    waitValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#008080',
        marginTop: 10,
    },
    aiPriorityAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e3f3f5',
        borderRadius: 12,
        padding: 12,
        marginTop: 15,
        gap: 10,
    },
    aiAlertText: {
        flex: 1,
        fontSize: 11,
        color: '#008080',
        fontWeight: '700',
        lineHeight: 16,
    },
    doctorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 20,
        padding: 16,
        marginTop: 20,
        gap: 15,
    },
    doctorAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#e8f2f4',
    },
    doctorInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#002b40',
    },
    doctorSpecialty: {
        fontSize: 12,
        color: '#6f7f79',
        marginTop: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 6,
    },
    ratingText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#002b40',
    },
    chatShortcutBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailsBlockCard: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 20,
        padding: 16,
        marginTop: 20,
        gap: 15,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    detailsIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    detailsTextContainer: {
        flex: 1,
    },
    detailsLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#a3b5bc',
        letterSpacing: 0.5,
    },
    detailsValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#002b40',
        marginTop: 3,
    },
    detailsSubVal: {
        fontSize: 11,
        color: '#6f7f79',
        marginTop: 1,
    },
    detailsDivider: {
        height: 1,
        backgroundColor: '#e8f2f4',
    },
    mapLinkBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 12,
    },
    mapLinkText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#008080',
    },
    instructionsCard: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 20,
        marginTop: 20,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    instructionsAccentBar: {
        width: 5,
        backgroundColor: '#008080',
    },
    instructionsContent: {
        flex: 1,
        padding: 16,
    },
    instructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    instructionsTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#002b40',
    },
    instructionBullet: {
        fontSize: 12,
        color: '#6f7f79',
        lineHeight: 18,
        marginTop: 4,
    },
    actionBlock: {
        marginTop: 30,
        gap: 15,
    },
    trackerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#008080',
        height: 52,
        borderRadius: 26,
    },
    trackerText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16,
    },
    cancelBtn: {
        height: 52,
        borderRadius: 26,
        borderWidth: 1.5,
        borderColor: '#e8f2f4',
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        color: '#6f7f79',
        fontSize: 15,
        fontWeight: '700',
    },
});
