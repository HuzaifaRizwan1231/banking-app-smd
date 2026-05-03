import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Ionicons } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

// Configure Google Sign-In with the Web Client ID you got from Firebase Console
GoogleSignin.configure({
  webClientId: '907124283200-ehua2vck9b25pfn15qo7qsnf93ofvmg3.apps.googleusercontent.com',
});

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleLogin = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    try {
      // Use verifyPhoneNumber to get the verificationId
      await auth().verifyPhoneNumber(phoneNumber).on('state_changed', (phoneAuthSnapshot) => {
        if (phoneAuthSnapshot.state === 'sent') {
          Alert.alert('Success', 'Verification code sent!');
          router.push({
            pathname: '/(auth)/verify-otp',
            params: { 
              verificationId: phoneAuthSnapshot.verificationId,
              phoneNumber 
            }
          });
        }
      }, (error) => {
        Alert.alert('Login Failed', error.message);
      });
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      // Sign out first to force the account picker
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();
      if (!userInfo.data?.idToken) {
        throw new Error('No ID token found');
      }
      const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data.idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      // Initialize user in Firestore if not exists
      const { userService } = require('@/services/userService');
      await userService.initializeUser(userCredential.user.uid, {
        displayName: userCredential.user.displayName || 'User',
        email: userCredential.user.email || '',
        phoneNumber: userCredential.user.phoneNumber || '',
      });

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Google Login Failed', error.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) {
        throw new Error('User cancelled the login process');
      }
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error('Something went wrong obtaining access token');
      }
      const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
      const userCredential = await auth().signInWithCredential(facebookCredential);
      
      // Initialize user in Firestore if not exists
      const { userService } = require('@/services/userService');
      await userService.initializeUser(userCredential.user.uid, {
        displayName: userCredential.user.displayName || 'User',
        email: userCredential.user.email || '',
        phoneNumber: userCredential.user.phoneNumber || '',
      });

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Facebook Login Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Login</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          <Input 
            placeholder="Phone Number (e.g. +1234567890)" 
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />

          <Button title="Login" onPress={handleLogin} style={styles.loginButton} />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
              <Ionicons name="logo-google" size={24} color={Colors.text} />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={() => router.push('/(auth)/forgot-password')} 
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account yet? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
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
  form: {
    marginTop: 40,
  },
  loginButton: {
    marginTop: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    gap: 8,
  },
  socialButtonText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.md,
    color: Colors.text,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 24,
  },
  forgotPasswordText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
  },
  signUpText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
