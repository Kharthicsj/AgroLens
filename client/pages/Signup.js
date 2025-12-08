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
import { SignupStyles } from '../styles';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  // Enhanced password validation function
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('at least 8 characters');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('one special character');
    }
    
    return errors;
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Enhanced password validation
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      Alert.alert(
        'Weak Password', 
        `Password must contain ${passwordErrors.join(', ')}.`
      );
      return;
    }

    setLoading(true);
    try {
      // Call backend API for signup
      const userData = {
        name,
        email,
        password,
        phone: '', // You can add phone field later if needed
        location: '' // You can add location field later if needed
      };

      const response = await authAPI.signup(userData);
      
      if (response.success) {
        // Auto-signin after successful signup
        try {
          const signinResponse = await authAPI.signin({ email, password });
          if (signinResponse.success) {
            // Use AuthContext login method
            await login(signinResponse.token, { email, name });
            
            setLoading(false);
            
            // Clear form
            setName('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            
            // Navigation will be handled automatically by AuthContext
          }
        } catch (signinError) {
          setLoading(false);
          // If auto-signin fails, show success message and navigate to signin
          Alert.alert('Success', 'Account created successfully! Please sign in.', [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Signin')
            }
          ]);
        }
      }
      
    } catch (error) {
      setLoading(false);
      const errorMessage = error.message || 'Failed to create account. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const navigateToSignin = () => {
    navigation.navigate('Signin');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f23' }}>
      <View style={{ flex: 1 }}>
        <LinearGradient 
          colors={['#0f0f23', '#2d2d5f', '#1a1a3e']} 
          style={SignupStyles.backgroundGradient}
        >
      {/* Decorative Elements */}
      <View style={SignupStyles.decorativeCircle1} />
      <View style={SignupStyles.decorativeCircle2} />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
      >
        <ScrollView 
          contentContainerStyle={SignupStyles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          bounces={false}
        >
          <View style={SignupStyles.formContainer}>
            <Text style={SignupStyles.title}>Create Account</Text>
            <Text style={SignupStyles.subtitle}>Join us and start your journey</Text>

            <View style={SignupStyles.inputContainer}>
              <Text style={SignupStyles.label}>Full Name</Text>
              <TextInput
                style={SignupStyles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={SignupStyles.inputContainer}>
              <Text style={SignupStyles.label}>Email Address</Text>
              <TextInput
                style={SignupStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={SignupStyles.inputContainer}>
              <Text style={SignupStyles.label}>Password</Text>
              <PasswordInput
                style={SignupStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                showStrengthIndicator={true}
              />
            </View>

            <View style={SignupStyles.inputContainer}>
              <Text style={SignupStyles.label}>Confirm Password</Text>
              <PasswordInput
                style={SignupStyles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                matchPassword={password}
                showMatchIndicator={true}
              />
            </View>

            <View style={[SignupStyles.buttonContainer, loading && SignupStyles.buttonDisabled]}>
              <TouchableOpacity 
                style={SignupStyles.button}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ['#4a5568', '#2d3748'] : ['#764ba2', '#667eea', '#f093fb']}
                  style={SignupStyles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={SignupStyles.buttonText}>
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={SignupStyles.signinContainer}>
              <Text style={SignupStyles.signinText}>Already have an account? </Text>
              <TouchableOpacity onPress={navigateToSignin} activeOpacity={0.7}>
                <Text style={SignupStyles.signinLink}>Sign In</Text>
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

export default Signup;