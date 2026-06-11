import { router } from 'expo-router';
import { useAuth } from '@/hooks/use-auth';
import { fetchPatientMe, updatePatient } from '@/lib/api';
import { useEffect, useState } from 'react';
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
    Image,
    Modal,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BLOOD_GROUPS = ['A+ve', 'A-ve', 'B+ve', 'B-ve', 'O+ve', 'O-ve', 'AB+ve', 'AB-ve'];

export default function ContinueProfileScreen() {
    const { token, user } = useAuth();
    const [dob, setDob] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [gender, setGender] = useState('Male');
    const [phone, setPhone] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [patientId, setPatientId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.role === 'doctor') {
            router.replace('/(tabs)');
            return;
        }

        const loadPatient = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const patient = await fetchPatientMe(token);
                setPatientId(patient.id);
                setDob(patient.date_of_birth ? String(patient.date_of_birth) : '');
                setPhone(patient.phone ?? '');
            } catch (err) {
                console.warn('Could not fetch patient profile', err);
            } finally {
                setLoading(false);
            }
        };

        void loadPatient();
    }, [token]);

    const onNext = async () => {
        if (!dob.trim() || !phone.trim()) {
            setError('Please enter your date of birth and phone number.');
            return;
        }

        if (!token || !patientId) {
            setError('Unable to update profile at this time.');
            return;
        }

        setError(null);
        setIsSaving(true);

        try {
            await updatePatient(token, patientId, {
                date_of_birth: dob.trim(),
                phone: phone.trim(),
                blood_group: bloodGroup || null,
                gender: gender || null,
            });
            router.push('/medical-history');
        } catch (err) {
            console.warn('Update patient failed', err);
            setError(err instanceof Error ? err.message : 'Unable to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loaderWrap}>
                    <ActivityIndicator size="large" color="#008080" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Complete Your Profile</Text>
                    <Text style={styles.headerStep}>Step 1 of 2</Text>
                </View>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarCircle}>
                            <Ionicons name="person" size={54} color="#008080" />
                        </View>
                        <Text style={styles.uploadText}>Health Profile</Text>
                    </View>

                    <View style={styles.formCard}>
                        <Text style={styles.label}>Date of Birth</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="calendar-outline" size={20} color="#008080" style={styles.inputIcon} />
                            <TextInput
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#999"
                                style={styles.input}
                                value={dob}
                                onChangeText={setDob}
                            />
                        </View>

                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color="#008080" style={styles.inputIcon} />
                            <TextInput
                                placeholder="Enter your phone number"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>

                        <Text style={styles.label}>Blood Group</Text>
                        <Pressable style={styles.inputContainer} onPress={() => setIsModalVisible(true)}>
                            <Ionicons name="water-outline" size={20} color="#008080" style={styles.inputIcon} />
                            <Text style={[styles.input, { color: bloodGroup ? '#002b40' : '#999', lineHeight: 50 }]}>
                                {bloodGroup || 'Select Blood Group'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6f7f79" />
                        </Pressable>

                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.genderRow}>
                            {['Male', 'Female', 'Other'].map((g) => (
                                <Pressable
                                    key={g}
                                    style={[styles.genderButton, gender === g && styles.genderButtonActive]}
                                    onPress={() => setGender(g)}
                                >
                                    <Text style={[styles.genderButtonText, gender === g && styles.genderButtonTextActive]}>{g}</Text>
                                </Pressable>
                            ))}
                        </View>

                        <View style={styles.infoBox}>
                            <Ionicons name="sparkles" size={20} color="#008080" style={styles.infoIcon} />
                            <Text style={styles.infoText}>
                                Filling your health profile accurately helps our AI provide more precise diagnosis suggestions and wellness plans tailored to your physiology.
                            </Text>
                        </View>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    <Pressable 
                        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                        onPress={onNext}
                        disabled={isSaving || loading}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <>
                                <Text style={styles.primaryButtonText}>Next</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </Pressable>

                    <Text style={styles.footerNote}>You can update these details later in your Health Hub.</Text>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Blood Group</Text>
                            <Pressable onPress={() => setIsModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#002b40" />
                            </Pressable>
                        </View>
                        <FlatList
                            data={BLOOD_GROUPS}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <Pressable 
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setBloodGroup(item);
                                        setIsModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.modalItemText, bloodGroup === item && styles.modalItemTextActive]}>{item}</Text>
                                    {bloodGroup === item && <Ionicons name="checkmark" size={20} color="#008080" />}
                                </Pressable>
                            )}
                        />
                    </View>
                </View>
            </Modal>
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
    },
    headerStep: {
        fontSize: 12,
        color: '#008080',
        fontWeight: '700',
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 30,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#e8f2f4',
        borderStyle: 'dashed',
        backgroundColor: '#f6fafb',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    uploadText: {
        color: '#008080',
        fontWeight: '700',
        fontSize: 14,
    },
    errorText: {
        color: '#ff4d4d',
        fontSize: 14,
        marginTop: 10,
    },
    formCard: {
        backgroundColor: '#f6fafb',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
    },
    loaderWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 14,
        color: '#002b40',
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 12,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#002b40',
    },
    genderRow: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e8f2f4',
        padding: 4,
    },
    genderButton: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    genderButtonActive: {
        backgroundColor: '#008080',
    },
    genderButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6f7f79',
    },
    genderButtonTextActive: {
        color: '#fff',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 15,
        marginTop: 25,
        gap: 12,
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    infoIcon: {
        marginTop: 2,
    },
    infoText: {
        flex: 1,
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
    },
    primaryButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 18,
    },
    buttonPressed: {
        opacity: 0.8,
    },
    footerNote: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 12,
        color: '#6f7f79',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002b40',
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalItemText: {
        fontSize: 16,
        color: '#002b40',
    },
    modalItemTextActive: {
        color: '#008080',
        fontWeight: '700',
    },
});


