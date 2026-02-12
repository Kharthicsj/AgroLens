import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import Icon from './Icon';

const PasswordInput = ({
  value,
  onChangeText,
  placeholder,
  style,
  showStrengthIndicator = false,
  autoCapitalize = "none",
  matchPassword = null, // For confirm password matching
  showMatchIndicator = false
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Password strength validation
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '#666' };

    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('at least 8 characters');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('lowercase letter');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('uppercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('number');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('special character');
    }

    // Determine strength level
    let strengthText = '';
    let strengthColor = '';

    if (score === 0) {
      strengthText = '';
      strengthColor = '#666';
    } else if (score <= 2) {
      strengthText = 'Weak';
      strengthColor = '#e74c3c';
    } else if (score <= 3) {
      strengthText = 'Fair';
      strengthColor = '#f39c12';
    } else if (score <= 4) {
      strengthText = 'Good';
      strengthColor = '#27ae60';
    } else {
      strengthText = 'Strong';
      strengthColor = '#2ecc71';
    }

    return {
      strength: score,
      text: strengthText,
      color: strengthColor,
      feedback: feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : 'Password meets all requirements!'
    };
  };

  const passwordStrength = showStrengthIndicator ? getPasswordStrength(value) : null;

  // Password matching logic
  const getMatchStatus = () => {
    if (!showMatchIndicator || !value || !matchPassword) return null;

    const isMatching = value === matchPassword;
    return {
      isMatching,
      color: isMatching ? '#2ecc71' : '#e74c3c',
      text: isMatching ? 'Passwords match' : 'Passwords do not match'
    };
  };

  const matchStatus = showMatchIndicator ? getMatchStatus() : null;

  return (
    <View>
      <View style={[style, { flexDirection: 'row', alignItems: 'center' }]}>
        <TextInput
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: '#ffffff',
              fontWeight: '500'
            }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          secureTextEntry={!isPasswordVisible}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={{
            padding: 8,
            marginLeft: 8
          }}
          activeOpacity={0.7}
        >
          <Icon
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={20}
            color="rgba(255, 255, 255, 0.7)"
          />
        </TouchableOpacity>
      </View>

      {/* Password Strength Indicator */}
      {showStrengthIndicator && value && (
        <View style={{ marginTop: 8 }}>
          {/* Strength Bars */}
          <View style={{ flexDirection: 'row', marginBottom: 6 }}>
            {[1, 2, 3, 4, 5].map((bar) => (
              <View
                key={bar}
                style={{
                  flex: 1,
                  height: 4,
                  backgroundColor: bar <= passwordStrength.strength
                    ? passwordStrength.color
                    : 'rgba(255, 255, 255, 0.2)',
                  marginHorizontal: 1,
                  borderRadius: 2
                }}
              />
            ))}
          </View>

          {/* Strength Text */}
          {passwordStrength.text && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{
                fontSize: 12,
                color: passwordStrength.color,
                fontWeight: '600',
                marginRight: 6
              }}>
                Password Strength: {passwordStrength.text}
              </Text>
              {passwordStrength.strength >= 4 && (
                <Icon name="checkmark-circle" size={14} color={passwordStrength.color} />
              )}
            </View>
          )}

          {/* Feedback */}
          <Text style={{
            fontSize: 11,
            color: 'rgba(255, 255, 255, 0.6)',
            lineHeight: 16
          }}>
            {passwordStrength.feedback}
          </Text>
        </View>
      )}

      {/* Password Match Indicator */}
      {showMatchIndicator && value && matchPassword && matchStatus && (
        <View style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
              fontSize: 12,
              color: matchStatus.color,
              fontWeight: '600',
              marginRight: 6
            }}>
              {matchStatus.text}
            </Text>
            {matchStatus.isMatching && (
              <Icon name="checkmark-circle" size={14} color={matchStatus.color} />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default PasswordInput;
