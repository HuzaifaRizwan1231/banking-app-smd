import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const BUDGETS = [
  { id: '1', category: 'Shopping', spent: 1200, total: 2000, icon: 'cart-outline', color: '#7F3DFF' },
  { id: '2', category: 'Transportation', spent: 350, total: 500, icon: 'car-outline', color: '#0077FF' },
  { id: '3', category: 'Food', spent: 800, total: 1000, icon: 'fast-food-outline', color: '#FD3C4A' },
  { id: '4', category: 'Entertainment', spent: 150, total: 400, icon: 'game-controller-outline', color: '#FF9500' },
];

export default function BudgetsScreen() {
  const renderBudgetItem = (item: typeof BUDGETS[0]) => {
    const percentage = (item.spent / item.total) * 100;
    
    return (
      <View key={item.id} style={styles.budgetCard}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
            <Ionicons name={item.icon as any} size={24} color={item.color} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.categoryName}>{item.category}</Text>
            <Text style={styles.remainingText}>Remaining ${item.total - item.spent}</Text>
          </View>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: item.color }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.spentText}>${item.spent}</Text>
            <Text style={styles.totalText}>of ${item.total}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Budgets</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>This Month's Budget</Text>
          <Text style={styles.summaryAmount}>$3,900.00</Text>
          <View style={styles.summaryProgress}>
            <View style={[styles.progressFill, { width: '65%', backgroundColor: Colors.white }]} />
          </View>
          <Text style={styles.summaryStatus}>65% used</Text>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>Category Budgets</Text>
          {BUDGETS.map(renderBudgetItem)}
        </View>
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
  headerTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 18,
    color: Colors.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    margin: 20,
    padding: 24,
    borderRadius: 32,
    backgroundColor: Colors.primary,
  },
  summaryLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  summaryAmount: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 32,
    color: Colors.white,
    marginTop: 8,
  },
  summaryProgress: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    marginTop: 20,
    overflow: 'hidden',
  },
  summaryStatus: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.white,
    marginTop: 8,
    textAlign: 'right',
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 18,
    color: Colors.text,
    marginBottom: 20,
  },
  budgetCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  categoryName: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 16,
    color: Colors.text,
  },
  remainingText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 20,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E8E8E8',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  spentText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 14,
    color: Colors.text,
  },
  totalText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
