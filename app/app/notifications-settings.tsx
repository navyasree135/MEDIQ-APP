import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    Pressable,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function NotificationsSettingsScreen() {
    const [appointmentReminders, setAppointmentReminders] = useState(true);
    const [medicineReminders, setMedicineReminders] = useState(true);
    const [queueUpdates, setQueueUpdates] = useState(true);
    const [travelAlerts, setTravelAlerts] = useState(false);
    const [followUpReminders, setFollowUpReminders] = useState(true);
    const [promotionalNotifications, setPromotionalNotifications] = useState(false);

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#002b40" />
                </Pressable>
                <Text style={styles.headerTitle}>Notifications</Text>
                <Pressable style={styles.menuButton}>
                    <Ionicons name="notifications-outline" size={22} color="#002b40" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.headerDescription}>
                    Manage how you receive alerts and communications from the MediQ platform.
                </Text>

                {/* Toggles Container */}
                <View style={styles.togglesCard}>
                    {/* Item 1 */}
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleTitle}>Appointment Reminders</Text>
                            <Text style={styles.toggleSubtitle}>Receive alerts for your upcoming doctor visits and clinical tests.</Text>
                        </View>
                        <Switch
                            value={appointmentReminders}
                            onValueChange={setAppointmentReminders}
                            trackColor={{ false: '#e2e8f0', true: '#008080' }}
                            thumbColor={appointmentReminders ? '#ffffff' : '#f4f4f5'}
                        />
                    </View>

                    {/* Item 2 */}
                    <View style={[styles.toggleRow, styles.borderTop]}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleTitle}>Medicine Reminders</Text>
                            <Text style={styles.toggleSubtitle}>Timed notifications to help you stay on track with your prescriptions.</Text>
                        </View>
                        <Switch
                            value={medicineReminders}
                            onValueChange={setMedicineReminders}
                            trackColor={{ false: '#e2e8f0', true: '#008080' }}
                            thumbColor={medicineReminders ? '#ffffff' : '#f4f4f5'}
                        />
                    </View>

                    {/* Item 3 */}
                    <View style={[styles.toggleRow, styles.borderTop]}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleTitle}>Queue Updates</Text>
                            <Text style={styles.toggleSubtitle}>Real-time alerts regarding your current position in the clinic queue.</Text>
                        </View>
                        <Switch
                            value={queueUpdates}
                            onValueChange={setQueueUpdates}
                            trackColor={{ false: '#e2e8f0', true: '#008080' }}
                            thumbColor={queueUpdates ? '#ffffff' : '#f4f4f5'}
                        />
                    </View>

                    {/* Item 4 */}
                    <View style={[styles.toggleRow, styles.borderTop]}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleTitle}>Travel Alerts</Text>
                            <Text style={styles.toggleSubtitle}>Notifications about health advisories or clinic closures in your area.</Text>
                        </View>
                        <Switch
                            value={travelAlerts}
                            onValueChange={setTravelAlerts}
                            trackColor={{ false: '#e2e8f0', true: '#008080' }}
                            thumbColor={travelAlerts ? '#ffffff' : '#f4f4f5'}
                        />
                    </View>

                    {/* Item 5 */}
                    <View style={[styles.toggleRow, styles.borderTop]}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleTitle}>Follow-up Reminders</Text>
                            <Text style={styles.toggleSubtitle}>Automatic prompts for post-treatment checkups and lab results.</Text>
                        </View>
                        <Switch
                            value={followUpReminders}
                            onValueChange={setFollowUpReminders}
                            trackColor={{ false: '#e2e8f0', true: '#008080' }}
                            thumbColor={followUpReminders ? '#ffffff' : '#f4f4f5'}
                        />
                    </View>

                    {/* Item 6 */}
                    <View style={[styles.toggleRow, styles.borderTop]}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.toggleTitle}>Promotional Notifications</Text>
                            <Text style={styles.toggleSubtitle}>Updates on new services, health packages, and wellness insights.</Text>
                        </View>
                        <Switch
                            value={promotionalNotifications}
                            onValueChange={setPromotionalNotifications}
                            trackColor={{ false: '#e2e8f0', true: '#008080' }}
                            thumbColor={promotionalNotifications ? '#ffffff' : '#f4f4f5'}
                        />
                    </View>
                </View>

                {/* AI Assistant Tip */}
                <View style={styles.tipCard}>
                    <View style={styles.tipHeader}>
                        <Ionicons name="medical" size={18} color="#008080" />
                        <Text style={styles.tipTitle}>AI Assistant Tip</Text>
                    </View>
                    <Text style={styles.tipText}>
                        Keeping 'Appointment Reminders' active can reduce missed consultations by up to 34%.
                    </Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderColor: '#f1f5f9',
    },
    backButton: {
        padding: 4,
        marginTop: 25,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#002b40',
        marginTop: 25,
        marginRight: 110,
    },
    menuButton: {
        padding: 4,
        marginTop: 25,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 40,
    },
    headerDescription: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 20,
    },
    togglesCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2.22,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    borderTop: {
        borderTopWidth: 1,
        borderColor: '#f1f5f9',
    },
    toggleInfo: {
        flex: 1,
        marginRight: 16,
    },
    toggleTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 4,
    },
    toggleSubtitle: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 16,
    },
    tipCard: {
        backgroundColor: '#e6f7f7',
        borderWidth: 1,
        borderColor: '#bbf0f3',
        borderRadius: 16,
        padding: 16,
        marginTop: 20,
        flexDirection: 'column',
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
    },
    tipTitle: {
        color: '#008080',
        fontSize: 14,
        fontWeight: '700',
    },
    tipText: {
        color: '#2a5a5d',
        fontSize: 13,
        lineHeight: 18,
    },
});
