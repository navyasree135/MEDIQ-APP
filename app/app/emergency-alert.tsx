import React from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function EmergencyAlertScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#002b40" />
                </Pressable>
                <Text style={styles.headerTitle}>MediQ</Text>
                <Ionicons name="ellipsis-vertical" size={24} color="#002b40" />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Emergency Alert Banner */}
                <View style={styles.alertBanner}>
                    <View style={styles.asteriskCircle}>
                        <Ionicons name="medical" size={28} color="#001a2c" />
                    </View>
                    <View style={styles.bannerTextContainer}>
                        <Text style={styles.bannerTitle}>Emergency Alert</Text>
                        <Text style={styles.bannerSubtitle}>Critical response mode active</Text>
                    </View>
                </View>

                {/* Map Graphic Container */}
                <View style={styles.mapContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=600' }}
                        style={styles.mapImage}
                    />
                    <View style={styles.trafficBadge}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.trafficText}>Live Traffic Optimized</Text>
                    </View>
                </View>

                {/* Nearby Facilities Title */}
                <Text style={styles.sectionTitle}>Nearby Facilities</Text>
                <Text style={styles.sectionSubtitle}>Prioritizing by distance and trauma level</Text>

                {/* Facility 1 */}
                <View style={styles.facilityCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.facilityInfo}>
                            <Text style={styles.facilityName}>St. Jude Trauma Center</Text>
                            <View style={styles.distanceRow}>
                                <Ionicons name="location-outline" size={16} color="#6f7f79" />
                                <Text style={styles.distanceText}>0.8 miles away</Text>
                            </View>
                        </View>
                        <View style={styles.badgeTrauma}>
                            <Text style={styles.badgeTextTrauma}>Level 1</Text>
                            <Text style={styles.badgeTextTraumaSub}>Trauma</Text>
                        </View>
                    </View>

                    <View style={styles.statusRow}>
                        <Ionicons name="checkmark-circle" size={18} color="#008080" />
                        <Text style={styles.statusText}>ER Available</Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.waitTimeText}>~4 min wait</Text>
                    </View>

                    <View style={styles.btnRow}>
                        <Pressable style={styles.callBtn}>
                            <Ionicons name="call" size={18} color="#fff" style={styles.btnIcon} />
                            <Text style={styles.callBtnText}>Call Now</Text>
                        </Pressable>
                        <Pressable style={styles.navigateBtn}>
                            <Ionicons name="navigate" size={18} color="#fff" style={styles.btnIcon} />
                            <Text style={styles.navigateBtnText}>Navigate</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Facility 2 */}
                <View style={styles.facilityCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.facilityInfo}>
                            <Text style={styles.facilityName}>Metropolitan General</Text>
                            <View style={styles.distanceRow}>
                                <Ionicons name="location-outline" size={16} color="#6f7f79" />
                                <Text style={styles.distanceText}>2.4 miles away</Text>
                            </View>
                        </View>
                        <View style={styles.badgeSpecial}>
                            <Text style={styles.badgeTextSpecial}>Specialized</Text>
                            <Text style={styles.badgeTextSpecialSub}>Unit</Text>
                        </View>
                    </View>

                    <View style={styles.statusRow}>
                        <Ionicons name="time" size={18} color="#ff9900" />
                        <Text style={[styles.statusText, { color: '#ff9900' }]}>Limited Slots</Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.waitTimeText}>~12 min wait</Text>
                    </View>

                    <View style={styles.btnRow}>
                        <Pressable style={styles.callBtn}>
                            <Ionicons name="call" size={18} color="#fff" style={styles.btnIcon} />
                            <Text style={styles.callBtnText}>Call Now</Text>
                        </Pressable>
                        <Pressable style={styles.navigateBtn}>
                            <Ionicons name="navigate" size={18} color="#fff" style={styles.btnIcon} />
                            <Text style={styles.navigateBtnText}>Navigate</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Book Emergency Slot Button */}
                <Pressable
                    style={styles.bookEmergencyBtn}
                    onPress={() => router.push('/recommended-doctors')}
                >
                    <Ionicons name="flash" size={18} color="#fff" style={styles.boltIcon} />
                    <Text style={styles.bookEmergencyText}>Book Emergency Slot Now</Text>
                </Pressable>
            </ScrollView>

            {/* Fake Bottom Tab Bar matching screen navigation styling */}
            <View style={styles.bottomTabs}>
                <Pressable style={styles.tabItem} onPress={() => router.replace('/(tabs)')}>
                    <Ionicons name="home-outline" size={22} color="#6f7f79" />
                    <Text style={styles.tabText}>Home</Text>
                </Pressable>
                <Pressable style={styles.tabItem} onPress={() => router.replace('/(tabs)/appointments')}>
                    <Ionicons name="calendar-outline" size={22} color="#6f7f79" />
                    <Text style={styles.tabText}>Health</Text>
                </Pressable>
                <Pressable style={styles.tabItemActive} onPress={() => router.replace('/(tabs)/chat')}>
                    <View style={styles.activeIconCircle}>
                        <Ionicons name="chatbubble-ellipses" size={22} color="#002b40" />
                    </View>
                    <Text style={styles.tabTextActive}>AI Concierge</Text>
                </Pressable>
                <Pressable style={styles.tabItem} onPress={() => router.replace('/(tabs)/account')}>
                    <Ionicons name="person-outline" size={22} color="#6f7f79" />
                    <Text style={styles.tabText}>Profile</Text>
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
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f5f4',
    },
    headerBtn: {
        padding: 5,
        marginTop: 30,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#002b40',
        marginTop: 30,
        marginRight: 180,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 110,
    },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#001a2c',
        borderRadius: 20,
        padding: 20,
        marginTop: 15,
        marginBottom: 20,
    },
    asteriskCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    bannerTextContainer: {
        flex: 1,
    },
    bannerTitle: {
        color: '#ffffff',
        fontSize: 22,
        fontWeight: '800',
    },
    bannerSubtitle: {
        color: '#8fa8b8',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },
    mapContainer: {
        height: 150,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    mapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.85,
    },
    trafficBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e8f2f4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00cc99',
        marginRight: 8,
    },
    trafficText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#002b40',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#002b40',
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#6f7f79',
        fontWeight: '600',
        marginTop: 2,
        marginBottom: 20,
    },
    facilityCard: {
        backgroundColor: '#f6fafb',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e8f2f4',
        marginBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    facilityInfo: {
        flex: 1,
    },
    facilityName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002b40',
    },
    distanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    distanceText: {
        fontSize: 13,
        color: '#6f7f79',
        fontWeight: '600',
        marginLeft: 4,
    },
    badgeTrauma: {
        backgroundColor: '#e3f3f5',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignItems: 'center',
    },
    badgeTextTrauma: {
        fontSize: 11,
        fontWeight: '700',
        color: '#008080',
    },
    badgeTextTraumaSub: {
        fontSize: 11,
        fontWeight: '700',
        color: '#008080',
    },
    badgeSpecial: {
        backgroundColor: '#e8e8ea',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 6,
        alignItems: 'center',
    },
    badgeTextSpecial: {
        fontSize: 11,
        fontWeight: '700',
        color: '#555',
    },
    badgeTextSpecialSub: {
        fontSize: 11,
        fontWeight: '700',
        color: '#555',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eef4f5',
        marginTop: 15,
        paddingTop: 15,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#008080',
        marginLeft: 6,
    },
    dotSeparator: {
        color: '#6f7f79',
        marginHorizontal: 8,
    },
    waitTimeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6f7f79',
    },
    btnRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 18,
    },
    callBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#008080',
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    callBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 15,
    },
    navigateBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#001a2c',
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navigateBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 15,
    },
    btnIcon: {
        marginRight: 6,
    },
    bookEmergencyBtn: {
        backgroundColor: '#001a2c',
        height: 56,
        borderRadius: 28,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    bookEmergencyText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16,
    },
    boltIcon: {
        marginRight: 8,
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
    tabText: {
        fontSize: 11,
        color: '#6f7f79',
        fontWeight: '600',
        marginTop: 4,
    },
    tabTextActive: {
        fontSize: 11,
        color: '#002b40',
        fontWeight: '700',
    },
});
