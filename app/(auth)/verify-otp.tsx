import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const { verificationId, phoneNumber, name } = useLocalSearchParams<{ verificationId: string, phoneNumber: string, name?: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<TextInput[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit code');
      return;
    }
    
    console.log('Verifying OTP:', otpString);
    
    if (!verificationId) {
      Alert.alert('Error', 'Missing verification session. Please go back and try again.');
      return;
    }

    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId, otpString);
      const userCredential = await auth().signInWithCredential(credential);
      
      if (name && userCredential.user) {
        await userCredential.user.updateProfile({ displayName: name });
      }

      // Initialize user in Firestore
      if (userCredential.user) {
        const { userService } = require('@/services/userService');
        await userService.initializeUser(userCredential.user.uid, {
          displayName: name || userCredential.user.displayName || 'User',
          email: userCredential.user.email || '',
          phoneNumber: userCredential.user.phoneNumber || phoneNumber || '',
        });
      }

      Alert.alert('Success', 'Verified successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') } 
      ]);
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verification</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Enter your{'\n'}Verification Code</Text>
          <Text style={styles.subtitle}>We sent a verification code to {phoneNumber || 'your phone'}.</Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref as TextInput)}
                style={styles.otpInput}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>04:59</Text>
            <Text style={styles.resendText}>
              I didn't receive the code?{' '}
              <Text style={styles.resendLink}>Resend</Text>
            </Text>
          </View>

          <Button title="Verify" onPress={handleVerify} style={styles.verifyButton} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.lg,
    color: Colors.text,
  },
  content: {
    marginTop: 40,
  },
  title: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.xl * 1.2,
    color: Colors.text,
    lineHeight: 40,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  timerContainer: {
    marginBottom: 32,
  },
  timerText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.lg,
    color: Colors.primary,
    marginBottom: 8,
  },
  resendText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
  },
  resendLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  verifyButton: {
    marginTop: 16,
  },
});
