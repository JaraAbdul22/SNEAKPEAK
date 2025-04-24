import React, { useState } from 'react';
     import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
     import { auth } from '../firebaseConfig';
     import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
     import { Ionicons } from '@expo/vector-icons';
     import { useNavigation } from '@react-navigation/native';
     import { theme } from '../components/theme';

     export default function EmailAuthScreen() {
       const [email, setEmail] = useState('');
       const [password, setPassword] = useState('');
       const [isLogin, setIsLogin] = useState(true);
       const navigation = useNavigation();

       const handleAuth = async () => {
         if (!email || !password) {
           return Alert.alert('Missing fields', 'Please enter email and password.');
         }

         try {
           if (isLogin) {
             await signInWithEmailAndPassword(auth, email, password);
           } else {
             await createUserWithEmailAndPassword(auth, email, password);
           }
           navigation.replace('Main');
         } catch (err) {
           Alert.alert('Error', err.message);
         }
       };

       return (
         <View style={styles.container}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
           </TouchableOpacity>
           <Text style={styles.header}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
           <TextInput
             style={styles.input}
             placeholder="Email"
             placeholderTextColor={theme.colors.muted}
             onChangeText={setEmail}
             value={email}
             keyboardType="email-address"
             autoCapitalize="none"
           />
           <TextInput
             style={styles.input}
             placeholder="Password"
             placeholderTextColor={theme.colors.muted}
             onChangeText={setPassword}
             value={password}
             secureTextEntry
           />
           <TouchableOpacity style={styles.button} onPress={handleAuth}>
             <Text style={styles.buttonText}>{isLogin ? 'Log In' : 'Create Account'}</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
             <Text style={styles.toggleText}>
               {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
             </Text>
           </TouchableOpacity>
         </View>
       );
     }

     const styles = StyleSheet.create({
       container: {
         flex: 1,
         backgroundColor: theme.colors.background,
         justifyContent: 'center',
         paddingHorizontal: theme.spacing.md,
       },
       backButton: {
         position: 'absolute',
         top: theme.spacing.xl,
         left: theme.spacing.md,
         zIndex: 1,
       },
       header: {
         ...theme.fonts.title,
         color: theme.colors.text,
         marginBottom: theme.spacing.lg,
         textAlign: 'center',
       },
       input: {
         backgroundColor: theme.colors.card,
         color: theme.colors.text,
         padding: theme.spacing.sm,
         borderRadius: theme.borderRadius.md,
         marginBottom: theme.spacing.sm,
       },
       button: {
         backgroundColor: theme.colors.primary,
         paddingVertical: theme.spacing.sm,
         borderRadius: theme.borderRadius.md,
         marginBottom: theme.spacing.md,
       },
       buttonText: {
         ...theme.fonts.button,
         color: theme.colors.text,
         textAlign: 'center',
       },
       toggleText: {
         ...theme.fonts.body,
         color: theme.colors.secondaryText,
         textAlign: 'center',
         textDecorationLine: 'underline',
       },
     });