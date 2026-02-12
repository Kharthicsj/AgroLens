import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from './en.json';
import hi from './hi.json';
import ta from './ta.json';
import ml from './ml.json';
import te from './te.json';
import kn from './kn.json';

// Language detection for AsyncStorage
const languageDetector = {
    type: 'languageDetector',
    async: true,
    detect: async function (callback) {
        try {
            const savedLanguage = await AsyncStorage.getItem('user-language');
            if (savedLanguage) {
                callback(savedLanguage);
            } else {
                callback('en'); // Default language
            }
        } catch (error) {
            callback('en'); // Fallback to English
        }
    },
    init: () => { },
    cacheUserLanguage: async function (language) {
        try {
            await AsyncStorage.setItem('user-language', language);
        } catch (error) {
            console.error('Error saving language to AsyncStorage:', error);
        }
    },
};

// Available languages configuration
export const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
];

i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            hi: { translation: hi },
            ta: { translation: ta },
            ml: { translation: ml },
            te: { translation: te },
            kn: { translation: kn },
        },
        compatibilityJSON: 'v3', // For React Native compatibility
        fallbackLng: 'en',
        debug: false,
        saveMissing: false,
        suppressWarnings: true,
        interpolation: {
            escapeValue: false, // React already does escaping
        },
        react: {
            useSuspense: false, // Important for React Native
        },
    });

export default i18n;