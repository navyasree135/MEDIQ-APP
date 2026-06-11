import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function HelpSupportScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // first item expanded by default

    const faqItems = [
        {
            question: "How do I view my test results?",
            answer: "You can view your results in the 'Records' or 'Recent Reports' tab. Once your practitioner releases them, you'll receive a notification and a summary will appear at the top of your dashboard."
        },
        {
            question: "Booking a specialist appointment",
            answer: "Tap 'Check Symptoms with AI' or go to 'Recommended Doctors' to choose a specialized cardiologist, dermatologist or GP. Select a convenient time slot and complete check-out."
        },
        {
            question: "Updating insurance information",
            answer: "Go to your Profile tab, click 'Insurance Details', and upload a picture of your health card or enter details manually. Our admin team will verify it in minutes."
        }
    ];

    const toggleExpand = (index: number) => {
        if (expandedIndex === index) {
            setExpandedIndex(null);
        } else {
            setExpandedIndex(index);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#002b40" />
                </Pressable>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <Pressable style={styles.menuButton} onPress={() => router.push('/rate-experience')}>
                    <Ionicons name="star-outline" size={22} color="#002b40" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search for help"
                        placeholderTextColor="#94a3b8"
                    />
                </View>

                {/* Live Chat Banner */}
                <View style={styles.liveChatBanner}>
                    <View style={styles.liveChatHeader}>
                        <Text style={styles.liveChatTitle}>Live Chat</Text>
                        <Text style={styles.liveChatStatus}>• Online with agent</Text>
                    </View>
                    <Pressable 
                        style={({ pressed }) => [
                            styles.chatBtn,
                            pressed && styles.btnPressed
                        ]}
                        onPress={() => router.push('/(tabs)/chat')}
                    >
                        <Text style={styles.chatBtnText}>Start Now</Text>
                    </Pressable>
                </View>

                {/* FAQ Section */}
                <View style={styles.faqSection}>
                    <View style={styles.faqHeader}>
                        <Text style={styles.sectionTitle}>Common Questions</Text>
                        <Pressable>
                            <Text style={styles.viewAllText}>View all</Text>
                        </Pressable>
                    </View>

                    {faqItems.map((item, idx) => {
                        const isExpanded = expandedIndex === idx;
                        return (
                            <View key={idx} style={styles.faqCard}>
                                <Pressable style={styles.faqQuestionRow} onPress={() => toggleExpand(idx)}>
                                    <Text style={styles.faqQuestion}>{item.question}</Text>
                                    <Ionicons 
                                        name={isExpanded ? "chevron-up" : "chevron-forward"} 
                                        size={20} 
                                        color="#64748b" 
                                    />
                                </Pressable>
                                {isExpanded && (
                                    <View style={styles.faqAnswerContainer}>
                                        <Text style={styles.faqAnswer}>{item.answer}</Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Still Need Help Section */}
                <View style={styles.stillNeedHelpCard}>
                    <View style={styles.supportHeader}>
                        <View style={styles.supportIconBg}>
                            <Ionicons name="headset-outline" size={24} color="#008080" />
                        </View>
                        <View style={styles.supportHeaderText}>
                            <Text style={styles.supportTitle}>Still need help?</Text>
                            <Text style={styles.supportSubtitle}>Our team is available 24/7</Text>
                        </View>
                    </View>

                    <View style={styles.supportBtnContainer}>
                        <Pressable 
                            style={({ pressed }) => [
                                styles.supportChatBtn,
                                pressed && styles.btnPressed
                            ]}
                            onPress={() => router.push('/(tabs)/chat')}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={18} color="#ffffff" style={styles.btnIcon} />
                            <Text style={styles.supportChatBtnText}>Chat with Us</Text>
                        </Pressable>

                        <Pressable 
                            style={({ pressed }) => [
                                styles.supportCallBtn,
                                pressed && styles.btnPressed
                            ]}
                        >
                            <Ionicons name="call-outline" size={18} color="#008080" style={styles.btnIcon} />
                            <Text style={styles.supportCallBtnText}>Call Support</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Feedback Rate Us Trigger */}
                <Pressable 
                    style={({ pressed }) => [
                        styles.rateUsCard,
                        pressed && styles.btnPressed
                    ]}
                    onPress={() => router.push('/rate-experience')}
                >
                    <View style={styles.rateUsInfo}>
                        <Ionicons name="star" size={22} color="#f59e0b" />
                        <View style={styles.rateUsTextContainer}>
                            <Text style={styles.rateUsTitle}>Rate Your Experience</Text>
                            <Text style={styles.rateUsSubtitle}>Help us improve doctor consultations</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#64748b" />
                </Pressable>
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
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 52,
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#0f172a',
        fontWeight: '600',
    },
    liveChatBanner: {
        backgroundColor: '#e0f2fe',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#bae6fd',
    },
    liveChatHeader: {
        flex: 1,
    },
    liveChatTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0369a1',
        marginBottom: 4,
    },
    liveChatStatus: {
        fontSize: 13,
        color: '#0284c7',
        fontWeight: '600',
    },
    chatBtn: {
        backgroundColor: '#0284c7',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    chatBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 13,
    },
    btnPressed: {
        opacity: 0.85,
    },
    faqSection: {
        marginBottom: 24,
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
    },
    viewAllText: {
        fontSize: 13,
        color: '#0284c7',
        fontWeight: '700',
    },
    faqCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
    },
    faqQuestionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    faqQuestion: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0f172a',
        flex: 1,
        marginRight: 16,
    },
    faqAnswerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderTopWidth: 1,
        borderColor: '#f1f5f9',
        paddingTop: 12,
    },
    faqAnswer: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 18,
    },
    stillNeedHelpCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 20,
    },
    supportHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    supportIconBg: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#e6f7f7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    supportHeaderText: {
        flex: 1,
    },
    supportTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    supportSubtitle: {
        fontSize: 13,
        color: '#64748b',
    },
    supportBtnContainer: {
        flexDirection: 'column',
        gap: 12,
    },
    supportChatBtn: {
        backgroundColor: '#008080',
        height: 48,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    supportChatBtnText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 14,
    },
    supportCallBtn: {
        backgroundColor: 'transparent',
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#008080',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    supportCallBtnText: {
        color: '#008080',
        fontWeight: '700',
        fontSize: 14,
    },
    btnIcon: {
        marginRight: 8,
    },
    rateUsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fffbeb',
        borderWidth: 1,
        borderColor: '#fde68a',
        borderRadius: 16,
        padding: 16,
    },
    rateUsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rateUsTextContainer: {
        marginLeft: 12,
    },
    rateUsTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#b45309',
    },
    rateUsSubtitle: {
        fontSize: 12,
        color: '#d97706',
        marginTop: 2,
    },
});
