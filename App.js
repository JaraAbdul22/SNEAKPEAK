import React from 'react';
     import { NavigationContainer } from '@react-navigation/native';
     import { createNativeStackNavigator } from '@react-navigation/native-stack';
     import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
     import { Ionicons } from '@expo/vector-icons';
     import { AuthProvider, useAuth } from './components/AuthContext';
     import { Alert } from 'react-native';

     // Screens
     import SplashScreen from './Screens/SplashScreen';
     import AuthScreen from './Screens/AuthScreen';
     import EmailAuthScreen from './Screens/EmailAuthScreen';
     import HomeScreen from './Screens/HomeScreen';
     import LikedScreen from './Screens/LikedScreen';
     import SneakerDetailScreen from './Screens/SneakerDetailScreen';
     import GuestProfileScreen from './Screens/GuestProfileScreen';

     const Stack = createNativeStackNavigator();
     const Tab = createBottomTabNavigator();

     function MainTabs() {
       const { user } = useAuth();

       return (
         <Tab.Navigator
           screenOptions={({ route }) => ({
             headerShown: false,
             tabBarActiveTintColor: '#e63946',
             tabBarInactiveTintColor: '#777',
             tabBarStyle: {
               backgroundColor: '#1a1a1a',
               borderTopColor: '#333',
               paddingBottom: 5,
               paddingTop: 5,
               height: 60,
             },
             tabBarLabelStyle: {
               fontSize: 12,
               fontWeight: '600',
             },
             tabBarIcon: ({ color, size }) => {
               let iconName;
               if (route.name === 'Home') iconName = 'home';
               else if (route.name === 'Liked') iconName = 'heart';
               else if (route.name === 'Profile') iconName = 'person-circle';
               return <Ionicons name={iconName} size={size} color={color} />;
             },
           })}
           screenListeners={({ navigation }) => ({
             tabPress: (e) => {
               if (!user && ['Liked', 'Profile'].includes(e.target?.split('-')[0])) {
                 e.preventDefault();
                 Alert.alert(
                   'Login Required',
                   'Please log in to access this section.',
                   [
                     { text: 'Cancel', style: 'cancel' },
                     { text: 'Log In', onPress: () => navigation.navigate('Auth') },
                   ]
                 );
               }
             },
           })}
         >
           <Tab.Screen name="Home" component={HomeScreen} />
           <Tab.Screen name="Liked" component={LikedScreen} />
           <Tab.Screen name="Profile" component={GuestProfileScreen} />
         </Tab.Navigator>
       );
     }

     export default function App() {
       return (
         <AuthProvider>
           <NavigationContainer>
             <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
               <Stack.Screen name="Splash" component={SplashScreen} />
               <Stack.Screen name="Auth" component={AuthScreen} />
               <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
               <Stack.Screen name="Main" component={MainTabs} />
               <Stack.Screen name="SneakerDetails" component={SneakerDetailScreen} />
             </Stack.Navigator>
           </NavigationContainer>
         </AuthProvider>
       );
     }