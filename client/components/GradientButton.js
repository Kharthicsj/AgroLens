import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GradientButton = ({ 
  onPress, 
  title, 
  colors = ['#667eea', '#764ba2', '#f093fb'], 
  style = {}, 
  textStyle = {},
  disabled = false,
  activeOpacity = 0.8,
  loading = false,
  loadingText = 'Loading...'
}) => {
  const buttonColors = disabled || loading ? ['#4a5568', '#2d3748'] : colors;
  
  return (
    <View 
      style={[
        {
          borderRadius: 16,
          overflow: 'hidden',
        },
        style
      ]}
    >
      <TouchableOpacity 
        onPress={onPress} 
        disabled={disabled || loading}
        activeOpacity={activeOpacity}
        style={{
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={buttonColors}
          style={{
            paddingVertical: 18,
            paddingHorizontal: 24,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 56,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text 
            style={[
              {
                color: '#ffffff',
                fontSize: 18,
                fontWeight: '700',
                letterSpacing: 0.5,
                textAlign: 'center',
              },
              textStyle
            ]}
          >
            {loading ? loadingText : title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default GradientButton;
