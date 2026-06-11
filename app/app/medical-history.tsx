import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Pressable,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/hooks/use-auth';
import {
    fetchPatientMe,
    updatePatient,
    fetchPrescriptions,
    createPrescription,
    fetchLabTests,
    createLabTest
} from '@/lib/api';

const CONDITIONS = ['Diabetes', 'Hypertension', 'Asthma', 'Heart Disease', 'None', 'Other'];

export default function MedicalHistoryScreen() {
    const { token } = useAuth();
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [allergies, setAllergies] = useState('');
    const [insurance, setInsurance] = useState('');
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');

    useEffect(() => {
        if (!token) return;
        const loadProfile = async () => {
            try {
                const patient = await fetchPatientMe(token);
                if (patient) {
                    if (patient.conditions) {
                        setSelectedConditions(patient.conditions.split(',').filter(Boolean));
                    }
                    setAllergies(patient.allergies || '');
                    setEmergencyName(patient.emergency_contact_name || '');
                    setEmergencyPhone(patient.emergency_contact_phone || '');
                }
            } catch (err) {
                console.error("Error loading profile:", err);
            }
        };
        void loadProfile();
    }, [token]);

    const toggleCondition = (condition: string) => {
        if (selectedConditions.includes(condition)) {
            setSelectedConditions(selectedConditions.filter(c => c !== condition));
        } else {
            setSelectedConditions([...selectedConditions, condition]);
        }
    };

    const onComplete = async () => {
        if (!token) {
            router.replace('/(tabs)');
            return;
        }
        try {
            const patient = await fetchPatientMe(token);
            await updatePatient(token, patient.id, {
                conditions: selectedConditions.join(','),
                allergies: allergies.trim(),
                emergency_contact_name: emergencyName.trim(),
                emergency_contact_phone: emergencyPhone.trim(),
                last_visit: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            });

            // Seed prescriptions if none exist
            const prescriptions = await fetchPrescriptions(token);
            if (prescriptions.length === 0) {
                await createPrescription(token, {
                    doctor_name: 'Dr. Sarah Jenkins',
                    specialty: 'Consultant Cardiologist',
                    hospital: 'City General Hospital',
                    date: 'Oct 24, 2023',
                    image_url: null,
                    medicines_json: JSON.stringify([
                        {
                            name: 'Atorvastatin 20mg',
                            instruction: 'Take after dinner',
                            frequency: '1x Daily',
                            duration: '30 Days',
                            activeTime: 'night',
                            dosage: '20 mg',
                            instructionText: 'Take one capsule by mouth every night before bed. Finish the entire course.',
                            remaining: '30 Pills'
                        },
                        {
                            name: 'Lisinopril 10mg',
                            instruction: 'Take on empty stomach',
                            frequency: '1x Daily',
                            duration: '15 Days',
                            activeTime: 'morning',
                            dosage: '10 mg',
                            instructionText: 'Take one tablet in the morning on an empty stomach.',
                            remaining: '15 Pills'
                        }
                    ])
                });
                await createPrescription(token, {
                    doctor_name: 'Dr. Michael Chen',
                    specialty: 'Heart & Vascular Specialist',
                    hospital: 'Heart & Vascular Center',
                    date: 'Sep 12, 2023',
                    image_url: null,
                    medicines_json: JSON.stringify([
                        {
                            name: 'Aspirin 81mg',
                            instruction: 'Take with food',
                            frequency: '1x Daily',
                            duration: '90 Days',
                            activeTime: 'morning',
                            dosage: '81 mg',
                            instructionText: 'Take one baby aspirin daily in the morning with breakfast.',
                            remaining: '90 Pills'
                        }
                    ])
                });
            }

            // Seed lab tests if none exist
            const labTests = await fetchLabTests(token);
            if (labTests.length === 0) {
                await createLabTest(token, {
                    test_name: 'Complete Blood Count (CBC)',
                    lab_name: 'City Diagnostic Center',
                    order_date: 'Oct 24, 2023',
                    status: 'PENDING'
                });
                await createLabTest(token, {
                    test_name: 'Lipid Profile',
                    lab_name: 'Apex Medical Labs',
                    order_date: 'Oct 12, 2023',
                    status: 'COMPLETED'
                });
                await createLabTest(token, {
                    test_name: 'Blood Glucose Fasting',
                    lab_name: 'City Diagnostic Center',
                    order_date: 'Oct 05, 2023',
                    status: 'COMPLETED'
                });
            }
        } catch (err) {
            console.error("Error updating patient onboarding:", err);
        }
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Medical History</Text>
                    <Text style={styles.headerStep}>Step 2 of 2</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="medical-outline" size={20} color="#008080" />
                            </View>
                            <Text style={styles.sectionTitle}>Existing Conditions</Text>
                        </View>
                        <Text style={styles.sectionSubtitle}>
                            Select all that apply to help our AI concierge provide accurate health insights.
                        </Text>
                        <View style={styles.chipsContainer}>
                            {CONDITIONS.map((c) => (
                                <Pressable
                                    key={c}
                                    style={[
                                        styles.chip,
                                        selectedConditions.includes(c) && styles.chipActive,
                                    ]}
                                    onPress={() => toggleCondition(c)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        selectedConditions.includes(c) && styles.chipTextActive,
                                    ]}>
                                        {c} {selectedConditions.includes(c) && '✓'}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="medkit-outline" size={20} color="#008080" />
                            </View>
                            <Text style={styles.sectionTitle}>Any known allergies?</Text>
                        </View>
                        <TextInput
                            multiline
                            numberOfLines={3}
                            placeholder="E.g. Penicillin, Peanuts, Pollen..."
                            placeholderTextColor="#999"
                            style={styles.textArea}
                            value={allergies}
                            onChangeText={setAllergies}
                        />
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="shield-checkmark-outline" size={20} color="#008080" />
                            </View>
                            <Text style={styles.sectionTitle}>Insurance Provider</Text>
                        </View>
                        <View style={styles.insuranceRow}>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    placeholder="Enter provider name"
                                    placeholderTextColor="#999"
                                    style={styles.input}
                                    value={insurance}
                                    onChangeText={setInsurance}
                                />
                            </View>
                            <Pressable style={styles.uploadIconButton}>
                                <Ionicons name="cloud-upload-outline" size={24} color="#008080" />
                            </Pressable>
                        </View>
                        <Text style={styles.hintText}>Upload insurance card for faster verification (Optional)</Text>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="people-outline" size={20} color="#008080" />
                            </View>
                            <Text style={styles.sectionTitle}>Emergency Contact</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                placeholder="Full Name"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={emergencyName}
                                onChangeText={setEmergencyName}
                            />
                        </View>
                        <View style={[styles.inputContainer, { marginTop: 10 }]}>
                            <TextInput
                                placeholder="Phone Number"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                                style={styles.input}
                                value={emergencyPhone}
                                onChangeText={setEmergencyPhone}
                            />
                        </View>
                    </View>

                    <View style={styles.privacyNote}>
                        <View style={styles.privacyIconCircle}>
                            <Ionicons name="sparkles" size={16} color="#008080" />
                        </View>
                        <View style={styles.privacyTextContent}>
                            <Text style={styles.privacyTitle}>Privacy Note</Text>
                            <Text style={styles.privacyText}>
                                Your medical history is encrypted and only accessible by you and authorized healthcare providers. MediQ uses this data to personalize your AI health concierge experience.
                            </Text>
                        </View>
                    </View>

                    <Pressable 
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                        onPress={onComplete}
                    >
                        <Text style={styles.primaryButtonText}>Complete Setup</Text>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
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
        backgroundColor: '#001a2c',
    },
    backButton: {
        padding: 5,
        marginTop: 30,
    },
    headerTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginTop: 30,
        marginRight: 80,
    },
    headerStep: {
        fontSize: 12,
        color: '#008080',
        fontWeight: '700',
        marginTop: 30,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    section: {
        marginTop: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 15,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f8f8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002b40',
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#6f7f79',
        lineHeight: 18,
        marginBottom: 15,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    chipActive: {
        backgroundColor: '#008080',
        borderColor: '#008080',
    },
    chipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#002b40',
    },
    chipTextActive: {
        color: '#fff',
    },
    textArea: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 15,
        padding: 15,
        fontSize: 15,
        color: '#002b40',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    insuranceRow: {
        flexDirection: 'row',
        gap: 10,
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 12,
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 15,
        color: '#002b40',
    },
    uploadIconButton: {
        width: 50,
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#008080',
        borderStyle: 'dashed',
        backgroundColor: '#f0f8f8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    hintText: {
        fontSize: 11,
        color: '#6f7f79',
        fontStyle: 'italic',
        marginTop: 6,
    },
    privacyNote: {
        flexDirection: 'row',
        backgroundColor: '#f6fafb',
        borderRadius: 20,
        padding: 20,
        marginTop: 30,
        gap: 15,
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    privacyIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e0f2f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    privacyTextContent: {
        flex: 1,
    },
    privacyTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#008080',
        marginBottom: 4,
    },
    privacyText: {
        fontSize: 12,
        color: '#6f7f79',
        lineHeight: 18,
    },
    primaryButton: {
        backgroundColor: '#008080',
        borderRadius: 20,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 18,
    },
    buttonPressed: {
        opacity: 0.8,
    },
});
