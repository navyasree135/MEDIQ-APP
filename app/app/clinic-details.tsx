import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Pressable,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';
import { fetchDoctorMe, updateDoctorMe } from '@/lib/api';

export default function ClinicDetailsScreen() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [clinicAddress, setClinicAddress] = useState('');
    const [clinicLat, setClinicLat] = useState('');
    const [clinicLng, setClinicLng] = useState('');
    const [location, setLocation] = useState('');

    useEffect(() => {
        if (!token) {
            setLoading(false);  // don't stay stuck on spinner if no token
            return;
        }
        const load = async () => {
            try {
                const profile = await fetchDoctorMe(token);
                setClinicAddress(profile.clinic_address || '');
                setClinicLat(profile.clinic_lat?.toString() || '');
                setClinicLng(profile.clinic_lng?.toString() || '');
                setLocation(profile.location || '');
            } catch (err) {
                console.error('Error loading clinic details:', err);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, [token]);

    const handleSave = async () => {
        if (!token) return;
        if (!clinicAddress.trim()) {
            Alert.alert('Required', 'Please enter a clinic address.');
            return;
        }

        const lat = clinicLat.trim() ? parseFloat(clinicLat) : null;
        const lng = clinicLng.trim() ? parseFloat(clinicLng) : null;

        if (clinicLat.trim() && (lat === null || isNaN(lat) || lat < -90 || lat > 90)) {
            Alert.alert('Invalid', 'Latitude must be a number between -90 and 90.');
            return;
        }
        if (clinicLng.trim() && (lng === null || isNaN(lng) || lng < -180 || lng > 180)) {
            Alert.alert('Invalid', 'Longitude must be a number between -180 and 180.');
            return;
        }

        setSaving(true);
        try {
            await updateDoctorMe(token, {
                clinic_address: clinicAddress.trim(),
                clinic_lat: lat,
                clinic_lng: lng,
                location: location.trim() || undefined,
            });
            Alert.alert('Success', 'Clinic details updated successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to save clinic details.';
            Alert.alert('Error', message);
        } finally {
            setSaving(false);
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
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Clinic Details</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Info Banner */}
                    <View style={styles.infoBanner}>
                        <Ionicons name="information-circle" size={20} color="#008080" />
                        <Text style={styles.infoBannerText}>
                            Adding your clinic coordinates allows patients to get live directions to your clinic after booking.
                        </Text>
                    </View>

                    {/* Location Name */}
                    <Text style={styles.inputLabel}>Clinic / Hospital Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="business-outline" size={20} color="#6f7f79" style={styles.inputIcon} />
                        <TextInput
                            placeholder="e.g. Saint Mary's General Hospital"
                            placeholderTextColor="#a3b5bc"
                            style={styles.textInput}
                            value={location}
                            onChangeText={setLocation}
                        />
                    </View>

                    {/* Clinic Address */}
                    <Text style={styles.inputLabel}>Full Address</Text>
                    <View style={[styles.inputWrapper, { height: 80, alignItems: 'flex-start', paddingTop: 14 }]}>
                        <Ionicons name="location-outline" size={20} color="#6f7f79" style={styles.inputIcon} />
                        <TextInput
                            placeholder="e.g. 45 Medical Drive, Healthcare City, London"
                            placeholderTextColor="#a3b5bc"
                            style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
                            value={clinicAddress}
                            onChangeText={setClinicAddress}
                            multiline
                        />
                    </View>

                    {/* Coordinates Section */}
                    <View style={styles.coordSection}>
                        <View style={styles.coordHeader}>
                            <Ionicons name="navigate-circle-outline" size={20} color="#008080" />
                            <Text style={styles.coordTitle}>GPS Coordinates</Text>
                        </View>
                        <Text style={styles.coordHint}>
                            You can find coordinates from Google Maps: right-click your clinic location and copy the latitude, longitude values.
                        </Text>

                        <View style={styles.coordRow}>
                            <View style={styles.coordField}>
                                <Text style={styles.coordLabel}>Latitude</Text>
                                <View style={styles.coordInputWrap}>
                                    <TextInput
                                        placeholder="e.g. 51.5074"
                                        placeholderTextColor="#a3b5bc"
                                        style={styles.coordInput}
                                        value={clinicLat}
                                        onChangeText={setClinicLat}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                            <View style={styles.coordField}>
                                <Text style={styles.coordLabel}>Longitude</Text>
                                <View style={styles.coordInputWrap}>
                                    <TextInput
                                        placeholder="e.g. -0.1278"
                                        placeholderTextColor="#a3b5bc"
                                        style={styles.coordInput}
                                        value={clinicLng}
                                        onChangeText={setClinicLng}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Preview Map Tile */}
                    {clinicLat.trim() && clinicLng.trim() && (
                        <View style={styles.previewCard}>
                            <View style={styles.previewMapBg}>
                                <View style={[styles.previewMapLine, { transform: [{ rotate: '45deg' }], top: 20 }]} />
                                <View style={[styles.previewMapLine, { transform: [{ rotate: '-30deg' }], top: 50 }]} />
                                <View style={[styles.previewMapLine, { width: 3, height: '100%', left: '40%' }]} />
                                <View style={[styles.previewMapLine, { width: '100%', height: 3, top: '60%' }]} />
                                <View style={styles.previewPin}>
                                    <Ionicons name="location" size={28} color="#ff4d4d" />
                                    <View style={styles.previewPulse} />
                                </View>
                            </View>
                            <View style={styles.previewInfo}>
                                <Ionicons name="checkmark-circle" size={16} color="#00cc99" />
                                <Text style={styles.previewText}>
                                    Coordinates set: {parseFloat(clinicLat).toFixed(4)}, {parseFloat(clinicLng).toFixed(4)}
                                </Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Bottom Save Button */}
                <View style={styles.bottomBar}>
                    <Pressable
                        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                                <Text style={styles.saveBtnText}>Save Clinic Details</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loaderWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        fontSize: 17,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 30,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 110,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        backgroundColor: '#e3f3f5',
        borderRadius: 14,
        padding: 14,
        marginBottom: 25,
    },
    infoBannerText: {
        flex: 1,
        fontSize: 12,
        color: '#006060',
        lineHeight: 18,
        fontWeight: '500',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#002b40',
        marginBottom: 8,
        marginTop: 5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f6fafb',
        borderWidth: 1.5,
        borderColor: '#e8f2f4',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 52,
        marginBottom: 18,
    },
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: '#002b40',
        fontWeight: '600',
    },
    coordSection: {
        backgroundColor: '#f6fafb',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        borderRadius: 18,
        padding: 16,
        marginBottom: 20,
    },
    coordHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    coordTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#002b40',
    },
    coordHint: {
        fontSize: 11,
        color: '#6f7f79',
        lineHeight: 16,
        marginBottom: 15,
    },
    coordRow: {
        flexDirection: 'row',
        gap: 12,
    },
    coordField: {
        flex: 1,
    },
    coordLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6f7f79',
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    coordInputWrap: {
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#e8f2f4',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 46,
        justifyContent: 'center',
    },
    coordInput: {
        fontSize: 15,
        color: '#002b40',
        fontWeight: '700',
    },
    previewCard: {
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e8f2f4',
        backgroundColor: '#f6fafb',
        marginBottom: 20,
    },
    previewMapBg: {
        height: 100,
        backgroundColor: '#e0ecee',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewMapLine: {
        position: 'absolute',
        backgroundColor: '#cce0e3',
        width: '120%',
        height: 2,
    },
    previewPin: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2,
    },
    previewPulse: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#ff4d4d',
        opacity: 0.4,
        bottom: -2,
        zIndex: 1,
    },
    previewInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
    },
    previewText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#002b40',
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
    saveBtn: {
        backgroundColor: '#008080',
        height: 52,
        borderRadius: 26,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveBtnDisabled: {
        opacity: 0.8,
    },
    saveBtnText: {
        color: '#ffffff',
        fontWeight: '800',
        fontSize: 16,
    },
});
