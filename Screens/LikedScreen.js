import React, { useEffect, useState } from 'react';
     import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
     import { Ionicons } from '@expo/vector-icons';
     import { db } from '../firebaseConfig';
     import { collection, doc, getDocs, deleteDoc } from 'firebase/firestore';
     import { useNavigation, useFocusEffect } from '@react-navigation/native';
     import { useAuth } from '../components/AuthContext';
     import { theme } from '../components/theme';

     export default function LikedScreen() {
       const [likedSneakers, setLikedSneakers] = useState([]);
       const [loading, setLoading] = useState(true);
       const [sortMode, setSortMode] = useState('newest');
       const navigation = useNavigation();
       const { user } = useAuth();

       useEffect(() => {
         if (user) {
           fetchLikedSneakers();
         } else {
           setLoading(false);
         }
       }, [user]);

       const fetchLikedSneakers = async () => {
         setLoading(true);
         try {
           if (!user) return;
           const snapshot = await getDocs(collection(doc(db, 'users', user.uid), 'likedSneakers'));
           let sneakers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
           sneakers = sortSneakers(sneakers, sortMode);
           setLikedSneakers(sneakers);
         } catch (error) {
           console.error('Failed to fetch liked sneakers:', error);
         } finally {
           setLoading(false);
         }
       };

       const sortSneakers = (data, mode) => {
         if (mode === 'profit') {
           return [...data].sort((a, b) => {
             const profitA = a.predicted - a.retail;
             const profitB = b.predicted - b.retail;
             return profitB - profitA;
           });
         } else {
           return [...data].sort((a, b) => {
             const timeA = a.timestamp?.seconds || 0;
             const timeB = b.timestamp?.seconds || 0;
             return timeB - timeA;
           });
         }
       };

       const toggleSortMode = () => {
         const newMode = sortMode === 'newest' ? 'profit' : 'newest';
         const sorted = sortSneakers(likedSneakers, newMode);
         setSortMode(newMode);
         setLikedSneakers(sorted);
       };

       const handleUnlike = async (name) => {
         if (!user) return;
         try {
           await deleteDoc(doc(collection(doc(db, 'users', user.uid), 'likedSneakers'), name));
           setLikedSneakers(prev => prev.filter(item => item.name !== name));
         } catch (error) {
           console.error('Error unliking sneaker:', error);
         }
       };

       useFocusEffect(
         React.useCallback(() => {
           if (user) {
             fetchLikedSneakers();
           }
         }, [user])
       );

       const renderItem = ({ item }) => (
         <TouchableOpacity
           style={styles.card}
           onPress={() => navigation.navigate('SneakerDetails', { sneaker: item })}
           activeOpacity={0.8}
         >
           <View style={styles.cardContent}>
             <View>
               <Text style={styles.name}>{item.name}</Text>
               <Text style={styles.detail}>Brand: {item.brand}</Text>
               <Text style={styles.detail}>Retail Price: ${item.retail}</Text>
               <Text style={styles.detail}>Predicted Price: ${item.predicted}</Text>
               <Text style={styles.detail}>Release Date: {item.release}</Text>
             </View>
             <TouchableOpacity
               style={styles.heartButton}
               onPress={() => handleUnlike(item.name)}
             >
               <Ionicons name="heart" size={22} color={theme.colors.primary} />
             </TouchableOpacity>
           </View>
         </TouchableOpacity>
       );

       if (!user) {
         return (
           <View style={styles.container}>
             <Text style={styles.empty}>You are not logged in. Please log in to see your liked sneakers.</Text>
             <TouchableOpacity
               style={styles.loginButton}
               onPress={() => navigation.navigate('Auth')}
             >
               <Text style={styles.loginText}>Sign Up / Log In</Text>
             </TouchableOpacity>
           </View>
         );
       }

       return (
         <View style={styles.container}>
           <View style={styles.headerRow}>
             <Text style={styles.header}>Your Liked Sneakers</Text>
             <TouchableOpacity onPress={toggleSortMode} style={styles.sortButton}>
               <Ionicons name="swap-vertical-outline" size={20} color={theme.colors.text} />
               <Text style={styles.sortText}>
                 {sortMode === 'profit' ? 'Sort: Profit' : 'Sort: Newest'}
               </Text>
             </TouchableOpacity>
           </View>
           {loading ? (
             <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.xl }} />
           ) : likedSneakers.length === 0 ? (
             <Text style={styles.empty}>You haven’t liked any sneakers yet.</Text>
           ) : (
             <FlatList
               data={likedSneakers}
               keyExtractor={item => item.id || item.name}
               renderItem={renderItem}
               contentContainerStyle={{ paddingBottom: 100 }}
             />
           )}
         </View>
       );
     }

     const styles = StyleSheet.create({
       container: {
         flex: 1,
         backgroundColor: theme.colors.background,
         paddingHorizontal: theme.spacing.md,
         paddingTop: theme.spacing.xl,
       },
       headerRow: {
         flexDirection: 'row',
         justifyContent: 'space-between',
         alignItems: 'center',
         marginBottom: theme.spacing.md,
       },
       header: {
         ...theme.fonts.title,
         color: theme.colors.text,
         textAlign: 'center',
         flex: 1,
       },
       sortButton: {
         flexDirection: 'row',
         alignItems: 'center',
         gap: theme.spacing.xs,
       },
       sortText: {
         ...theme.fonts.label,
         color: theme.colors.text,
       },
       card: {
         backgroundColor: theme.colors.card,
         padding: theme.spacing.md,
         borderRadius: theme.borderRadius.md,
         marginBottom: theme.spacing.sm,
       },
       cardContent: {
         position: 'relative',
       },
       name: {
         ...theme.fonts.body,
         fontWeight: '600',
         color: theme.colors.text,
         marginBottom: theme.spacing.xs,
       },
       detail: {
         ...theme.fonts.body,
         color: theme.colors.secondaryText,
         marginBottom: theme.spacing.xs,
       },
       heartButton: {
         position: 'absolute',
         bottom: theme.spacing.sm,
         right: theme.spacing.sm,
         padding: theme.spacing.xs,
       },
       empty: {
         ...theme.fonts.body,
         color: theme.colors.muted,
         marginTop: theme.spacing.xl,
         textAlign: 'center',
       },
       loginButton: {
         backgroundColor: theme.colors.primary,
         paddingVertical: theme.spacing.sm,
         paddingHorizontal: theme.spacing.lg,
         borderRadius: theme.borderRadius.md,
         marginTop: theme.spacing.md,
       },
       loginText: {
         ...theme.fonts.button,
         color: theme.colors.text,
         textAlign: 'center',
       },
     });