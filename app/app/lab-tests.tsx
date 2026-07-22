import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
    Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';
import { fetchLabTests, createLabTest } from '@/lib/api';
import type { LabTest } from '@/lib/types';

const REPORT_TYPES = [
    'Blood Routine Test',
    'Lipid Profile',
    'Thyroid Panel',
    'Urine Analysis',
    'COVID-19 PCR Test',
    'X-Ray Scan Report',
    'Other'
];

const MOCK_FILES = [
    { name: 'blood_routine_results.pdf', type: 'PDF' },
    { name: 'lipid_profile_chart.png', type: 'Image' },
    { name: 'thyroid_panel_lab.pdf', type: 'PDF' },
    { name: 'chest_xray_scan.jpg', type: 'Image' },
];

export default function LabTestsScreen() {
    const { token } = useAuth();
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [testName, setTestName] = useState('Blood Routine Test');
    const [labName, setLabName] = useState('');
    const [isTypeDropdownVisible, setIsTypeDropdownVisible] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // File selection state
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [customFileName, setCustomFileName] = useState('');

    const loadLabTests = async () => {
        if (!token) return;
        try {
            const list = await fetchLabTests(token);
            setLabTests(list);
        } catch (err) {
            console.error("Error loading lab tests:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadLabTests();
    }, [token]);

    const handleUploadReport = async () => {
        if (!labName.trim()) {
            Alert.alert("Error", "Please enter the diagnostic lab name.");
            return;
        }
        if (!token) return;

        const finalFile = customFileName.trim() || selectedFile || 'report.pdf';

        setIsUploading(true);
        try {
            await createLabTest(token, {
                test_name: testName,
                lab_name: labName.trim(),
                order_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'COMPLETED',
                file_name: finalFile
            });
            Alert.alert("Success", "Report uploaded successfully!");
            setIsModalVisible(false);
            setLabName('');
            setSelectedFile(null);
            setCustomFileName('');
            void loadLabTests();
        } catch (err) {
            console.error("Upload report failed:", err);
            Alert.alert("Error", "Failed to upload report.");
        } finally {
            setIsUploading(false);
        }
    };

    const getIconName = (name: string) => {
        if (name.includes('Blood')) return 'flask-outline';
        if (name.includes('Lipid')) return 'pulse';
        if (name.includes('X-Ray')) return 'radiology';
        return 'water-outline';
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#008080" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#ffffff" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Lab Reports</Text>
                </View>
                <Pressable onPress={() => setIsModalVisible(true)} style={styles.uploadButton}>
                    <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.uploadButtonText}>Upload</Text>
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Recent Orders Filter Header */}
                <View style={styles.filterSection}>
                    <Text style={styles.sectionLabel}>RECENT ORDERS</Text>
                    <Pressable style={styles.filterIcon} onPress={() => Alert.alert('Filter', 'Filter options toggled.')}>
                        <Ionicons name="funnel-outline" size={20} color="#6f7f79" />
                    </Pressable>
                </View>

                {labTests.length === 0 ? (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Ionicons name="document-text-outline" size={48} color="#bbd8ce" style={{ marginBottom: 15 }} />
                        <Text style={{ color: '#6f7f79', fontSize: 14, textAlign: 'center' }}>No recent lab orders or reports found.</Text>
                    </View>
                ) : (
                    labTests.map((test) => {
                        const isPending = test.status.toUpperCase() === 'PENDING';
                        return (
                            <View key={test.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.iconContainer}>
                                        <MaterialCommunityIcons name={getIconName(test.test_name) as any} size={26} color="#008080" />
                                    </View>
                                    <View style={styles.cardInfo}>
                                        <Text style={styles.testName}>{test.test_name}</Text>
                                        <Text style={styles.labName}>{test.lab_name}</Text>
                                        {test.file_name && (
                                            <View style={styles.fileBadge}>
                                                <Ionicons 
                                                    name={test.file_name.toLowerCase().endsWith('.pdf') ? "document-text-outline" : "image-outline"} 
                                                    size={14} 
                                                    color="#008080" 
                                                />
                                                <Text style={styles.fileBadgeText} numberOfLines={1}>{test.file_name}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={[styles.statusBadge, isPending ? styles.statusPending : styles.statusCompleted]}>
                                        <Text style={isPending ? styles.statusTextPending : styles.statusTextCompleted}>
                                            {test.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                {isPending && (
                                    <Pressable 
                                        style={({ pressed }) => [
                                            styles.primaryBtn,
                                            pressed && styles.btnPressed
                                        ]}
                                        onPress={() => router.push('/select-slot')}
                                    >
                                        <Ionicons name="calendar-outline" size={18} color="#ffffff" style={styles.btnIcon} />
                                        <Text style={styles.primaryBtnText}>Book Lab Appointment</Text>
                                    </Pressable>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Upload Report Modal */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => { setIsModalVisible(false); setIsTypeDropdownVisible(false); }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Upload Lab Report</Text>
                            <Pressable onPress={() => { setIsModalVisible(false); setIsTypeDropdownVisible(false); }}>
                                <Ionicons name="close" size={24} color="#002b40" />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                            <Text style={styles.modalLabel}>Report Type</Text>
                            <Pressable style={styles.dropdownTrigger} onPress={() => setIsTypeDropdownVisible(!isTypeDropdownVisible)}>
                                <Text style={styles.dropdownTriggerText}>{testName}</Text>
                                <Ionicons name={isTypeDropdownVisible ? "chevron-up" : "chevron-down"} size={20} color="#6f7f79" />
                            </Pressable>

                            {isTypeDropdownVisible && (
                                <View style={styles.dropdownMenu}>
                                    <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
                                        {REPORT_TYPES.map((type) => (
                                            <Pressable
                                                key={type}
                                                style={styles.dropdownItem}
                                                onPress={() => {
                                                    setTestName(type);
                                                    setIsTypeDropdownVisible(false);
                                                }}
                                            >
                                                <Text style={styles.dropdownItemText}>{type}</Text>
                                            </Pressable>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            <Text style={styles.modalLabel}>Diagnostic Lab Name</Text>
                            <View style={styles.modalInputContainer}>
                                <TextInput
                                    placeholder="E.g. City Diagnostic Center, Apex Labs"
                                    placeholderTextColor="#999"
                                    style={styles.modalInput}
                                    value={labName}
                                    onChangeText={setLabName}
                                />
                            </View>

                            <Text style={styles.modalLabel}>Select Report File (PDF/Image)</Text>
                            <View style={styles.fileSelectorContainer}>
                                {MOCK_FILES.map((file) => (
                                    <Pressable
                                        key={file.name}
                                        style={[
                                            styles.fileOption,
                                            selectedFile === file.name && styles.fileOptionActive
                                        ]}
                                        onPress={() => {
                                            setSelectedFile(file.name);
                                            setCustomFileName('');
                                        }}
                                    >
                                        <Ionicons 
                                            name={file.type === 'PDF' ? "document-text" : "image"} 
                                            size={16} 
                                            color={selectedFile === file.name ? "#ffffff" : "#008080"} 
                                            style={{ marginRight: 6 }}
                                        />
                                        <Text 
                                            style={[
                                                styles.fileOptionText,
                                                selectedFile === file.name && styles.fileOptionTextActive
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {file.name}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            <Text style={styles.modalSubLabel}>Or Enter Custom Filename:</Text>
                            <View style={styles.modalInputContainer}>
                                <TextInput
                                    placeholder="E.g. cbc_results.pdf"
                                    placeholderTextColor="#999"
                                    style={styles.modalInput}
                                    value={customFileName}
                                    onChangeText={(text) => {
                                        setCustomFileName(text);
                                        setSelectedFile(null);
                                    }}
                                />
                            </View>

                            <Pressable 
                                style={({ pressed }) => [styles.modalUploadBtn, pressed && styles.btnPressed]}
                                onPress={handleUploadReport}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <ActivityIndicator color="#ffffff" />
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <Text style={styles.modalUploadBtnText}>Upload Report</Text>
                                    </>
                                )}
                            </Pressable>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        backgroundColor: '#001b2c',
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
        gap: 12,
    },
    backButton: {
        padding: 4,
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        marginTop: 20,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#008080',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 20,
    },
    uploadButtonText: {
        color: '#ffffff',
        fontSize: 13,
        fontWeight: '700',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 30,
    },
    filterSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#7f8c8d',
        letterSpacing: 1.1,
    },
    filterIcon: {
        padding: 4,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#eef2f6',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2.22,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#e6f7f7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    cardInfo: {
        flex: 1,
    },
    testName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a202c',
        marginBottom: 4,
    },
    labName: {
        fontSize: 13,
        color: '#718096',
        marginBottom: 2,
    },
    orderDate: {
        fontSize: 12,
        color: '#a0aec0',
        marginBottom: 6,
    },
    fileBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdfa',
        borderWidth: 1,
        borderColor: '#99f6e4',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
        marginTop: 4,
        maxWidth: 180,
    },
    fileBadgeText: {
        fontSize: 11,
        color: '#008080',
        marginLeft: 4,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusPending: {
        backgroundColor: '#e0f2f1',
    },
    statusCompleted: {
        backgroundColor: '#e8f5e9',
    },
    statusTextPending: {
        fontSize: 10,
        fontWeight: '700',
        color: '#008080',
    },
    statusTextCompleted: {
        fontSize: 10,
        fontWeight: '700',
        color: '#2e7d32',
    },
    primaryBtn: {
        backgroundColor: '#008080',
        height: 46,
        borderRadius: 23,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtn: {
        backgroundColor: 'transparent',
        height: 46,
        borderRadius: 23,
        borderWidth: 1,
        borderColor: '#008080',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnPressed: {
        opacity: 0.85,
    },
    btnIcon: {
        marginRight: 8,
    },
    primaryBtnText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    secondaryBtnText: {
        color: '#008080',
        fontSize: 14,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 43, 64, 0.45)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#002b40',
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#002b40',
        marginTop: 15,
        marginBottom: 8,
    },
    modalSubLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6f7f79',
        marginTop: 10,
        marginBottom: 6,
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f6fafb',
        borderWidth: 1.5,
        borderColor: '#e8f2f4',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dropdownTriggerText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#002b40',
    },
    dropdownMenu: {
        backgroundColor: '#ffffff',
        borderWidth: 1.5,
        borderColor: '#e8f2f4',
        borderRadius: 12,
        marginTop: 4,
        maxHeight: 160,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f6fafb',
    },
    dropdownItemText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#002b40',
    },
    modalInputContainer: {
        backgroundColor: '#f6fafb',
        borderWidth: 1.5,
        borderColor: '#e8f2f4',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    modalInput: {
        fontSize: 14,
        color: '#002b40',
        fontWeight: '600',
        padding: 0,
    },
    fileSelectorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 8,
    },
    fileOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0fdfa',
        borderWidth: 1,
        borderColor: '#b2f5ea',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        width: '48%',
    },
    fileOptionActive: {
        backgroundColor: '#008080',
        borderColor: '#008080',
    },
    fileOptionText: {
        fontSize: 11,
        color: '#008080',
        fontWeight: '700',
        flex: 1,
    },
    fileOptionTextActive: {
        color: '#ffffff',
    },
    modalUploadBtn: {
        backgroundColor: '#008080',
        borderRadius: 24,
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25,
    },
    modalUploadBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '800',
    },
});
