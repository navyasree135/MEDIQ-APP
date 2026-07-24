import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, SafeAreaView, ScrollView, ActivityIndicator, Alert, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { uploadReportFileForOcr, explainReportText, getReportDownloadUrl, OcrUploadResponse, ReportExplanationResponse } from '@/lib/api';

export default function ReportExplainerScreen() {
    const [selectedDocType, setSelectedDocType] = useState<'lab_report' | 'prescription' | 'medical_record'>('lab_report');
    const [uploading, setUploading] = useState(false);
    const [explaining, setExplaining] = useState(false);
    const [ocrData, setOcrData] = useState<OcrUploadResponse | null>(null);
    const [explanation, setExplanation] = useState<ReportExplanationResponse | null>(null);

    // Pick file via HTML file input (web) or fallback
    const handlePickFile = async () => {
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*,application/pdf';
            input.onchange = async (e: any) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fileUrl = URL.createObjectURL(file);
                await startProcessing(fileUrl, file.name, file.type);
            };
            input.click();
        } else {
            // Mobile fallback simulation / file trigger
            Alert.alert(
                'Select Medical Document',
                'Choose a medical report, prescription, or lab result to upload.',
                [
                    {
                        text: 'Pediatric Cold & Flu Prescription',
                        onPress: async () => {
                            setSelectedDocType('prescription');
                            const pedRx = `Prescription for Upper Respiratory Tract Infection (Cold & Flu)\nPatient: Pediatric Care\n\nRx:\n1. Amoxicillin syrup - 5ml, 3 times a day after food - 7 days\n2. Paracetamol syrup - 5ml only if fever goes above 100°F - max 4 times a day\n3. Cetirizine tablet - Half a tablet at night - 5 days\n4. ORS (Oral Rehydration Salts) - 1 sachet mixed in 200ml water - as needed\n\nAdvice:\n- Keep child hydrated\n- Avoid cold food & ice\n- Complete full 7 days antibiotic course`;
                            setOcrData({
                                status: 'success',
                                filename: 'pediatric_prescription.pdf',
                                extraction_method: 'direct_pdf',
                                extracted_text: pedRx,
                                confidence_score: 0.99,
                                character_count: pedRx.length,
                            });
                            await runExplanation(pedRx);
                        }
                    },
                    {
                        text: 'City Care Clinic Prescription',
                        onPress: async () => {
                            setSelectedDocType('prescription');
                            const rxText = `City Care Clinic\n123 MG Road, Chennai - 600001\nDr. A. Kumar, MBBS, MD (General Medicine)\nPatient Name: Test Patient | Age/Sex: 34 / M | Date: 22-07-2026\n\nRx:\n1. Tab. Metformin 500mg - 1 tablet twice daily after food - 30 days\n2. Tab. Amlodipine 5mg - 1 tablet once daily in the morning - 30 days\n3. Cap. Omeprazole 20mg - 1 capsule before breakfast - 15 days\n4. Tab. Paracetamol 650mg - 1 tablet if fever, max 3 times a day\n\nAdvice:\n- Low sugar, low salt diet\n- Regular exercise, 30 mins walking daily\n- Follow up after 30 days with fasting blood sugar report`;
                            setOcrData({
                                status: 'success',
                                filename: 'city_care_clinic_prescription.png',
                                extraction_method: 'ocr_image',
                                extracted_text: rxText,
                                confidence_score: 0.98,
                                character_count: rxText.length,
                            });
                            await runExplanation(rxText);
                        }
                    },
                    {
                        text: 'Sample Blood Test Report',
                        onPress: async () => {
                            setSelectedDocType('lab_report');
                            const demoText = `Complete Blood Count (CBC) & Sugar Evaluation\nHemoglobin: 11.2 g/dL (Normal: 12.0 - 15.5 g/dL)\nFasting Blood Sugar: 115 mg/dL (Normal: < 100 mg/dL)\nWhite Blood Cells: 8,500 /uL (Normal: 4,500 - 11,000 /uL)`;
                            setOcrData({
                                status: 'success',
                                filename: 'cbc_report_sample.pdf',
                                extraction_method: 'direct_pdf',
                                extracted_text: demoText,
                                confidence_score: 0.98,
                                character_count: demoText.length,
                            });
                            await runExplanation(demoText);
                        }
                    },
                    { text: 'Cancel', style: 'cancel' }
                ]
            );
        }
    };

    const startProcessing = async (uri: string, name: string, type: string) => {
        setUploading(true);
        setExplanation(null);
        setOcrData(null);
        try {
            const ocrRes = await uploadReportFileForOcr(uri, name, type);
            setOcrData(ocrRes);
            setUploading(false);

            await runExplanation(ocrRes.extracted_text);
        } catch (err: any) {
            setUploading(false);
            Alert.alert('Extraction Failed', err.message || 'Unable to extract text from document.');
        }
    };

    const runExplanation = async (textToExplain: string) => {
        setExplaining(true);
        try {
            const expRes = await explainReportText(textToExplain, selectedDocType);
            setExplanation(expRes);
        } catch (err: any) {
            Alert.alert('Explanation Error', err.message || 'Failed to generate plain-language explanation.');
        } finally {
            setExplaining(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!explanation) return;
        const downloadUrl = getReportDownloadUrl(explanation.report_id);
        
        try {
            if (Platform.OS === 'web') {
                window.open(downloadUrl, '_blank');
            } else {
                await Linking.openURL(downloadUrl);
            }
        } catch (err) {
            Alert.alert('Download Error', 'Could not initiate PDF download.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#002b40" />
                </Pressable>
                <Text style={styles.headerTitle}>Report Explainer AI</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Intro Hero Box */}
                <View style={styles.heroCard}>
                    <View style={styles.heroIconCircle}>
                        <Ionicons name="document-text-outline" size={28} color="#008080" />
                    </View>
                    <Text style={styles.heroTitle}>Upload Medical Report or Prescription</Text>
                    <Text style={styles.heroDesc}>
                        Extract text automatically and receive a simple, plain-language breakdown explained by AI — with no complex medical jargon.
                    </Text>

                    {/* Document Type Selector */}
                    <Text style={styles.selectorLabel}>DOCUMENT TYPE</Text>
                    <View style={styles.typeSelectorRow}>
                        <Pressable
                            style={[styles.typePill, selectedDocType === 'lab_report' && styles.typePillActive]}
                            onPress={() => setSelectedDocType('lab_report')}
                        >
                            <Text style={[styles.typePillText, selectedDocType === 'lab_report' && styles.typePillTextActive]}>Lab Report</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.typePill, selectedDocType === 'prescription' && styles.typePillActive]}
                            onPress={() => setSelectedDocType('prescription')}
                        >
                            <Text style={[styles.typePillText, selectedDocType === 'prescription' && styles.typePillTextActive]}>Prescription</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.typePill, selectedDocType === 'medical_record' && styles.typePillActive]}
                            onPress={() => setSelectedDocType('medical_record')}
                        >
                            <Text style={[styles.typePillText, selectedDocType === 'medical_record' && styles.typePillTextActive]}>General Record</Text>
                        </Pressable>
                    </View>

                    {/* Upload CTA Button */}
                    <Pressable
                        style={[styles.uploadBtn, (uploading || explaining) && { opacity: 0.7 }]}
                        onPress={() => void handlePickFile()}
                        disabled={uploading || explaining}
                    >
                        {uploading || explaining ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <>
                                <Ionicons name="cloud-upload" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                                <Text style={styles.uploadBtnText}>Upload File (PDF / Image)</Text>
                            </>
                        )}
                    </Pressable>
                </View>

                {/* Processing Indicators */}
                {uploading && (
                    <View style={styles.statusBox}>
                        <ActivityIndicator color="#008080" style={{ marginBottom: 8 }} />
                        <Text style={styles.statusText}>Running OCR & Text Extraction...</Text>
                    </View>
                )}

                {explaining && (
                    <View style={styles.statusBox}>
                        <ActivityIndicator color="#008080" style={{ marginBottom: 8 }} />
                        <Text style={styles.statusText}>Generating Plain-Language Explanation (Claude API)...</Text>
                    </View>
                )}

                {/* OCR Text Result Summary */}
                {ocrData && (
                    <View style={styles.ocrCard}>
                        <View style={styles.ocrHeaderRow}>
                            <Ionicons name="scan-outline" size={18} color="#008080" />
                            <Text style={styles.ocrCardTitle}>Extracted Document Text ({ocrData.filename})</Text>
                        </View>
                        <Text style={styles.ocrConfidence}>Extraction Method: {ocrData.extraction_method.toUpperCase()} • Confidence: {Math.round(ocrData.confidence_score * 100)}%</Text>
                        <Text style={styles.ocrTextPreview}>{ocrData.extracted_text}</Text>
                    </View>
                )}

                {/* Explanation Output Result */}
                {explanation && (
                    <View style={styles.resultCard}>
                        <View style={styles.resultHeaderRow}>
                            <View style={styles.resultBadge}>
                                <Ionicons name="sparkles" size={14} color="#008080" style={{ marginRight: 4 }} />
                                <Text style={styles.resultBadgeText}>AI Explanation Ready</Text>
                            </View>
                            <Text style={styles.providerText}>{explanation.provider}</Text>
                        </View>

                        <View style={styles.markdownOutputWrap}>
                            {explanation.explanation_markdown.split('\n').map((line, idx) => {
                                const trimmed = line.trim();
                                if (!trimmed || trimmed.startsWith('|---')) return null;

                                // Section Headers (**Summary**, **Breakdown**, etc)
                                if (/^\*\*(Summary|Breakdown|What this might mean|Things to keep in mind|Disclaimer)\*\*$/i.test(trimmed) || trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
                                    const headerText = trimmed.replace(/\*\*/g, '').replace(/^#+\s*/, '');
                                    return (
                                        <Text key={idx} style={styles.mdSectionHeader}>
                                            {headerText}
                                        </Text>
                                    );
                                }

                                // Table Rows (| Item | Purpose | How to take |)
                                if (trimmed.startsWith('|')) {
                                    const parts = trimmed.split('|').map(p => p.trim()).filter(Boolean);
                                    const isHeader = parts.some(p => p.toLowerCase().includes('medicine') || p.toLowerCase().includes('parameter') || p.toLowerCase().includes('purpose'));
                                    return (
                                        <View key={idx} style={[styles.mdTableRow, isHeader && styles.mdTableHeaderRow]}>
                                            {parts.map((p, pIdx) => (
                                                <Text key={pIdx} style={[styles.mdTableCell, isHeader && styles.mdTableHeaderCell, { flex: pIdx === 0 ? 1.2 : 1 }]}>
                                                    {p.replace(/\*\*/g, '')}
                                                </Text>
                                            ))}
                                        </View>
                                    );
                                }

                                // Disclaimer Block
                                if (trimmed.startsWith('> ') || trimmed.toLowerCase().includes('disclaimer')) {
                                    return (
                                        <View key={idx} style={styles.mdDisclaimerBox}>
                                            <Text style={styles.mdDisclaimerTitle}>⚠️ DISCLAIMER</Text>
                                            <Text style={styles.mdDisclaimerText}>
                                                {trimmed.replace('> ', '').replace(/\*\*/g, '')}
                                            </Text>
                                        </View>
                                    );
                                }

                                // Bullet Rows
                                if (trimmed.startsWith('- ') || /^\d+\.\s+/.test(trimmed)) {
                                    const cleanContent = trimmed.replace(/^(-\s+|\d+\.\s+)/, '');
                                    return (
                                        <View key={idx} style={styles.mdBulletRow}>
                                            <Text style={styles.mdBulletDot}>•</Text>
                                            <Text style={styles.mdBulletText}>{cleanContent.replace(/\*\*/g, '')}</Text>
                                        </View>
                                    );
                                }

                                return (
                                    <Text key={idx} style={styles.mdParagraph}>
                                        {trimmed.replace(/\*\*/g, '')}
                                    </Text>
                                );
                            })}
                        </View>

                        {/* Download PDF Action */}
                        <Pressable style={styles.downloadBtn} onPress={() => void handleDownloadPdf()}>
                            <Ionicons name="download-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                            <Text style={styles.downloadBtnText}>Download PDF Report</Text>
                        </Pressable>
                    </View>
                )}
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
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002b40',
    },
    scrollContent: {
        padding: 20,
    },
    heroCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 20,
    },
    heroIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: '#e6f7f7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    heroTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002b40',
        marginBottom: 6,
    },
    heroDesc: {
        fontSize: 13,
        color: '#64748b',
        lineHeight: 19,
        marginBottom: 16,
    },
    selectorLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94a3b8',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    typeSelectorRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    typePill: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    typePillActive: {
        backgroundColor: '#008080',
    },
    typePillText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
    },
    typePillTextActive: {
        color: '#ffffff',
    },
    uploadBtn: {
        flexDirection: 'row',
        backgroundColor: '#008080',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    statusBox: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 20,
    },
    statusText: {
        fontSize: 13,
        color: '#008080',
        fontWeight: '600',
    },
    ocrCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        marginBottom: 20,
    },
    ocrHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ocrCardTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#002b40',
        marginLeft: 6,
    },
    ocrConfidence: {
        fontSize: 11,
        color: '#64748b',
        marginBottom: 10,
    },
    ocrTextPreview: {
        fontSize: 12,
        color: '#334155',
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 8,
        lineHeight: 17,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    resultCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#008080',
        marginBottom: 30,
    },
    resultHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    resultBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e6f7f7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    resultBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#008080',
    },
    providerText: {
        fontSize: 11,
        color: '#94a3b8',
    },
    markdownOutputWrap: {
        marginBottom: 20,
    },
    mdTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#002b40',
        marginBottom: 12,
    },
    mdSectionHeader: {
        fontSize: 15,
        fontWeight: '700',
        color: '#008080',
        marginTop: 14,
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 4,
    },
    mdParagraph: {
        fontSize: 13,
        color: '#334155',
        lineHeight: 20,
        marginBottom: 8,
    },
    mdTableRow: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginBottom: 4,
        borderRadius: 6,
    },
    mdTableHeaderRow: {
        backgroundColor: '#e6f7f7',
        borderColor: '#008080',
    },
    mdTableCell: {
        fontSize: 12,
        color: '#334155',
        paddingHorizontal: 4,
    },
    mdTableHeaderCell: {
        fontWeight: '700',
        color: '#004d4d',
    },
    mdBulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
        paddingLeft: 4,
    },
    mdBulletDot: {
        fontSize: 14,
        color: '#008080',
        marginRight: 8,
        fontWeight: '700',
    },
    mdBulletText: {
        flex: 1,
        fontSize: 13,
        color: '#334155',
        lineHeight: 19,
    },
    mdDisclaimerBox: {
        backgroundColor: '#fffbe6',
        borderWidth: 1,
        borderColor: '#ffe58f',
        borderLeftWidth: 4,
        borderLeftColor: '#faad14',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
        marginBottom: 10,
    },
    mdDisclaimerTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#d48806',
        marginBottom: 4,
    },
    mdDisclaimerText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 17,
    },
    downloadBtn: {
        flexDirection: 'row',
        backgroundColor: '#004d4d',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    downloadBtnText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
});
