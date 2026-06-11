import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

interface Doctor {
    id: number;
    name: string;
    specialty: string;
    match: string;
    location: string;
    rating: string;
    reviews: string;
    nextAvailable: string;
    avatar: string;
    fee: string;
    patients: string;
    bio: string;
    qualifications: string;
    experience: string;
    clinicAddress: string;
    clinicLat: number | null;
    clinicLng: number | null;
}

const DEFAULT_DOCTOR: Doctor = {
    id: 1,
    name: 'Dr. Julian Thorne',
    specialty: 'Senior Cardiologist',
    match: '99%',
    location: 'Saint Mary\'s General Hospital, London',
    rating: '4.9',
    reviews: '180',
    nextAvailable: 'Today, 3:30 PM',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
    fee: '$120.00',
    patients: '4.2k+',
    qualifications: 'MBBS, MD (Cardiology) - Harvard Medical School.\nFellowship in Interventional Cardiology at Mayo Clinic.',
    experience: 'Over 12 years of clinical excellence in diagnosing and treating complex cardiovascular conditions with a success rate of 98% in bypass surgeries.',
    bio: 'Dr. Julian Thorne is an acclaimed cardiologist dedicated to providing precision-driven care. His approach combines traditional medical rigor with the latest AI-enhanced diagnostic tools available through MediQ, ensuring patients receive the most accurate treatment pathways for long-term heart health.',
    clinicAddress: '',
    clinicLat: null,
    clinicLng: null,
};

export default function DoctorDetailsScreen() {
    const params = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState('About');

    // Parse the doctor data if passed, otherwise use default doctor (Dr. Julian Thorne)
    let doctor: Doctor = DEFAULT_DOCTOR;
    if (params.doctorData) {
        try {
            doctor = JSON.parse(params.doctorData as string) as Doctor;
        } catch (e) {
            console.error('Failed to parse doctor data', e);
        }
    }

    const handleCheckSlots = () => {
        router.push({
            pathname: '/select-slot',
            params: {
                doctorName: doctor.name,
                doctorId: String(doctor.id),
                clinicAddress: doctor.clinicAddress || '',
                clinicLat: doctor.clinicLat != null ? String(doctor.clinicLat) : '',
                clinicLng: doctor.clinicLng != null ? String(doctor.clinicLng) : '',
            }
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Visual Top Header Card with Circular Doctor Image */}
                <View style={styles.topCard}>
                    {/* Header Controls overlay */}
                    <View style={styles.headerRow}>
                        <Pressable onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#ffffff" />
                        </Pressable>
                        <Ionicons name="ellipsis-vertical" size={24} color="#ffffff" />
                    </View>

                    {/* Circular Image and Name */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarContainer}>
                            <View style={[styles.avatarImage, { backgroundColor: '#f0f7f9', alignItems: 'center', justifyContent: 'center' }]}>
                                <Ionicons name="person-circle-outline" size={80} color="#8ce6e6" />
                            </View>
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={20} color="#008080" />
                            </View>
                        </View>
                        <Text style={styles.doctorName}>{doctor.name}</Text>
                        <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                        <Text style={styles.doctorHospital}>{doctor.location}</Text>
                    </View>
                </View>

                {/* Navigation Segmented Tabs */}
                <View style={styles.tabsRow}>
                    {['About', 'Reviews', 'Availability'].map((tab) => (
                        <Pressable 
                            key={tab} 
                            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* About Content Tab */}
                {activeTab === 'About' && (
                    <View style={styles.aboutContainer}>
                        {/* Qualifications Card */}
                        <View style={styles.infoCard}>
                            <View style={styles.infoCardHeader}>
                                <Ionicons name="school-outline" size={20} color="#008080" style={styles.infoIcon} />
                                <Text style={styles.infoCardTitle}>Qualifications</Text>
                            </View>
                            <Text style={styles.infoCardBody}>{doctor.qualifications}</Text>
                        </View>

                        {/* Experience Card */}
                        <View style={styles.infoCard}>
                            <View style={styles.infoCardHeader}>
                                <Ionicons name="briefcase-outline" size={20} color="#008080" style={styles.infoIcon} />
                                <Text style={styles.infoCardTitle}>Experience</Text>
                            </View>
                            <Text style={styles.infoCardBody}>{doctor.experience}</Text>
                        </View>

                        {/* Metrics Row (Fee, Patients) */}
                        <View style={styles.metricsRow}>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>CONSULTATION FEE</Text>
                                <Text style={styles.metricVal}>{doctor.fee}</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>PATIENTS</Text>
                                <Text style={styles.metricVal}>{doctor.patients}</Text>
                            </View>
                        </View>

                        {/* Biography Paragraph */}
                        <Text style={styles.bioTitle}>Biography</Text>
                        <Text style={styles.bioBody}>{doctor.bio}</Text>
                    </View>
                )}

                {/* Dummy Review/Availability tab content */}
                {activeTab !== 'About' && (
                    <View style={styles.emptyTab}>
                        <Ionicons name="sparkles-outline" size={40} color="#008080" style={{ marginBottom: 10 }} />
                        <Text style={styles.emptyTabText}>Clinical AI Concierge loaded.</Text>
                        <Text style={styles.emptyTabSub}>All items synchronized with hospital registry.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Check Available Slots sticky action button */}
            <View style={styles.bottomBar}>
                <Pressable style={styles.actionBtn} onPress={handleCheckSlots}>
                    <Ionicons name="calendar-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.actionBtnText}>Check Available Slots</Text>
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
    scrollContent: {
        paddingBottom: 110,
    },
    topCard: {
        backgroundColor: '#022d42',
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        paddingTop: Platform.OS === 'ios' ? 10 : 25,
        paddingBottom: 35,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    backBtn: {
        padding: 5,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 5,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatarImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 4,
        backgroundColor: '#ffffff',
        borderRadius: 10,
    },
    doctorName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#ffffff',
        textAlign: 'center',
    },
    doctorSpecialty: {
        fontSize: 14,
        color: '#8ce6e6',
        fontWeight: '700',
        marginTop: 4,
        textAlign: 'center',
    },
    doctorHospital: {
        fontSize: 12,
        color: '#8fa8b8',
        fontWeight: '500',
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    tabsRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f5f4',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    tabBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    tabBtnActive: {
        borderBottomColor: '#008080',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#6f7f79',
    },
    tabTextActive: {
        color: '#008080',
        fontWeight: '700',
    },
    aboutContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    infoCard: {
        backgroundColor: '#f6fafb',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e8f2f4',
        marginBottom: 15,
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoIcon: {
        marginRight: 8,
    },
    infoCardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#002b40',
    },
    infoCardBody: {
        fontSize: 13,
        color: '#6f7f79',
        lineHeight: 20,
        fontWeight: '500',
    },
    metricsRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20,
    },
    metricItem: {
        flex: 1,
        backgroundColor: '#f6fafb',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e8f2f4',
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 10,
        color: '#6f7f79',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    metricVal: {
        fontSize: 20,
        fontWeight: '800',
        color: '#008080',
        marginTop: 6,
    },
    bioTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#002b40',
        marginBottom: 10,
    },
    bioBody: {
        fontSize: 13,
        color: '#6f7f79',
        lineHeight: 20,
        fontWeight: '500',
    },
    emptyTab: {
        padding: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTabText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#002b40',
    },
    emptyTabSub: {
        fontSize: 12,
        color: '#6f7f79',
        marginTop: 4,
        textAlign: 'center',
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
    actionBtn: {
        backgroundColor: '#008080',
        height: 52,
        borderRadius: 26,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
});
