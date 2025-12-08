import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Import pages
import Signin from '../pages/Signin';
import Signup from '../pages/Signup';
import MainApp from '../pages/MainApp';
import Settings from '../pages/Settings';
import LoadingScreen from '../components/LoadingScreen';

const Stack = createStackNavigator();

const AppRouter = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // User is authenticated - show main app screens
          <>
            <Stack.Screen name="MainApp" component={MainApp} />
            <Stack.Screen name="Settings" component={Settings} />
          </>
        ) : (
          // User is not authenticated - show auth screens
          <>
            <Stack.Screen name="Signin" component={Signin} />
            <Stack.Screen name="Signup" component={Signup} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppRouter;