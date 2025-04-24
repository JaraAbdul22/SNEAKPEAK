import React from 'react';
     import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
     import { useNavigation } from '@react-navigation/native';
     import { useAuth } from '../components/AuthContext';
     import ProfileScreen from './ProfileScreen';
     import { theme } from '../components/theme';

     export default function GuestProfileScreen() {
       const navigation = useNavigation();
       const { user, loading } = useAuth();

       if (loading) {
         return (
           <View style={styles.container}>
             <ActivityIndicator size="large" color={theme.colors.primary} />
           </View>
         );
       }

       if (user) {
         return <ProfileScreen />;
       }

       return (
         <View style={styles.container}>
           <Text style={styles.message}>You are not logged in.</Text>
           <TouchableOpacity
             style={styles.loginButton}
             onPress={() => navigation.navigate('Auth')}
           >
             <Text style={styles.loginText}>Sign Up / Log In</Text>
           </TouchableOpacity>
         </View>
       );
     }

     const styles = StyleSheet.create({
       container: {
         flex: 1,
         backgroundColor: theme.colors.background,
         alignItems: 'center',
         justifyContent: 'center',
         paddingHorizontal: theme.spacing.md,
       },
       message: {
         ...theme.fonts.subtitle,
         color: theme.colors.text,
         marginBottom: theme.spacing.md,
         textAlign: 'center',
       },
       loginButton: {
         backgroundColor: theme.colors.primary,
         paddingVertical: theme.spacing.sm,
         paddingHorizontal: theme.spacing.lg,
         borderRadius: theme.borderRadius.md,
       },
       loginText: {
         ...theme.fonts.button,
         color: theme.colors.text,
         textAlign: 'center',
       },
     });