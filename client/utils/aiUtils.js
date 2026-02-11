import { useLanguage } from '../context/LanguageContext';

/**
 * AI utility functions for language-aware prompts and responses
 */
export const AIUtils = {
    /**
     * Prepends language instruction to user prompt based on current language
     * @param {string} userPrompt - The original user prompt
     * @param {string} currentLanguage - Current language code (en, hi, ta, etc.)
     * @returns {string} - Modified prompt with language instruction
     */
    createLanguageAwarePrompt: (userPrompt, currentLanguage) => {
        const languageInstructions = {
            'hi': 'Answer the following agricultural query in Hindi: ',
            'ta': 'Answer the following agricultural query in Tamil: ',
            'ml': 'Answer the following agricultural query in Malayalam: ',
            'te': 'Answer the following agricultural query in Telugu: ',
            'kn': 'Answer the following agricultural query in Kannada: ',
            'en': '' // No prefix for English
        };

        const prefix = languageInstructions[currentLanguage] || '';
        return prefix + userPrompt;
    },

    /**
     * Enhances detection result with language context for follow-up queries
     * @param {object} detectionResult - ML model result
     * @param {string} currentLanguage - Current language code
     * @returns {object} - Enhanced result with language context
     */
    enhanceDetectionWithLanguageContext: (detectionResult, currentLanguage) => {
        if (!detectionResult || !detectionResult.success) {
            return detectionResult;
        }

        // Add language context to the result
        return {
            ...detectionResult,
            languageContext: {
                userLanguage: currentLanguage,
                responseLanguage: currentLanguage === 'en' ? 'English' :
                    currentLanguage === 'hi' ? 'Hindi' :
                        currentLanguage === 'ta' ? 'Tamil' :
                            currentLanguage === 'ml' ? 'Malayalam' :
                                currentLanguage === 'te' ? 'Telugu' :
                                    currentLanguage === 'kn' ? 'Kannada' : 'English'
            }
        };
    },

    /**
     * Formats AI prompt for agricultural queries with proper context
     * @param {string} query - User's agricultural query
     * @param {object} context - Additional context (location, crop, soil type, etc.)
     * @param {string} currentLanguage - Current language code
     * @returns {string} - Formatted prompt ready for AI model
     */
    formatAgriculturalQuery: (query, context = {}, currentLanguage = 'en') => {
        let prompt = query;

        // Add context information if available
        if (context.location) {
            prompt += ` Location: ${context.location}.`;
        }
        if (context.cropType) {
            prompt += ` Crop: ${context.cropType}.`;
        }
        if (context.soilType) {
            prompt += ` Soil type: ${context.soilType}.`;
        }
        if (context.season) {
            prompt += ` Season: ${context.season}.`;
        }

        // Apply language instruction
        return AIUtils.createLanguageAwarePrompt(prompt, currentLanguage);
    },

    /**
     * Creates a language-aware disease detection follow-up prompt
     * @param {object} diseaseResult - Disease detection result
     * @param {string} currentLanguage - Current language code
     * @returns {string} - Follow-up prompt for treatment advice
     */
    createDiseaseFollowUpPrompt: (diseaseResult, currentLanguage = 'en') => {
        if (!diseaseResult || !diseaseResult.prediction) {
            return AIUtils.createLanguageAwarePrompt(
                'Please provide general plant health care tips.',
                currentLanguage
            );
        }

        const basePrompt = `Based on the detected disease: ${diseaseResult.prediction} with ${diseaseResult.confidence_percentage}% confidence, provide detailed treatment recommendations including:
1. Immediate treatment steps
2. Preventive measures
3. Organic and chemical treatment options
4. Best practices for future prevention`;

        return AIUtils.createLanguageAwarePrompt(basePrompt, currentLanguage);
    },

    /**
     * Creates language-aware fertilizer recommendation query
     * @param {object} soilData - Soil and crop information
     * @param {string} currentLanguage - Current language code
     * @returns {string} - Formatted fertilizer query
     */
    createFertilizerQuery: (soilData, currentLanguage = 'en') => {
        const basePrompt = `Provide fertilizer recommendations for:
Crop: ${soilData.crop || 'general farming'}
Soil Type: ${soilData.soilType || 'unknown'}
Location: ${soilData.location || 'general'}
Growth Stage: ${soilData.growthStage || 'general'}

Include NPK ratios, application timing, and organic alternatives.`;

        return AIUtils.createLanguageAwarePrompt(basePrompt, currentLanguage);
    },

    /**
     * React hook to get language-aware AI utilities
     * @returns {object} - AI utility functions with current language context
     */
    useLanguageAwareAI: () => {
        const { currentLanguage, getAIPromptPrefix } = useLanguage();

        return {
            currentLanguage,

            createPrompt: (userPrompt) =>
                AIUtils.createLanguageAwarePrompt(userPrompt, currentLanguage),

            formatQuery: (query, context = {}) =>
                AIUtils.formatAgriculturalQuery(query, context, currentLanguage),

            createDiseaseFollowUp: (diseaseResult) =>
                AIUtils.createDiseaseFollowUpPrompt(diseaseResult, currentLanguage),

            createFertilizerQuery: (soilData) =>
                AIUtils.createFertilizerQuery(soilData, currentLanguage),

            enhanceResult: (result) =>
                AIUtils.enhanceDetectionWithLanguageContext(result, currentLanguage),

            getLanguagePrefix: () => getAIPromptPrefix()
        };
    }
};

/**
 * React hook for language-aware AI utilities
 */
export const useLanguageAwareAI = AIUtils.useLanguageAwareAI;

export default AIUtils;