import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    SafeAreaView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { fetchDoctorMe } from '@/lib/api';
import type { DoctorProfile } from '@/lib/types';

export default function AccountScreen() {
    const { token, user, signOut } = useAuth();
    const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token || user?.role !== 'doctor') return;
        
        const loadDoctorProfile = async () => {
            try {
                setLoading(true);
                const profile = await fetchDoctorMe(token);
                setDoctorProfile(profile);
            } catch (err) {
                console.error("Error loading doctor profile:", err);
            } finally {
                setLoading(false);
            }
        };

        void loadDoctorProfile();
    }, [token, user]);

    const handleMockOption = (optionName: string) => {
        Alert.alert("Info", `${optionName} details will be fetched from your clinical records or settings!`);
    };

    const isDoctor = user?.role === 'doctor';

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loaderWrap}>
                    <ActivityIndicator size="large" color="#008080" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Custom Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={[styles.headerAvatar, { backgroundColor: '#008080', alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="person-circle-outline" size={24} color="#ffffff" />
                    </View>
                    <Text style={styles.headerTitle}>MediQ Healthcare</Text>
                </View>
                <Ionicons name="notifications-outline" size={22} color="#ffffff" style={styles.headerIcon} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero Profile Card */}
                <View style={[styles.heroCard, { backgroundColor: '#004d4d' }]}>
                    <View style={styles.avatarWrapper}>
                        <View style={[styles.avatarImage, { backgroundColor: '#008080', alignItems: 'center', justifyContent: 'center' }]}>
                            <Ionicons name="person-circle-outline" size={80} color="#ffffff" />
                        </View>
                        {!isDoctor && (
                            <Pressable style={styles.editAvatarBtn} onPress={() => router.push('/edit-profile')}>
                                <Ionicons name="pencil" size={14} color="#ffffff" />
                            </Pressable>
                        )}
                    </View>

                    <Text style={styles.userName}>{user?.full_name || 'Rahul Sharma'}</Text>
                    <Text style={styles.userEmail}>
                        {isDoctor && doctorProfile 
                            ? `${doctorProfile.specialty} • ${doctorProfile.location || 'London Wing'}` 
                            : user?.email || 'rahul.sharma@email.com'}
                    </Text>
                </View>

                {/* Role-based Menu Options */}
                {isDoctor ? (
                    // Doctor Menu Options
                    <View style={styles.menuCard}>
                        {/* Item 1 */}
                        <Pressable 
                            style={({ pressed }) => [styles.menuItem, pressed && styles.itemPressed]}
                            onPress={() => handleMockOption('Practice Timings')}
                        >
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="time-outline" size={20} color="#008080" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Practice Timings</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#64748b" />
                        </Pressable>

                        {/* Item 2 */}
                        <Pressable 
                            style={({ pressed }) => [styles.menuItem, styles.borderTop, pressed && styles.itemPressed]}
                            onPress={() => router.push('/clinic-details')}
                        >
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="business-outline" size={20} color="#008080" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Clinic Details</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#64748b" />
                        </Pressable>

                        {/* Item 3 */}
                        <Pressable 
                            style={({ pressed }) => [styles.menuItem, styles.borderTop, pressed && styles.itemPressed]}
                            onPress={() => handleMockOption('Consultation Fee')}
                        >
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="card-outline" size={20} color="#008080" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Consultation Fees</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#64748b" />
                        </Pressable>
                    </View>
                ) : (
                    // Patient Menu Options
                    <View style={styles.menuCard}>
                        {/* Item 1 */}
                        <Pressable 
                            style={({ pressed }) => [styles.menuItem, pressed && styles.itemPressed]}
                            onPress={() => router.push('/edit-profile')}
                        >
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="person-outline" size={20} color="#008080" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Personal Details</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#64748b" />
                        </Pressable>

                        {/* Item 2 */}
                        <Pressable 
                            style={({ pressed }) => [styles.menuItem, styles.borderTop, pressed && styles.itemPressed]}
                            onPress={() => router.push('/medical-history')}
                        >
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="clipboard-outline" size={20} color="#008080" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Medical History</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#64748b" />
                        </Pressable>

                        {/* Item 3 */}
                        <Pressable 
                            style={({ pressed }) => [styles.menuItem, styles.borderTop, pressed && styles.itemPressed]}
                            onPress={() => handleMockOption('Insurance')}
                        >
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="shield-checkmark-outline" size={20} color="#008080" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Insurance Details</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#64748b" />
                        </Pressable>

                        {/* Item 4 */}
                        <Pressable 
                            style={({ pressed }) => [styles.menuItem, styles.borderTop, pressed && styles.itemPressed]}
                            onPress={() => router.push('/emergency-alert')}
                        >
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="medical-outline" size={20} color="#008080" style={styles.menuIcon} />
                                <Text style={styles.menuText}>Emergency Contact</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#64748b" />
                        </Pressable>
                    </View>
                )}

                {/* Section Title */}
                <Text style={styles.sectionTitle}>SETTINGS & SUPPORT</Text>

                {/* Settings Card */}
                <View style={styles.menuCard}>
                    {/* Item 1 */}
                    <Pressable 
                        style={({ pressed }) => [styles.menuItem, pressed && styles.itemPressed]}
                        onPress={() => router.push('/notifications-settings')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="notifications-outline" size={20} color="#008080" style={styles.menuIcon} />
                            <Text style={styles.menuText}>Notifications</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#64748b" />
                    </Pressable>

                    {/* Item 2 */}
                    <Pressable 
                        style={({ pressed }) => [styles.menuItem, styles.borderTop, pressed && styles.itemPressed]}
                        onPress={() => handleMockOption('Privacy')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="lock-closed-outline" size={20} color="#008080" style={styles.menuIcon} />
                            <Text style={styles.menuText}>Privacy</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#64748b" />
                    </Pressable>

                    {/* Item 3 */}
                    <Pressable 
                        style={({ pressed }) => [styles.menuItem, styles.borderTop, pressed && styles.itemPressed]}
                        onPress={() => router.push('/help-support')}
                    >
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="help-circle-outline" size={20} color="#008080" style={styles.menuIcon} />
                            <Text style={styles.menuText}>Help & Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#64748b" />
                    </Pressable>

                    {/* Item 4 - Logout */}
                    <Pressable 
                        style={({ pressed }) => [styles.menuItem, styles.borderTop, pressed && styles.itemPressed]}
                        onPress={() => signOut()}
                    >
                        <View style={styles.menuItemLeft}>
                            <Ionicons name="log-out-outline" size={20} color="#dc2626" style={styles.menuIcon} />
                            <Text style={[styles.menuText, { color: '#dc2626' }]}>Logout</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#dc2626" />
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
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
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#004d4d',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#ffffff',
        marginTop: 30,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 30,
    },
    headerIcon: {
        padding: 4,
        marginTop: 30,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroCard: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        marginBottom: 20,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    avatarImage: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: '#ffffff',
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#008080',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#e2f1ed',
        opacity: 0.9,
        textAlign: 'center',
    },
    menuCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2.22,
        paddingVertical: 4,
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 16,
    },
    borderTop: {
        borderTopWidth: 1,
        borderColor: '#f1f5f9',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: 14,
    },
    menuText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
    },
    itemPressed: {
        backgroundColor: '#f8fafc',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748b',
        letterSpacing: 1.1,
        marginLeft: 20,
        marginBottom: 10,
    },
});
