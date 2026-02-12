import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import DraggableLanguageSelector from '../components/DraggableLanguageSelector';
import Icon from '../components/Icon';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();
  const { login, continueAsGuest } = useAuth();
  const { t } = useTranslation();

  const handleSignin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const credentials = { email, password };
      const response = await authAPI.signin(credentials);

      if (response.success) {
        await login(response.token, { email });
        setEmail('');
        setPassword('');
        setLoading(false);

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
    <SafeAreaView style={signinStyles.container}>
      <View style={signinStyles.wrapper}>
        <LinearGradient
          colors={['#0f0f23', '#1a1a3e', '#2d2d5f']}
          style={signinStyles.gradient}
        >
          {/* Decorative Elements */}
          <View style={signinStyles.decorativeCircle1} />
          <View style={signinStyles.decorativeCircle2} />

          {/* Draggable Language Selector */}
          <DraggableLanguageSelector />

          <KeyboardAvoidingView
            style={signinStyles.keyboardView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
          >
            <ScrollView
              contentContainerStyle={signinStyles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Logo/App Name Section */}
              <View style={signinStyles.headerSection}>
                <View style={signinStyles.logoContainer}>
                  <Text style={signinStyles.logoIcon}>🌾</Text>
                </View>
                <Text style={signinStyles.appName}>AgroLens</Text>
                <Text style={signinStyles.tagline}>Smart Agriculture Solutions</Text>
              </View>

              {/* Form Section */}
              <View style={signinStyles.formSection}>
                <Text style={signinStyles.title}>{t('welcomeBack')}</Text>
                <Text style={signinStyles.subtitle}>Sign in to continue your journey</Text>

                {/* Email Input */}
                <View style={signinStyles.inputWrapper}>
                  <Text style={signinStyles.label}>{t('email')}</Text>
                  <View style={signinStyles.inputContainer}>
                    <Icon name="mail" size={20} color="rgba(255, 255, 255, 0.6)" style={signinStyles.inputIcon} />
                    <TextInput
                      style={signinStyles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder={t('email')}
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={signinStyles.inputWrapper}>
                  <Text style={signinStyles.label}>{t('password')}</Text>
                  <View style={signinStyles.passwordContainer}>
                    <Icon name="lock" size={20} color="rgba(255, 255, 255, 0.6)" style={signinStyles.inputIcon} />
                    <TextInput
                      style={signinStyles.passwordTextInput}
                      value={password}
                      onChangeText={setPassword}
                      placeholder={t('password')}
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      secureTextEntry={!showPassword}
                      editable={!loading}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={signinStyles.eyeIcon}
                      activeOpacity={0.7}
                    >
                      <Icon
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color="rgba(255, 255, 255, 0.6)"
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}
                    activeOpacity={0.7}
                    style={signinStyles.forgotPasswordButton}
                  >
                    <Text style={signinStyles.forgotLink}>{t('forgotPassword')}?</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={[signinStyles.signInButton, loading && signinStyles.buttonDisabled]}
                  onPress={handleSignin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={loading ? ['#4a5568', '#2d3748'] : ['#667eea', '#764ba2', '#f093fb']}
                    style={signinStyles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={signinStyles.buttonText}>
                      {loading ? t('loading') : t('signIn')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={signinStyles.signupRow}>
                  <Text style={signinStyles.signupText}>{t('dontHaveAccount')} </Text>
                  <TouchableOpacity onPress={navigateToSignup} activeOpacity={0.7}>
                    <Text style={signinStyles.signupLink}>{t('signUp')}</Text>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={signinStyles.dividerContainer}>
                  <View style={signinStyles.dividerLine} />
                  <Text style={signinStyles.dividerText}>OR</Text>
                  <View style={signinStyles.dividerLine} />
                </View>

                {/* Guest Login Button */}
                <TouchableOpacity
                  onPress={handleGuestLogin}
                  disabled={loading}
                  activeOpacity={0.7}
                  style={[signinStyles.guestButton, loading && signinStyles.buttonDisabled]}
                >
                  <Icon name="user" size={20} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={signinStyles.guestButtonText}>{t('continueAsGuest')}</Text>
                </TouchableOpacity>

                <Text style={signinStyles.guestNote}>Limited access</Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const signinStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  wrapper: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(249, 168, 212, 0.08)',
    bottom: -50,
    left: -50,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  formSection: {
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  inputWrapper: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotLink: {
    fontSize: 15,
    color: '#879cfb',
    fontWeight: '600',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    height: 56,
  },
  passwordTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    height: 56,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    height: 56,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    height: 56,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    height: 56,
  },
  passwordTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    height: 56,
    paddingVertical: 0,
    textAlignVertical: 'center',
    paddingRight: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  signInButton: {
    marginTop: 28,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  signupLink: {
    fontSize: 15,
    color: '#879cfb',
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: '600',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: 56,
  },
  guestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  guestNote: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Signin;
