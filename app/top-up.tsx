import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import auth from '@react-native-firebase/auth';
import { userService } from '@/services/userService';

export default function TopUpScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('100.00');
  const [loading, setLoading] = useState(false);
  const user = auth().currentUser;

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const numAmount = parseFloat(amount);
      await userService.createTransaction(user.uid, {
        title: 'Top Up Balance',
        amount: numAmount,
        type: 'topup',
        icon: 'add-circle-outline',
        iconBg: '#E8F5E9',
      });

      Alert.alert('Success', `Successfully topped up $${numAmount}`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Top Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const presets = ['50', '100', '200', '500'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Up</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Enter Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
        </View>

        <View style={styles.presetsContainer}>
          {presets.map((preset) => (
            <TouchableOpacity 
              key={preset} 
              style={[styles.presetItem, amount === preset && styles.activePreset]}
              onPress={() => setAmount(preset)}
            >
              <Text style={[styles.presetText, amount === preset && styles.activePresetText]}>
                ${preset}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            The amount will be added instantly to your balance after confirmation.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Confirm Top Up" onPress={handleTopUp} loading={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 18,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  amountSection: {
    alignItems: 'center',
  },
  amountLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  currencySymbol: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 40,
    color: Colors.text,
  },
  amountInput: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 56,
    color: Colors.text,
    marginLeft: 10,
  },
  presetsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 40,
  },
  presetItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FAFAFA',
  },
  activePreset: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  presetText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 16,
    color: Colors.text,
  },
  activePresetText: {
    color: Colors.white,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
    padding: 16,
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
