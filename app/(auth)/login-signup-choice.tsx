import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Button } from '@/components/Button';

export default function LoginSignupChoiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.illustrationContainer}>
        <Image 
          source={require('@/assets/images/onboarding.png')} 
          style={styles.image} 
          resizeMode="contain" 
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Plan your finances with ease</Text>
        <Text style={styles.subtitle}>
          The easiest way to manage your money and track your spending.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button 
          title="Sign Up" 
          onPress={() => router.push('/(auth)/signup')} 
          style={styles.button}
        />
        <Button 
          title="Login" 
          onPress={() => router.push('/(auth)/login')} 
          type="outline"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  illustrationContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xl,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  button: {
    width: '100%',
  },
});
