import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import LottieView from 'lottie-react-native';

export default function SplashScreen({ navigation }) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Show logo for 2.5s, then show animation
    const logoTimer = setTimeout(() => {
      setShowAnimation(true);
    }, 2500);

    return () => clearTimeout(logoTimer);
  }, []);

  const handleAnimationFinish = () => {
    navigation.replace('Auth'); // Navigate after animation naturally ends
  };

  return (
    <View style={styles.container}>
      {!showAnimation ? (
        <ImageBackground
          source={require('../assets/sneakpeaklogo2.png')}
          resizeMode="contain"
          style={styles.logo}
        />
      ) : (
        <LottieView
          source={require('../assets/sneakers.json')}
          autoPlay
          loop={false}
          onAnimationFinish={handleAnimationFinish}
          style={styles.animation}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  animation: {
    width: Dimensions.get('window').width * 0.8, // adds spacing on sides
    height: Dimensions.get('window').height * 0.8, // adds spacing top/bottom
  },
});
