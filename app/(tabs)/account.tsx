import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import auth from '@react-native-firebase/auth';

import { userService, UserData } from '@/services/userService';

export default function AccountScreen() {
  const router = useRouter();
  const user = auth().currentUser;
  const [userData, setUserData] = React.useState<UserData | null>(null);

  React.useEffect(() => {
    if (!user) return;

    const unsubscribe = userService.subscribeToUser(user.uid, (data) => {
      setUserData(data);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          try {
            await auth().signOut();
            router.replace('/(auth)/login');
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        }
      }
    ]);
  };

  const renderSettingItem = (icon: any, title: string, subtitle: string, color: string) => (
    <TouchableOpacity style={styles.settingItem}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color={Colors.textSecondary} />
          </View>
          <Text style={styles.userName}>{userData?.displayName || user?.displayName || 'User'}</Text>
          <Text style={styles.userLocation}>{userData?.location || 'Location not set'}</Text>
        </View>

        {/* Settings List */}
        <View style={styles.settingsList}>
          <TouchableOpacity onPress={() => router.push('/edit-profile')}>
            {renderSettingItem('person-outline', 'Your Account', 'Name, Email, Handphone', Colors.primary)}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/budget')}>
            {renderSettingItem('pie-chart-outline', 'Budgeting', 'Category Limits, Tracking', '#0077FF')}
          </TouchableOpacity>
          {renderSettingItem('time-outline', 'History Activities', 'Tracking, Alert, Notifications', '#00A86B')}
          {renderSettingItem('shield-checkmark-outline', 'Privacy & Security', 'Password, Privilege, Locations', '#FD3C4A')}
          {renderSettingItem('information-circle-outline', 'About Us', 'Explanation of our history', '#FF9500')}
          
          <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={[styles.iconContainer, { backgroundColor: '#FD3C4A15' }]}>
              <Ionicons name="log-out-outline" size={22} color="#FD3C4A" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: '#FD3C4A' }]}>Log Out</Text>
              <Text style={styles.settingSubtitle}>End your session</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FD3C4A" />
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 18,
    color: Colors.text,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 32,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 22,
    color: Colors.text,
  },
  userLocation: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  settingsList: {
    marginTop: 40,
    paddingHorizontal: 20,
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FAFAFA',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 15,
    color: Colors.text,
  },
  settingSubtitle: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutItem: {
    marginTop: 12,
    borderColor: '#FD3C4A15',
  },
});
