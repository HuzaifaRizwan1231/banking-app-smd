import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/Button';

import auth from '@react-native-firebase/auth';
import { userService, UserData } from '@/services/userService';
import { Modal, FlatList } from 'react-native';

const RECIPIENTS = [
  { id: '1', name: 'William Jameson', card: '**** 9809', avatar: 'W' },
  { id: '2', name: 'Soroush Nasrpour', card: '**** 1253', avatar: 'S' },
  { id: '3', name: 'Alireza Alavi', card: '**** 4432', avatar: 'A' },
  { id: '4', name: 'Kuroo Hazama', card: '**** 0909', avatar: 'K' },
];

export default function SendMoneyScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('900.00');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState(RECIPIENTS[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const user = auth().currentUser;

  React.useEffect(() => {
    if (!user) return;
    userService.getUserData(user.uid).then(setUserData);
  }, [user]);

  const handleSend = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const numAmount = parseFloat(amount);
      await userService.createTransaction(user.uid, {
        title: `Transfer To ${selectedRecipient.name}`,
        amount: -numAmount,
        type: 'transfer',
        icon: 'swap-horizontal-outline',
        iconBg: '#F5F5F5',
      });

      router.push({
        pathname: '/transfer-success',
        params: { amount: amount }
      });
    } catch (error: any) {
      Alert.alert('Transaction Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card Section */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={[Colors.primary, '#9D50BB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="wifi-outline" size={24} color={Colors.white} style={styles.cardWifi} />
              <Text style={styles.cardType}>{userData?.card?.type || 'VIS'}</Text>
            </View>
            <Text style={styles.cardNumber}>{userData?.card?.number || '****  ****  ****  ****'}</Text>
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardHolderLabel}>Card Holder</Text>
                <Text style={styles.cardHolderName}>{userData?.card?.holderName || user?.displayName || 'User'}</Text>
              </View>
              <View>
                <Text style={styles.cardHolderLabel}>Expires</Text>
                <Text style={styles.cardHolderName}>{userData?.card?.expiry || '00/00'}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Recipient Section */}
        <View style={styles.recipientSection}>
          <Text style={styles.sectionTitle}>Recipient</Text>
          <View style={styles.recipientCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={{ fontFamily: Typography.fontFamily.bold, color: Colors.textSecondary }}>
                  {selectedRecipient.avatar}
                </Text>
              </View>
              <View>
                <Text style={styles.recipientName}>{selectedRecipient.name}</Text>
                <Text style={styles.recipientDetails}>{selectedRecipient.card}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount Section */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Transfer amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </ScrollView>

      {/* Recipient Selection Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Recipient</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={RECIPIENTS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.recipientItem}
                  onPress={() => {
                    setSelectedRecipient(item);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.avatarSmall}>
                    <Text style={{ fontFamily: Typography.fontFamily.bold }}>{item.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recipientName}>{item.name}</Text>
                    <Text style={styles.recipientDetails}>{item.card}</Text>
                  </View>
                  {selectedRecipient.id === item.id && (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.footer}>
        <Button title="Send Money" onPress={handleSend} loading={loading} />
      </View>

      <View style={styles.footer}>
        <Button title="Send Money" onPress={handleSend} loading={loading} />
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
    paddingBottom: 100,
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  card: {
    height: 200,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardWifi: {
    transform: [{ rotate: '90deg' }],
  },
  cardType: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 24,
    color: Colors.white,
    letterSpacing: 1,
  },
  cardNumber: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 22,
    color: Colors.white,
    letterSpacing: 2,
    marginTop: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardHolderLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
  },
  cardHolderName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 14,
    color: Colors.white,
    marginTop: 4,
  },
  recipientSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  recipientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FAFAFA',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipientName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 16,
    color: Colors.text,
  },
  recipientDetails: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  changeLink: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  amountSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  amountLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  currencySymbol: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 32,
    color: Colors.text,
  },
  amountInput: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 48,
    color: Colors.text,
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 20,
    color: Colors.text,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 16,
  },
  avatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
