import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import auth from '@react-native-firebase/auth';
import { userService, Transaction } from '@/services/userService';

const CATEGORIES = [
  { id: 'Food', name: 'Food & Drinks', icon: 'fast-food-outline', color: '#FD3C4A' },
  { id: 'Shopping', name: 'Shopping', icon: 'cart-outline', color: '#7F3DFF' },
  { id: 'Transport', name: 'Transport', icon: 'car-outline', color: '#0077FF' },
  { id: 'Entertainment', name: 'Entertainment', icon: 'game-controller-outline', color: '#FF9500' },
  { id: 'Health', name: 'Health', icon: 'medkit-outline', color: '#00A86B' },
  { id: 'Others', name: 'Others', icon: 'grid-outline', color: '#1E1E1E' },
];

export default function BudgetScreen() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;
    const unsubBudgets = userService.subscribeToBudgets(user.uid, setBudgets);
    const unsubTrans = userService.subscribeToTransactions(user.uid, setTransactions);
    return () => {
      unsubBudgets();
      unsubTrans();
    };
  }, [user]);

  const calculateSpending = (categoryId: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const d = t.date?.toDate ? t.date.toDate() : new Date(t.date);
        return d.getMonth() === currentMonth && 
               d.getFullYear() === currentYear && 
               t.amount < 0 && 
               (t.type === categoryId.toLowerCase() || (categoryId === 'Others' && !t.type));
      })
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  };

  const renderBudgetItem = ({ item }: { item: typeof CATEGORIES[0] }) => {
    const budget = budgets.find(b => b.category === item.id);
    const spending = calculateSpending(item.id);
    const limit = budget?.amount || 0;
    const percentage = limit > 0 ? Math.min(Math.round((spending / limit) * 100), 100) : 0;
    const isOver = spending > limit && limit > 0;

    return (
      <TouchableOpacity 
        style={styles.budgetItem}
        onPress={() => handleSetBudget(item.id, item.name, limit)}
      >
        <View style={styles.budgetHeader}>
          <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
            <Ionicons name={item.icon as any} size={24} color={item.color} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.budgetStatus}>
              {limit > 0 ? `$${spending.toLocaleString()} of $${limit.toLocaleString()}` : 'No budget set'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.percentageText, isOver && { color: '#FD3C4A' }]}>{percentage}%</Text>
            {isOver && <Ionicons name="warning" size={16} color="#FD3C4A" />}
          </View>
        </View>
        
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${percentage}%`, backgroundColor: isOver ? '#FD3C4A' : item.color }
            ]} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  const handleSetBudget = (id: string, name: string, currentLimit: number) => {
    Alert.prompt(
      `Set Budget for ${name}`,
      'Enter your monthly spending limit for this category',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: (val) => {
          if (val && !isNaN(parseFloat(val)) && user) {
            userService.setBudget(user.uid, id, parseFloat(val))
              .then(() => Alert.alert('Success', 'Budget updated'))
              .catch(err => Alert.alert('Error', err.message));
          }
        }}
      ],
      'plain-text',
      currentLimit > 0 ? currentLimit.toString() : ''
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budgeting</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderBudgetItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <Text style={styles.monthText}>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <Text style={styles.subtitle}>Set and track your monthly spending limits</Text>
          </View>
        )}
      />
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  listHeader: {
    marginTop: 20,
    marginBottom: 32,
  },
  monthText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 24,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  budgetItem: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FAFAFA',
  },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 16,
    color: Colors.text,
  },
  budgetStatus: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  percentageText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    color: Colors.text,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
