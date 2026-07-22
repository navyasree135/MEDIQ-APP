import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, TextInput, Image, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';
import { fetchPrescriptions } from '@/lib/api';

interface PrescriptionItem {
    id: string;
    doctorName: string;
    specialty: string;
    hospital: string;
    date: string;
    medsCount: number;
    imageUrl: string;
    medicines: {
        name: string;
        instruction: string;
        frequency: string;
        duration: string;
        activeTime: 'morning' | 'noon' | 'night';
        dosage: string;
        instructionText: string;
        remaining: string;
    }[];
    labTests?: string[];
}

export default function PrescriptionsListScreen() {
    const { token } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        const loadPrescriptions = async () => {
            try {
                const list = await fetchPrescriptions(token);
                const mapped = list.map((p) => {
                    let medicines = [];
                    let labTests: string[] = [];
                    try {
                        const parsed = JSON.parse(p.medicines_json);
                        if (Array.isArray(parsed)) {
                            medicines = parsed;
                        } else if (parsed && typeof parsed === 'object') {
                            medicines = parsed.medicines || [];
                            labTests = parsed.labTests || [];
                        }
                    } catch (e) {
                        console.error("Error parsing medicines_json:", e);
                    }
                    return {
                        id: String(p.id),
                        doctorName: p.doctor_name,
                        specialty: p.specialty,
                        hospital: p.hospital,
                        date: p.date,
                        medsCount: medicines.length,
                        imageUrl: p.image_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
                        medicines: medicines,
                        labTests: labTests,
                    };
                });
                setPrescriptions(mapped);
            } catch (err) {
                console.error("Error loading prescriptions:", err);
            } finally {
                setLoading(false);
            }
        };
        void loadPrescriptions();
    }, [token]);

    const handleView = (item: PrescriptionItem) => {
        router.push({
            pathname: '/prescription-details',
            params: {
                doctorName: item.doctorName,
                specialty: item.specialty,
                hospital: item.hospital,
                date: item.date,
                imageUrl: item.imageUrl,
                medicines: JSON.stringify(item.medicines),
                labTests: JSON.stringify(item.labTests || []),
            }
        });
    };

    const handleDownload = (item: PrescriptionItem) => {
        const medsList = item.medicines && item.medicines.length > 0 
            ? item.medicines.map((m, idx) => `${idx + 1}. ${m.name}\n   - Dosage: ${m.dosage || 'As directed'}\n   - Frequency: ${m.frequency || 'As directed'}\n   - Duration: ${m.duration || 'As directed'}`).join('\n\n')
            : 'No medication details listed.';

        const labTestsList = item.labTests && item.labTests.length > 0
            ? item.labTests.map((t, idx) => `• ${t}`).join('\n')
            : 'No tests mentioned';

        const content = `==================================================
           MEDIQ CLINICAL PRESCRIPTION           
==================================================
Doctor:    ${item.doctorName}
Specialty: ${item.specialty}
Hospital:  ${item.hospital}
Date:      ${item.date}
--------------------------------------------------
MEDICATIONS PRESCRIBED:

${medsList}

--------------------------------------------------
RECOMMENDED LAB TESTS:

${labTestsList}

==================================================
        Official Digital Medical Record
==================================================`;

        if (Platform.OS === 'web') {
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Prescription_${item.doctorName.replace(/\s+/g, '_')}_${item.date.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            Alert.alert('Download Complete', `Prescription document from ${item.doctorName} has been downloaded to your storage.`);
        }
    };

    const filteredList = prescriptions.filter(item => 
        item.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hospital.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#008080" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>My Prescriptions</Text>
                <Pressable style={styles.headerBtn}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#ffffff" />
                </Pressable>
            </View>

            {/* Search filter bar */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#a3b5bc" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search medicines or doctor"
                        placeholderTextColor="#a3b5bc"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <Pressable style={styles.filterBtn} onPress={() => Alert.alert('Filter', 'Filter parameters toggled.')}>
                    <Ionicons name="options-outline" size={22} color="#008080" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {filteredList.map((item) => (
                    <View key={item.id} style={styles.prescriptionCard}>
                        {/* Doctor profile card */}
                        <View style={styles.cardHeader}>
                            <View style={[styles.doctorAvatar, { backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e8f2f4' }]}>
                                <Ionicons name="person-circle-outline" size={44} color="#008080" />
                            </View>
                            <View style={styles.doctorInfo}>
                                <Text style={styles.doctorName}>{item.doctorName}</Text>
                                <Text style={styles.hospitalName}>{item.hospital}</Text>
                                <Text style={styles.dateText}>📅 {item.date}</Text>
                            </View>
                            <View style={styles.medsBadge}>
                                <Text style={styles.medsBadgeText}>{item.medsCount} Meds</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Card bottom actions row */}
                        <View style={styles.cardActionsRow}>
                            <Pressable style={styles.viewBtn} onPress={() => handleView(item)}>
                                <Ionicons name="eye-outline" size={18} color="#008080" />
                                <Text style={styles.actionBtnText}>View</Text>
                            </Pressable>

                            <View style={styles.verticalSplit} />

                            <Pressable style={styles.downloadBtn} onPress={() => handleDownload(item)}>
                                <Ionicons name="download-outline" size={18} color="#6f7f79" />
                                <Text style={[styles.actionBtnText, { color: '#6f7f79' }]}>Download</Text>
                            </Pressable>
                        </View>
                    </View>
                ))}
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
        marginTop: 25,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 25,
        marginRight: 85,
    },
    searchWrapper: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 15,
        backgroundColor: '#ffffff',
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6fafb',
        borderWidth: 1.5,
        borderColor: '#e8f2f4',
        borderRadius: 14,
        paddingHorizontal: 15,
        height: 50,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#002b40',
        fontWeight: '600',
    },
    filterBtn: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: '#e3f3f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    prescriptionCard: {
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
    hospitalName: {
        fontSize: 12,
        color: '#6f7f79',
        marginTop: 2,
    },
    dateText: {
        fontSize: 11,
        color: '#a3b5bc',
        fontWeight: '700',
        marginTop: 3,
    },
    medsBadge: {
        position: 'absolute',
        right: 0,
        top: 0,
        backgroundColor: '#008080',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    medsBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#ffffff',
    },
    divider: {
        height: 1,
        backgroundColor: '#e8f2f4',
        marginVertical: 15,
    },
    cardActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    verticalSplit: {
        width: 1,
        height: 20,
        backgroundColor: '#e8f2f4',
    },
    downloadBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#008080',
    },
});
