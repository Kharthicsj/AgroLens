import { useTranslation } from 'react-i18next';

/**
 * Utility function to get translated crop name
 * @param {string} cropName - English crop name to translate
 * @returns {string} - Translated crop name or original name if translation not found
 */
export const useTranslateCrop = () => {
    const { t } = useTranslation();

    const translateCrop = (cropName) => {
        if (!cropName) return cropName;

        // Clean the crop name by removing extra spaces and standardizing format
        const cleanName = cropName.trim();

        // Try to get translation from the cropNames object in translations
        const translatedName = t(`cropNames.${cleanName}`, { defaultValue: null });

        // If translation exists and is not the same as the key, return it
        if (translatedName && translatedName !== `cropNames.${cleanName}`) {
            return translatedName;
        }

        // If no direct translation found, return the original name
        return cleanName;
    };

    return translateCrop;
};

/**
 * Non-hook version for use outside React components
 * @param {string} cropName - English crop name to translate
 * @param {function} t - Translation function from useTranslation hook
 * @returns {string} - Translated crop name or original name if translation not found
 */
export const translateCropName = (cropName, t) => {
    if (!cropName || !t) return cropName;

    // Clean the crop name by removing extra spaces and standardizing format
    const cleanName = cropName.trim();

    // Try to get translation from the cropNames object in translations
    const translatedName = t(`cropNames.${cleanName}`, { defaultValue: null });

    // If translation exists and is not the same as the key, return it
    if (translatedName && translatedName !== `cropNames.${cleanName}`) {
        return translatedName;
    }

    // If no direct translation found, return the original name
    return cleanName;
};