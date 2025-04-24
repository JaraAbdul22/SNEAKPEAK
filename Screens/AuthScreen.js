import React from 'react';
     import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
     import { theme } from '../components/theme';

     export default function AuthScreen({ navigation }) {
       const handleContinueAsGuest = () => {
         navigation.replace('Main');
       };

       const handleSignUp = () => {
         navigation.navigate('EmailAuth');
       };

       return (
         <View style={styles.container}>
           <Image
             source={require('../assets/sneakpeaklogo2.png')}
             style={styles.logo}
             resizeMode="contain"
           />
           <Text style={styles.title}>Welcome to SneakPeak</Text>
           <Text style={styles.subtitle}>Step into the future of sneaker prices</Text>
           <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp}>
             <Text style={styles.primaryText}>Continue with Email</Text>
           </TouchableOpacity>
           <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueAsGuest}>
             <Text style={styles.secondaryText}>Continue as Guest</Text>
           </TouchableOpacity>
         </View>
       );
     }

     const styles = StyleSheet.create({
       container: {
         flex: 1,
         backgroundColor: theme.colors.background,
         justifyContent: 'center',
         alignItems: 'center',
         paddingHorizontal: theme.spacing.md,
       },
       logo: {
         width: Dimensions.get('window').width * 0.85,
         height: 160,
         marginBottom: theme.spacing.lg,
       },
       title: {
         ...theme.fonts.title,
         color: theme.colors.text,
         marginBottom: theme.spacing.sm,
       },
       subtitle: {
         ...theme.fonts.body,
         color: theme.colors.secondaryText,
         marginBottom: theme.spacing.xl,
         textAlign: 'center',
       },
       primaryButton: {
         backgroundColor: theme.colors.text,
         paddingVertical: theme.spacing.sm,
         paddingHorizontal: theme.spacing.lg,
         borderRadius: theme.borderRadius.md,
         marginBottom: theme.spacing.md,
         width: '100%',
       },
       primaryText: {
         ...theme.fonts.button,
         color: theme.colors.background,
         textAlign: 'center',
       },
       secondaryButton: {
         borderColor: theme.colors.text,
         borderWidth: 1.5,
         paddingVertical: theme.spacing.sm,
         paddingHorizontal: theme.spacing.lg,
         borderRadius: theme.borderRadius.md,
         width: '100%',
       },
       secondaryText: {
         ...theme.fonts.button,
         color: theme.colors.text,
         textAlign: 'center',
       },
     });