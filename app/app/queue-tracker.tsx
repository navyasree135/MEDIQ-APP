import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, Platform, Alert, Vibration, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

type StepType = 'leave_now' | 'directions' | 'live_tracker' | 'checked_in' | 'your_turn';

export default function QueueTrackerScreen() {
    const params = useLocalSearchParams();
    const doctorName = (params.doctorName as string) || 'Dr. Priya Sharma';
    const tokenNumber = (params.tokenNumber as string) || 'A-42';
    const hospital = (params.hospital as string) || 'City General Hospital';
    const urgencyLevel = (params.urgencyLevel as string) || 'priority';
    const clinicAddress = (params.clinicAddress as string) || '';
    const clinicLat = (params.clinicLat as string) || '';
    const clinicLng = (params.clinicLng as string) || '';

    // Build real map URLs using coordinates if available, otherwise fall back to address search
    const destination = (clinicLat && clinicLng)
        ? `${clinicLat},${clinicLng}`
        : encodeURIComponent(clinicAddress || hospital);

    const openGoogleMaps = async () => {
        const googleUrl = (clinicLat && clinicLng)
            ? `https://www.google.com/maps/dir/?api=1&destination=${clinicLat},${clinicLng}&travelmode=driving`
            : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(clinicAddress || hospital)}&travelmode=driving`;
        const canOpen = await Linking.canOpenURL(googleUrl);
        if (canOpen) {
            await Linking.openURL(googleUrl);
        } else {
            Alert.alert('Error', 'Cannot open Google Maps on this device.');
        }
    };

    const openAppleMaps = async () => {
        const appleUrl = (clinicLat && clinicLng)
            ? `maps://?daddr=${clinicLat},${clinicLng}&dirflg=d`
            : `maps://?daddr=${encodeURIComponent(clinicAddress || hospital)}&dirflg=d`;
        const webFallback = (clinicLat && clinicLng)
            ? `https://maps.apple.com/?daddr=${clinicLat},${clinicLng}&dirflg=d`
            : `https://maps.apple.com/?daddr=${encodeURIComponent(clinicAddress || hospital)}&dirflg=d`;
        const canOpen = await Linking.canOpenURL(appleUrl);
        if (canOpen) {
            await Linking.openURL(appleUrl);
        } else {
            await Linking.openURL(webFallback);
        }
    };

    const openNativeMaps = () => {
        // Skip the directions screen — go straight to live queue tracker
        setStep('live_tracker');
        // Open the real native maps app
        if (Platform.OS === 'ios') {
            void openAppleMaps();
        } else {
            void openGoogleMaps();
        }
    };

    const [step, setStep] = useState<StepType>('leave_now');
    const [patientsAhead, setPatientsAhead] = useState(3);
    const [buzzActive, setBuzzActive] = useState(false);

    // Audio Buzz Notification simulator for Step 5
    useEffect(() => {
        if (step === 'your_turn') {
            setBuzzActive(true);
            // Simulate buzz sound using device vibration if supported
            Vibration.vibrate([0, 500, 150, 500, 150, 500]);
            
            // Visual alert dialog to mimic high-priority sound alarm
            Alert.alert(
                '🔔 MediQ Buzz Notification',
                'BUZZZ! BUZZZ! It is your turn! Please proceed to Room 4 immediately.',
                [{ text: 'Dismiss Buzz', onPress: () => Vibration.cancel() }]
            );
        } else {
            setBuzzActive(false);
            Vibration.cancel();
        }
        return () => Vibration.cancel();
    }, [step]);

    // Handle next simulator steps
    const handleFastForwardQueue = () => {
        if (patientsAhead > 1) {
            setPatientsAhead(prev => prev - 1);
        } else if (patientsAhead === 1) {
            setPatientsAhead(0);
            setStep('your_turn');
        }
    };

    const handleDismiss = () => {
        router.back();
    };

    return (
        <SafeAreaView style={[styles.safeArea, step === 'leave_now' || step === 'your_turn' ? styles.darkThemeBg : styles.lightThemeBg]}>
            {/* Simulation Controller Panel at top (for testing easy transitions) */}
            <View style={styles.simPanel}>
                <Text style={styles.simLabel}>🧪 JOURNEY SIMULATOR:</Text>
                {step === 'leave_now' && (
                    <Pressable style={styles.simBtn} onPress={() => setStep('directions')}>
                        <Text style={styles.simBtnText}>1. Route Map</Text>
                    </Pressable>
                )}
                {step === 'directions' && (
                    <Pressable style={styles.simBtn} onPress={() => setStep('live_tracker')}>
                        <Text style={styles.simBtnText}>2. Reached Hospital 📍</Text>
                    </Pressable>
                )}
                {step === 'live_tracker' && (
                    <Pressable style={styles.simBtn} onPress={() => setStep('checked_in')}>
                        <Text style={styles.simBtnText}>3. Check In</Text>
                    </Pressable>
                )}
                {step === 'checked_in' && (
                    <Pressable style={[styles.simBtn, { backgroundColor: '#ff4d4d' }]} onPress={handleFastForwardQueue}>
                        <Text style={styles.simBtnText}>4. Fast-Forward Queue (Ahead: {patientsAhead}) ⏩</Text>
                    </Pressable>
                )}
                {step === 'your_turn' && (
                    <Pressable style={styles.simBtn} onPress={() => setStep('leave_now')}>
                        <Text style={styles.simBtnText}>Reset Journey</Text>
                    </Pressable>
                )}
            </View>

            {/* SCREEN 1: Time to Leave Now! */}
            {step === 'leave_now' && (
                <View style={styles.flexContainer}>
                    <View style={styles.centerSection}>
                        <View style={styles.pulsingIconOuter}>
                            <View style={styles.pulsingIconInner}>
                                <Ionicons name="location" size={40} color="#008080" />
                            </View>
                        </View>

                        <Text style={styles.darkTitle}>Time to Leave Now!</Text>
                        <Text style={styles.darkSubtitle}>Your appointment is in 45 minutes. Leave now to reach on time.</Text>

                        {/* Travel stats row */}
                        <View style={styles.travelRow}>
                            <View style={styles.travelCard}>
                                <Ionicons name="time-outline" size={24} color="#ffffff" style={{ opacity: 0.8 }} />
                                <Text style={styles.travelVal}>35</Text>
                                <Text style={styles.travelUnit}>min</Text>
                                <Text style={styles.travelLabel}>TRAVEL TIME</Text>
                            </View>

                            <View style={styles.travelCard}>
                                <Ionicons name="swap-horizontal" size={24} color="#ffffff" style={{ opacity: 0.8 }} />
                                <Text style={styles.travelVal}>12.4</Text>
                                <Text style={styles.travelUnit}>km</Text>
                                <Text style={styles.travelLabel}>DISTANCE</Text>
                            </View>
                        </View>

                        {/* Traffic alert card */}
                        <View style={styles.trafficBanner}>
                            <Ionicons name="alert-circle" size={18} color="#8ce6e6" />
                            <Text style={styles.trafficText}>Traffic is moderate on Highway 10</Text>
                        </View>
                    </View>

                    {/* Bottom Actions */}
                    <View style={styles.bottomActions}>
                        <Pressable style={styles.whiteBtn} onPress={openNativeMaps}>
                            <Ionicons name="navigate" size={20} color="#002b40" style={{ marginRight: 8 }} />
                            <Text style={styles.whiteBtnText}>Open Maps</Text>
                        </Pressable>

                        <Pressable style={styles.dismissBtn} onPress={handleDismiss}>
                            <Text style={styles.dismissText}>Dismiss</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* SCREEN 2: Get Directions / Map Route guidance */}
            {step === 'directions' && (
                <View style={styles.flexContainer}>
                    {/* Header */}
                    <View style={styles.lightHeader}>
                        <Pressable onPress={handleDismiss} style={styles.headerBtn}>
                            <Ionicons name="arrow-back" size={24} color="#002b40" />
                        </Pressable>
                        <Text style={styles.lightHeaderTitle}>Get Directions</Text>
                        <Ionicons name="ellipsis-vertical" size={24} color="#002b40" />
                    </View>

                    {/* Map Simulation */}
                    <View style={styles.mapArea}>
                        <View style={styles.mapLineGrid}>
                            <View style={[styles.gridLine, { transform: [{ rotate: '30deg' }], top: 50 }]} />
                            <View style={[styles.gridLine, { transform: [{ rotate: '-45deg' }], top: 120 }]} />
                            <View style={[styles.gridLine, { width: 3, height: '100%', left: '35%' }]} />
                            <View style={[styles.gridLine, { width: '100%', height: 3, top: '45%' }]} />
                        </View>
                        {/* Map Pin Route overlay */}
                        <View style={styles.routePinStart}>
                            <Ionicons name="radio-button-on" size={20} color="#008080" />
                        </View>
                        <View style={styles.routePinEnd}>
                            <Ionicons name="business" size={28} color="#ff4d4d" />
                        </View>
                    </View>

                    {/* Reached destination simulated GPS button */}
                    <Pressable style={styles.arriveSimBtn} onPress={() => setStep('live_tracker')}>
                        <Ionicons name="location-outline" size={18} color="#ffffff" />
                        <Text style={styles.arriveSimText}>Arrived at Hospital? Open Queue Tracker</Text>
                    </Pressable>

                    {/* Bottom Card details overlay */}
                    <View style={styles.directionDetailsCard}>
                        <View style={styles.hospRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.hospName}>{hospital}</Text>
                                <Text style={styles.hospAddress}>450 Medical Plaza, Health District, SF 94115</Text>
                            </View>
                            <View style={styles.hospBadge}>
                                <Text style={styles.hospBadgeText}>OPEN 24H</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        {/* Travel stats */}
                        <View style={styles.statsSplitRow}>
                            <View style={styles.splitCell}>
                                <Text style={styles.splitLabel}>DISTANCE</Text>
                                <Text style={styles.splitVal}>12.4 km</Text>
                            </View>
                            <View style={styles.splitDivider} />
                            <View style={styles.splitCell}>
                                <Text style={styles.splitLabel}>ARRIVAL TIME</Text>
                                <Text style={styles.splitVal}>12:45 PM</Text>
                            </View>
                        </View>

                        {/* Map choices button */}
                        <View style={styles.mapBtnRow}>
                            <Pressable style={styles.outlineMapBtn} onPress={() => void openGoogleMaps()}>
                                <Ionicons name="logo-google" size={18} color="#008080" />
                                <Text style={styles.mapBtnText}>Google Maps</Text>
                            </Pressable>
                            <Pressable style={styles.outlineMapBtn} onPress={() => void openAppleMaps()}>
                                <Ionicons name="map" size={18} color="#008080" />
                                <Text style={styles.mapBtnText}>Apple Maps</Text>
                            </Pressable>
                        </View>

                        {/* Emergency contact row */}
                        <Pressable style={styles.emergencyContactRow} onPress={() => Alert.alert('Call', 'Calling emergency line...')}>
                            <Ionicons name="call" size={18} color="#ff4d4d" />
                            <Text style={styles.emergencyContactText}>Emergency Contact: (555) 012-3456</Text>
                            <Ionicons name="chevron-forward" size={16} color="#6f7f79" style={{ marginLeft: 'auto' }} />
                        </Pressable>
                    </View>
                </View>
            )}

            {/* SCREEN 3: Live Queue Tracker (Reaching clinic) */}
            {step === 'live_tracker' && (
                <View style={styles.flexContainer}>
                    {/* Header */}
                    <View style={styles.lightHeader}>
                        <Pressable onPress={() => setStep('directions')} style={styles.headerBtn}>
                            <Ionicons name="arrow-back" size={24} color="#002b40" />
                        </Pressable>
                        <Text style={styles.lightHeaderTitle}>Live Queue Tracker</Text>
                        <View style={styles.liveTag}>
                            <View style={styles.liveTagPulse} />
                            <Text style={styles.liveTagText}>LIVE</Text>
                        </View>
                    </View>

                    <ScrollView contentContainerStyle={styles.lightScroll} showsVerticalScrollIndicator={false}>
                        {/* Circular ring chart */}
                        <View style={styles.circleContainer}>
                            <View style={styles.circleOuterRing}>
                                <View style={styles.circleInnerContainer}>
                                    <Text style={styles.circleNumber}>{patientsAhead}</Text>
                                    <Text style={styles.circleLabel}>patients ahead</Text>
                                </View>
                            </View>
                            <Text style={styles.lastUpdatedText}>🕒 Last updated 30 sec ago</Text>
                        </View>

                        {/* Tracker detail list cards */}
                        <View style={styles.cardDetailsList}>
                            <View style={styles.detailCardBlock}>
                                <Ionicons name="time-outline" size={22} color="#008080" />
                                <View style={styles.detailCardText}>
                                    <Text style={styles.detailCardLabel}>ESTIMATED WAIT</Text>
                                    <Text style={styles.detailCardVal}>12 min</Text>
                                </View>
                            </View>

                            <View style={styles.detailCardBlock}>
                                <Ionicons name="ticket-outline" size={22} color="#008080" />
                                <View style={styles.detailCardText}>
                                    <Text style={styles.detailCardLabel}>YOUR TOKEN</Text>
                                    <Text style={styles.detailCardVal}>#{tokenNumber}</Text>
                                </View>
                            </View>

                            <View style={styles.detailCardBlock}>
                                <Ionicons name="people-outline" size={22} color="#008080" />
                                <View style={styles.detailCardText}>
                                    <Text style={styles.detailCardLabel}>CURRENT TOKEN</Text>
                                    <Text style={styles.detailCardVal}>#A-139</Text>
                                </View>
                            </View>
                        </View>

                        {/* Waiting room display */}
                        <View style={styles.waitingRoomCard}>
                            <Image 
                                source={{ uri: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400' }} 
                                style={styles.waitingRoomImg} 
                            />
                            <View style={styles.waitingRoomOverlay}>
                                <Text style={styles.waitingRoomTitle}>Waiting Room B</Text>
                                <Text style={styles.waitingRoomDesc}>Please remain in the vicinity for your call.</Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Bottom Check-in button */}
                    <View style={styles.bottomStickyBar}>
                        <Pressable style={styles.tealCheckinBtn} onPress={() => setStep('checked_in')}>
                            <Text style={styles.tealCheckinBtnText}>Check In</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* SCREEN 4: You're Checked In! */}
            {step === 'checked_in' && (
                <View style={styles.flexContainer}>
                    {/* Header */}
                    <View style={styles.lightHeader}>
                        <Pressable onPress={() => setStep('live_tracker')} style={styles.headerBtn}>
                            <Ionicons name="arrow-back" size={24} color="#002b40" />
                        </Pressable>
                        <Text style={styles.lightHeaderTitle}>MediQ</Text>
                        <Ionicons name="ellipsis-vertical" size={24} color="#002b40" />
                    </View>

                    <ScrollView contentContainerStyle={styles.lightScroll} showsVerticalScrollIndicator={false}>
                        {/* Checked in success badge */}
                        <View style={styles.checkedInBadgeSection}>
                            <View style={styles.checkedInGreenCircle}>
                                <Ionicons name="checkmark" size={44} color="#ffffff" />
                            </View>
                            <Text style={styles.checkedInTitle}>You're Checked In!</Text>
                            <Text style={styles.checkedInSubtitle}>Your token is now active in the hospital system.</Text>
                        </View>

                        {/* Large token counter highlight card */}
                        <View style={styles.tokenHighlightCard}>
                            <Text style={styles.tokenHighlightLabel}>QUEUE TOKEN</Text>
                            <Text style={styles.tokenHighlightValue}>{tokenNumber}</Text>
                        </View>

                        {/* Status detail list */}
                        <View style={styles.checkedInStatusCard}>
                            <View style={styles.statusRowItem}>
                                <Ionicons name="people-outline" size={22} color="#008080" />
                                <View style={styles.statusCellText}>
                                    <Text style={styles.statusCellTitle}>Patients Ahead: {patientsAhead}</Text>
                                    <View style={styles.liveTagMini}>
                                        <Text style={styles.liveTagMiniText}>LIVE</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.statusSplitGrid}>
                                <View style={styles.gridCell}>
                                    <Text style={styles.gridCellLabel}>WAIT TIME</Text>
                                    <Text style={styles.gridCellVal}>~{patientsAhead * 6} mins</Text>
                                </View>
                                <View style={styles.gridSplitter} />
                                <View style={styles.gridCell}>
                                    <Text style={styles.gridCellLabel}>DOCTOR</Text>
                                    <Text style={styles.gridCellVal}>{doctorName}</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.notificationNoteRow}>
                                <Ionicons name="information-circle-outline" size={16} color="#008080" />
                                <Text style={styles.notificationNoteText}>You will receive a notification when 1 patient is ahead.</Text>
                            </View>
                        </View>

                        {/* Waiting seat directions */}
                        <View style={styles.waitingRoomCard}>
                            <Image 
                                source={{ uri: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=400' }} 
                                style={styles.waitingRoomImg} 
                            />
                            <View style={styles.waitingRoomOverlay}>
                                <Text style={styles.waitingRoomDesc}>Please remain in the Level 2 waiting area.</Text>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Simulation counting helper */}
                    <View style={styles.simulationControlCard}>
                        <Pressable style={styles.simTriggerBtn} onPress={handleFastForwardQueue}>
                            <Ionicons name="play-forward" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                            <Text style={styles.simTriggerBtnText}>Advance Queue (Simulate turn coming)</Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* SCREEN 5: It's Your Turn! full screen buzz alert */}
            {step === 'your_turn' && (
                <View style={[styles.flexContainer, styles.darkThemeBg, { justifyContent: 'center' }]}>
                    <View style={styles.yourTurnCenter}>
                        {/* pulsing bell icon */}
                        <View style={styles.bellPulseRing}>
                            <View style={styles.bellInnerCircle}>
                                <Ionicons name="notifications" size={60} color="#00cc99" />
                            </View>
                        </View>

                        <Text style={styles.yourTurnTitle}>It's Your Turn!</Text>
                        <Text style={styles.yourTurnSubtitle}>Please proceed to <Text style={styles.boldSubtitleText}>Room 4</Text></Text>

                        {/* Ready status pill */}
                        <View style={styles.readyPill}>
                            <View style={styles.readyIndicatorPulse} />
                            <Text style={styles.readyPillText}>{doctorName} is ready for you</Text>
                        </View>
                    </View>

                    {/* On my way primary action */}
                    <View style={styles.yourTurnBottomBar}>
                        <Pressable style={styles.imOnMyWayBtn} onPress={() => router.replace({
                            pathname: '/hospital-checkin',
                            params: {
                                doctorName: doctorName,
                                tokenNumber: tokenNumber,
                                hospital: hospital,
                            }
                        })}>
                            <Text style={styles.imOnMyWayText}>I'm On My Way 🏃</Text>
                        </Pressable>
                        {/* MediQ footer removed */}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    darkThemeBg: {
        backgroundColor: '#001a2c',
    },
    lightThemeBg: {
        backgroundColor: '#ffffff',
    },
    flexContainer: {
        flex: 1,
    },
    simPanel: {
        backgroundColor: '#002b40',
        paddingVertical: 10,
        paddingHorizontal: 15,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#008080',
        zIndex: 99,
        marginTop:40,
    },
    simLabel: {
        color: '#8ce6e6',
        fontSize: 10,
        fontWeight: '800',
    },
    simBtn: {
        backgroundColor: '#008080',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    simBtnText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: '700',
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 25,
    },
    pulsingIconOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(0, 128, 128, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
    },
    pulsingIconInner: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    darkTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 10,
    },
    darkSubtitle: {
        fontSize: 14,
        color: '#a3b5bc',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 35,
        paddingHorizontal: 10,
    },
    travelRow: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
        justifyContent: 'space-between',
    },
    travelCard: {
        flex: 1,
        backgroundColor: '#002b40',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#008080',
        padding: 20,
        alignItems: 'center',
    },
    travelVal: {
        fontSize: 28,
        fontWeight: '900',
        color: '#ffffff',
        marginTop: 10,
    },
    travelUnit: {
        fontSize: 14,
        color: '#8ce6e6',
        fontWeight: '800',
        marginTop: 2,
    },
    travelLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#a3b5bc',
        letterSpacing: 0.5,
        marginTop: 8,
    },
    trafficBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 128, 128, 0.2)',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginTop: 25,
        gap: 8,
    },
    trafficText: {
        color: '#8ce6e6',
        fontSize: 12,
        fontWeight: '700',
    },
    bottomActions: {
        padding: 25,
        gap: 15,
    },
    whiteBtn: {
        backgroundColor: '#ffffff',
        height: 52,
        borderRadius: 26,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    whiteBtnText: {
        color: '#002b40',
        fontWeight: '800',
        fontSize: 16,
    },
    dismissBtn: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dismissText: {
        color: '#6f7f79',
        fontSize: 14,
        fontWeight: '700',
    },
    lightHeader: {
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
    },
    lightHeaderTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#002b40',
    },
    mapArea: {
        flex: 1,
        backgroundColor: '#e0ecee',
        position: 'relative',
    },
    mapLineGrid: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    gridLine: {
        position: 'absolute',
        backgroundColor: '#cce0e3',
        width: '120%',
        height: 2,
    },
    routePinStart: {
        position: 'absolute',
        left: '20%',
        bottom: '25%',
    },
    routePinEnd: {
        position: 'absolute',
        right: '25%',
        top: '25%',
    },
    arriveSimBtn: {
        position: 'absolute',
        top: 70,
        alignSelf: 'center',
        backgroundColor: '#ff4d4d',
        borderRadius: 16,
        paddingHorizontal: 15,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        zIndex: 5,
    },
    arriveSimText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '700',
    },
    directionDetailsCard: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4,
    },
    hospRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    hospName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#002b40',
    },
    hospAddress: {
        fontSize: 12,
        color: '#6f7f79',
        marginTop: 4,
    },
    hospBadge: {
        backgroundColor: '#e3f3f5',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    hospBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#008080',
    },
    divider: {
        height: 1,
        backgroundColor: '#e8f2f4',
        marginVertical: 15,
    },
    statsSplitRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    splitCell: {
        flex: 1,
        alignItems: 'center',
    },
    splitDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#e8f2f4',
    },
    splitLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#a3b5bc',
        letterSpacing: 0.5,
    },
    splitVal: {
        fontSize: 14,
        fontWeight: '800',
        color: '#008080',
        marginTop: 4,
    },
    mapBtnRow: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 15,
    },
    outlineMapBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: '#008080',
    },
    mapBtnText: {
        color: '#008080',
        fontSize: 13,
        fontWeight: '700',
    },
    emergencyContactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 15,
        backgroundColor: '#f6fafb',
        borderRadius: 12,
        padding: 10,
    },
    emergencyContactText: {
        fontSize: 11,
        color: '#6f7f79',
        fontWeight: '600',
    },
    liveTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 204, 153, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    liveTagPulse: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#00cc99',
    },
    liveTagText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#00cc99',
    },
    lightScroll: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 100,
    },
    circleContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    circleOuterRing: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 8,
        borderColor: '#008080',
        alignItems: 'center',
        justifyContent: 'center',
    },
    circleInnerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    circleNumber: {
        fontSize: 44,
        fontWeight: '900',
        color: '#002b40',
    },
    circleLabel: {
        fontSize: 12,
        color: '#6f7f79',
        fontWeight: '600',
        marginTop: 2,
    },
    lastUpdatedText: {
        fontSize: 11,
        color: '#6f7f79',
        fontWeight: '600',
        marginTop: 15,
    },
    cardDetailsList: {
        gap: 12,
        marginTop: 10,
    },
    detailCardBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 16,
        padding: 16,
        gap: 15,
    },
    detailCardText: {
        flex: 1,
    },
    detailCardLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#a3b5bc',
        letterSpacing: 0.5,
    },
    detailCardVal: {
        fontSize: 15,
        fontWeight: '800',
        color: '#002b40',
        marginTop: 3,
    },
    waitingRoomCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 20,
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        position: 'relative',
    },
    waitingRoomImg: {
        height: 140,
        width: '100%',
        opacity: 0.8,
    },
    waitingRoomOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 43, 64, 0.8)',
        padding: 15,
    },
    waitingRoomTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#ffffff',
    },
    waitingRoomDesc: {
        fontSize: 11,
        color: '#8ce6e6',
        fontWeight: '700',
        marginTop: 2,
    },
    bottomStickyBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f5f4',
    },
    tealCheckinBtn: {
        backgroundColor: '#008080',
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tealCheckinBtnText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16,
    },
    checkedInBadgeSection: {
        alignItems: 'center',
        marginVertical: 15,
    },
    checkedInGreenCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#00cc99',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkedInTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#002b40',
        marginTop: 15,
    },
    checkedInSubtitle: {
        fontSize: 13,
        color: '#6f7f79',
        marginTop: 6,
        textAlign: 'center',
        paddingHorizontal: 15,
    },
    tokenHighlightCard: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tokenHighlightLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#a3b5bc',
        letterSpacing: 0.5,
    },
    tokenHighlightValue: {
        fontSize: 36,
        fontWeight: '900',
        color: '#008080',
        marginTop: 5,
    },
    checkedInStatusCard: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 20,
        padding: 16,
        marginTop: 20,
    },
    statusRowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusCellText: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusCellTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#002b40',
    },
    liveTagMini: {
        backgroundColor: '#e3f3f5',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    liveTagMiniText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#008080',
    },
    statusSplitGrid: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridCell: {
        flex: 1,
        alignItems: 'center',
    },
    gridSplitter: {
        width: 1,
        height: 35,
        backgroundColor: '#e8f2f4',
    },
    gridCellLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#a3b5bc',
    },
    gridCellVal: {
        fontSize: 13,
        fontWeight: '800',
        color: '#002b40',
        marginTop: 4,
    },
    notificationNoteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 12,
        padding: 10,
    },
    notificationNoteText: {
        fontSize: 11,
        color: '#6f7f79',
        fontWeight: '600',
    },
    simulationControlCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#001a2c',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#008080',
    },
    simTriggerBtn: {
        backgroundColor: '#ff4d4d',
        height: 48,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    simTriggerBtnText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '800',
    },
    yourTurnCenter: {
        alignItems: 'center',
        paddingHorizontal: 25,
    },
    bellPulseRing: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(0, 204, 153, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    bellInnerCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#002b40',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#00cc99',
    },
    yourTurnTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#ffffff',
        textAlign: 'center',
    },
    yourTurnSubtitle: {
        fontSize: 16,
        color: '#a3b5bc',
        textAlign: 'center',
        marginTop: 8,
    },
    boldSubtitleText: {
        color: '#00cc99',
        fontWeight: '900',
    },
    readyPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 204, 153, 0.15)',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        marginTop: 25,
        gap: 8,
    },
    readyIndicatorPulse: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00cc99',
    },
    readyPillText: {
        color: '#00cc99',
        fontSize: 13,
        fontWeight: '800',
    },
    yourTurnBottomBar: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        alignItems: 'center',
        gap: 15,
    },
    imOnMyWayBtn: {
        width: '100%',
        backgroundColor: '#008080',
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imOnMyWayText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16,
    },
    assistantFooter: {
        fontSize: 11,
        color: '#6f7f79',
        fontWeight: '600',
    },
});
