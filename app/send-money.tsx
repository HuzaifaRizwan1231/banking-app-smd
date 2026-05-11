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

import { Input } from '@/components/Input';

interface Beneficiary {
  uid: string;
  displayName: string;
  email: string;
  cardType: string;
  cardNumber: string;
}

export default function SendMoneyScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('900.00');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<Beneficiary | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addBeneficiaryModalVisible, setAddBeneficiaryModalVisible] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const user = auth().currentUser;

  const beneficiaries = userData?.beneficiaries || [];

  // Automatically select the first beneficiary if none is selected and data is loaded
  React.useEffect(() => {
    if (beneficiaries.length > 0 && !selectedRecipient) {
      setSelectedRecipient(beneficiaries[0]);
    }
  }, [beneficiaries, selectedRecipient]);

  React.useEffect(() => {
    if (!user) return;
    const unsubscribe = userService.subscribeToUser(user.uid, setUserData);
    return () => unsubscribe();
  }, [user]);

  const handleSend = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedRecipient) {
      Alert.alert('Error', 'Please select a recipient');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      const numAmount = parseFloat(amount);
      await userService.transferMoney(
        user.uid,
        selectedRecipient.uid,
        numAmount,
        `Transfer To ${selectedRecipient.displayName}`
      );

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

  const handleAddBeneficiary = async () => {
    if (!searchEmail) {
      Alert.alert('Error', 'Please enter an email');
      return;
    }

    if (!user) return;

    setSearchLoading(true);
    try {
      const foundUser = await userService.searchUserByEmail(searchEmail);
      if (!foundUser) {
        Alert.alert('User Not Found', `No user found with email: ${searchEmail}`);
        return;
      }

      if (foundUser.uid === user.uid) {
        Alert.alert('Error', "You can't add yourself as a beneficiary");
        return;
      }

      await userService.addBeneficiary(user.uid, foundUser);
      Alert.alert('Success', `${foundUser.displayName} has been added to your beneficiaries`);
      setAddBeneficiaryModalVisible(false);
      setSearchEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSearchLoading(false);
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
            {selectedRecipient ? (
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={{ fontFamily: Typography.fontFamily.bold, color: Colors.textSecondary }}>
                    {selectedRecipient.displayName.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.recipientName}>{selectedRecipient.displayName}</Text>
                  <Text style={styles.recipientDetails}>{selectedRecipient.cardNumber}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: '#F5F5F5' }]}>
                  <Ionicons name="person-add" size={24} color={Colors.textSecondary} />
                </View>
                <View>
                  <Text style={styles.recipientName}>No Recipient Selected</Text>
                  <Text style={styles.recipientDetails}>Please add or select one</Text>
                </View>
              </View>
            )}
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.changeLink}>{selectedRecipient ? 'Change' : 'Select'}</Text>
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
              data={beneficiaries}
              keyExtractor={(item) => item.uid}
              ListFooterComponent={
                <TouchableOpacity 
                  style={[styles.recipientItem, { borderBottomWidth: 0 }]}
                  onPress={() => {
                    setModalVisible(false);
                    setAddBeneficiaryModalVisible(true);
                  }}
                >
                  <View style={[styles.avatarSmall, { backgroundColor: Colors.primary + '15' }]}>
                    <Ionicons name="add" size={24} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recipientName, { color: Colors.primary }]}>Add New Beneficiary</Text>
                    <Text style={styles.recipientDetails}>Find user by email</Text>
                  </View>
                </TouchableOpacity>
              }
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.recipientItem}
                  onPress={() => {
                    setSelectedRecipient(item);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.avatarSmall}>
                    <Text style={{ fontFamily: Typography.fontFamily.bold }}>{item.displayName.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recipientName}>{item.displayName}</Text>
                    <Text style={styles.recipientDetails}>{item.cardNumber}</Text>
                  </View>
                  {selectedRecipient?.uid === item.uid && (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Add Beneficiary Modal */}
      <Modal visible={addBeneficiaryModalVisible} animationType="fade" transparent>
        <View style={[styles.modalOverlay, { justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <View style={[styles.modalContent, { marginHorizontal: 20, borderRadius: 24, paddingBottom: 24 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Beneficiary</Text>
              <TouchableOpacity onPress={() => setAddBeneficiaryModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <Input 
              label="User Email"
              placeholder="Enter beneficiary's email"
              value={searchEmail}
              onChangeText={setSearchEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <View style={{ marginTop: 10 }}>
              <Button 
                title="Search and Add" 
                onPress={handleAddBeneficiary} 
                loading={searchLoading} 
              />
            </View>
          </View>
        </View>
      </Modal>

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
