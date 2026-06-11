import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, Image, FlatList, Platform, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { fetchDoctorAvailability } from '@/lib/api';

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

export default function RecommendedDoctorsScreen() {
    const { token } = useAuth();
    const [selectedTab, setSelectedTab] = useState('All');
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const loadDoctors = async () => {
            try {
                setLoading(true);
                setError(null);
                const list = await fetchDoctorAvailability(token);
                const mapped = list.map((doc, idx) => ({
                    id: doc.doctor_id,
                    name: doc.doctor_name,
                    specialty: doc.specialty,
                    match: `${98 - idx % 5}%`,
                    location: doc.location || "Saint Mary's General Hospital, London",
                    rating: (4.7 + (idx % 3) * 0.1).toFixed(1),
                    reviews: String(45 + idx * 12),
                    nextAvailable: doc.slot ? new Date(doc.slot).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Today, 3:30 PM',
                    avatar: '',
                    fee: `$${100 + (idx % 3) * 20}.00`,
                    patients: `${1.2 + (idx % 4) * 0.8}k+`,
                    qualifications: `MD (${doc.specialty})`,
                    experience: `Over ${8 + idx} years of clinical excellence in diagnosing and treating patients.`,
                    bio: `${doc.doctor_name} is a dedicated ${doc.specialty.toLowerCase()} specialist. Their approach combines clinical expertise with personalized care, ensuring patients receive the most accurate treatment pathways for long-term health.`,
                    clinicAddress: doc.clinic_address || '',
                    clinicLat: doc.clinic_lat ?? null,
                    clinicLng: doc.clinic_lng ?? null,
                }));
                setDoctors(mapped);
            } catch (err) {
                console.error('Failed to load doctors:', err);
                setError('Failed to load doctors from database.');
            } finally {
                setLoading(false);
            }
        };

        void loadDoctors();
    }, [token]);

    const handleBook = (doctor: Doctor) => {
        router.push({
            pathname: '/doctor-details',
            params: { doctorData: JSON.stringify(doctor) }
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#008080" />
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.centerContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        if (selectedTab === 'Nearest') return doc.location.includes('1.8km') || doc.location.includes('2.4km') || doc.location.includes('London');
        if (selectedTab === 'Top Rated') return parseFloat(doc.rating) >= 4.8;
        if (selectedTab === 'Available') return doc.nextAvailable.includes('Today') || doc.nextAvailable.includes('Mon') || doc.nextAvailable.includes('Tue') || doc.nextAvailable.includes('Wed');
        return true;
    });

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>Recommended Doctors</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color="#6f7f79" style={{ marginRight: 8 }} />
                    <TextInput
                        placeholder="Search doctors by name or specialty..."
                        placeholderTextColor="#a3b5bc"
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                            <Ionicons name="close-circle" size={18} color="#a3b5bc" />
                        </Pressable>
                    )}
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.tabsOuter}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                    {['All', 'Nearest', 'Top Rated', 'Available'].map((tab) => (
                        <Pressable
                            key={tab}
                            style={[styles.tabBtn, selectedTab === tab && styles.tabBtnActive]}
                            onPress={() => setSelectedTab(tab)}
                        >
                            <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                                {tab}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Doctor List */}
            <FlatList
                data={filteredDoctors}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={48} color="#bbd8ce" />
                        <Text style={styles.emptyText}>No registered doctors match your criteria.</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.docCard}>
                        <View style={styles.docMainInfo}>
                            <View style={[styles.docAvatar, { backgroundColor: '#f6fafb', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e8f2f4' }]}>
                                <Ionicons name="person-circle-outline" size={60} color="#008080" />
                            </View>
                            <View style={styles.docTextDetails}>
                                <View style={styles.nameMatchRow}>
                                    <Text style={styles.docName} numberOfLines={1}>{item.name}</Text>
                                    <View style={styles.matchBadge}>
                                        <Text style={styles.matchText}>{item.match} Match</Text>
                                    </View>
                                </View>
                                <Text style={styles.docSpecialty}>{item.specialty}</Text>
                                <View style={styles.locationRow}>
                                    <Ionicons name="location" size={14} color="#6f7f79" />
                                    <Text style={styles.docLocation} numberOfLines={1}>{item.location}</Text>
                                </View>
                                <View style={styles.ratingRow}>
                                    <Ionicons name="star" size={14} color="#ff9900" />
                                    <Text style={styles.ratingText}>{item.rating} </Text>
                                    <Text style={styles.reviewsText}>({item.reviews} reviews)</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.cardFooter}>
                            <View style={styles.nextAvailRow}>
                                <View style={styles.availDot} />
                                <Text style={styles.nextAvailText}>Next Available: <Text style={styles.nextAvailTime}>{item.nextAvailable.split(', ')[1] || item.nextAvailable}</Text></Text>
                            </View>
                            <Pressable style={styles.bookBtn} onPress={() => handleBook(item)}>
                                <Text style={styles.bookBtnText}>Book</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            />

            {/* Bottom Navigation Bar with Health tab active */}
            <View style={styles.bottomTabs}>
                <Pressable style={styles.tabItem} onPress={() => router.replace('/(tabs)')}>
                    <Ionicons name="home-outline" size={22} color="#6f7f79" />
                    <Text style={styles.tabItemText}>Home</Text>
                </Pressable>
                <Pressable style={styles.tabItemActive} onPress={() => router.replace('/(tabs)/appointments')}>
                    <View style={styles.activeIconCircle}>
                        <Ionicons name="calendar" size={22} color="#008080" />
                    </View>
                    <Text style={styles.tabItemTextActive}>Health</Text>
                </Pressable>
                <Pressable style={styles.tabItem} onPress={() => router.replace('/(tabs)/chat')}>
                    <Ionicons name="chatbubble-ellipses-outline" size={22} color="#6f7f79" />
                    <Text style={styles.tabItemText}>AI Concierge</Text>
                </Pressable>
                <Pressable style={styles.tabItem} onPress={() => router.replace('/(tabs)/account')}>
                    <Ionicons name="person-outline" size={22} color="#6f7f79" />
                    <Text style={styles.tabItemText}>Profile</Text>
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
        marginTop: 26,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 26,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#0f172a',
        fontWeight: '600',
        padding: 0,
    },
    tabsOuter: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f5f4',
        paddingVertical: 12,
    },
    tabsScroll: {
        paddingHorizontal: 20,
        gap: 10,
    },
    tabBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f5f7f8',
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    tabBtnActive: {
        backgroundColor: '#008080',
        borderColor: '#008080',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6f7f79',
    },
    tabTextActive: {
        color: '#ffffff',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 110,
    },
    docCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e8f2f4',
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    docMainInfo: {
        flexDirection: 'row',
    },
    docAvatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#f5f5f5',
    },
    docTextDetails: {
        flex: 1,
        marginLeft: 15,
    },
    nameMatchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    docName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#002b40',
        flex: 1,
        marginRight: 6,
    },
    matchBadge: {
        backgroundColor: '#008080',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    matchText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
    },
    docSpecialty: {
        fontSize: 13,
        color: '#6f7f79',
        fontWeight: '600',
        marginTop: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    docLocation: {
        fontSize: 12,
        color: '#6f7f79',
        marginLeft: 4,
        flex: 1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#002b40',
        marginLeft: 4,
    },
    reviewsText: {
        fontSize: 12,
        color: '#6f7f79',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f5f4',
        marginTop: 15,
        paddingTop: 15,
    },
    nextAvailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    availDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00cc99',
        marginRight: 6,
    },
    nextAvailText: {
        fontSize: 12,
        color: '#6f7f79',
        fontWeight: '500',
    },
    nextAvailTime: {
        fontWeight: '700',
        color: '#002b40',
    },
    bookBtn: {
        backgroundColor: '#008080',
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderRadius: 20,
    },
    bookBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
    },
    bottomTabs: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f0f5f4',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 15 : 0,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabItemActive: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeIconCircle: {
        backgroundColor: '#e3f3f5',
        width: 48,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    tabItemText: {
        fontSize: 11,
        color: '#6f7f79',
        fontWeight: '600',
        marginTop: 4,
    },
    tabItemTextActive: {
        fontSize: 11,
        color: '#008080',
        fontWeight: '700',
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#dc2626',
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        gap: 15,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 14,
        color: '#6f7f79',
        fontWeight: '600',
        textAlign: 'center',
    },
});
