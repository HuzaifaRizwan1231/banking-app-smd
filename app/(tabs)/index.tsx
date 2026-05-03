import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import auth from '@react-native-firebase/auth';
import { userService, UserData, Transaction } from '@/services/userService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const user = auth().currentUser;

  React.useEffect(() => {
    if (!user) return;

    // Subscribe to user data (balance, card)
    const unsubscribeUser = userService.subscribeToUser(user.uid, (data) => {
      setUserData(data);
    });

    // Subscribe to latest 4 transactions
    const unsubscribeTransactions = userService.subscribeToTransactions(user.uid, (data) => {
      setTransactions(data);
    }, 4);

    return () => {
      unsubscribeUser();
      unsubscribeTransactions();
    };
  }, [user]);

  const renderQuickAction = (icon: any, label: string, color: string, onPress?: () => void) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={[styles.actionIconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color={Colors.white} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + 
           ' • ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>${userData?.balance?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="search-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Ionicons name="notifications-outline" size={24} color={Colors.text} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Section */}
        <TouchableOpacity 
          activeOpacity={0.9} 
          onPress={() => router.push('/card-detail')}
          style={styles.cardContainer}
        >
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
        </TouchableOpacity>

        {/* Carousel Indicators */}
        <View style={styles.indicators}>
          <View style={[styles.indicator, styles.activeIndicator]} />
          <View style={styles.indicator} />
          <View style={styles.indicator} />
          <View style={styles.indicator} />
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          {renderQuickAction('swap-horizontal-outline', 'Transfers', '#7F3DFF', () => router.push('/send-money'))}
          {renderQuickAction('card-outline', 'Payments', '#5B259F')}
          {renderQuickAction('add-circle-outline', 'Top up', '#0077FF', () => router.push('/top-up'))}
          {renderQuickAction('grid-outline', 'Details', '#1E1E1E')}
        </View>

        {/* Transactions */}
        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/transaction-history')}>
            <Text style={styles.seeMore}>See More</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ color: Colors.textSecondary, fontFamily: Typography.fontFamily.medium }}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((item) => (
            <TouchableOpacity key={item.id} style={styles.transactionItem}>
              <View style={[styles.transactionIconContainer, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon as any} size={24} color={Colors.text} />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{item.title}</Text>
                <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: item.amount < 0 ? '#FD3C4A' : '#00A86B' }
              ]}>
                {item.amount < 0 ? `-$${Math.abs(item.amount).toFixed(2)}` : `+$${item.amount.toFixed(2)}`}
              </Text>
            </TouchableOpacity>
          ))
        )}
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  balanceLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  balanceAmount: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.fontSize.xxl,
    color: Colors.text,
    marginTop: 4,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FD3C4A',
    borderWidth: 1,
    borderColor: Colors.white,
  },
  cardContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
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
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E8E8E8',
  },
  activeIndicator: {
    backgroundColor: Colors.primary,
    width: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 32,
  },
  actionItem: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 13,
    color: Colors.text,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 18,
    color: Colors.text,
  },
  seeMore: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  transactionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  transactionTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 15,
    color: Colors.text,
  },
  transactionDate: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  transactionAmount: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 16,
  },
});
