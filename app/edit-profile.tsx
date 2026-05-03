import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import auth from '@react-native-firebase/auth';
import { userService, UserData } from '@/services/userService';

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const user = auth().currentUser;

  useEffect(() => {
    if (!user) return;
    
    userService.getUserData(user.uid).then(data => {
      if (data) {
        setDisplayName(data.displayName || '');
        setLocation(data.location || '');
        setEmail(data.email || '');
        setPhone(data.phoneNumber || '');
      }
      setFetching(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!displayName) {
      Alert.alert('Error', 'Full Name is required');
      return;
    }

    if (!user) return;

    setLoading(true);
    try {
      await userService.updateProfile(user.uid, {
        displayName,
        location,
        email,
        phoneNumber: phone
      });

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Update Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Account</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={Colors.textSecondary} />
          </View>
          <TouchableOpacity style={styles.changeAvatar}>
            <Text style={styles.changeAvatarText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <Input
            placeholder="Your Name"
            value={displayName}
            onChangeText={setDisplayName}
          />

          <Text style={styles.inputLabel}>Location</Text>
          <Input
            placeholder="City, Country"
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.inputLabel}>Email Address</Text>
          <Input
            placeholder="email@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <Input
            placeholder="+1 234 567 890"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Save Changes" onPress={handleSave} loading={loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  changeAvatar: {
    marginTop: 12,
  },
  changeAvatarText: {
    fontFamily: Typography.fontFamily.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  form: {
    gap: 16,
  },
  inputLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: -8,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
