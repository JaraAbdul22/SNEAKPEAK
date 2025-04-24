import React, { useEffect, useState } from 'react';
     import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
     import { updateProfile, signOut } from 'firebase/auth';
     import { useAuth } from '../components/AuthContext';
     import { auth } from '../firebaseConfig';
     import { useNavigation } from '@react-navigation/native';
     import { theme } from '../components/theme';

     export default function ProfileScreen() {
       const { user } = useAuth();
       const [displayName, setDisplayName] = useState('');
       const [editing, setEditing] = useState(false);
       const [newName, setNewName] = useState('');
       const navigation = useNavigation();

       useEffect(() => {
         if (user) {
           setDisplayName(user.displayName || 'Sneakerhead');
         }
       }, [user]);

       const handleUpdateDisplayName = async () => {
         if (!newName.trim()) return;
         try {
           await updateProfile(user, { displayName: newName });
           setDisplayName(newName);
           setEditing(false);
           setNewName('');
           Alert.alert('Updated!', 'Your username has been updated.');
         } catch (error) {
           console.error('Error updating display name:', error);
           Alert.alert('Error', 'Failed to update username.');
         }
       };

       const handleLogout = async () => {
         try {
           await signOut(auth);
           setDisplayName('');
           navigation.reset({
             index: 0,
             routes: [{ name: 'Auth' }],
           });
         } catch (error) {
           console.error('Logout error:', error);
           Alert.alert('Error', 'Failed to log out.');
         }
       };

       if (!user) {
         return (
           <View style={styles.container}>
             <Text style={styles.title}>You are not logged in.</Text>
           </View>
         );
       }

       return (
         <View style={styles.container}>
           <Text style={styles.title}>👤 {displayName}</Text>
           {editing ? (
             <>
               <TextInput
                 style={styles.input}
                 placeholder="Enter new username"
                 placeholderTextColor={theme.colors.muted}
                 value={newName}
                 onChangeText={setNewName}
               />
               <TouchableOpacity style={styles.saveButton} onPress={handleUpdateDisplayName}>
                 <Text style={styles.saveText}>Save</Text>
               </TouchableOpacity>
             </>
           ) : (
             <TouchableOpacity onPress={() => setEditing(true)}>
               <Text style={styles.editText}>Edit Username</Text>
             </TouchableOpacity>
           )}
           <View style={styles.infoBox}>
             <Text style={styles.infoLabel}>📧 Email:</Text>
             <Text style={styles.infoText}>{user.email}</Text>
           </View>
           <View style={styles.infoBox}>
             <Text style={styles.infoLabel}>🆔 UID:</Text>
             <Text style={styles.infoText}>{user.uid}</Text>
           </View>
           <View style={styles.infoBox}>
             <Text style={styles.infoLabel}>🗓 Joined:</Text>
             <Text style={styles.infoText}>{new Date(user.metadata.creationTime).toLocaleDateString()}</Text>
           </View>
           <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
             <Text style={styles.logoutText}>Log Out</Text>
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
         padding: theme.spacing.md,
       },
       title: {
         ...theme.fonts.title,
         color: theme.colors.text,
         marginBottom: theme.spacing.md,
       },
       infoBox: {
         backgroundColor: theme.colors.card,
         padding: theme.spacing.sm,
         borderRadius: theme.borderRadius.sm,
         width: '100%',
         marginBottom: theme.spacing.sm,
       },
       infoLabel: {
         ...theme.fonts.label,
         color: theme.colors.secondaryText,
       },
       infoText: {
         ...theme.fonts.body,
         color: theme.colors.text,
       },
       editText: {
         color: theme.colors.primary,
         marginBottom: theme.spacing.md,
         textDecorationLine: 'underline',
       },
       input: {
         backgroundColor: theme.colors.card,
         color: theme.colors.text,
         borderRadius: theme.borderRadius.sm,
         padding: theme.spacing.sm,
         marginBottom: theme.spacing.sm,
         width: '100%',
       },
       saveButton: {
         backgroundColor: theme.colors.primary,
         borderRadius: theme.borderRadius.sm,
         padding: theme.spacing.sm,
         marginBottom: theme.spacing.md,
       },
       saveText: {
         ...theme.fonts.button,
         color: theme.colors.text,
         textAlign: 'center',
       },
       logoutButton: {
         backgroundColor: theme.colors.primary,
         paddingVertical: theme.spacing.sm,
         paddingHorizontal: theme.spacing.lg,
         borderRadius: theme.borderRadius.md,
         marginTop: theme.spacing.lg,
       },
       logoutText: {
         ...theme.fonts.button,
         color: theme.colors.text,
         textAlign: 'center',
       },
     });