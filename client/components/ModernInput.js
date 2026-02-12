import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';

const ModernInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  style = {},
  containerStyle = {},
  labelStyle = {},
  darkTheme = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseInputStyle = {
    borderWidth: 2,
    borderColor: darkTheme ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    backgroundColor: darkTheme ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
    color: darkTheme ? '#ffffff' : '#2d3748',
    fontWeight: '500',
  };

  const focusedInputStyle = {
    borderColor: darkTheme ? '#667eea' : '#667eea',
    backgroundColor: darkTheme ? 'rgba(255, 255, 255, 0.1)' : '#ffffff',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  };

  const labelBaseStyle = {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: darkTheme ? '#ffffff' : '#2d3748',
    letterSpacing: 0.2,
  };

  const containerBaseStyle = {
    marginBottom: 20,
  };

  return (
    <View style={[containerBaseStyle, containerStyle]}>
      {label && (
        <Text style={[labelBaseStyle, labelStyle]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          baseInputStyle,
          isFocused && focusedInputStyle,
          style
        ]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={darkTheme ? 'rgba(255, 255, 255, 0.5)' : '#a0aec0'}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        {...props}
      />
    </View>
  );
};

export default ModernInput;
