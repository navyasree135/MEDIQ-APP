import React from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, Platform, Share, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function BookingConfirmedScreen() {
    const params = useLocalSearchParams();
    const doctorName = (params.doctorName as string) || 'Dr. Sarah Al-Farsi';
    const dateStr = (params.date as string) || 'October 24, 2023';
    const timeStr = (params.time as string) || '10:30 AM';
    const clinicAddress = (params.clinicAddress as string) || '';
    const clinicLat = (params.clinicLat as string) || '';
    const clinicLng = (params.clinicLng as string) || '';
    const hospital = (params.hospital as string) || 'Advanced Heart Care Hospital';

    const handleGetDirections = async () => {
        const googleUrl = (clinicLat && clinicLng)
            ? `https://www.google.com/maps/dir/?api=1&destination=${clinicLat},${clinicLng}&travelmode=driving`
            : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinicAddress || hospital)}&travelmode=driving`;
        const appleUrl = (clinicLat && clinicLng)
            ? `maps://?daddr=${clinicLat},${clinicLng}&dirflg=d`
            : `maps://?daddr=${encodeURIComponent(clinicAddress || hospital)}&dirflg=d`;

        if (Platform.OS === 'ios') {
            const canApple = await Linking.canOpenURL(appleUrl);
            await Linking.openURL(canApple ? appleUrl : googleUrl);
        } else {
            await Linking.openURL(googleUrl);
        }
    };

    const handleGoHome = () => {
        router.replace('/(tabs)');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `My medical appointment with ${doctorName} is confirmed for ${dateStr} at ${timeStr}. Token: #A-42. Hospital: ${clinicAddress || hospital}.`,
            });
        } catch (error) {
            console.error('Error sharing details:', error);
        }
    };

    const handleAddToCalendar = () => {
        Alert.alert('Success', 'Appointment successfully added to your system calendar.');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header removed for clean UI */}
            <View style={styles.header} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Success Indicator Section */}
                <View style={styles.successContainer}>
                    <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={44} color="#ffffff" />
                    </View>
                    <Text style={styles.successTitle}>Appointment Confirmed!</Text>
                    <Text style={styles.successSubtitle}>Your medical appointment is successfully scheduled.</Text>
                </View>

                {/* Highlighted Confirmation Card */}
                <View style={styles.infoCard}>
                    {/* Token container */}
                    <View style={styles.tokenHighlight}>
                        <Text style={styles.tokenLabel}>TOKEN NUMBER</Text>
                        <Text style={styles.tokenValue}>#A-42</Text>
                    </View>

                    {/* Doctor Details */}
                    <View style={styles.rowItem}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="person" size={20} color="#008080" />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={styles.rowTitle}>{doctorName}</Text>
                            <Text style={styles.rowSubtitle}>Senior Cardiologist</Text>
                        </View>
                    </View>

                    <View style={styles.cardDivider} />

                    {/* Hospital Location details */}
                    <View style={styles.rowItem}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="business" size={20} color="#008080" />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={styles.rowTitle}>{clinicAddress || hospital || 'Advanced Heart Care Hospital'}</Text>
                            <Text style={styles.rowSubtitle}>{clinicLat && clinicLng ? `${parseFloat(clinicLat).toFixed(4)}, ${parseFloat(clinicLng).toFixed(4)}` : '45 Medical Drive, Healthcare City'}</Text>
                        </View>
                    </View>

                    <View style={styles.cardDivider} />

                    {/* Scheduled Slot */}
                    <View style={styles.rowItem}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="calendar" size={20} color="#008080" />
                        </View>
                        <View style={styles.rowTextContainer}>
                            <Text style={styles.rowTitle}>{dateStr}</Text>
                            <Text style={styles.rowSubtitle}>{timeStr} – {timeStr.includes('AM') ? '11:00 AM' : '04:00 PM'}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons (Calendar / Share) */}
                <View style={styles.actionsContainer}>
                    <Pressable style={styles.outlineBtn} onPress={handleAddToCalendar}>
                        <Ionicons name="calendar-outline" size={20} color="#008080" />
                        <Text style={styles.outlineBtnText}>Add to Calendar</Text>
                    </Pressable>
                    <Pressable style={styles.outlineBtn} onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={20} color="#008080" />
                        <Text style={styles.outlineBtnText}>Share Details</Text>
                    </Pressable>
                </View>

                {/* Map/Directions Card overlay */}
                <View style={styles.mapCard}>
                    {/* Simulated Map Visual Structure */}
                    <View style={styles.mapBackground}>
                        {/* Abstract map lines representation */}
                        <View style={[styles.mapLine, { transform: [{ rotate: '45deg' }], top: 40 }]} />
                        <View style={[styles.mapLine, { transform: [{ rotate: '-30deg' }], top: 90 }]} />
                        <View style={[styles.mapLine, { width: 3, height: '100%', left: '40%' }]} />
                        <View style={[styles.mapLine, { width: '100%', height: 3, top: '60%' }]} />
                        
                        <View style={styles.mapPin}>
                            <Ionicons name="location" size={32} color="#ff4d4d" />
                            <View style={styles.mapPinPulse} />
                        </View>
                    </View>
                    
                    {/* Get Directions Floating Action Button */}
                    <Pressable style={styles.directionsBtn} onPress={() => void handleGetDirections()}>
                        <Ionicons name="navigate-outline" size={20} color="#008080" />
                        <Text style={styles.directionsText}>Get Directions</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Bottom sticky action button */}
            <View style={styles.bottomBar}>
                <Pressable style={styles.homeBtn} onPress={handleGoHome}>
                    <Text style={styles.homeBtnText}>Go to Home</Text>
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
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f6fafb',
    },
    headerBtn: {
        padding: 5,
        marginTop: 25,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#002b40',
        marginTop: 27,
        marginRight: 180,
    },
    scrollContent: {
        paddingBottom: 110,
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    successContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    checkCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#00cc99',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#00cc99',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#002b40',
        marginTop: 20,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 14,
        color: '#6f7f79',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    infoCard: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2,
    },
    tokenHighlight: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 16,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 20,
    },
    tokenLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#a3b5bc',
        letterSpacing: 1,
    },
    tokenValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#008080',
        marginTop: 4,
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        paddingVertical: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e3f3f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowTextContainer: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#002b40',
    },
    rowSubtitle: {
        fontSize: 12,
        color: '#6f7f79',
        marginTop: 3,
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#e8f2f4',
        marginVertical: 12,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 20,
    },
    outlineBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 48,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: '#008080',
        backgroundColor: '#ffffff',
    },
    outlineBtnText: {
        color: '#008080',
        fontSize: 13,
        fontWeight: '700',
    },
    mapCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        marginTop: 25,
        backgroundColor: '#f6fafb',
    },
    mapBackground: {
        height: 150,
        backgroundColor: '#e0ecee',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapLine: {
        position: 'absolute',
        backgroundColor: '#cce0e3',
        width: '120%',
        height: 2,
    },
    mapPin: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
    },
    mapPinPulse: {
        position: 'absolute',
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#ff4d4d',
        opacity: 0.4,
        bottom: -2,
        zIndex: 1,
    },
    directionsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#ffffff',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e8f2f4',
    },
    directionsText: {
        color: '#008080',
        fontSize: 13,
        fontWeight: '700',
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
    homeBtn: {
        backgroundColor: '#008080',
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    homeBtnText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16,
    },
});
