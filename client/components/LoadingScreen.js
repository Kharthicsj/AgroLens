import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoadingScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f23' }}>
      <LinearGradient 
        colors={['#0f0f23', '#1a1a3e', '#2d2d5f']} 
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <ActivityIndicator size="large" color="#764ba2" />
        <Text style={{
          color: '#ffffff',
          fontSize: 18,
          marginTop: 20,
          fontWeight: '600'
        }}>
          Loading...
        </Text>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LoadingScreen;
