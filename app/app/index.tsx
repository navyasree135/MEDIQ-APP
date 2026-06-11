import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Text, Image } from 'react-native';

import { useAuth } from '@/hooks/use-auth';

export default function RootIndexScreen() {
    const { user, loading } = useAuth();
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2500); // 2.5 seconds for splash

        return () => clearTimeout(timer);
    }, []);

    if (showSplash) {
        return (
            <View style={styles.splashContainer}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>MediQ</Text>
                    <Text style={styles.tagline}>Your AI Health Companion</Text>
                </View>
                <View style={styles.footer}>
                    <View style={styles.dot} />
                </View>
            </View>
        );
    }

    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        backgroundColor: '#001a2c',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoText: {
        fontSize: 48,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 16,
        color: '#3ea8c4',
        marginTop: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#ffffff',
        opacity: 0.5,
    },
});

