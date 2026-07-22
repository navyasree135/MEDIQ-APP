import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

interface DynamicDateItem {
    id: number;
    month: string;
    dayNum: string;
    dayName: string;
    fullDateStr: string;
}

const generate30DaysCalendar = (): DynamicDateItem[] => {
    const dates: DynamicDateItem[] = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);

        const monthStr = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        const dayNum = String(d.getDate());
        const dayNameShort = d.toLocaleDateString('en-US', { weekday: 'short' });
        const dayName = i === 0 ? 'Today' : dayNameShort;
        const fullDateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        dates.push({
            id: i + 1,
            month: monthStr,
            dayNum: dayNum,
            dayName: dayName,
            fullDateStr: fullDateStr,
        });
    }
    return dates;
};

export default function SelectSlotScreen() {
    const params = useLocalSearchParams();
    const doctorName = (params.doctorName as string) || 'Dr. Julian Thorne';
    const doctorId = (params.doctorId as string) || '';
    const hospital = (params.hospital as string) || '';
    const clinicAddress = (params.clinicAddress as string) || '';
    const clinicLat = (params.clinicLat as string) || '';
    const clinicLng = (params.clinicLng as string) || '';

    const datesList = useMemo(() => generate30DaysCalendar(), []);
    const [selectedDate, setSelectedDate] = useState(1);
    const [selectedSlot, setSelectedSlot] = useState('09:30 AM');

    const morningSlots = [
        { time: '09:00 AM', status: 'available' },
        { time: '09:30 AM', status: 'available' },
        { time: '10:00 AM', status: 'taken' },
        { time: '10:30 AM', status: 'available' },
        { time: '11:00 AM', status: 'available' },
        { time: '11:30 AM', status: 'available' }
    ];

    const afternoonSlots = [
        { time: '01:00 PM', status: 'available' },
        { time: '01:30 PM', status: 'available' },
        { time: '02:00 PM', status: 'available' },
        { time: '02:30 PM', status: 'taken' },
        { time: '03:00 PM', status: 'available' },
        { time: '03:30 PM', status: 'available' }
    ];

    const eveningSlots = [
        { time: '05:00 PM', status: 'available' },
        { time: '05:30 PM', status: 'available' },
        { time: '06:00 PM', status: 'available' }
    ];

    const handleConfirmSlot = () => {
        const selectedDateObj = datesList.find(d => d.id === selectedDate) || datesList[0];
        const dateStr = selectedDateObj.fullDateStr;

        router.push({
            pathname: '/appointment-summary',
            params: {
                doctorName: doctorName,
                doctorId: doctorId,
                hospital: hospital,
                clinicAddress: clinicAddress,
                clinicLat: clinicLat,
                clinicLng: clinicLng,
                date: dateStr,
                time: selectedSlot,
            }
        });
    };

    const renderSlotItem = (item: { time: string; status: string }) => {
        const isTaken = item.status === 'taken';
        const isSelected = selectedSlot === item.time;

        return (
            <Pressable
                key={item.time}
                disabled={isTaken}
                style={[
                    styles.slotBtn,
                    isSelected && styles.slotBtnSelected,
                    isTaken && styles.slotBtnTaken
                ]}
                onPress={() => setSelectedSlot(item.time)}
            >
                <Text
                    style={[
                        styles.slotText,
                        isSelected && styles.slotTextSelected,
                        isTaken && styles.slotTextTaken
                    ]}
                >
                    {item.time}
                </Text>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color="#ffffff" />
                </Pressable>
                <Text style={styles.headerTitle}>Select Appointment Slot</Text>
                <View style={{ width: 20 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Horizontal Date List */}
                <View style={styles.dateCarousel}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
                        {datesList.map((date) => {
                            const isSelected = selectedDate === date.id;
                            return (
                                <Pressable
                                    key={date.id}
                                    style={[
                                        styles.dateCircle,
                                        isSelected ? styles.dateCircleSelected : styles.dateCircleDefault
                                    ]}
                                    onPress={() => setSelectedDate(date.id)}
                                >
                                    <Text style={[styles.dateMonth, isSelected ? styles.dateMonthSelected : styles.dateMonthDefault]}>
                                        {date.month}
                                    </Text>
                                    <Text style={[styles.dateDayNum, isSelected ? styles.dateDayNumSelected : styles.dateDayNumDefault]}>
                                        {date.dayNum}
                                    </Text>
                                    <Text style={[styles.dateDayName, isSelected ? styles.dateDayNameSelected : styles.dateDayNameDefault]}>
                                        {date.dayName}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* MORNING SLOTS */}
                <View style={styles.slotsSection}>
                    <Text style={styles.sectionHeader}>MORNING SLOTS</Text>
                    <View style={styles.slotsGrid}>
                        {morningSlots.map(renderSlotItem)}
                    </View>
                </View>

                {/* AFTERNOON SLOTS */}
                <View style={styles.slotsSection}>
                    <Text style={styles.sectionHeader}>AFTERNOON SLOTS</Text>
                    <View style={styles.slotsGrid}>
                        {afternoonSlots.map(renderSlotItem)}
                    </View>
                </View>

                {/* EVENING SLOTS */}
                <View style={styles.slotsSection}>
                    <Text style={styles.sectionHeader}>EVENING SLOTS</Text>
                    <View style={styles.slotsGrid}>
                        {eveningSlots.map(renderSlotItem)}
                    </View>
                </View>

                {/* MEDIQ INTELLIGENCE AI RATIONALE CARD */}
                <View style={styles.aiIntelligenceCard}>
                    <View style={styles.aiIconCircle}>
                        <Ionicons name="sparkles" size={20} color="#008080" />
                    </View>
                    <View style={styles.aiTextContainer}>
                        <Text style={styles.aiTitle}>MEDIQ INTELLIGENCE</Text>
                        <Text style={styles.aiBody}>
                            Based on your history, morning slots are recommended to avoid higher clinic traffic observed between 2 PM - 4 PM today.
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Confirm Slot bottom sticky button */}
            <View style={styles.bottomBar}>
                <Pressable style={styles.confirmBtn} onPress={handleConfirmSlot}>
                    <Text style={styles.confirmText}>Confirm Slot</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
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
        marginTop: 33,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 30,
        marginRight: 60
    },
    scrollContent: {
        paddingBottom: 110,
    },
    dateCarousel: {
        paddingVertical: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f5f4',
    },
    dateScroll: {
        paddingHorizontal: 20,
        gap: 15,
    },
    dateCircle: {
        width: 76,
        height: 76,
        borderRadius: 38,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateCircleDefault: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    dateCircleSelected: {
        backgroundColor: '#008080',
        borderWidth: 2,
        borderColor: '#008080',
    },
    dateMonth: {
        fontSize: 10,
        fontWeight: '700',
    },
    dateMonthDefault: {
        color: '#6f7f79',
    },
    dateMonthSelected: {
        color: '#8ce6e6',
    },
    dateDayNum: {
        fontSize: 20,
        fontWeight: '800',
        marginTop: 2,
    },
    dateDayNumDefault: {
        color: '#002b40',
    },
    dateDayNumSelected: {
        color: '#ffffff',
    },
    dateDayName: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    dateDayNameDefault: {
        color: '#6f7f79',
    },
    dateDayNameSelected: {
        color: '#ffffff',
    },
    slotsSection: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6f7f79',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    slotBtn: {
        width: '31%',
        height: 46,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#e8f2f4',
    },
    slotBtnSelected: {
        backgroundColor: '#008080',
        borderColor: '#008080',
    },
    slotBtnTaken: {
        backgroundColor: '#f5fafb',
        borderColor: '#e8f2f4',
        borderStyle: 'dashed',
    },
    slotText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#002b40',
    },
    slotTextSelected: {
        color: '#ffffff',
    },
    slotTextTaken: {
        color: '#a3b5bc',
        textDecorationLine: 'line-through',
    },
    aiIntelligenceCard: {
        backgroundColor: '#f6fafb',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e8f2f4',
        marginHorizontal: 20,
        marginTop: 30,
        flexDirection: 'row',
        gap: 12,
    },
    aiIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e3f3f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiTextContainer: {
        flex: 1,
    },
    aiTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: '#008080',
        letterSpacing: 0.5,
    },
    aiBody: {
        fontSize: 12,
        color: '#6f7f79',
        lineHeight: 18,
        fontWeight: '500',
        marginTop: 4,
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
    confirmBtn: {
        backgroundColor: '#008080',
        height: 52,
        borderRadius: 26,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16,
    },
});
