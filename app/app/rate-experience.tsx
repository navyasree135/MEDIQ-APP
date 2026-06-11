import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Pressable,
    Image,
    SafeAreaView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function RateExperienceScreen() {
    const [doctorRating, setDoctorRating] = useState(4);
    const [appRating, setAppRating] = useState(5);
    const [feedbackText, setFeedbackText] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>(['Quick Booking', 'Helpful AI']);

    const quickFeedbackTags = ['Quick Booking', 'Helpful AI', 'Easy Check-in', 'Good Doctor'];

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSubmit = () => {
        Alert.alert("Thank You!", "Your feedback has been submitted successfully!");
        router.back();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#002b40" />
                    </Pressable>
                    <Text style={styles.headerTitle}>MediQ Healthcare</Text>
                </View>
                <View style={styles.headerRight}>
                    <Ionicons name="notifications-outline" size={22} color="#002b40" style={styles.headerIcon} />
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' }}
                        style={styles.headerAvatar}
                    />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.mainTitle}>Rate Your Experience</Text>

                {/* Doctor Card */}
                <View style={styles.doctorCard}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200' }}
                        style={styles.doctorAvatar}
                    />
                    <View style={styles.doctorInfo}>
                        <Text style={styles.doctorName}>Dr. Sarah Jenkins</Text>
                        <Text style={styles.doctorSpecialty}>Senior Cardiologist</Text>
                    </View>
                </View>

                {/* Doctor Rating Stars */}
                <View style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>Rate Your Doctor</Text>
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Pressable key={star} onPress={() => setDoctorRating(star)}>
                                <Ionicons
                                    name={star <= doctorRating ? "star" : "star-outline"}
                                    size={32}
                                    color="#008080"
                                    style={styles.starIcon}
                                />
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* App Rating Stars */}
                <View style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>Rate the App</Text>
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Pressable key={star} onPress={() => setAppRating(star)}>
                                <Ionicons
                                    name={star <= appRating ? "star" : "star-outline"}
                                    size={32}
                                    color="#008080"
                                    style={styles.starIcon}
                                />
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Quick Feedback Tags */}
                <View style={styles.tagsSection}>
                    <Text style={styles.sectionLabel}>QUICK FEEDBACK</Text>
                    <View style={styles.tagsWrapper}>
                        {quickFeedbackTags.map((tag) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                                <Pressable
                                    key={tag}
                                    style={[
                                        styles.tagButton,
                                        isSelected ? styles.tagButtonActive : styles.tagButtonInactive,
                                    ]}
                                    onPress={() => toggleTag(tag)}
                                >
                                    <Text style={isSelected ? styles.tagTextActive : styles.tagTextInactive}>
                                        {tag}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Experience Feedback Input */}
                <View style={styles.feedbackSection}>
                    <View style={styles.feedbackInputWrapper}>
                        <TextInput
                            style={styles.feedbackInput}
                            multiline
                            numberOfLines={4}
                            value={feedbackText}
                            onChangeText={setFeedbackText}
                            placeholder="Tell us your experience"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                {/* Submit Button */}
                <Pressable 
                    style={({ pressed }) => [
                        styles.submitBtn,
                        pressed && styles.btnPressed
                    ]}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitBtnText}>Submit Feedback</Text>
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
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderColor: '#f1f5f9',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 10,
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002b40',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIcon: {
        padding: 4,
    },
    headerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 20,
    },
    doctorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
    },
    doctorAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 16,
    },
    doctorInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 4,
    },
    doctorSpecialty: {
        fontSize: 13,
        color: '#64748b',
    },
    ratingSection: {
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    ratingLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 10,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    starIcon: {
        padding: 2,
    },
    tagsSection: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748b',
        letterSpacing: 1.1,
        marginBottom: 12,
    },
    tagsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagButton: {
        height: 36,
        paddingHorizontal: 16,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagButtonActive: {
        backgroundColor: '#008080',
    },
    tagButtonInactive: {
        backgroundColor: '#f1f5f9',
    },
    tagTextActive: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    tagTextInactive: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '600',
    },
    feedbackSection: {
        marginBottom: 24,
    },
    feedbackInputWrapper: {
        backgroundColor: '#f1f5f9',
        borderRadius: 16,
        padding: 12,
    },
    feedbackInput: {
        fontSize: 14,
        color: '#0f172a',
        height: 80,
        textAlignVertical: 'top',
    },
    submitBtn: {
        backgroundColor: '#008080',
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    submitBtnText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    btnPressed: {
        opacity: 0.85,
    },
});
