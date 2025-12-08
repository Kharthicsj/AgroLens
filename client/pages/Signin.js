import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SigninStyles } from '../styles';
import { authAPI } from '../services/api';
import { authUtils } from '../utils/auth';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleSignin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Call backend API for signin
      const credentials = {
        email,
        password
      };

      const response = await authAPI.signin(credentials);
      
      if (response.success) {
        // Use AuthContext login method
        await login(response.token, { email });
        
        setLoading(false);
        
        // Clear form
        setEmail('');
        setPassword('');
        
        // Navigation will be handled automatically by AuthContext
      }
      
    } catch (error) {
      setLoading(false);
      const errorMessage = error.message || 'Failed to sign in. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f23' }}>
      <View style={{ flex: 1 }}>
        <LinearGradient 
          colors={['#0f0f23', '#1a1a3e', '#2d2d5f']} 
          style={SigninStyles.backgroundGradient}
        >
      {/* Decorative Elements */}
      <View style={SigninStyles.decorativeCircle1} />
      <View style={SigninStyles.decorativeCircle2} />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
      >
        <ScrollView 
          contentContainerStyle={SigninStyles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          bounces={false}
        >
          <View style={SigninStyles.formContainer}>
            <Text style={SigninStyles.title}>Welcome Back</Text>
            <Text style={SigninStyles.subtitle}>Sign in to continue your journey</Text>

            <View style={SigninStyles.inputContainer}>
              <Text style={SigninStyles.label}>Email Address</Text>
              <TextInput
                style={SigninStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={SigninStyles.inputContainer}>
              <Text style={SigninStyles.label}>Password</Text>
              <PasswordInput
                style={SigninStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
              />
            </View>

            <View style={[SigninStyles.buttonContainer, loading && SigninStyles.buttonDisabled]}>
              <TouchableOpacity 
                style={SigninStyles.button}
                onPress={handleSignin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ['#4a5568', '#2d3748'] : ['#667eea', '#764ba2', '#f093fb']}
                  style={SigninStyles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={SigninStyles.buttonText}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={SigninStyles.signupContainer}>
              <Text style={SigninStyles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToSignup} activeOpacity={0.7}>
                <Text style={SigninStyles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

export default Signin;