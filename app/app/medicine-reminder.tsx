import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, Platform, Vibration, Image, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function MedicineReminderScreen() {
    const params = useLocalSearchParams();
    const medName = (params.medName as string) || 'Metformin Hydrochloride';

    // Trigger high-priority buzzer vibration and alarm description alert on load
    useEffect(() => {
        // High-intensity repeating vibration pattern
        Vibration.vibrate([0, 500, 200, 500, 200, 500], true);

        // Buzz pop-up sound description
        Alert.alert(
            '🔔 Pill Alarm: BUZZZ!',
            `Time to take your medicine: ${medName}. Take 1 Tablet now!`,
            [{ text: 'Dismiss Alarm', onPress: () => Vibration.cancel() }]
        );

        return () => Vibration.cancel();
    }, [medName]);

    const handleAction = (type: 'taken' | 'snooze' | 'skip') => {
        Vibration.cancel();
        if (type === 'taken') {
            Alert.alert('Success', 'Medicine marked as taken successfully.');
        } else if (type === 'snooze') {
            Alert.alert('Snoozed', 'Reminder snoozed for 15 minutes.');
        }
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}


            <View style={styles.content}>
                {/* Pill Symbol */}
                <View style={styles.pillIconCircle}>
                    <MaterialCommunityIcons name={"capsule" as any} size={44} color="#ffffff" />
                </View>

                {/* Alarm Text */}
                <Text style={styles.alarmTitle}>Time for Your Medicine</Text>
                <Text style={styles.medName}>{medName}</Text>
                <Text style={styles.medDose}>500mg • 1 Tablet</Text>
                <Text style={styles.scheduleText}>Scheduled for 08:30 AM</Text>

                {/* Alarm Buttons */}
                <View style={styles.btnGroup}>
                    <Pressable style={styles.takenBtn} onPress={() => handleAction('taken')}>
                        <Text style={styles.takenBtnText}>Mark as Taken</Text>
                    </Pressable>

                    <Pressable style={styles.snoozeBtn} onPress={() => handleAction('snooze')}>
                        <Text style={styles.snoozeBtnText}>Snooze 15 min</Text>
                    </Pressable>

                    <Pressable style={styles.skipBtn} onPress={() => handleAction('skip')}>
                        <Text style={styles.skipText}>Skip this dose</Text>
                    </Pressable>
                </View>

                {/* Premium pill tablet illustration card */}
                <View style={styles.tabletIllustration}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&q=80&w=400' }}
                        style={styles.tabletImg}
                        resizeMode="cover"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#001a2c',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#001a2c',
    },
    headerBtn: {
        padding: 5,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 25,
        justifyContent: 'center',
        paddingBottom: 20,
    },
    pillIconCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#008080',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#008080',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    alarmTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#ffffff',
        marginTop: 25,
        textAlign: 'center',
    },
    medName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#00cc99',
        marginTop: 10,
        textAlign: 'center',
    },
    medDose: {
        fontSize: 14,
        color: '#a3b5bc',
        fontWeight: '600',
        marginTop: 4,
    },
    scheduleText: {
        fontSize: 12,
        color: '#6f7f79',
        fontWeight: '700',
        marginTop: 8,
    },
    btnGroup: {
        width: '100%',
        marginTop: 35,
        gap: 15,
        alignItems: 'center',
    },
    takenBtn: {
        width: '100%',
        backgroundColor: '#008080',
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    takenBtnText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16,
    },
    snoozeBtn: {
        width: '100%',
        borderWidth: 1.5,
        borderColor: '#008080',
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    snoozeBtnText: {
        color: '#00cc99',
        fontWeight: '800',
        fontSize: 16,
    },
    skipBtn: {
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipText: {
        color: '#6f7f79',
        fontSize: 13,
        fontWeight: '700',
    },
    tabletIllustration: {
        width: '100%',
        height: 120,
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 30,
        borderWidth: 1,
        borderColor: '#008080',
    },
    tabletImg: {
        width: '100%',
        height: '100%',
        opacity: 0.7,
    },
});
