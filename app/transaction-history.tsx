import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const HISTORY = [
  {
    day: 'Today',
    date: '09/01/24',
    items: [
      { id: '1', title: 'Transfer To Ahmad F', date: '6 Sep 2024 • 17:02', amount: -163.98, icon: 'swap-horizontal-outline', bg: '#F5F5F5' },
      { id: '2', title: 'Receive from Annisa', date: '6 Sep 2024 • 17:02', amount: 21.21, icon: 'download-outline', bg: '#FFF3E0' },
      { id: '3', title: 'Game Top Up', date: '6 Sep 2024 • 17:02', amount: -13.98, icon: 'game-controller-outline', bg: '#E1F5FE' },
      { id: '4', title: 'Withdraw Pay', date: '6 Sep 2024 • 17:02', amount: -163.98, icon: 'arrow-up-outline', bg: '#F5F5F5' },
      { id: '5', title: 'Receive from Annisa', date: '6 Sep 2024 • 17:02', amount: 21.21, icon: 'download-outline', bg: '#FFF3E0' },
    ]
  },
  {
    day: 'Yesterday',
    date: '08/01/24',
    items: [
      { id: '6', title: 'Online Shop', date: '5 Sep 2024 • 17:02', amount: -163.98, icon: 'cart-outline', bg: '#F5F5F5' },
      { id: '7', title: 'Withdraw Payza', date: '5 Sep 2024 • 17:02', amount: 21.21, icon: 'card-outline', bg: '#E8E8E8' },
      { id: '8', title: 'Receive from Annisa', date: '5 Sep 2024 • 17:02', amount: 21.21, icon: 'download-outline', bg: '#FFF3E0' },
    ]
  }
];

export default function TransactionHistoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
          <TextInput 
            placeholder="Search" 
            style={styles.searchInput}
            placeholderTextColor={Colors.textSecondary}
          />
          <TouchableOpacity>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {HISTORY.map((group, groupIdx) => (
          <View key={groupIdx} style={styles.groupContainer}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupDay}>{group.day}</Text>
              <View style={styles.groupDateRow}>
                <Text style={styles.groupDate}>{group.date}</Text>
                <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
              </View>
            </View>

            {group.items.map((item) => (
              <TouchableOpacity key={item.id} style={styles.transactionItem}>
                <View style={[styles.iconContainer, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as any} size={24} color={Colors.text} />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{item.title}</Text>
                  <Text style={styles.transactionDate}>{item.date}</Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  { color: item.amount < 0 ? '#FD3C4A' : '#00A86B' }
                ]}>
                  {item.amount < 0 ? `-$${Math.abs(item.amount)}` : `+$${item.amount}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
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
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
    color: Colors.text,
  },
  groupContainer: {
    marginTop: 32,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  groupDay: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 16,
    color: Colors.text,
  },
  groupDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupDate: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
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
