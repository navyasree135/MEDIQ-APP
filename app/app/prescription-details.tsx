import React from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, Image, Platform, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

interface Medicine {
    name: string;
    instruction: string;
    frequency: string;
    duration: string;
    activeTime: 'morning' | 'noon' | 'night';
    dosage: string;
    instructionText: string;
    remaining: string;
}

export default function PrescriptionDetailsScreen() {
    const params = useLocalSearchParams();
    const doctorName = (params.doctorName as string) || 'Dr. Jonathan Reeves';
    const specialty = (params.specialty as string) || 'Consultant Cardiologist';
    const hospital = (params.hospital as string) || 'City General Hospital';
    const dateStr = (params.date as string) || 'Oct 24, 2023';
    const imageUrl = (params.imageUrl as string) || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200';

    const medicines: Medicine[] = params.medicines
        ? JSON.parse(params.medicines as string)
        : [
            {
                name: 'Atorvastatin 20mg',
                instruction: 'Take after dinner',
                frequency: '1x Daily',
                duration: '30 Days',
                activeTime: 'night',
                dosage: '20 mg',
                instructionText: 'Take one capsule by mouth every night before bed. Finish the entire course.',
                remaining: '30 Pills'
            },
            {
                name: 'Lisinopril 10mg',
                instruction: 'Take on empty stomach',
                frequency: '1x Daily',
                duration: '15 Days',
                activeTime: 'morning',
                dosage: '10 mg',
                instructionText: 'Take one tablet in the morning on an empty stomach.',
                remaining: '15 Pills'
            }
        ];

    const handleMedicineClick = (med: Medicine) => {
        router.push({
            pathname: '/medicine-view',
            params: {
                medicineName: med.name,
                dosage: med.dosage,
                frequency: med.frequency,
                duration: med.duration,
                remaining: med.remaining,
                instructionText: med.instructionText,
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
                <Text style={styles.headerTitle}>Your Prescription</Text>
                <View style={styles.headerRight}>
                    <Pressable style={styles.headerBtn} onPress={() => Alert.alert('Download', 'Downloading prescription PDF...')}>
                        <Ionicons name="download-outline" size={22} color="#ffffff" />
                    </Pressable>
                    <Pressable style={styles.headerBtn} onPress={() => Alert.alert('Share', 'Sharing prescription link...')}>
                        <Ionicons name="share-social-outline" size={22} color="#ffffff" />
                    </Pressable>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Doctor details card */}
                <View style={styles.doctorBlock}>
                    <View style={[styles.doctorAvatar, { backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e8f2f4' }]}>
                        <Ionicons name="person-circle-outline" size={44} color="#008080" />
                    </View>
                    <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>{doctorName}</Text>
                        <Text style={styles.specialtyText}>{specialty}</Text>
                        <Text style={styles.dateLabel}>Date: {dateStr}</Text>
                    </View>
                </View>

                {/* Medicines List Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Medicines</Text>
                    {medicines.map((med, index) => (
                        <Pressable key={index} style={styles.medicineCard} onPress={() => handleMedicineClick(med)}>
                            <View style={styles.medicineIconCircle}>
                                <MaterialCommunityIcons name={"pill" as any} size={44} color="#ffffff" />
                            </View>
                            <View style={styles.medicineInfo}>
                                <Text style={styles.medicineName}>{med.name}</Text>
                                <Text style={styles.medicineInstruction}>{med.instruction}</Text>

                                {/* Dose timing row */}
                                <View style={styles.timingRow}>
                                    <View style={styles.timeCell}>
                                        <Text style={styles.timeCellLabel}>MORN</Text>
                                        <View style={[styles.timeCircle, med.activeTime === 'morning' && styles.timeCircleActive]}>
                                            <Ionicons 
                                                name="sunny-outline" 
                                                size={14} 
                                                color={med.activeTime === 'morning' ? '#ffffff' : '#6f7f79'} 
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.timeCell}>
                                        <Text style={styles.timeCellLabel}>NOON</Text>
                                        <View style={[styles.timeCircle, med.activeTime === 'noon' && styles.timeCircleActive]}>
                                            <Ionicons 
                                                name="sunny-outline" 
                                                size={14} 
                                                color={med.activeTime === 'noon' ? '#ffffff' : '#6f7f79'} 
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.timeCell}>
                                        <Text style={styles.timeCellLabel}>NIGHT</Text>
                                        <View style={[styles.timeCircle, med.activeTime === 'night' && styles.timeCircleActive]}>
                                            <Ionicons 
                                                name="moon-outline" 
                                                size={14} 
                                                color={med.activeTime === 'night' ? '#ffffff' : '#6f7f79'} 
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                            
                            {/* Duration block right aligned */}
                            <View style={styles.durationBlock}>
                                <Text style={styles.durationLabel}>Duration</Text>
                                <Text style={styles.durationValue}>{med.duration}</Text>
                            </View>
                        </Pressable>
                    ))}
                </View>

                {/* Lab recommendation block */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lab Tests Recommended</Text>
                    <View style={styles.labCard}>
                        <View style={styles.labIconOuter}>
                            <Ionicons name="beaker-outline" size={24} color="#008080" />
                        </View>
                        <View style={styles.labList}>
                            <Text style={styles.labItem}>•  Complete Blood Count (CBC)</Text>
                            <Text style={styles.labItem}>•  Lipid Profile</Text>
                            <Text style={styles.labItem}>•  HbA1c Test</Text>
                        </View>
                    </View>
                </View>

                {/* Follow up block card */}
                <View style={styles.followupCard}>
                    <Ionicons name="calendar-outline" size={24} color="#ffffff" />
                    <View style={styles.followupInfo}>
                        <Text style={styles.followupLabel}>FOLLOW-UP DATE</Text>
                        <Text style={styles.followupDate}>Nov 15, 2023</Text>
                    </View>
                    <Pressable style={styles.remindBtn} onPress={() => Alert.alert('Reminder Set', 'We will alert you for your follow-up appointment.')}>
                        <Text style={styles.remindBtnText}>Remind Me</Text>
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
        marginTop:25,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 25,
        marginRight: 80,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 15,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    doctorBlock: {
        flexDirection: 'row',
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
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
    specialtyText: {
        fontSize: 12,
        color: '#6f7f79',
        marginTop: 2,
    },
    dateLabel: {
        fontSize: 11,
        color: '#a3b5bc',
        fontWeight: '700',
        marginTop: 4,
    },
    section: {
        marginTop: 25,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#002b40',
        marginBottom: 15,
    },
    medicineCard: {
        flexDirection: 'row',
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 20,
        padding: 16,
        marginBottom: 15,
        alignItems: 'center',
        gap: 15,
    },
    medicineIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#e3f3f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    medicineInfo: {
        flex: 1,
    },
    medicineName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#002b40',
    },
    medicineInstruction: {
        fontSize: 12,
        color: '#6f7f79',
        marginTop: 2,
    },
    timingRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
    },
    timeCell: {
        alignItems: 'center',
        gap: 4,
    },
    timeCellLabel: {
        fontSize: 7,
        fontWeight: '800',
        color: '#a3b5bc',
        letterSpacing: 0.5,
    },
    timeCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeCircleActive: {
        backgroundColor: '#008080',
        borderColor: '#008080',
    },
    durationBlock: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    durationLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#a3b5bc',
        letterSpacing: 0.5,
    },
    durationValue: {
        fontSize: 14,
        fontWeight: '800',
        color: '#002b40',
        marginTop: 4,
    },
    labCard: {
        flexDirection: 'row',
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 20,
        padding: 16,
        gap: 15,
        alignItems: 'center',
    },
    labIconOuter: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#e3f3f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    labList: {
        flex: 1,
        gap: 5,
    },
    labItem: {
        fontSize: 13,
        fontWeight: '700',
        color: '#002b40',
    },
    followupCard: {
        backgroundColor: '#008080',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 25,
        gap: 15,
    },
    followupInfo: {
        flex: 1,
    },
    followupLabel: {
        fontSize: 8,
        fontWeight: '800',
        color: '#8ce6e6',
        letterSpacing: 0.5,
    },
    followupDate: {
        fontSize: 16,
        fontWeight: '800',
        color: '#ffffff',
        marginTop: 3,
    },
    remindBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 15,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    remindBtnText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '800',
    },
});
