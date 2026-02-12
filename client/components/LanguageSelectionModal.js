import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';

// Language flag icons mapping
const getLanguageIcon = (languageCode) => {
    const iconMap = {
        'en': 'language-outline',
        'hi': 'earth-outline',
        'ta': 'leaf-outline',
        'ml': 'flower-outline',
        'te': 'diamond-outline',
        'kn': 'star-outline'
    };
    return iconMap[languageCode] || 'language-outline';
};

const LanguageSelectionModal = ({ visible, onClose }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { currentLanguage, languages, changeLanguage } = useLanguage();

    const handleLanguageSelect = async (languageCode) => {
        const success = await changeLanguage(languageCode);
        if (success) {
            onClose();
        }
    };

    const renderLanguageItem = ({ item }) => {
        const isSelected = item.code === currentLanguage;

        return (
            <TouchableOpacity
                style={[
                    styles.languageItem,
                    {
                        backgroundColor: isSelected
                            ? '#667eea20'
                            : colors.surface || 'rgba(255,255,255,0.05)',
                        borderColor: isSelected
                            ? '#667eea'
                            : 'rgba(255,255,255,0.1)',
                        borderWidth: isSelected ? 2 : 1,
                    },
                ]}
                onPress={() => handleLanguageSelect(item.code)}
                activeOpacity={0.7}
            >
                <View style={styles.languageLeftContent}>
                    <View style={[
                        styles.languageIconContainer,
                        {
                            backgroundColor: isSelected ? '#667eea' : 'rgba(255,255,255,0.1)'
                        }
                    ]}>
                        <Icon
                            name={getLanguageIcon(item.code)}
                            size={20}
                            color={isSelected ? '#ffffff' : '#667eea'}
                        />
                    </View>
                    <View style={styles.languageTextContainer}>
                        <Text style={[
                            styles.languageName,
                            {
                                color: colors.text || '#ffffff',
                                fontWeight: isSelected ? '700' : '600'
                            }
                        ]}>
                            {item.name}
                        </Text>
                        <Text style={[
                            styles.languageNativeName,
                            {
                                color: colors.textSecondary || 'rgba(255,255,255,0.7)',
                                fontWeight: isSelected ? '600' : '400'
                            }
                        ]}>
                            {item.nativeName}
                        </Text>
                    </View>
                </View>
                {isSelected && (
                    <View style={styles.selectedIndicator}>
                        <Icon name="checkmark-circle" size={24} color="#667eea" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={['#1a1a3e', '#0f0f23']}
                        style={styles.modalContent}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <View style={styles.headerIconContainer}>
                                    <Icon name="globe-outline" size={22} color="#ffffff" />
                                </View>
                                <Text style={styles.title}>
                                    {t('selectLanguage')}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                                activeOpacity={0.7}
                            >
                                <Icon name="close" size={20} color="#ffffff" />
                            </TouchableOpacity>
                        </View>

                        {/* Language List */}
                        <View style={styles.listContainer}>
                            <FlatList
                                data={languages}
                                renderItem={renderLanguageItem}
                                keyExtractor={(item) => item.code}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.listContent}
                                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                            />
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                                activeOpacity={0.8}
                            >
                                <Icon name="close-circle-outline" size={18} color="rgba(255,255,255,0.7)" />
                                <Text style={styles.cancelText}>
                                    {t('cancel')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        height: Dimensions.get('window').height * 0.7,
        maxHeight: 600,
        minHeight: 500,
    },
    modalContent: {
        flex: 1,
        borderRadius: 24,
        paddingBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerIconContainer: {
        backgroundColor: '#667eea',
        borderRadius: 10,
        padding: 8,
        marginRight: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        flex: 1,
    },
    closeButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 8,
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    listContent: {
        paddingBottom: 16,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        marginHorizontal: 4,
    },
    languageLeftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    languageIconContainer: {
        borderRadius: 10,
        padding: 8,
        marginRight: 14,
    },
    languageTextContainer: {
        flex: 1,
    },
    languageName: {
        fontSize: 16,
        marginBottom: 2,
    },
    languageNativeName: {
        fontSize: 14,
    },
    selectedIndicator: {
        marginLeft: 12,
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginLeft: 8,
    },
});

export default LanguageSelectionModal;