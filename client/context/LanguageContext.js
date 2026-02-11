import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { languages } from '../locales/i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [isLoading, setIsLoading] = useState(true);

    // Initialize language from storage
    useEffect(() => {
        const initializeLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem('user-language');
                if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
                    setCurrentLanguage(savedLanguage);
                    await i18n.changeLanguage(savedLanguage);
                }
            } catch (error) {
                console.error('Error loading saved language:', error);
            }
            setIsLoading(false);
        };

        initializeLanguage();
    }, [i18n]);

    // Change language function
    const changeLanguage = async (languageCode) => {
        try {
            // Validate language code
            if (!languages.find(lang => lang.code === languageCode)) {
                throw new Error(`Language ${languageCode} is not supported`);
            }

            // Change language in i18n
            await i18n.changeLanguage(languageCode);

            // Save to AsyncStorage
            await AsyncStorage.setItem('user-language', languageCode);

            // Update state
            setCurrentLanguage(languageCode);

            return true;
        } catch (error) {
            console.error('Error changing language:', error);
            return false;
        }
    };

    // Get current language info
    const getCurrentLanguageInfo = () => {
        return languages.find(lang => lang.code === currentLanguage) || languages[0];
    };

    // Get language code for AI model context
    const getLanguageForAI = () => {
        switch (currentLanguage) {
            case 'hi':
                return 'hindi';
            case 'ta':
                return 'tamil';
            case 'ml':
                return 'malayalam';
            case 'te':
                return 'telugu';
            case 'kn':
                return 'kannada';
            case 'en':
            default:
                return 'english';
        }
    };

    // Get AI prompt prefix based on language
    const getAIPromptPrefix = () => {
        switch (currentLanguage) {
            case 'hi':
                return 'Answer the following agricultural query in Hindi: ';
            case 'ta':
                return 'Answer the following agricultural query in Tamil: ';
            case 'ml':
                return 'Answer the following agricultural query in Malayalam: ';
            case 'te':
                return 'Answer the following agricultural query in Telugu: ';
            case 'kn':
                return 'Answer the following agricultural query in Kannada: ';
            case 'en':
            default:
                return ''; // No prefix for English
        }
    };

    const value = {
        currentLanguage,
        languages,
        changeLanguage,
        getCurrentLanguageInfo,
        getLanguageForAI,
        getAIPromptPrefix,
        isLoading,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageContext;