import React, { useState, useEffect } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { fetchPatientMe, updatePatient } from '@/lib/api';

export default function EditProfileScreen() {
    const { token, user } = useAuth();
    const [patientId, setPatientId] = useState<number | null>(null);
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState(user?.email || '');
    const [dob, setDob] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [gender, setGender] = useState<'Female' | 'Male' | 'Other'>('Female');

    useEffect(() => {
        if (!token) return;
        const loadProfile = async () => {
            try {
                const patient = await fetchPatientMe(token);
                if (patient) {
                    setPatientId(patient.id);
                    setFullName(patient.full_name || '');
                    setPhone(patient.phone || '');
                    setDob(patient.date_of_birth || '');
                    setBloodGroup(patient.blood_group || '');
                    if (patient.gender === 'Female' || patient.gender === 'Male' || patient.gender === 'Other') {
                        setGender(patient.gender);
                    }
                }
            } catch (err) {
                console.error("Error loading profile:", err);
            }
        };
        void loadProfile();
    }, [token]);

    const handleSave = async () => {
        if (!token || !patientId) {
            router.back();
            return;
        }
        try {
            await updatePatient(token, patientId, {
                full_name: fullName,
                phone: phone,
                date_of_birth: dob || null,
                blood_group: bloodGroup,
                gender: gender,
            });
            Alert.alert("Success", "Profile updated successfully!");
        } catch (err) {
            console.error("Error saving profile:", err);
            Alert.alert("Error", "Could not save profile details.");
        }
        router.back();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                </View>
                <Pressable onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save</Text>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Profile Photo Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <View style={[styles.avatarImage, { backgroundColor: '#f0f7f9', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', borderRadius: 52 }]}>
                            <Ionicons name="person" size={54} color="#0c5c64" />
                        </View>
                    </View>
                    <Text style={styles.changePhotoText}>Health Profile</Text>
                </View>

                {/* Form Fields */}
                <View style={styles.formContainer}>
                    {/* Full Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Enter full name"
                                placeholderTextColor="#a0aec0"
                            />
                        </View>
                    </View>

                    {/* Phone */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Phone</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholder="Enter phone number"
                                placeholderTextColor="#a0aec0"
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.textInput}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="Enter email address"
                                placeholderTextColor="#a0aec0"
                            />
                        </View>
                    </View>

                    {/* DOB and Blood Group Row */}
                    <View style={styles.rowInputs}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                            <Text style={styles.inputLabel}>DOB</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.textInput}
                                    value={dob}
                                    onChangeText={setDob}
                                    placeholder="DD/MM/YYYY"
                                    placeholderTextColor="#a0aec0"
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.inputLabel}>Blood Group</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.textInput}
                                    value={bloodGroup}
                                    onChangeText={setBloodGroup}
                                    placeholder="e.g. O+"
                                    placeholderTextColor="#a0aec0"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Gender */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Gender</Text>
                        <View style={styles.genderRow}>
                            <Pressable
                                style={[
                                    styles.genderTab,
                                    gender === 'Female' ? styles.genderTabActive : styles.genderTabInactive,
                                ]}
                                onPress={() => setGender('Female')}
                            >
                                <Text style={gender === 'Female' ? styles.genderTextActive : styles.genderTextInactive}>Female</Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.genderTab,
                                    gender === 'Male' ? styles.genderTabActive : styles.genderTabInactive,
                                ]}
                                onPress={() => setGender('Male')}
                            >
                                <Text style={gender === 'Male' ? styles.genderTextActive : styles.genderTextInactive}>Male</Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.genderTab,
                                    gender === 'Other' ? styles.genderTabActive : styles.genderTabInactive,
                                ]}
                                onPress={() => setGender('Other')}
                            >
                                <Text style={gender === 'Other' ? styles.genderTextActive : styles.genderTextInactive}>Other</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* AI Insight Card */}
                <View style={styles.insightCard}>
                    <View style={styles.insightHeader}>
                        <Ionicons name="star" size={20} color="#008080" />
                        <Text style={styles.insightTitle}>MediQ AI Insight</Text>
                    </View>
                    <Text style={styles.insightText}>
                        Keeping your profile updated helps our diagnostic models provide more accurate health predictions and medication reminders tailored to your age and blood group.
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
        backgroundColor: '#0c5c64',
        paddingVertical: 18,
        paddingHorizontal: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 12,
        padding: 4,
        marginTop: 30,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 30,
        marginRight: 80,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 30,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 3,
        borderColor: '#0c5c64',
        padding: 2,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 52,
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: '#0c5c64',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
    changePhotoText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6f7f79',
        letterSpacing: 1.2,
        marginTop: 12,
    },
    formContainer: {
        gap: 16,
        marginBottom: 24,
    },
    inputGroup: {
        gap: 6,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#5c7e75',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputWrapper: {
        backgroundColor: '#f0f7f9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2eff2',
        paddingHorizontal: 16,
        height: 52,
        justifyContent: 'center',
    },
    textInput: {
        fontSize: 15,
        color: '#1a202c',
        fontWeight: '600',
    },
    rowInputs: {
        flexDirection: 'row',
    },
    genderRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    genderTab: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    genderTabActive: {
        backgroundColor: '#008080',
    },
    genderTabInactive: {
        backgroundColor: '#f0f7f9',
        borderWidth: 1,
        borderColor: '#e2eff2',
    },
    genderTextActive: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    genderTextInactive: {
        color: '#4a5568',
        fontSize: 14,
        fontWeight: '600',
    },
    insightCard: {
        backgroundColor: '#e6f7f8',
        borderWidth: 1,
        borderColor: '#bbf0f3',
        borderRadius: 16,
        padding: 16,
        marginTop: 8,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 6,
    },
    insightTitle: {
        color: '#008080',
        fontSize: 14,
        fontWeight: '700',
    },
    insightText: {
        color: '#2a5a5d',
        fontSize: 13,
        lineHeight: 18,
    },
});
