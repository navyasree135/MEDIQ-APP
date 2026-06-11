import React from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function HospitalCheckinScreen() {
    const params = useLocalSearchParams();
    const doctorName = (params.doctorName as string) || 'Dr. Priya Sharma';
    const hospital = (params.hospital as string) || 'City General Hospital';
    const tokenNumber = (params.tokenNumber as string) || 'A-42';

    const handleCheckIn = () => {
        // Successful check-in returns safely to tabs home page
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>Hospital Check-In</Text>
                <Pressable style={styles.headerBtn}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#ffffff" />
                </Pressable>
            </View>

            <View style={styles.content}>
                {/* Check in Card */}
                <View style={styles.checkinCard}>
                    {/* Visual hospital symbol illustration */}
                    <View style={styles.symbolOuter}>
                        <View style={styles.symbolInner}>
                            <Ionicons name="business" size={60} color="#008080" />
                        </View>
                    </View>

                    <Text style={styles.tokenLabel}>YOUR TOKEN NUMBER</Text>
                    <Text style={styles.tokenValue}>{tokenNumber}</Text>
                </View>

                {/* Doctor Details */}
                <View style={styles.doctorCard}>
                    <Text style={styles.doctorName}>{doctorName}</Text>
                    <Text style={styles.hospitalName}>{hospital}</Text>
                </View>

                {/* Info Note Row */}
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle-outline" size={20} color="#008080" style={{ marginTop: 2 }} />
                    <Text style={styles.infoText}>
                        Present your token number at the reception desk or kiosk to confirm your arrival and enter the queue.
                    </Text>
                </View>

                {/* Check In Now Button */}
                <Pressable style={styles.checkinBtn} onPress={handleCheckIn}>
                    <Text style={styles.checkinBtnText}>Check In Now</Text>
                </Pressable>

                {/* Having trouble support link */}
                <Pressable style={styles.helpLink} onPress={() => Alert.alert('Help', 'Support desk: (555) 012-3456')}>
                    <Ionicons name="help-circle-outline" size={16} color="#6f7f79" />
                    <Text style={styles.helpLinkText}>Having trouble? Get help</Text>
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
        marginTop: 25,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 25,
        marginRight: 85,
    },
    content: {
        flex: 1,
        paddingHorizontal: 25,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
    },
    checkinCard: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 24,
        paddingVertical: 35,
        paddingHorizontal: 20,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    symbolOuter: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(0, 128, 128, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
    },
    symbolInner: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.02,
        shadowRadius: 5,
    },
    tokenLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#a3b5bc',
        letterSpacing: 1,
    },
    tokenValue: {
        fontSize: 48,
        fontWeight: '900',
        color: '#008080',
        marginTop: 8,
    },
    doctorCard: {
        alignItems: 'center',
        marginTop: 25,
    },
    doctorName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#002b40',
    },
    hospitalName: {
        fontSize: 14,
        color: '#6f7f79',
        fontWeight: '600',
        marginTop: 4,
    },
    infoBanner: {
        flexDirection: 'row',
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 16,
        padding: 16,
        marginTop: 25,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#6f7f79',
        lineHeight: 18,
        fontWeight: '600',
    },
    checkinBtn: {
        width: '100%',
        backgroundColor: '#008080',
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 35,
    },
    checkinBtnText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16,
    },
    helpLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        marginTop: 20,
    },
    helpLinkText: {
        fontSize: 13,
        color: '#6f7f79',
        fontWeight: '700',
    },
});
