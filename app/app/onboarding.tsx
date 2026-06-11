import { router } from 'expo-router';
import { useState, useRef } from 'react';
import {
    FlatList,
    StyleSheet,
    View,
    Text,
    Image,
    Dimensions,
    Pressable,
    SafeAreaView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
    {
        id: '1',
        title: 'Describe Your Symptoms',
        subtitle: 'Just speak or type — our AI understands you',
        image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800', // Placeholder for now
        buttonText: 'Get Started ->',
        theme: 'dark',
    },
    {
        id: '2',
        title: 'Get Matched to the Right Doctor',
        subtitle: 'AI finds the best doctor based on your symptoms, urgency and location',
        image: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=800', // Placeholder for now
        buttonText: 'Next',
        theme: 'light',
    },
    {
        id: '3',
        title: 'Track Your Queue in Real Time',
        subtitle: "Know exactly when it's your turn",
        image: 'https://images.unsplash.com/photo-1504813184591-01592fd03cfd?auto=format&fit=crop&q=80&w=800', // Placeholder for now
        buttonText: 'Get Started',
        theme: 'light',
    },
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (currentIndex < ONBOARDING_DATA.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
            setCurrentIndex(currentIndex + 1);
        } else {
            router.push('/signup');
        }
    };

    const renderItem = ({ item, index }: { item: typeof ONBOARDING_DATA[0], index: number }) => {
        const isDark = item.theme === 'dark';
        return (
            <View style={[styles.slide, { backgroundColor: isDark ? '#001a2c' : '#ffffff' }]}>
                <View style={styles.topSection}>
                    <Pressable style={styles.skipButton} onPress={() => router.push('/signup')}>
                        <Text style={[styles.skipText, { color: isDark ? '#ffffff' : '#6f7f79' }]}>Skip</Text>
                    </Pressable>
                    <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
                </View>

                <View style={[styles.bottomCard, { backgroundColor: isDark ? '#002b40' : '#ffffff' }]}>
                    <Text style={[styles.title, { color: isDark ? '#ffffff' : '#15332c' }]}>{item.title}</Text>
                    <Text style={[styles.subtitle, { color: isDark ? '#cde6eb' : '#6f7f79' }]}>{item.subtitle}</Text>
                    
                    <View style={styles.pagination}>
                        {ONBOARDING_DATA.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    { backgroundColor: i === currentIndex ? '#008080' : '#d1e0e0' },
                                    i === currentIndex && styles.activeDot,
                                ]}
                            />
                        ))}
                    </View>

                    <Pressable style={styles.button} onPress={handleNext}>
                        <Text style={styles.buttonText}>{item.buttonText}</Text>
                    </Pressable>

                    {index === ONBOARDING_DATA.length - 1 && (
                        <View style={styles.loginLinkRow}>
                            <Text style={[styles.loginText, { color: isDark ? '#cde6eb' : '#6f7f79' }]}>Already have an account? </Text>
                            <Pressable onPress={() => router.push('/login')}>
                                <Text style={styles.loginLinkText}>Log In</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={ONBOARDING_DATA}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                keyExtractor={(item) => item.id}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slide: {
        width,
        height,
    },
    topSection: {
        flex: 0.6,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    skipButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '500',
    },
    image: {
        width: width * 0.8,
        height: width * 0.8,
    },
    bottomCard: {
        flex: 0.4,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 30,
    },
    pagination: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    activeDot: {
        width: 20,
    },
    button: {
        backgroundColor: '#008080',
        width: '100%',
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    loginLinkRow: {
        flexDirection: 'row',
        marginTop: 20,
    },
    loginText: {
        fontSize: 14,
    },
    loginLinkText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#008080',
    },
});
