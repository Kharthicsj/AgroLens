import { StyleSheet } from 'react-native';

// Import JSON style files
import signinStyles from './Signin.json';
import signupStyles from './Signup.json';

/**
 * Convert JSON styles to React Native StyleSheet
 * @param {Object} jsonStyles - The JSON style object
 * @returns {Object} StyleSheet.create() result
 */
const createStyleSheet = (jsonStyles) => {
  return StyleSheet.create(jsonStyles);
};

// Export created stylesheets
export const SigninStyles = createStyleSheet(signinStyles);
export const SignupStyles = createStyleSheet(signupStyles);

// Export individual style loaders for other components
export const loadStyles = (styleName) => {
  switch (styleName) {
    case 'signin':
      return SigninStyles;
    case 'signup':
      return SignupStyles;
    default:
      return {};
  }
};
