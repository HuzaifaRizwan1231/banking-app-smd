import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';

import auth from '@react-native-firebase/auth';
import { userService, Transaction, UserData } from '@/services/userService';

const { width } = Dimensions.get('window');

export default function StatisticScreen() {
  const [activeFilter, setActiveFilter] = useState('Month');
  const filters = ['Day', 'Week', 'Month', 'Year'];
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const user = auth().currentUser;

  React.useEffect(() => {
    if (!user) return;
    
    // Subscribe to user and transactions
    const unsubUser = userService.subscribeToUser(user.uid, setUserData);
    const unsubTrans = userService.subscribeToTransactions(user.uid, setTransactions);
    
    return () => {
      unsubUser();
      unsubTrans();
    };
  }, [user]);

  // Calculate stats
  const totalSpending = transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);

  const savings = totalIncome > totalSpending ? totalIncome - totalSpending : 0;

  // Simple SVG Line Chart helper
  const chartData = transactions.length > 0 
    ? transactions.slice(0, 7).map(t => Math.abs(t.amount)) 
    : [100, 150, 120, 250, 180, 300, 220]; // Fallback
  
  const chartHeight = 150;
  const chartWidth = width - 80;
  const step = chartWidth / (chartData.length - 1);
  const max = Math.max(...chartData);
  
  const points = chartData.map((val, i) => {
    const x = i * step;
    const y = chartHeight - (val / max) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const pathData = `M ${points}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 44 }} />
          <Text style={styles.headerTitle}>Card Statistic</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Card Carousel Preview */}
        <View style={styles.carouselContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled>
            <View style={styles.cardPreview}>
              <LinearGradient colors={[Colors.primary, '#9D50BB']} style={styles.smallCard}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{userData?.card?.type || 'VIS'} Card</Text>
                  <Text style={styles.cardNumber}>{userData?.card?.number?.slice(-4) ? `**** ${userData.card.number.slice(-4)}` : '**** 0000'}</Text>
                </View>
                <Ionicons name="logo-mastercard" size={32} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </View>
          </ScrollView>
        </View>

        {/* Spending Summary */}
        <View style={styles.spendingContainer}>
          <Text style={styles.spendingLabel}>Total Spending</Text>
          <Text style={styles.spendingAmount}>${totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity 
              key={filter} 
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterItem, activeFilter === filter && styles.activeFilterItem]}
            >
              <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart Section */}
        <View style={styles.chartWrapper}>
          <View style={styles.chartYAxis}>
            <Text style={styles.axisLabel}>${(max).toFixed(0)}</Text>
            <Text style={styles.axisLabel}>${(max * 0.75).toFixed(0)}</Text>
            <Text style={styles.axisLabel}>${(max * 0.5).toFixed(0)}</Text>
            <Text style={styles.axisLabel}>${(max * 0.25).toFixed(0)}</Text>
            <Text style={styles.axisLabel}>$0</Text>
          </View>
          <View style={styles.chartContent}>
            <Svg height={chartHeight} width={chartWidth}>
              <Defs>
                <SvgGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={Colors.primary} stopOpacity="0.3" />
                  <Stop offset="1" stopColor={Colors.primary} stopOpacity="0" />
                </SvgGradient>
              </Defs>
              <Path
                d={`${pathData} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`}
                fill="url(#grad)"
              />
              <Path
                d={pathData}
                fill="none"
                stroke={Colors.primary}
                strokeWidth="3"
              />
            </Svg>
            <View style={styles.chartXAxis}>
              <Text style={styles.axisLabel}>Mon</Text>
              <Text style={styles.axisLabel}>Tue</Text>
              <Text style={styles.axisLabel}>Wed</Text>
              <Text style={styles.axisLabel}>Thu</Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#7F3DFF15' }]}>
              <Ionicons name="arrow-up" size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statValue}>${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#1E1E1E15' }]}>
              <Ionicons name="arrow-down" size={24} color={Colors.text} />
            </View>
            <View>
              <Text style={styles.statLabel}>Expenses</Text>
              <Text style={styles.statValue}>${totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            </View>
          </View>
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
  moreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  carouselContainer: {
    marginTop: 20,
  },
  cardPreview: {
    width: width,
    paddingHorizontal: 20,
  },
  smallCard: {
    height: 100,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardInfo: {
    gap: 4,
  },
  cardName: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  cardNumber: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
    color: Colors.white,
  },
  spendingContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  spendingLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  spendingAmount: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 32,
    color: Colors.text,
    marginTop: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  filterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
  },
  activeFilterItem: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  activeFilterText: {
    color: Colors.white,
  },
  chartWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 40,
    gap: 16,
  },
  chartYAxis: {
    justifyContent: 'space-between',
    height: 150,
  },
  axisLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  chartContent: {
    flex: 1,
  },
  chartXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#FD3C4A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tooltipText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 10,
    color: Colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 40,
    gap: 16,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 15,
    color: Colors.text,
    marginTop: 2,
  },
});
