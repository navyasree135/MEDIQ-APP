import { useMemo, useState, useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
    ScrollView,
    Image,
    Animated,
    Easing,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';
import { analyzeSymptoms, sendCoordinatorMessage } from '@/lib/api';

type ScreenState = 'input' | 'listening' | 'analyzing' | 'result';
type UrgencyType = 'urgent' | 'priority' | 'routine';

export default function ChatScreen() {
    const { token, user } = useAuth();
    
    // UI Screen state
    const [state, setState] = useState<ScreenState>('input');
    
    // Input parameters
    const [inputType, setInputType] = useState<'type' | 'voice'>('type');
    const [symptomsText, setSymptomsText] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>(['Fever']);
    
    // Voice transcription state
    const [transcript, setTranscript] = useState('');
    const dictationInputRef = useRef<TextInput>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);

    // Triage results
    const [urgency, setUrgency] = useState<UrgencyType>('routine');
    const [rationale, setRationale] = useState('');
    
    // Analyzing Steps
    const [analysisStep, setAnalysisStep] = useState(1);
    const [analysisProgress, setAnalysisProgress] = useState(10);
    
    // Quick tags definition
    const quickTags = ['Fever', 'Headache', 'Cough', 'Fatigue', 'Nausea', 'Pain'];

    // Animation values
    const anim1 = useRef(new Animated.Value(20)).current;
    const anim2 = useRef(new Animated.Value(40)).current;
    const anim3 = useRef(new Animated.Value(15)).current;
    const anim4 = useRef(new Animated.Value(50)).current;
    const anim5 = useRef(new Animated.Value(30)).current;
    const spinValue = useRef(new Animated.Value(0)).current;

    // Equalizer animation logic
    useEffect(() => {
        if (state === 'listening') {
            const createAnimation = (anim: Animated.Value, toValue: number, duration: number) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue,
                            duration,
                            easing: Easing.linear,
                            useNativeDriver: false,
                        }),
                        Animated.timing(anim, {
                            toValue: 15,
                            duration,
                            easing: Easing.linear,
                            useNativeDriver: false,
                        }),
                    ])
                );
            };

            const a1 = createAnimation(anim1, 55, 600);
            const a2 = createAnimation(anim2, 65, 500);
            const a3 = createAnimation(anim3, 45, 700);
            const a4 = createAnimation(anim4, 70, 400);
            const a5 = createAnimation(anim5, 50, 550);

            a1.start();
            a2.start();
            a3.start();
            a4.start();
            a5.start();

            // Autofocus text input to open keyboard dictation instantly
            const focusTimer = setTimeout(() => {
                dictationInputRef.current?.focus();
            }, 300);

            return () => {
                a1.stop();
                a2.stop();
                a3.stop();
                a4.stop();
                a5.stop();
                clearTimeout(focusTimer);
            };
        }
    }, [state]);

    // Spinner animation logic
    useEffect(() => {
        if (state === 'analyzing') {
            spinValue.setValue(0);
            Animated.loop(
                Animated.timing(spinValue, {
                    toValue: 1,
                    duration: 3500,
                    easing: Easing.linear,
                    useNativeDriver: false,
                })
            ).start();
        }
    }, [state]);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    // Handle Triage analyze
    const handleStartAnalysis = async (inputText: string) => {
        const queryText = inputText.trim() || symptomsText.trim() || `Symptom tags: ${selectedTags.join(', ')}`;
        console.log('[MediQ Triage] queryText being sent to AI:', queryText);
        
        setState('analyzing');
        setAnalysisStep(1);
        setAnalysisProgress(12);

        // Simulated steps progress
        const progressInterval = setInterval(() => {
            setAnalysisProgress(p => {
                if (p < 95) return p + 3;
                return p;
            });
        }, 150);

        // Step 1: NLP Processing (1.1s)
        const t1 = setTimeout(() => {
            setAnalysisStep(2);
            setAnalysisProgress(45);
        }, 1100);

        // Step 2: Knowledge Base Query (2.3s)
        const t2 = setTimeout(() => {
            setAnalysisStep(3);
            setAnalysisProgress(82);
        }, 2300);

        // Real API call to the backend coordinator agent when logged in
        let apiResult: { urgency: UrgencyType; rationale: string } | null = null;
        try {
            if (!token) {
                console.warn('[MediQ Triage] WARNING: token is null/undefined — skipping API call, will use fallback classifier');
            } else {
                console.log('[MediQ Triage] Calling coordinator agent with token and queryText...');
                const response = await sendCoordinatorMessage(token, queryText, sessionId ?? undefined);
                setSessionId(response.session_id);
                if (response.triage) {
                    apiResult = response.triage;
                } else {
                    apiResult = {
                        urgency: 'routine',
                        rationale: response.reply,
                    };
                }
                console.log('[MediQ Triage] Coordinator response received:', JSON.stringify(response));
            }
        } catch (err) {
            console.warn('[MediQ Triage] Coordinator API call failed, falling back to local classifier:', err);
        }

        // Advanced internal NLP / Urgency classification algorithm
        if (!apiResult) {
            console.log('[MediQ Triage] No API result — using keyword-based fallback classifier');
            const cleanText = queryText.toLowerCase();
            if (
                cleanText.includes('chest') || 
                cleanText.includes('heart') || 
                cleanText.includes('breath') ||
                cleanText.includes('bleeding') ||
                cleanText.includes('unconscious') ||
                cleanText.includes('seizure') ||
                cleanText.includes('stroke') ||
                cleanText.includes('paralysis') ||
                cleanText.includes('unable to breathe')
            ) {
                apiResult = {
                    urgency: 'urgent',
                    rationale: 'Critical symptoms detected (possible cardiac, respiratory, or neurological emergency). Immediate medical intervention required.'
                };
            } else if (
                cleanText.includes('fever') || 
                cleanText.includes('headache') || 
                cleanText.includes('vomiting') ||
                cleanText.includes('stomach') || 
                cleanText.includes('nausea') || 
                cleanText.includes('pain') ||
                cleanText.includes('swelling') ||
                cleanText.includes('dizziness') ||
                cleanText.includes('infection') ||
                cleanText.includes('fatigue') ||
                cleanText.includes('weakness')
            ) {
                apiResult = {
                    urgency: 'priority',
                    rationale: 'Active medical symptoms require prioritized medical attention and slot scheduling within 24 hours.'
                };
            } else {
                apiResult = {
                    urgency: 'routine',
                    rationale: 'Mild or routine physiological discomforts indicate routine consultation. No immediate threats identified.'
                };
            }
            console.log('[MediQ Triage] Fallback classifier result:', JSON.stringify(apiResult));
        }

        // Show result transition once progress reaches 100
        setTimeout(() => {
            clearInterval(progressInterval);
            setAnalysisProgress(100);
            
            setUrgency(apiResult?.urgency || 'routine');
            setRationale(apiResult?.rationale || 'AI triage complete.');
            
            setState('result');
        }, 3400);
    };

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    // Header component
    const renderHeader = (title: string, isDark: boolean = false, onBackPress?: () => void) => {
        return (
            <View style={[styles.header, isDark ? styles.headerDark : styles.headerLight]}>
                <View style={styles.headerLeft}>
                    <Pressable onPress={onBackPress || (() => router.back())} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#002b40'} />
                    </Pressable>
                    <Text style={[styles.headerTitle, isDark ? styles.headerTitleDark : styles.headerTitleLight]}>{title}</Text>
                </View>
                <Ionicons name="ellipsis-vertical" size={24} color={isDark ? '#fff' : '#002b40'} />
            </View>
        );
    };

    // Render Input state (1st Pic)
    const renderInputState = () => {
        return (
            <SafeAreaView style={styles.safeArea}>
                {/* Header removed */}
                
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Toggle Switch */}
                    <View style={styles.toggleOuter}>
                        <Pressable 
                            style={[styles.toggleBtn, inputType === 'type' ? styles.toggleBtnActive : styles.toggleBtnInactive]}
                            onPress={() => setInputType('type')}
                        >
                            <Text style={inputType === 'type' ? styles.toggleTextActive : styles.toggleTextInactive}>Type Symptoms</Text>
                        </Pressable>
                        <Pressable 
                            style={[styles.toggleBtn, inputType === 'voice' ? styles.toggleBtnActive : styles.toggleBtnInactive]}
                            onPress={() => {
                                setTranscript('');
                                setState('listening');
                            }}
                        >
                            <Ionicons name="mic-outline" size={16} color={inputType === 'voice' ? "#fff" : "#008080"} style={{ marginRight: 6 }} />
                            <Text style={inputType === 'voice' ? styles.toggleTextActive : styles.toggleTextInactive}>Voice Input</Text>
                        </Pressable>
                    </View>

                    {/* Description Block */}
                    <View style={styles.sectionWrap}>
                        <Text style={styles.sectionHeader}>DESCRIPTION</Text>
                        <View style={styles.textAreaContainer}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="Describe your symptoms.."
                                placeholderTextColor="#6f7f79"
                                multiline
                                value={symptomsText}
                                onChangeText={setSymptomsText}
                            />
                            <View style={styles.textareaFooter}>
                                <Ionicons name="pencil-outline" size={14} color="#8ab8b8" />
                                <Text style={styles.textareaFooterText}>Visualizing data..</Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Tags Block */}
                    <View style={styles.sectionWrap}>
                        <View style={styles.tagsHeader}>
                            <Text style={styles.sectionHeader}>QUICK TAGS</Text>
                            <Pressable>
                                <Text style={styles.viewAllText}>View all</Text>
                            </Pressable>
                        </View>
                        <View style={styles.tagsGrid}>
                            {quickTags.map((tag) => {
                                const isSelected = selectedTags.includes(tag);
                                return (
                                    <Pressable
                                        key={tag}
                                        style={[styles.tagBadge, isSelected ? styles.tagBadgeActive : styles.tagBadgeInactive]}
                                        onPress={() => toggleTag(tag)}
                                    >
                                        {isSelected && <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginRight: 4 }} />}
                                        <Text style={[styles.tagText, isSelected ? styles.tagTextActive : styles.tagTextInactive]}>
                                            {tag}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* Banner Block */}
                    <View style={styles.bannerContainer}>
                        <Image 
                            source={{ uri: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600' }} 
                            style={styles.bannerImage} 
                        />
                        <View style={styles.bannerOverlay}>
                            <View style={styles.statusBadge}>
                                <View style={styles.pulseDot} />
                                <Text style={styles.statusText}>MediQ AI is ready to analyze</Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Button */}
                    <Pressable 
                        style={styles.analyzeButton}
                        onPress={() => handleStartAnalysis(symptomsText)}
                    >
                        <Ionicons name="analytics-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.analyzeButtonText}>Analyse Symptoms</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        );
    };

    // Render Listening State (2nd Pic)
    const renderListeningState = () => {
        return (
            <SafeAreaView style={[styles.safeArea, styles.darkBg]}>
                {/* Reset listening state to input */}
                
                <KeyboardAvoidingView 
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView contentContainerStyle={styles.listeningCenter} keyboardShouldPersistTaps="handled">
                        {/* Glowing active intelligence text */}
                        <View style={styles.intelBadge}>
                            <View style={styles.cyanPulseDot} />
                            <Text style={styles.intelText}>SPEECH RECOGNITION LIVE</Text>
                        </View>

                        {/* Wave circular pattern */}
                        <View style={styles.radarContainer}>
                            <View style={styles.radarRing1} />
                            <View style={styles.radarRing2} />
                            <View style={styles.radarRing3} />
                            
                            {/* Equalizer animation wave */}
                            <View style={styles.equalizerRow}>
                                <Animated.View style={[styles.eqBar, { height: anim1 }]} />
                                <Animated.View style={[styles.eqBar, { height: anim2 }]} />
                                <Animated.View style={[styles.eqBar, { height: anim3 }]} />
                                <Animated.View style={[styles.eqBar, { height: anim4 }]} />
                                <Animated.View style={[styles.eqBar, { height: anim5 }]} />
                            </View>
                        </View>

                        {/* Titles */}
                        <Text style={styles.listeningTitle}>Listening...</Text>
                        <Text style={styles.listeningSubtitle}>
                            🎙️ Tap Gboard Mic or type your symptoms below:
                        </Text>

                        {/* Live Transcription Glassmorphic Input Area */}
                        <View style={styles.transcriptCard}>
                            <TextInput
                                ref={dictationInputRef}
                                style={styles.dictationInputInsideListening}
                                placeholder="Start speaking now..."
                                placeholderTextColor="#8fa8b8"
                                multiline
                                value={transcript}
                                onChangeText={setTranscript}
                            />
                        </View>

                        {/* Stop Button */}
                        <Pressable 
                            style={styles.stopButton} 
                            onPress={() => {
                                Keyboard.dismiss();
                                const finalQueryText = transcript.trim();
                                if (!finalQueryText) {
                                    Alert.alert(
                                        'No Speech Detected',
                                        'We could not hear your symptoms clearly. Please try speaking again.',
                                        [{ text: 'OK' }]
                                    );
                                    return;
                                }
                                handleStartAnalysis(finalQueryText);
                            }}
                        >
                            <View style={styles.stopSquare} />
                        </Pressable>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    };

    // Render Analyzing State (3rd Pic)
    const renderAnalyzingState = () => {
        return (
            <SafeAreaView style={[styles.safeArea, styles.darkBg]}>
                {/* Header removed */}
                
                <View style={styles.analyzingContent}>
                    {/* Plexus Spin */}
                    <View style={styles.plexusContainer}>
                        <Animated.View style={[styles.plexusCircle, { transform: [{ rotate: spin }] }]}>
                            <Ionicons name="planet-outline" size={90} color="#00ffff" />
                        </Animated.View>
                        <Ionicons name="medical" size={32} color="#00ffff" style={styles.plexusCenterIcon} />
                    </View>

                    <Text style={styles.analyzingTitle}>Analysing Your Symptoms</Text>
                    <Text style={styles.analyzingSubtitle}>AI engine is cross-referencing clinical data...</Text>

                    {/* Dynamic Step list */}
                    <View style={styles.stepsCard}>
                        {/* Step 1 */}
                        <View style={styles.stepRow}>
                            <View style={styles.stepIconWrap}>
                                {analysisStep > 1 ? (
                                    <Ionicons name="checkmark-circle" size={24} color="#00cc99" />
                                ) : (
                                    <ActivityIndicator size="small" color="#00ffff" />
                                )}
                            </View>
                            <Text style={[styles.stepText, analysisStep >= 1 ? styles.stepTextActive : styles.stepTextMuted]}>
                                Processing natural language
                            </Text>
                        </View>

                        {/* Step 2 */}
                        <View style={styles.stepRow}>
                            <View style={styles.stepIconWrap}>
                                {analysisStep > 2 ? (
                                    <Ionicons name="checkmark-circle" size={24} color="#00cc99" />
                                ) : analysisStep === 2 ? (
                                    <ActivityIndicator size="small" color="#00ffff" />
                                ) : (
                                    <Ionicons name="ellipse-outline" size={20} color="#3d6259" />
                                )}
                            </View>
                            <Text style={[styles.stepText, analysisStep >= 2 ? styles.stepTextActive : styles.stepTextMuted]}>
                                Searching medical knowledge base
                            </Text>
                        </View>

                        {/* Step 3 */}
                        <View style={styles.stepRow}>
                            <View style={styles.stepIconWrap}>
                                {analysisStep > 3 ? (
                                    <Ionicons name="checkmark-circle" size={24} color="#00cc99" />
                                ) : analysisStep === 3 ? (
                                    <ActivityIndicator size="small" color="#00ffff" />
                                ) : (
                                    <Ionicons name="time-outline" size={20} color="#3d6259" />
                                )}
                            </View>
                            <Text style={[styles.stepText, analysisStep >= 3 ? styles.stepTextActive : styles.stepTextMuted]}>
                                Classifying urgency level
                            </Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressSection}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${analysisProgress}%` }]} />
                        </View>
                        <View style={styles.progressTextRow}>
                            <Text style={styles.progressTimeText}>ESTIMATED TIME: {Math.max(1, Math.round((100 - analysisProgress) / 25))}s</Text>
                            <Text style={styles.progressPercentText}>{analysisProgress}% COMPLETE</Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        );
    };

    // Render Results State (4th Pic)
    const renderResultState = () => {
        // Render Low Urgency Screen
        if (urgency === 'routine') {
            return (
                <SafeAreaView style={[styles.safeArea, { backgroundColor: '#f3faf8' }]}>
                    {/* Header removed */}
                    
                    <ScrollView contentContainerStyle={styles.resultScrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.resultMainCard}>
                            <View style={[styles.resultCircle, { backgroundColor: '#00cc99' }]}>
                                <Ionicons name="checkmark" size={48} color="#fff" />
                            </View>
                            <Text style={[styles.resultTitle, { color: '#006644' }]}>Low Urgency</Text>
                            <Text style={styles.resultSubtitleText}>
                                Your symptoms suggest a routine condition. No immediate concern.
                            </Text>
                        </View>

                        {/* Detected Symptoms */}
                        <View style={styles.cardWrap}>
                            <Text style={styles.cardHeaderTitle}>Detected Symptoms</Text>
                            <View style={styles.cardBulletRow}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#008080" />
                                <Text style={styles.cardBulletText}>Mild fatigue</Text>
                            </View>
                            <View style={styles.cardBulletRow}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#008080" />
                                <Text style={styles.cardBulletText}>Slight throat irritation</Text>
                            </View>
                            <View style={styles.cardBulletRow}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#008080" />
                                <Text style={styles.cardBulletText}>No fever recorded</Text>
                            </View>
                        </View>

                        {/* Recommended Care */}
                        <View style={styles.cardWrap}>
                            <Text style={styles.cardHeaderTitle}>RECOMMENDED CARE</Text>
                            <View style={styles.careRecommendationCard}>
                                <View style={styles.careRecommendationLeft}>
                                    <Ionicons name="medkit-outline" size={24} color="#008080" />
                                    <Text style={styles.careSpecialistTitle}>General Physician</Text>
                                </View>
                                <Ionicons name="add-circle" size={24} color="#008080" />
                            </View>
                        </View>

                        {/* AI Verified Status */}
                        <View style={styles.cardWrap}>
                            <Text style={styles.cardHeaderTitle}>AI CLINICAL RATIONALE</Text>
                            <View style={styles.rationaleContainer}>
                                <Ionicons name="sparkles" size={16} color="#008080" style={{ marginRight: 6 }} />
                                <Text style={styles.rationaleText}>{rationale}</Text>
                            </View>
                        </View>

                        {/* Bottom Actions */}
                        <Pressable 
                            style={styles.actionBtnPrimary}
                            onPress={() => router.push('/recommended-doctors')}
                        >
                            <Text style={styles.actionBtnPrimaryText}>Find Available Doctors</Text>
                        </Pressable>
                    </ScrollView>
                </SafeAreaView>
            );
        }

        // Render Medium Urgency Screen
        if (urgency === 'priority') {
            const isStomachAche = transcript.toLowerCase().includes('stomach') || symptomsText.toLowerCase().includes('stomach') || rationale.toLowerCase().includes('abdominal') || rationale.toLowerCase().includes('stomach');
            return (
                <SafeAreaView style={[styles.safeArea, { backgroundColor: '#fffbf4' }]}>
                    {/* Header removed */}
                    
                    <ScrollView contentContainerStyle={styles.resultScrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.resultMainCard}>
                            <View style={[styles.resultCircle, { backgroundColor: '#ff9900' }]}>
                                <Text style={{ fontSize: 44, color: '#fff', fontWeight: 'bold' }}>!</Text>
                            </View>
                            <Text style={[styles.resultTitle, { color: '#b36600' }]}>Medium Urgency</Text>
                            <Text style={styles.resultSubtitleText}>
                                Your symptoms need attention soon. Please book within 24 hours.
                            </Text>
                        </View>

                        {/* Reported Symptoms */}
                        <View style={styles.cardWrap}>
                            <Text style={styles.cardHeaderTitle}>Reported Symptoms</Text>
                            <View style={styles.tagsHorizontalList}>
                                {isStomachAche ? (
                                    <>
                                        <View style={styles.orangeBadge}><Text style={styles.orangeBadgeText}>STOMACH ACHE</Text></View>
                                        <View style={styles.orangeBadge}><Text style={styles.orangeBadgeText}>NAUSEA</Text></View>
                                        <View style={styles.orangeBadge}><Text style={styles.orangeBadgeText}>ABDOMINAL DISCOMFORT</Text></View>
                                    </>
                                ) : (
                                    <>
                                        <View style={styles.orangeBadge}><Text style={styles.orangeBadgeText}>PERSISTENT COUGH</Text></View>
                                        <View style={styles.orangeBadge}><Text style={styles.orangeBadgeText}>LOW-GRADE FEVER</Text></View>
                                        <View style={styles.orangeBadge}><Text style={styles.orangeBadgeText}>CHEST TIGHTNESS</Text></View>
                                    </>
                                )}
                            </View>
                        </View>

                        {/* Recommended Specialist Doctor Card */}
                        <View style={styles.cardWrap}>
                            <Text style={styles.cardHeaderTitle}>Recommended Specialist</Text>
                            <View style={styles.doctorItemCard}>
                                <Image 
                                    source={{ 
                                        uri: isStomachAche 
                                            ? 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200' 
                                            : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200' 
                                    }} 
                                    style={styles.doctorAvatar} 
                                />
                                <View style={styles.doctorInfo}>
                                    <Text style={styles.doctorName}>{isStomachAche ? 'Dr. Sarah Connor' : 'Dr. Julian Vane'}</Text>
                                    <Text style={styles.doctorSub}>{isStomachAche ? 'Gastroenterologist' : 'Senior Pulmonologist'}</Text>
                                    <View style={styles.ratingRow}>
                                        <Ionicons name="star" size={14} color="#ff9900" />
                                        <Text style={styles.ratingText}>4.9 (120 reviews)</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.doctorMemoBox}>
                                <Ionicons name="information-circle-outline" size={18} color="#b36600" style={{ marginRight: 6 }} />
                                <Text style={styles.doctorMemoText}>
                                    {isStomachAche 
                                        ? 'Dr. Connor specializes in gastroenterology and abdominal diagnostics. She has 12+ years experience treating acute stomach aches and stomach ailments.'
                                        : 'Dr. Vane is a specialist in respiratory health and has 15+ years experience treating similar symptomatic profiles.'
                                    }
                                </Text>
                            </View>
                        </View>

                        {/* AI Triage Rationale */}
                        <View style={styles.cardWrap}>
                            <Text style={styles.cardHeaderTitle}>AI CLINICAL RATIONALE</Text>
                            <View style={styles.rationaleContainerOrange}>
                                <Text style={styles.rationaleTextOrange}>{rationale}</Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <Pressable 
                            style={[styles.actionBtnPrimary, { backgroundColor: '#002b40' }]}
                            onPress={() => router.push('/recommended-doctors')}
                        >
                            <Text style={styles.actionBtnPrimaryText}>Book Priority Appointment</Text>
                        </Pressable>
                        <Text style={styles.availableSlotsHint}>Available slots starting in 2h 15m</Text>
                    </ScrollView>
                </SafeAreaView>
            );
        }

        // Render High Urgency Screen
        return (
            <SafeAreaView style={[styles.safeArea, { backgroundColor: '#fff5f5' }]}>
                {/* Header removed */}
                
                <ScrollView contentContainerStyle={styles.resultScrollContent} showsVerticalScrollIndicator={false}>
                    {/* Action required banner */}
                    <View style={styles.dangerBanner}>
                        <Ionicons name="warning" size={24} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.dangerBannerTitle}>High Urgency</Text>
                    </View>

                    <View style={styles.resultMainCard}>
                        <Text style={[styles.resultTitle, { color: '#cc0000', marginTop: 10 }]}>Action Required</Text>
                        <Text style={styles.resultSubtitleText}>
                            Seek medical attention immediately
                        </Text>
                    </View>

                    {/* Detected Symptoms */}
                    <View style={styles.cardWrap}>
                        <Text style={styles.cardHeaderTitle}>Detected Symptoms</Text>
                        <View style={styles.cardBulletRow}>
                            <Ionicons name="close-circle" size={18} color="#cc0000" />
                            <Text style={[styles.cardBulletText, { fontWeight: '600' }]}>Acute chest pain radiating to left arm</Text>
                        </View>
                        <View style={styles.cardBulletRow}>
                            <Ionicons name="close-circle" size={18} color="#cc0000" />
                            <Text style={[styles.cardBulletText, { fontWeight: '600' }]}>Shortness of breath (Dyspnea)</Text>
                        </View>
                        <View style={styles.cardBulletRow}>
                            <Ionicons name="close-circle" size={18} color="#cc0000" />
                            <Text style={[styles.cardBulletText, { fontWeight: '600' }]}>Cold perspiration (Diaphoresis)</Text>
                        </View>
                    </View>

                    {/* Recommended Specialist */}
                    <View style={styles.cardWrap}>
                        <Text style={styles.cardHeaderTitle}>RECOMMENDED SPECIALIST</Text>
                        <View style={styles.doctorItemCard}>
                            <Image 
                                source={{ uri: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200' }} 
                                style={styles.doctorAvatar} 
                            />
                            <View style={styles.doctorInfo}>
                                <Text style={styles.doctorName}>Cardiologist</Text>
                                <Text style={styles.doctorSub}>Available at Central Medical Hub</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#cc0000" />
                        </View>
                    </View>

                    {/* AI Clincal Rationale */}
                    <View style={styles.cardWrap}>
                        <Text style={styles.cardHeaderTitle}>AI CLINICAL RATIONALE</Text>
                        <View style={styles.rationaleContainerRed}>
                            <Text style={styles.rationaleTextRed}>{rationale}</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <Pressable 
                        style={[styles.actionBtnPrimary, { backgroundColor: '#002b40', marginBottom: 12 }]}
                        onPress={() => router.push('/recommended-doctors')}
                    >
                        <Text style={styles.actionBtnPrimaryText}>Book Emergency Appointment</Text>
                    </Pressable>

                    <Pressable 
                        style={styles.actionBtnDangerOutline}
                        onPress={() => router.push('/emergency-alert')}
                    >
                        <Ionicons name="call" size={18} color="#cc0000" style={{ marginRight: 8 }} />
                        <Text style={styles.actionBtnDangerOutlineText}>Call Emergency Services</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        );
    };

    // State routing
    if (state === 'listening') return renderListeningState();
    if (state === 'analyzing') return renderAnalyzingState();
    if (state === 'result') return renderResultState();
    return renderInputState();
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    darkBg: {
        backgroundColor: '#001525',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerLight: {
        backgroundColor: '#ffffff',
        borderBottomColor: '#f0f5f4',
    },
    headerDark: {
        backgroundColor: '#001525',
        borderBottomColor: '#002742',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    headerTitleLight: {
        color: '#002b40',
    },
    headerTitleDark: {
        color: '#ffffff',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    toggleOuter: {
        flexDirection: 'row',
        backgroundColor: '#f0f7f7',
        borderRadius: 30,
        padding: 4,
        marginTop: 40,
        marginBottom: 10,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 26,
    },
    toggleBtnActive: {
        backgroundColor: '#008080',
    },
    toggleBtnInactive: {
        backgroundColor: 'transparent',
    },
    toggleTextActive: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    toggleTextInactive: {
        color: '#008080',
        fontSize: 14,
        fontWeight: '700',
    },
    sectionWrap: {
        marginBottom: 25,
    },
    sectionHeader: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6f7f79',
        letterSpacing: 1,
        marginBottom: 10,
    },
    textAreaContainer: {
        borderWidth: 1,
        borderColor: '#008080',
        borderRadius: 16,
        backgroundColor: '#fafdff',
        padding: 15,
        minHeight: 160,
        justifyContent: 'space-between',
    },
    textArea: {
        fontSize: 15,
        color: '#002b40',
        textAlignVertical: 'top',
        height: 110,
    },
    textareaFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
    },
    textareaFooterText: {
        fontSize: 11,
        color: '#8ab8b8',
        marginLeft: 4,
    },
    tagsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    viewAllText: {
        fontSize: 13,
        color: '#008080',
        fontWeight: '700',
    },
    tagsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 5,
    },
    tagBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
    },
    tagBadgeActive: {
        backgroundColor: '#008080',
        borderColor: '#008080',
    },
    tagBadgeInactive: {
        backgroundColor: '#f0f7f7',
        borderColor: '#e0efef',
    },
    tagText: {
        fontSize: 13,
        fontWeight: '600',
    },
    tagTextActive: {
        color: '#ffffff',
    },
    tagTextInactive: {
        color: '#004d4d',
    },
    bannerContainer: {
        height: 100,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 30,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 43, 64, 0.45)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00cc99',
        marginRight: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#002b40',
    },
    analyzeButton: {
        backgroundColor: '#008080',
        borderRadius: 28,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#008080',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
    },
    analyzeButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    listeningCenter: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingVertical: 40,
    },
    intelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 255, 255, 0.08)',
        borderColor: 'rgba(0, 255, 255, 0.2)',
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 30,
    },
    cyanPulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#00ffff',
        marginRight: 8,
    },
    intelText: {
        color: '#00ffff',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    radarContainer: {
        width: 180,
        height: 180,
        borderRadius: 90,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 30,
    },
    radarRing1: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 1.5,
        borderColor: 'rgba(0, 255, 255, 0.05)',
    },
    radarRing2: {
        position: 'absolute',
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 1.5,
        borderColor: 'rgba(0, 255, 255, 0.09)',
    },
    radarRing3: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 1.5,
        borderColor: 'rgba(0, 255, 255, 0.15)',
    },
    equalizerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 70,
    },
    eqBar: {
        width: 6,
        backgroundColor: '#00ffff',
        borderRadius: 3,
    },
    listeningTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 8,
    },
    listeningSubtitle: {
        fontSize: 13,
        color: '#8fa8b8',
        marginBottom: 25,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    transcriptCard: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        marginBottom: 30,
        minHeight: 100,
    },
    dictationInputInsideListening: {
        color: '#ffffff',
        fontSize: 15,
        lineHeight: 22,
        fontStyle: 'italic',
        textAlign: 'center',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    stopButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#8ce6e6',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#8ce6e6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    stopSquare: {
        width: 18,
        height: 18,
        borderRadius: 2,
        backgroundColor: '#001525',
    },
    analyzingContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 25,
        paddingBottom: 40,
    },
    plexusContainer: {
        width: 160,
        height: 160,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 30,
    },
    plexusCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 2,
        borderColor: 'rgba(0, 255, 255, 0.15)',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    plexusCenterIcon: {
        position: 'absolute',
    },
    analyzingTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#ffffff',
        marginBottom: 8,
    },
    analyzingSubtitle: {
        fontSize: 13,
        color: '#8fa8b8',
        textAlign: 'center',
        marginBottom: 35,
    },
    stepsCard: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderRadius: 20,
        padding: 20,
        gap: 16,
        marginBottom: 40,
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepIconWrap: {
        width: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    stepText: {
        fontSize: 14,
        fontWeight: '600',
    },
    stepTextActive: {
        color: '#ffffff',
    },
    stepTextMuted: {
        color: '#3d6259',
    },
    progressSection: {
        width: '100%',
        paddingHorizontal: 5,
    },
    progressBarBg: {
        height: 6,
        width: '100%',
        backgroundColor: '#002742',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#00ffff',
        borderRadius: 3,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    progressTimeText: {
        fontSize: 11,
        color: '#8fa8b8',
        fontWeight: '700',
    },
    progressPercentText: {
        fontSize: 11,
        color: '#00ffff',
        fontWeight: '700',
    },
    resultScrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    dangerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#cc0000',
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 15,
        marginBottom: 5,
    },
    dangerBannerTitle: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '700',
    },
    resultMainCard: {
        alignItems: 'center',
        marginVertical: 25,
    },
    resultCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    resultTitle: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 8,
    },
    resultSubtitleText: {
        fontSize: 14,
        color: '#4e6a62',
        textAlign: 'center',
        paddingHorizontal: 15,
        lineHeight: 20,
    },
    cardWrap: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e8f2f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },
    cardHeaderTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6f7f79',
        letterSpacing: 1,
        marginBottom: 15,
        textTransform: 'uppercase',
    },
    cardBulletRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardBulletText: {
        fontSize: 14,
        color: '#2b4d42',
        marginLeft: 10,
    },
    careRecommendationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f3faf8',
        paddingHorizontal: 15,
        paddingVertical: 16,
        borderRadius: 14,
    },
    careRecommendationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    careSpecialistTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#004d4d',
    },
    rationaleContainer: {
        flexDirection: 'row',
        backgroundColor: '#f3faf8',
        borderColor: '#ccebe6',
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
    },
    rationaleContainerOrange: {
        backgroundColor: '#fff7ed',
        borderColor: '#fed7aa',
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
    },
    rationaleContainerRed: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
    },
    rationaleText: {
        fontSize: 13,
        color: '#006655',
        lineHeight: 20,
        flex: 1,
    },
    rationaleTextOrange: {
        fontSize: 13,
        color: '#b45309',
        lineHeight: 20,
    },
    rationaleTextRed: {
        fontSize: 13,
        color: '#b91c1c',
        lineHeight: 20,
    },
    actionBtnPrimary: {
        backgroundColor: '#008080',
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
        marginTop: 10,
    },
    actionBtnPrimaryText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    tagsHorizontalList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    orangeBadge: {
        backgroundColor: '#fff7ed',
        borderColor: '#ffedd5',
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    orangeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#c2410c',
    },
    doctorItemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    doctorAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: 15,
    },
    doctorInfo: {
        flex: 1,
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#002b40',
    },
    doctorSub: {
        fontSize: 13,
        color: '#6f7f79',
        marginTop: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    ratingText: {
        fontSize: 11,
        color: '#ff9900',
        fontWeight: '700',
        marginLeft: 4,
    },
    doctorMemoBox: {
        flexDirection: 'row',
        backgroundColor: '#f7fafb',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e8f2f4',
    },
    doctorMemoText: {
        fontSize: 12,
        color: '#4e6a62',
        lineHeight: 18,
        flex: 1,
    },
    availableSlotsHint: {
        textAlign: 'center',
        fontSize: 12,
        color: '#b36600',
        fontWeight: '600',
        marginTop: 8,
    },
    actionBtnDangerOutline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 27,
        borderWidth: 1.5,
        borderColor: '#cc0000',
        backgroundColor: '#ffffff',
    },
    actionBtnDangerOutlineText: {
        color: '#cc0000',
        fontSize: 16,
        fontWeight: '700',
    },
});
