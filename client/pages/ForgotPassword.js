import React, { useState, useRef, useEffect } from 'react';
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
import { useTranslation } from 'react-i18next';
import Icon from '../components/Icon';
import PasswordInput from '../components/PasswordInput';
import DraggableLanguageSelector from '../components/DraggableLanguageSelector';
import { authAPI } from '../services/api';
import { SigninStyles } from '../styles';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const { t } = useTranslation();

    // OTP input refs
    const otpRefs = [
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null),
        useRef(null)
    ];

    // Auto-focus first OTP input when step changes to 2
    useEffect(() => {
        if (step === 2 && otpRefs[0].current) {
            setTimeout(() => otpRefs[0].current?.focus(), 100);
        }
    }, [step]);

    const handleSendOTP = async () => {
        if (!email || !email.trim()) {
            Alert.alert(t('error'), t('emailRequired'));
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert(t('error'), t('invalidEmail'));
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.forgotPassword({ email });

            if (response.success) {
                Alert.alert(t('success'), t('otpSentSuccess'));
                setStep(2);
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            Alert.alert(t('error'), error.message || t('otpSendFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (value, index) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            otpRefs[index + 1].current?.focus();
        }
    };

    const handleOtpKeyPress = (e, index) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs[index - 1].current?.focus();
        }
    };

    const handleVerifyOTP = () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            Alert.alert(t('error'), t('enterCompleteOtp'));
            return;
        }
        setStep(3);
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert(t('error'), t('fillAllFields'));
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert(t('error'), t('passwordTooShort'));
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(t('error'), t('passwordsDoNotMatch'));
            return;
        }

        setLoading(true);
        try {
            const otpString = otp.join('');
            const response = await authAPI.resetPassword({
                email,
                otp: otpString,
                newPassword
            });

            if (response.success) {
                Alert.alert(
                    t('success'),
                    t('passwordResetSuccess'),
                    [
                        {
                            text: t('ok'),
                            onPress: () => navigation.navigate('Signin')
                        }
                    ]
                );
            }
        } catch (error) {
            console.error('Reset password error:', error);
            Alert.alert(t('error'), error.message || t('passwordResetFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setOtp(['', '', '', '', '', '']);
        await handleSendOTP();
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

                    {/* Draggable Language Selector */}
                    <DraggableLanguageSelector />

                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
                    >
                        <ScrollView
                            contentContainerStyle={{
                                flexGrow: 1,
                                justifyContent: 'center',
                                padding: 24,
                                paddingTop: 60,
                                paddingBottom: 60
                            }}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            enableOnAndroid={true}
                            bounces={false}
                        >
                            <View style={SigninStyles.formContainer}>
                                {/* Step 1: Email Input */}
                                {step === 1 && (
                                    <>
                                        <Text style={SigninStyles.title}>{t('forgotPassword')}</Text>
                                        <Text style={SigninStyles.subtitle}>{t('forgotPasswordSubtitle')}</Text>

                                        <View style={SigninStyles.inputContainer}>
                                            <Text style={SigninStyles.label}>{t('email')}</Text>
                                            <TextInput
                                                style={SigninStyles.input}
                                                value={email}
                                                onChangeText={setEmail}
                                                placeholder={t('enterEmail')}
                                                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                                editable={!loading}
                                            />
                                        </View>

                                        <View style={[SigninStyles.buttonContainer, loading && SigninStyles.buttonDisabled]}>
                                            <TouchableOpacity
                                                style={SigninStyles.button}
                                                onPress={handleSendOTP}
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
                                                        {loading ? t('loading') : t('sendOtp')}
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}

                                {/* Step 2: OTP Verification */}
                                {step === 2 && (
                                    <>
                                        <Text style={SigninStyles.title}>{t('verifyOtp')}</Text>
                                        <Text style={SigninStyles.subtitle}>
                                            {t('otpSentTo')} {email}
                                        </Text>

                                        {/* OTP Input Boxes */}
                                        <View style={{ marginTop: 30, marginBottom: 30 }}>
                                            <Text style={SigninStyles.label}>{t('enterOtp')}</Text>
                                            <View style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                marginTop: 15
                                            }}>
                                                {otp.map((digit, index) => (
                                                    <TextInput
                                                        key={index}
                                                        ref={otpRefs[index]}
                                                        style={{
                                                            width: 48,
                                                            height: 56,
                                                            borderWidth: 2,
                                                            borderColor: digit ? '#667eea' : 'rgba(255, 255, 255, 0.3)',
                                                            borderRadius: 12,
                                                            textAlign: 'center',
                                                            fontSize: 24,
                                                            fontWeight: '600',
                                                            color: '#fff',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                                        }}
                                                        value={digit}
                                                        onChangeText={(value) => handleOtpChange(value, index)}
                                                        onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                                        keyboardType="number-pad"
                                                        maxLength={1}
                                                        selectTextOnFocus
                                                    />
                                                ))}
                                            </View>
                                        </View>

                                        {/* Resend OTP */}
                                        <TouchableOpacity
                                            onPress={handleResendOTP}
                                            disabled={loading}
                                            activeOpacity={0.7}
                                            style={{ alignSelf: 'center', marginBottom: 20 }}
                                        >
                                            <Text style={{
                                                color: '#879cfb',
                                                fontSize: 14,
                                                fontWeight: '600'
                                            }}>
                                                {t('resendOtp')}
                                            </Text>
                                        </TouchableOpacity>

                                        <View style={[SigninStyles.buttonContainer, loading && SigninStyles.buttonDisabled]}>
                                            <TouchableOpacity
                                                style={SigninStyles.button}
                                                onPress={handleVerifyOTP}
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
                                                        {t('verifyOtp')}
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}

                                {/* Step 3: New Password */}
                                {step === 3 && (
                                    <>
                                        <Text style={SigninStyles.title}>{t('setNewPassword')}</Text>
                                        <Text style={SigninStyles.subtitle}>{t('setNewPasswordSubtitle')}</Text>

                                        <View style={SigninStyles.inputContainer}>
                                            <Text style={SigninStyles.label}>{t('newPassword')}</Text>
                                            <PasswordInput
                                                style={SigninStyles.input}
                                                value={newPassword}
                                                onChangeText={setNewPassword}
                                                placeholder={t('enterNewPassword')}
                                            />
                                        </View>

                                        <View style={SigninStyles.inputContainer}>
                                            <Text style={SigninStyles.label}>{t('confirmPassword')}</Text>
                                            <PasswordInput
                                                style={SigninStyles.input}
                                                value={confirmPassword}
                                                onChangeText={setConfirmPassword}
                                                placeholder={t('enterConfirmPassword')}
                                            />
                                        </View>

                                        <View style={[SigninStyles.buttonContainer, loading && SigninStyles.buttonDisabled]}>
                                            <TouchableOpacity
                                                style={SigninStyles.button}
                                                onPress={handleResetPassword}
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
                                                        {loading ? t('loading') : t('resetPassword')}
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </LinearGradient>
            </View>
        </SafeAreaView>
    );
};

export default ForgotPassword;
