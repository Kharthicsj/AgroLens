import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

// Import pages
import Signin from '../pages/Signin';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import MainApp from '../pages/MainApp';
import Settings from '../pages/Settings';
import LoadingScreen from '../components/LoadingScreen';

const Stack = createStackNavigator();

const AppRouter = () => {
  const { isAuthenticated, isLoading, isGuest } = useAuth();
  const navigationRef = useRef(null);
  const previousAuthState = useRef({ isAuthenticated: false, isGuest: false });

  // Handle navigation reset when auth state changes
  useEffect(() => {
    const currentShowMainApp = isAuthenticated || isGuest;
    const previousShowMainApp = previousAuthState.current.isAuthenticated || previousAuthState.current.isGuest;

    // Only reset navigation if auth state actually changed from logged out to logged in
    if (!isLoading && currentShowMainApp && !previousShowMainApp) {
      // Use setTimeout to ensure navigation happens after render
      setTimeout(() => {
        if (navigationRef.current) {
          navigationRef.current.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'MainApp' }],
            })
          );
        }
      }, 100);
    }

    // Update previous state
    previousAuthState.current = { isAuthenticated, isGuest };
  }, [isAuthenticated, isGuest, isLoading]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  const showMainApp = isAuthenticated || isGuest;

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showMainApp ? (
          // User is authenticated or in guest mode
          <Stack.Group>
            <Stack.Screen
              name="MainApp"
              component={MainApp}
              options={{ gestureEnabled: false, animationEnabled: true }}
            />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Signin" component={Signin} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </Stack.Group>
        ) : (
          // User is not authenticated
          <Stack.Group>
            <Stack.Screen
              name="Signin"
              component={Signin}
              options={{ gestureEnabled: false, animationEnabled: true }}
            />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppRouter;
