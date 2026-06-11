import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';
import { sendAiMessage } from '@/lib/aiChatApi';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function AiChatScreen() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
    // Fade‑in animation for new message
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    addMessage(userMsg);
    setInput('');
    setLoading(true);
    try {
      const authToken = token ?? '';
      const response = await sendAiMessage(authToken, input);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response.reply };
      addMessage(aiMsg);
    } catch (e) {
      const errMsg: Message = { id: (Date.now() + 2).toString(), role: 'assistant', content: 'Sorry, something went wrong.' };
      addMessage(errMsg);
    }
    setLoading(false);
  };

  // Auto‑scroll to newest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Assistant</Text>
        <View style={{ width: 20 }} />
        
      </View>

      <ScrollView ref={scrollRef} style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.map(msg => (
          <Animated.View key={msg.id} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble, { opacity: fadeAnim }]}>
            <Text style={styles.messageText}>{msg.content}</Text>
          </Animated.View>
        ))}
        {loading && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color="#00bfa6" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask anything..."
          placeholderTextColor="#8fa8b8"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
        />
        <Pressable onPress={handleSend} style={styles.sendBtn} disabled={loading}>
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, backgroundColor: '#ffffff' },
  backBtn: { padding: 4 },
  headerTitle: { color: '#333', fontSize: 18, fontWeight: '600' },
  chatArea: { flex: 1, paddingHorizontal: 12 },
  chatContent: { paddingVertical: 12 },
  bubble: { maxWidth: '80%', marginVertical: 6, borderRadius: 12, padding: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#d0f0c0' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#f0e68c' },
  messageText: { color: '#333', lineHeight: 20 },
  typingIndicator: { alignSelf: 'flex-start', marginVertical: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#e0e0e0' },
  textInput: { flex: 1, backgroundColor: '#ffffff', color: '#000', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  sendBtn: { backgroundColor: '#00bfa6', borderRadius: 20, padding: 8 },
});
