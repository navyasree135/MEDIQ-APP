import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, Switch, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function MedicineViewScreen() {
    const params = useLocalSearchParams();
    const medicineName = (params.medicineName as string) || 'Amoxicillin';
    const dosage = (params.dosage as string) || '500 mg';
    const frequency = (params.frequency as string) || '3x Daily';
    const duration = (params.duration as string) || '7 Days';
    const remaining = (params.remaining as string) || '12 Pills';
    const instructionText = (params.instructionText as string) || 'Take one capsule by mouth every 8 hours. Finish the entire course of medication even if you feel better.';

    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [sideEffectsExpanded, setSideEffectsExpanded] = useState(false);

    const handleKeepAsDone = () => {
        // Return back to Home and cue the medicine buzz alarm alert in 2.5 seconds
        router.replace({
            pathname: '/(tabs)',
            params: {
                triggerPillAlert: 'true',
                medName: medicineName,
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
                <Text style={styles.headerTitle}>{medicineName}</Text>
                <Pressable style={styles.headerBtn}>
                    <Ionicons name="ellipsis-vertical" size={24} color="#ffffff" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Pill Graphic Illustration */}
                <View style={styles.pillArtContainer}>
                    <View style={styles.pillCirclePulse}>
                        <View style={styles.pillArtRow}>
                            <View style={[styles.pillArtCap, { backgroundColor: '#008080' }]} />
                            <View style={[styles.pillArtCap, { backgroundColor: '#00cc99' }]} />
                        </View>
                    </View>
                </View>

                {/* Details Grid */}
                <View style={styles.metricsGrid}>
                    <View style={styles.gridCell}>
                        <Text style={styles.cellLabel}>DOSAGE</Text>
                        <Text style={styles.cellVal}>{dosage}</Text>
                    </View>
                    <View style={styles.gridCell}>
                        <Text style={styles.cellLabel}>FREQUENCY</Text>
                        <Text style={styles.cellVal}>{frequency}</Text>
                    </View>
                    <View style={styles.gridCell}>
                        <Text style={styles.cellLabel}>DURATION</Text>
                        <Text style={styles.cellVal}>{duration}</Text>
                    </View>
                    <View style={styles.gridCell}>
                        <Text style={styles.cellLabel}>REMAINING</Text>
                        <Text style={styles.cellVal}>{remaining}</Text>
                    </View>
                </View>

                {/* Instructions section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>INSTRUCTIONS</Text>
                    <View style={styles.instructionsCard}>
                        <Text style={styles.instructionsBody}>{instructionText}</Text>
                    </View>
                </View>

                {/* Reminder Schedule */}
                <View style={styles.section}>
                    <View style={styles.reminderRowHeader}>
                        <Text style={styles.sectionTitle}>REMINDER TIMES</Text>
                        <Switch
                            value={reminderEnabled}
                            onValueChange={setReminderEnabled}
                            trackColor={{ false: '#e8f2f4', true: '#00cc99' }}
                            thumbColor={Platform.OS === 'ios' ? undefined : '#ffffff'}
                        />
                    </View>
                    
                    {reminderEnabled && (
                        <View style={styles.timesContainer}>
                            <View style={styles.timeItem}>
                                <Ionicons name="time-outline" size={18} color="#008080" />
                                <Text style={styles.timeText}>08:00 AM</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.timeItem}>
                                <Ionicons name="time-outline" size={18} color="#008080" />
                                <Text style={styles.timeText}>02:00 PM</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.timeItem}>
                                <Ionicons name="time-outline" size={18} color="#008080" />
                                <Text style={styles.timeText}>10:00 PM</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Side Effects Accordion Dropdown */}
                <View style={styles.section}>
                    <Pressable 
                        style={styles.accordionHeader} 
                        onPress={() => setSideEffectsExpanded(!sideEffectsExpanded)}
                    >
                        <Text style={styles.accordionTitle}>SIDE EFFECTS</Text>
                        <Ionicons 
                            name={sideEffectsExpanded ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color="#002b40" 
                        />
                    </Pressable>

                    {sideEffectsExpanded && (
                        <View style={styles.accordionBody}>
                            <Text style={styles.sideEffectsText}>
                                Common side effects include mild nausea, temporary diarrhea, stomach upset, or minor headache. 
                                Take with food to mitigate stomach symptoms. Contact your consultant if rash or severe reactions occur.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom sticky action button */}
            <View style={styles.bottomStickyBar}>
                <Pressable style={styles.primaryCheckBtn} onPress={handleKeepAsDone}>
                    <Text style={styles.primaryCheckBtnText}>Keep as Done</Text>
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
        marginRight: 80,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 110,
    },
    pillArtContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    pillCirclePulse: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pillArtRow: {
        flexDirection: 'row',
        transform: [{ rotate: '-45deg' }],
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    pillArtCap: {
        width: 25,
        height: 50,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 10,
    },
    gridCell: {
        width: '48%',
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 16,
        padding: 16,
    },
    cellLabel: {
        fontSize: 9,
        fontWeight: '800',
        color: '#a3b5bc',
        letterSpacing: 0.5,
    },
    cellVal: {
        fontSize: 15,
        fontWeight: '800',
        color: '#002b40',
        marginTop: 4,
    },
    section: {
        marginTop: 25,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#a3b5bc',
        letterSpacing: 0.5,
        marginBottom: 10,
    },
    instructionsCard: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 16,
        padding: 16,
    },
    instructionsBody: {
        fontSize: 13,
        color: '#6f7f79',
        lineHeight: 18,
        fontWeight: '600',
    },
    reminderRowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timesContainer: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 16,
        paddingHorizontal: 16,
        marginTop: 5,
    },
    timeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 10,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#002b40',
    },
    divider: {
        height: 1,
        backgroundColor: '#e8f2f4',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e8f2f4',
    },
    accordionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#002b40',
        letterSpacing: 0.5,
    },
    accordionBody: {
        backgroundColor: '#f6fafb',
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    sideEffectsText: {
        fontSize: 12,
        color: '#6f7f79',
        lineHeight: 18,
        fontWeight: '600',
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
        paddingBottom: Platform.OS === 'ios' ? 25 : 20,
    },
    primaryCheckBtn: {
        backgroundColor: '#008080',
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryCheckBtnText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16,
    },
});
