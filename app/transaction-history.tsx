import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import auth from '@react-native-firebase/auth';
import { userService, Transaction } from '@/services/userService';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const user = auth().currentUser;

  React.useEffect(() => {
    if (!user) return;

    const unsubscribe = userService.subscribeToTransactions(user.uid, (data) => {
      setTransactions(data);
    });

    return () => unsubscribe();
  }, [user]);

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const groupTransactions = () => {
    const groups: { [key: string]: { day: string, date: string, items: Transaction[] } } = {};
    
    transactions.forEach(item => {
      const d = item.date?.toDate ? item.date.toDate() : new Date(item.date);
      const dateKey = d.toLocaleDateString('en-GB');
      const today = new Date().toLocaleDateString('en-GB');
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-GB');
      
      let day = dateKey;
      if (dateKey === today) day = 'Today';
      else if (dateKey === yesterday) day = 'Yesterday';
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          day,
          date: dateKey,
          items: []
        };
      }
      groups[dateKey].items.push(item);
    });
    
    return Object.values(groups).sort((a, b) => {
      const dateA = a.items[0].date?.toDate ? a.items[0].date.toDate() : new Date(a.items[0].date);
      const dateB = b.items[0].date?.toDate ? b.items[0].date.toDate() : new Date(b.items[0].date);
      return dateB - dateA;
    });
  };

  const groupedHistory = groupTransactions();

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

        {transactions.length === 0 ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <Ionicons name="receipt-outline" size={64} color={Colors.border} />
            <Text style={{ marginTop: 16, color: Colors.textSecondary, fontFamily: Typography.fontFamily.medium }}>No transactions found</Text>
          </View>
        ) : (
          groupedHistory.map((group, groupIdx) => (
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
                  <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
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
              ))}
            </View>
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
