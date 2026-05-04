import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Switch, Modal, TextInput, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Button } from '@/components/Button';

import auth from '@react-native-firebase/auth';
import { userService, UserData, Transaction } from '@/services/userService';

export default function CardDetailScreen() {
  const router = useRouter();
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [usernameModalVisible, setUsernameModalVisible] = React.useState(false);
  const [limitModalVisible, setLimitModalVisible] = React.useState(false);
  const [newCardName, setNewCardName] = React.useState('');
  const [newLimit, setNewLimit] = React.useState('');
  const user = auth().currentUser;

  React.useEffect(() => {
    if (!user) return;
    const unsubscribeUser = userService.subscribeToUser(user.uid, setUserData);
    const unsubscribeTrans = userService.subscribeToTransactions(user.uid, setTransactions);
    return () => {
      unsubscribeUser();
      unsubscribeTrans();
    };
  }, [user]);

  // Calculate real monthly spending
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlySpending = transactions
    .filter(t => {
      const d = t.date?.toDate ? t.date.toDate() : new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.amount < 0;
    })
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const limit = userData?.card?.monthlyLimit || 8000;
  const percentage = Math.min(Math.round((monthlySpending / limit) * 100), 100);
  
  const radius = 30;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleToggleFreeze = async (value: boolean) => {
    if (!user) return;
    try {
      await userService.toggleCardFreeze(user.uid, value);
      Alert.alert('Success', value ? 'Card frozen successfully' : 'Card unfrozen successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleChangeUsername = async () => {
    if (!newCardName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!user) return;
    try {
      await userService.updateCardUsername(user.uid, newCardName.trim());
      Alert.alert('Success', 'Card username updated');
      setUsernameModalVisible(false);
      setNewCardName('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleChangeLimit = async () => {
    if (!newLimit || isNaN(parseFloat(newLimit)) || parseFloat(newLimit) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!user) return;
    try {
      await userService.setMonthlyLimit(user.uid, parseFloat(newLimit));
      Alert.alert('Success', 'Limit updated');
      setLimitModalVisible(false);
      setNewLimit('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderMenuItem = (icon: any, title: string, color: string, rightElement?: React.ReactNode) => (
    <View style={styles.menuItem}>
      <View style={[styles.menuIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.menuTitle}>{title}</Text>
      {rightElement || <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Detail</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card Section */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={userData?.card?.isFrozen ? ['#BDBDBD', '#757575'] : [Colors.primary, '#9D50BB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, userData?.card?.isFrozen && { opacity: 0.8 }]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="wifi-outline" size={24} color={Colors.white} style={styles.cardWifi} />
              <View style={styles.cardHeaderRight}>
                {userData?.card?.isFrozen && (
                  <View style={styles.frozenBadge}>
                    <Text style={styles.frozenText}>FROZEN</Text>
                  </View>
                )}
                <Text style={styles.cardType}>{userData?.card?.type || 'VIS'}</Text>
              </View>
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

        {/* Limit Section */}
        <TouchableOpacity style={styles.limitContainer} onPress={() => {
          setNewLimit(limit.toString());
          setLimitModalVisible(true);
        }}>
          <View style={styles.progressContainer}>
            <Svg width={80} height={80}>
              <Circle
                cx="40"
                cy="40"
                r={radius}
                stroke="#F2F2F2"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx="40"
                cy="40"
                r={radius}
                stroke={Colors.primary}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                rotation="-90"
                origin="40, 40"
              />
            </Svg>
            <View style={styles.percentageContainer}>
              <Text style={styles.percentageText}>{percentage}%</Text>
            </View>
          </View>
          <View style={styles.limitInfo}>
            <Text style={styles.limitValue}>${monthlySpending.toLocaleString()} out of {limit.toLocaleString()}</Text>
            <Text style={styles.limitLabel}>Monthly Transfer Limit</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuList}>
          <TouchableOpacity onPress={() => handleToggleFreeze(!userData?.card?.isFrozen)}>
            {renderMenuItem(
              userData?.card?.isFrozen ? 'lock-open-outline' : 'lock-closed-outline', 
              userData?.card?.isFrozen ? 'Unfreeze Card' : 'Freeze Card', 
              userData?.card?.isFrozen ? '#00A86B' : '#FD3C4A',
              <Switch 
                value={userData?.card?.isFrozen} 
                onValueChange={handleToggleFreeze}
                trackColor={{ false: '#767577', true: Colors.primary }}
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/transaction-history')}>
            {renderMenuItem('time-outline', 'Transfer Activity History', '#0077FF')}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => {
            setNewCardName(userData?.card?.holderName || '');
            setUsernameModalVisible(true);
          }}>
            {renderMenuItem('create-outline', 'Change Card Username', Colors.primary)}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Change Username Modal */}
      <Modal visible={usernameModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Card Username</Text>
              <TouchableOpacity onPress={() => setUsernameModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Enter the new name for your card</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="New card name"
              value={newCardName}
              onChangeText={setNewCardName}
              autoCapitalize="words"
              placeholderTextColor={Colors.textSecondary}
            />
            <View style={{ marginTop: 16 }}>
              <Button title="Change" onPress={handleChangeUsername} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Limit Modal */}
      <Modal visible={limitModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Monthly Transfer Limit</Text>
              <TouchableOpacity onPress={() => setLimitModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Set your maximum monthly spending limit</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter amount"
              value={newLimit}
              onChangeText={setNewLimit}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors.textSecondary}
            />
            <View style={{ marginTop: 16 }}>
              <Button title="Set Limit" onPress={handleChangeLimit} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer Button */}
      <View style={styles.footer}>
        <Button title="Add Card" onPress={() => {}} />
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
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  frozenBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  frozenText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 10,
    color: Colors.white,
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
  limitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 32,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FAFAFA',
  },
  progressContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageContainer: {
    position: 'absolute',
  },
  percentageText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    color: Colors.text,
  },
  limitInfo: {
    flex: 1,
    marginLeft: 16,
  },
  limitValue: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 15,
    color: Colors.text,
  },
  limitLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  menuList: {
    marginTop: 32,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    flex: 1,
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 15,
    color: Colors.text,
    marginLeft: 16,
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    width: width - 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 20,
    color: Colors.text,
  },
  modalSubtitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  modalInput: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    fontFamily: Typography.fontFamily.regular,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
});
