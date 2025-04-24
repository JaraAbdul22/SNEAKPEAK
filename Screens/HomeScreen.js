import React, { useState, useRef } from 'react';
     import {
       View,
       Text,
       FlatList,
       StyleSheet,
       TextInput,
       TouchableOpacity,
       Image,
       KeyboardAvoidingView,
       Platform,
       Dimensions,
     } from 'react-native';
     import * as Animatable from 'react-native-animatable';
     import { Ionicons } from '@expo/vector-icons';
     import { useNavigation } from '@react-navigation/native';
     import rawSneakerData from '../assets/predicted_sneaker_prices.json';
     import { theme } from '../components/theme';

     const { width } = Dimensions.get('window');
     const CARD_MARGIN = 8;
     const CARD_WIDTH = (width - 20 * 2 - CARD_MARGIN * 2) / 2;

     function HomeScreen() {
       const [search, setSearch] = useState('');
       const navigation = useNavigation();
       const searchInputRef = useRef(null);

       const groupedData = rawSneakerData.reduce((acc, sale) => {
         const name = sale['Sneaker Name'];
         if (!acc[name]) {
           acc[name] = {
             name,
             brand: sale['Brand'],
             retail: sale['Retail Price'],
             predicted: sale['Predicted Price'],
             release: sale['Release Date'],
             sales: [],
           };
         }

         acc[name].sales.push({
           date: sale['Order Date'],
           price: sale['Sale Price'],
           size: sale['Shoe Size'],
           shap: [
             { feature: sale['SHAP Feature 1'], impact: sale['SHAP Impact 1'] },
             { feature: sale['SHAP Feature 2'], impact: sale['SHAP Impact 2'] },
             { feature: sale['SHAP Feature 3'], impact: sale['SHAP Impact 3'] },
           ],
         });

         return acc;
       }, {});

       const groupedSneakers = Object.values(groupedData);

       const filteredSneakers = groupedSneakers.filter(item => {
         const name = item.name?.toLowerCase().replace(/-/g, ' ') || '';
         return (
           search.length > 0 &&
           name.includes(search.toLowerCase().trim())
         );
       });

       const handleClear = () => {
         setSearch('');
         setTimeout(() => {
           searchInputRef.current?.focus();
         }, 50);
       };

       const renderTrendingItem = (item, index) => {
         const name = item.name.replace(/-/g, ' ');
         const brand = item.brand;
         const retail = Number(item.retail);
         const predicted = Number(item.predicted);
         const profit = predicted - retail;

         let trendIcon = 'remove';
         let trendColor = theme.colors.muted;
         let trendLabel = 'Steady';

         if (profit > 10) {
           trendIcon = 'trending-up';
           trendColor = theme.colors.success;
           trendLabel = 'Rising';
         } else if (profit < -10) {
           trendIcon = 'trending-down';
           trendColor = theme.colors.danger;
           trendLabel = 'Falling';
         }

         return (
           <Animatable.View
             key={index}
             animation="fadeInUp"
             delay={index * 100}
             duration={600}
             style={{ width: CARD_WIDTH, marginBottom: theme.spacing.md }}
           >
             <TouchableOpacity
               style={styles.trendingCardGrid}
               onPress={() => navigation.navigate('SneakerDetails', { sneaker: item })}
             >
               <View style={styles.brandTag}>
                 <Text style={styles.brandText}>{brand}</Text>
               </View>
               <Text style={styles.trendingName}>{name}</Text>
               <Text style={styles.trendingPrice}>Retail: ${retail}</Text>
               <Text style={styles.trendingPrice}>Predicted: ${predicted.toFixed(2)}</Text>
               <View style={styles.trendRow}>
                 <Ionicons name={trendIcon} size={18} color={trendColor} />
                 <Text style={[styles.trendLabel, { color: trendColor }]}>
                   {' '}
                   {trendLabel} {profit >= 0 ? `+${profit.toFixed(2)}` : profit.toFixed(2)}
                 </Text>
               </View>
               <Text style={styles.releaseDate}>🗓 {item.release}</Text>
             </TouchableOpacity>
           </Animatable.View>
         );
       };

       const renderSearchItem = ({ item }) => (
         <TouchableOpacity
           style={styles.resultCard}
           onPress={() => navigation.navigate('SneakerDetails', { sneaker: item })}
         >
           <Text style={styles.resultName}>
             {item.name.replace(/-/g, ' ')}
           </Text>
           <Text style={styles.resultPrice}>${item.retail}</Text>
         </TouchableOpacity>
       );

       const TrendingSection = () => (
         <View>
           <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
           <Animatable.View animation="fadeInLeft" duration={800} style={styles.underline} />
           <View style={styles.trendingGrid}>
             {groupedSneakers.slice(0, 4).map((item, index) => renderTrendingItem(item, index))}
           </View>
         </View>
       );

       return (
         <View style={styles.container}>
           <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
             <View style={styles.innerContainer}>
               <Image
                 source={require('../assets/sneakpeaklogo2.png')}
                 style={styles.logo}
                 resizeMode="contain"
               />

               <View style={styles.searchRow}>
                 <TextInput
                   ref={searchInputRef}
                   placeholder="Search sneakers..."
                   placeholderTextColor={theme.colors.muted}
                   value={search}
                   onChangeText={text => setSearch(text)}
                   style={styles.searchInput}
                   selectionColor={theme.colors.primary}
                 />
                 {search.length > 0 && (
                   <TouchableOpacity onPress={handleClear}>
                     <Ionicons name="close-circle" size={24} color={theme.colors.muted} />
                   </TouchableOpacity>
                 )}
               </View>

               {search.length === 0 ? (
                 <TrendingSection />
               ) : (
                 <FlatList
                   data={filteredSneakers}
                   keyExtractor={(item, index) => index.toString()}
                   renderItem={renderSearchItem}
                   contentContainerStyle={{ paddingBottom: 120 }}
                   keyboardShouldPersistTaps="handled"
                 />
               )}
             </View>
           </KeyboardAvoidingView>
         </View>
       );
     }

     const styles = StyleSheet.create({
       container: {
         flex: 1,
         backgroundColor: theme.colors.background,
       },
       innerContainer: {
         paddingHorizontal: theme.spacing.md,
         paddingTop: theme.spacing.xl,
         paddingBottom: theme.spacing.xl,
       },
       logo: {
         width: '100%',
         height: 100,
         marginBottom: theme.spacing.md,
         alignSelf: 'center',
       },
       searchRow: {
         flexDirection: 'row',
         alignItems: 'center',
         marginBottom: theme.spacing.md,
         gap: theme.spacing.sm,
       },
       searchInput: {
         flex: 1,
         backgroundColor: theme.colors.card,
         padding: 14,
         borderRadius: theme.borderRadius.md,
         fontSize: theme.fonts.body.fontSize,
         color: theme.colors.text,
         borderWidth: 1,
         borderColor: theme.colors.border,
       },
       sectionTitle: {
         ...theme.fonts.subtitle,
         color: theme.colors.text,
         marginTop: theme.spacing.sm,
         marginBottom: theme.spacing.xs,
       },
       underline: {
         width: 100,
         height: 2,
         backgroundColor: theme.colors.primary,
         marginBottom: theme.spacing.sm,
         borderRadius: 4,
       },
       trendingGrid: {
         flexDirection: 'row',
         flexWrap: 'wrap',
         justifyContent: 'space-between',
       },
       trendingCardGrid: {
         backgroundColor: theme.colors.card,
         padding: 14,
         borderRadius: theme.borderRadius.lg,
         minHeight: 230,
         justifyContent: 'space-between',
       },
       brandTag: {
         alignSelf: 'flex-start',
         backgroundColor: theme.colors.primary,
         paddingHorizontal: theme.spacing.sm,
         paddingVertical: theme.spacing.xs,
         borderRadius: theme.borderRadius.sm,
         marginBottom: theme.spacing.xs,
       },
       brandText: {
         color: theme.colors.text,
         ...theme.fonts.label,
         fontWeight: 'bold',
       },
       trendingName: {
         ...theme.fonts.body,
         fontWeight: 'bold',
         color: theme.colors.text,
         marginBottom: theme.spacing.xs,
       },
       trendingPrice: {
         ...theme.fonts.body,
         color: theme.colors.secondaryText,
       },
       trendRow: {
         flexDirection: 'row',
         alignItems: 'center',
         marginTop: theme.spacing.xs,
       },
       trendLabel: {
         ...theme.fonts.body,
         fontWeight: 'bold',
       },
       releaseDate: {
         ...theme.fonts.label,
         color: theme.colors.muted,
         marginTop: theme.spacing.sm,
       },
       resultCard: {
         backgroundColor: theme.colors.card,
         padding: theme.spacing.md,
         borderRadius: theme.borderRadius.md,
         marginBottom: theme.spacing.sm,
       },
       resultName: {
         ...theme.fonts.body,
         fontWeight: 'bold',
         color: theme.colors.text,
       },
       resultPrice: {
         ...theme.fonts.body,
         color: theme.colors.primary,
         marginTop: theme.spacing.xs,
       },
     });

     export default HomeScreen;