import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, SafeAreaView, ScrollView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  requestLoginCode,
  signInWithCode,
  checkPassword,
} from '../services/telegramService';

export default function AuthScreen({ onAuthenticated }) {
  const [step,     setStep]     = useState('setup'); // setup | phone | code | password
  const [apiId,    setApiId]    = useState('');
  const [apiHash,  setApiHash]  = useState('');
  const [phone,    setPhone]    = useState('');
  const [code,     setCode]     = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleSetup = () => {
    if (!apiId.trim() || !apiHash.trim()) {
      setError('Both API ID and API Hash are required.');
      return;
    }
    setError(null);
    setStep('phone');
  };

  const handleSendCode = async () => {
    if (!phone.trim()) { setError('Please enter your phone number.'); return; }
    setError(null); setLoading(true);
    try {
      await requestLoginCode(apiId.trim(), apiHash.trim(), phone.trim());
      setStep('code');
    } catch (e) {
      setError(e.message || 'Failed to send code. Check your API credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) { setError('Please enter the code from Telegram.'); return; }
    setError(null); setLoading(true);
    try {
      const result = await signInWithCode(apiId.trim(), apiHash.trim(), phone.trim(), code.trim());
      if (result.success)                   onAuthenticated();
      else if (result.nextStep === 'password') setStep('password');
    } catch (e) {
      setError(e.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async () => {
    if (!password.trim()) { setError('Please enter your cloud password.'); return; }
    setError(null); setLoading(true);
    try {
      await checkPassword(password.trim());
      onAuthenticated();
    } catch (e) {
      setError(e.message || 'Wrong password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const STEPS = ['setup', 'phone', 'code'];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoWrap}>
          <Ionicons name="cloud-done" size={64} color="#4A90E2" />
        </View>
        <Text style={styles.title}>Telegram Drive</Text>
        <Text style={styles.subtitle}>Mobile</Text>

        {/* Step Indicator */}
        <View style={styles.steps}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepRow}>
              <View style={[styles.stepDot, (STEPS.indexOf(step) >= i) && styles.stepDotActive]}>
                <Text style={[styles.stepNum, (STEPS.indexOf(step) >= i) && styles.stepNumActive]}>{i + 1}</Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, (STEPS.indexOf(step) > i) && styles.stepLineActive]} />
              )}
            </View>
          ))}
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* STEP 1 */}
        {step === 'setup' && (
          <View style={styles.form}>
            <Text style={styles.stepTitle}>API Credentials</Text>
            <Text style={styles.hint}>
              Get yours at{' '}
              <Text style={styles.link}>my.telegram.org</Text>
              {' '}→ API development tools
            </Text>
            <Text style={styles.label}>API ID</Text>
            <TextInput style={styles.input} value={apiId} onChangeText={setApiId}
              placeholder="e.g. 1234567" keyboardType="numeric" autoCapitalize="none" />
            <Text style={styles.label}>API Hash</Text>
            <TextInput style={styles.input} value={apiHash} onChangeText={setApiHash}
              placeholder="e.g. abcdef1234..." autoCapitalize="none" autoCorrect={false} />
            <TouchableOpacity style={styles.btn} onPress={handleSetup}>
              <Text style={styles.btnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2 */}
        {step === 'phone' && (
          <View style={styles.form}>
            <Text style={styles.stepTitle}>Phone Number</Text>
            <Text style={styles.hint}>Enter your Telegram phone number with country code</Text>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone}
              placeholder="+1 234 567 8900" keyboardType="phone-pad" autoFocus />
            <TouchableOpacity style={styles.btn} onPress={handleSendCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <><Text style={styles.btnText}>Send Code</Text><Ionicons name="send" size={16} color="#fff" /></>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn} onPress={() => { setStep('setup'); setError(null); }}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3 */}
        {step === 'code' && (
          <View style={styles.form}>
            <Text style={styles.stepTitle}>Verification Code</Text>
            <Text style={styles.hint}>Check your Telegram app for the login code</Text>
            <Text style={styles.label}>Code</Text>
            <TextInput style={[styles.input, styles.codeInput]} value={code} onChangeText={setCode}
              placeholder="1 2 3 4 5" keyboardType="numeric" autoFocus maxLength={10} />
            <TouchableOpacity style={styles.btn} onPress={handleVerifyCode} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <><Text style={styles.btnText}>Verify</Text><Ionicons name="checkmark" size={18} color="#fff" /></>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn} onPress={() => { setStep('phone'); setError(null); }}>
              <Text style={styles.backText}>← Change Phone</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4 - 2FA */}
        {step === 'password' && (
          <View style={styles.form}>
            <Text style={styles.stepTitle}>Cloud Password</Text>
            <View style={styles.infoBox}>
              <Ionicons name="shield-checkmark" size={16} color="#4A90E2" />
              <Text style={styles.infoText}>Two-Factor Authentication is enabled</Text>
            </View>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword}
              placeholder="Your cloud password" secureTextEntry autoFocus />
            <TouchableOpacity style={styles.btn} onPress={handlePassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <><Text style={styles.btnText}>Unlock</Text><Ionicons name="lock-open" size={16} color="#fff" /></>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#f5f7fa' },
  container:     { flexGrow: 1, alignItems: 'center', padding: 24, paddingBottom: 40 },
  logoWrap:      { width: 110, height: 110, borderRadius: 55, backgroundColor: '#e8f1fc', justifyContent: 'center', alignItems: 'center', marginTop: 40, marginBottom: 12, shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
  title:         { fontSize: 28, fontWeight: '800', color: '#1a1a2e', letterSpacing: 0.5 },
  subtitle:      { fontSize: 14, color: '#4A90E2', fontWeight: '600', marginBottom: 28, letterSpacing: 2, textTransform: 'uppercase' },
  steps:         { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  stepRow:       { flexDirection: 'row', alignItems: 'center' },
  stepDot:       { width: 30, height: 30, borderRadius: 15, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  stepDotActive: { backgroundColor: '#4A90E2' },
  stepNum:       { fontSize: 13, fontWeight: '700', color: '#999' },
  stepNumActive: { color: '#fff' },
  stepLine:      { width: 30, height: 2, backgroundColor: '#e0e0e0' },
  stepLineActive:{ backgroundColor: '#4A90E2' },
  form:          { width: '100%', maxWidth: 420, backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  stepTitle:     { fontSize: 20, fontWeight: '700', color: '#1a1a2e', marginBottom: 6 },
  hint:          { fontSize: 13, color: '#888', marginBottom: 20, lineHeight: 18 },
  link:          { color: '#4A90E2', fontWeight: '600' },
  label:         { fontSize: 11, fontWeight: '700', color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  input:         { borderWidth: 1.5, borderColor: '#e8e8e8', padding: 14, borderRadius: 12, marginBottom: 18, fontSize: 16, backgroundColor: '#fafafa', color: '#1a1a2e' },
  codeInput:     { fontSize: 22, textAlign: 'center', letterSpacing: 8, fontWeight: '700' },
  btn:           { backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#4A90E2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  btnText:       { color: '#fff', fontWeight: '700', fontSize: 16 },
  backBtn:       { marginTop: 14, alignItems: 'center' },
  backText:      { color: '#888', fontSize: 14 },
  errorBox:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ffeaea', borderRadius: 10, padding: 12, marginBottom: 16, width: '100%', maxWidth: 420 },
  errorText:     { color: '#e74c3c', fontSize: 13, flex: 1 },
  infoBox:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#e8f1fc', borderRadius: 10, padding: 12, marginBottom: 18 },
  infoText:      { color: '#4A90E2', fontSize: 13, flex: 1 },
});
