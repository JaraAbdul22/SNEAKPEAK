import React, { useEffect, useState } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
  } from 'react-native';
  import { Ionicons } from '@expo/vector-icons';
  import { db } from '../firebaseConfig';
  import {
    collection,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
  } from 'firebase/firestore';
  import { LineChart } from 'react-native-gifted-charts';
  import { useAuth } from '../components/AuthContext';
  import { theme } from '../components/theme';
  import * as Animatable from 'react-native-animatable';
  import LinearGradient from 'react-native-linear-gradient';

  export default function SneakerDetailScreen({ route, navigation }) {
    const { user } = useAuth();
    if (!route || !route.params || !route.params.sneaker) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Sneaker data not found.</Text>
        </View>
      );
    }

    const { sneaker } = route.params;
    const [liked, setLiked] = useState(false);
    const [loadingLikeStatus, setLoadingLikeStatus] = useState(true);
    const [selectedSale, setSelectedSale] = useState(null);

    const name = sneaker.name || sneaker['Sneaker Name'];
    const brand = sneaker.brand || sneaker['Brand'];
    const retail = sneaker.retail || sneaker['Retail Price'];
    const predicted = sneaker.predicted || sneaker['Predicted Price'] || sneaker['Predicted Sale Price'];
    const release = sneaker.release || sneaker['Release Date'];
    const sales = sneaker.sales || [];
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

    useEffect(() => {
      const checkIfLiked = async () => {
        if (!user) {
          setLoadingLikeStatus(false);
          return;
        }

        try {
          const docRef = doc(collection(doc(db, 'users', user.uid), 'likedSneakers'), name);
          const docSnap = await getDoc(docRef);
          setLiked(docSnap.exists());
        } catch (err) {
          console.error('Error checking like status:', err);
        } finally {
          setLoadingLikeStatus(false);
        }
      };

      checkIfLiked();
    }, [user, name]);

    const handleLike = async () => {
      if (!user) {
        alert('Please log in to like this sneaker.');
        return;
      }

      const docRef = doc(collection(doc(db, 'users', user.uid), 'likedSneakers'), name);

      try {
        if (liked) {
          await deleteDoc(docRef);
        } else {
          await setDoc(docRef, {
            name,
            brand,
            retail,
            predicted,
            release,
            timestamp: new Date(),
          });
        }
        setLiked(!liked);
      } catch (error) {
        console.error('Error updating likes:', error);
        alert('Failed to update like status.');
      }
    };

    const limitDataPoints = (data, maxPoints = 7) => {
      if (data.length <= maxPoints) return data;
      const step = Math.floor(data.length / maxPoints);
      return data.filter((_, index) => index % step === 0).slice(0, maxPoints);
    };

    const limitedSales = limitDataPoints(sales);
    const chartData = limitedSales.map((sale, index) => ({
      value: sale.price,
      label: new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dataPointText: `$${sale.price}`,
      index: index,
    }));

    const handlePointClick = (item) => {
      const sale = sales[item.index];
      setSelectedSale({
        date: sale.date,
        price: sale.price,
        size: sale.size,
        shap: sale.shap ? sale.shap.slice(0, 3) : [{ feature: 'No SHAP data', impact: 'N/A' }],
      });
    };

    const screenWidth = Dimensions.get('window').width;
    const chartWidth = screenWidth - theme.spacing.md * 2 - theme.spacing.lg * 2 - 60;

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animatable.View animation="fadeInDown" duration={600} style={styles.header}>
            <Image
              source={require('../assets/sneakpeaklogo2.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>{name.replace(/-/g, ' ')}</Text>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={600} delay={200} style={styles.card}>
            <Text style={styles.cardTitle}>Sneaker Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Brand:</Text>
              <Text style={styles.value}>{brand}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Retail Price:</Text>
              <Text style={styles.value}>${retail}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Predicted Price:</Text>
              <Text style={styles.value}>${predicted.toFixed(2)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Release Date:</Text>
              <Text style={styles.value}>{release}</Text>
            </View>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.card}>
            <Text style={styles.cardTitle}>Price Trend</Text>
            <View style={styles.trendRow}>
              <Ionicons name={trendIcon} size={24} color={trendColor} />
              <Text style={[styles.trendLabel, { color: trendColor }]}>
                {trendLabel} {profit >= 0 ? `+$${profit.toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`}
              </Text>
            </View>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" duration={600} delay={400} style={styles.actionRow}>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => alert('Redirecting to buy options...')}
            >
              <Ionicons name="cart-outline" size={22} color={theme.colors.text} />
              <Text style={styles.buyText}>Buy Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={handleLike}
              disabled={loadingLikeStatus}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.likeText}>{liked ? 'Unlike' : 'Like'}</Text>
            </TouchableOpacity>
          </Animatable.View>

          {Array.isArray(sales) && sales.length > 0 && (
            <Animatable.View animation="fadeInUp" duration={600} delay={500} style={[styles.card, styles.chartCard]}>
              <Text style={styles.cardTitle}>📈 Purchase History</Text>
              <LineChart
                data={chartData}
                width={chartWidth}
                height={300}
                areaChart
                curved
                startFillColor={theme.colors.primary + '66'}
                startOpacity={0.8}
                endFillColor={theme.colors.primary + '00'}
                endOpacity={0.1}
                color={theme.colors.primary}
                thickness={3}
                dataPointsColor={theme.colors.text}
                dataPointsRadius={6}
                xAxisLabelTextStyle={styles.xAxisLabel}
                yAxisTextStyle={styles.yAxisLabel}
                yAxisLabelPrefix="$"
                showDataPoints
                showStripes
                stripeColor={theme.colors.secondaryText + '22'}
                xAxisColor={theme.colors.secondaryText}
                yAxisColor={theme.colors.secondaryText}
                xAxisLabelShift={5}
                adjustToWidth={false}
                initialSpacing={20}
                endSpacing={40}
                onPress={handlePointClick}
                pointerConfig={{
                  pointerStripColor: theme.colors.primary,
                  pointerColor: theme.colors.primary,
                  radius: 6,
                  pointerLabelComponent: (items) => (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipText}>${items[0].value}</Text>
                      <Text style={styles.tooltipText}>{items[0].label}</Text>
                    </View>
                  ),
                }}
                style={styles.chart}
              />
            </Animatable.View>
          )}

          {selectedSale && (
            <Animatable.View animation="fadeInUp" duration={600} delay={600} style={styles.card}>
              <Text style={styles.cardTitle}>Sale Details</Text>
              <Text style={styles.detailText}>Date: {selectedSale.date}</Text>
              <Text style={styles.detailText}>Price: ${selectedSale.price}</Text>
              <Text style={styles.detailText}>Size: {selectedSale.size}</Text>
              <Text style={styles.detailText}>Top SHAP Features:</Text>
              {selectedSale.shap.map((shapValue, index) => (
                <Text key={index} style={styles.detailText}>
                  • {shapValue.feature}: {shapValue.impact}
                </Text>
              ))}
            </Animatable.View>
          )}
        </ScrollView>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    logo: {
      width: '100%',
      height: 120,
      marginBottom: theme.spacing.md,
    },
    backButton: {
      position: 'absolute',
      top: theme.spacing.sm,
      left: theme.spacing.sm,
    },
    title: {
      ...theme.fonts.title,
      color: theme.colors.text,
      textAlign: 'center',
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    chartCard: {
      overflow: 'hidden',
    },
    cardTitle: {
      ...theme.fonts.subtitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    label: {
      ...theme.fonts.body,
      color: theme.colors.secondaryText,
    },
    value: {
      ...theme.fonts.body,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    trendLabel: {
      ...theme.fonts.body,
      fontWeight: 'bold',
      marginLeft: theme.spacing.xs,
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: theme.spacing.md,
    },
    buyButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginRight: theme.spacing.sm,
    },
    buyText: {
      ...theme.fonts.button,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    likeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.card,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    likeText: {
      ...theme.fonts.button,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    chart: {
      borderRadius: theme.borderRadius.md,
    },
    xAxisLabel: {
      color: theme.colors.secondaryText,
      fontSize: 8,
    },
    yAxisLabel: {
      color: theme.colors.secondaryText,
      fontSize: 10,
    },
    tooltip: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    tooltipText: {
      ...theme.fonts.body,
      color: theme.colors.text,
      textAlign: 'center',
    },
    detailText: {
      ...theme.fonts.body,
      color: theme.colors.secondaryText,
      marginBottom: theme.spacing.xs,
    },
  });