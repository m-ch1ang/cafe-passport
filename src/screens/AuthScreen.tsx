import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSend = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: 'cafepassport://auth' },
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.heading}>Café Passport</Text>
        <Text style={styles.tagline}>Your coffee journey starts here</Text>

        {status === 'success' ? (
          <Text style={styles.success}>Check your email for a magic link</Text>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9C8B82"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={status !== 'loading'}
            />

            {status === 'error' && (
              <Text style={styles.error}>{errorMessage}</Text>
            )}

            <TouchableOpacity
              style={[styles.button, status === 'loading' && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <ActivityIndicator color="#FAF7F2" />
              ) : (
                <Text style={styles.buttonText}>Send magic link</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  heading: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2C1810',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#2C1810',
    opacity: 0.6,
    marginBottom: 48,
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#D4C4B8',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2C1810',
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
  },
  error: {
    color: '#C0392B',
    fontSize: 14,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  success: {
    fontSize: 16,
    color: '#2C1810',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: '#D4820A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FAF7F2',
    fontSize: 16,
    fontWeight: '600',
  },
});
