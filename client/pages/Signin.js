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
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import PasswordInput from '../components/PasswordInput';
import LanguageSelectionModal from '../components/LanguageSelectionModal';
import Icon from '../components/Icon';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const navigation = useNavigation();
  const { login, continueAsGuest } = useAuth();
  const { getCurrentLanguageInfo } = useLanguage();
  const { t } = useTranslation();

  const handleSignin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
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
        // Use AuthContext login method - await to ensure state is updated
        const destination = await login(response.token, { email });

        // Clear form
        setEmail('');
        setPassword('');

        // Navigate back to MainApp after successful login
        setLoading(false);

        // Check if we can go back (came from modal), otherwise let router handle it
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
      }

    } catch (error) {
      setLoading(false);
      console.error('Signin: Error during signin:', error);
      const errorMessage = error.message || t('loginFailed');
      Alert.alert(t('error'), errorMessage);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup');
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      await continueAsGuest();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert(t('error'), 'Failed to continue as guest. Please try again.');
    }
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

          {/* Language Selector */}
          <View style={{
            position: 'absolute',
            top: 60,
            right: 20,
            zIndex: 999
          }}>
            <TouchableOpacity
              onPress={() => setShowLanguageModal(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
              activeOpacity={0.7}
            >
              <Icon name="globe" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: 12,
                marginLeft: 6,
                fontWeight: '500'
              }}>
                {getCurrentLanguageInfo().nativeName}
              </Text>
            </TouchableOpacity>
          </View>

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
                <Text style={SigninStyles.title}>{t('welcomeBack')}</Text>
                <Text style={SigninStyles.subtitle}>Sign in to continue your journey</Text>

                <View style={SigninStyles.inputContainer}>
                  <Text style={SigninStyles.label}>{t('email')}</Text>
                  <TextInput
                    style={SigninStyles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('email')}
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={SigninStyles.inputContainer}>
                  <Text style={SigninStyles.label}>{t('password')}</Text>
                  <PasswordInput
                    style={SigninStyles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('password')}
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
                        {loading ? t('loading') : t('signIn')}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                <View style={SigninStyles.signupContainer}>
                  <Text style={SigninStyles.signupText}>{t('dontHaveAccount')} </Text>
                  <TouchableOpacity onPress={navigateToSignup} activeOpacity={0.7}>
                    <Text style={SigninStyles.signupLink}>{t('signUp')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Guest Login Button */}
                <View style={{ marginTop: 20, alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', paddingHorizontal: 10, fontSize: 12 }}>
                      OR
                    </Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                  </View>

                  <TouchableOpacity
                    onPress={handleGuestLogin}
                    disabled={loading}
                    activeOpacity={0.7}
                    style={{
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      borderRadius: 12,
                      paddingVertical: 14,
                      paddingHorizontal: 32,
                      width: '100%',
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                      {t('continueAsGuest')}
                    </Text>
                  </TouchableOpacity>

                  <Text style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: 12,
                    marginTop: 12,
                    textAlign: 'center',
                    paddingHorizontal: 20
                  }}>
                    Limited access
                  </Text>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Language Selection Modal */}
          <LanguageSelectionModal
            visible={showLanguageModal}
            onClose={() => setShowLanguageModal(false)}
          />
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

export default Signin;
