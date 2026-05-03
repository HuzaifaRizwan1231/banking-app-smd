import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { Colors } from '@/constants/Colors';
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

  const handleChangeLimit = () => {
    Alert.prompt(
      'Monthly Transfer Limit',
      'Set your maximum monthly spending limit',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Set', onPress: (val) => {
          if (val && !isNaN(parseFloat(val)) && user) {
            userService.setMonthlyLimit(user.uid, parseFloat(val))
              .then(() => Alert.alert('Success', 'Limit updated'))
              .catch(err => Alert.alert('Error', err.message));
          }
        }}
      ],
      'plain-text',
      limit.toString()
    );
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
        <TouchableOpacity style={styles.limitContainer} onPress={handleChangeLimit}>
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
            Alert.prompt(
              'Change Card Username',
              'Enter the new name for your card',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Change', onPress: (name) => {
                  if (name && user) {
                    userService.updateCardUsername(user.uid, name)
                      .then(() => Alert.alert('Success', 'Card username updated'))
                      .catch(err => Alert.alert('Error', err.message));
                  }
                }}
              ],
              'plain-text',
              userData?.card?.holderName
            );
          }}>
            {renderMenuItem('create-outline', 'Change Card Username', Colors.primary)}
          </TouchableOpacity>
        </View>
      </ScrollView>

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
});
