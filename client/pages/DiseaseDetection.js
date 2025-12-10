import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    BackHandler,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { diseaseAPI } from '../services/api';

const DiseaseDetection = ({ onBackPress }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // Storage key for chat history
    const STORAGE_KEY = `@disease_detection_history_${user?.userId || 'guest'}`;

    // Load chat history on mount
    useEffect(() => {
        loadChatHistory();
    }, []);

    // Save chat history whenever messages change
    useEffect(() => {
        if (!isLoadingHistory && messages.length > 0) {
            saveChatHistory();
        }
    }, [messages, isLoadingHistory]);

    // Handle hardware back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (onBackPress) {
                onBackPress();
                return true; // Prevent default behavior
            }
            return false;
        });

        return () => backHandler.remove();
    }, [onBackPress]);

    const loadChatHistory = async () => {
        try {
            const savedMessages = await AsyncStorage.getItem(STORAGE_KEY);
            if (savedMessages) {
                const parsed = JSON.parse(savedMessages);
                // Convert timestamp strings back to Date objects
                const messagesWithDates = parsed.map(msg => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                setMessages(messagesWithDates);
                console.log(`📚 Loaded ${messagesWithDates.length} messages from history`);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const saveChatHistory = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
            console.log(`💾 Saved ${messages.length} messages to history`);
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    };

    const clearChatHistory = async () => {
        Alert.alert(
            'Clear Chat History',
            'Are you sure you want to delete all your conversation history?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem(STORAGE_KEY);
                            setMessages([]);
                            console.log('🗑️ Chat history cleared');
                        } catch (error) {
                            console.error('Error clearing history:', error);
                        }
                    }
                }
            ]
        );
    };

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please grant camera roll permissions to upload images.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const requestCameraPermissions = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Camera Permission Required',
                'Please grant camera permissions to take photos.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const showImageSourceOptions = () => {
        Alert.alert(
            'Select Image Source',
            'Choose how you want to add an image',
            [
                {
                    text: 'Take Photo',
                    onPress: handleTakePhoto
                },
                {
                    text: 'Choose from Gallery',
                    onPress: handleImagePick
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ],
            { cancelable: true }
        );
    };

    const handleTakePhoto = async () => {
        try {
            const hasPermission = await requestCameraPermissions();
            if (!hasPermission) return;

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
                exif: false
            });

            if (!result.canceled && result.assets[0]) {
                console.log('📷 Camera result:', {
                    hasBase64: !!result.assets[0].base64,
                    base64Length: result.assets[0].base64?.length,
                    width: result.assets[0].width,
                    height: result.assets[0].height,
                    fileSize: result.assets[0].fileSize
                });
                await processSelectedImage(result.assets[0]);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to capture image. Please try again.');
        }
    };

    const handleImagePick = async () => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
                exif: false
            });

            if (!result.canceled && result.assets[0]) {
                console.log('🖼️ Gallery result:', {
                    hasBase64: !!result.assets[0].base64,
                    base64Length: result.assets[0].base64?.length,
                    width: result.assets[0].width,
                    height: result.assets[0].height,
                    fileSize: result.assets[0].fileSize
                });
                await processSelectedImage(result.assets[0]);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again.');
        }
    };

    const processSelectedImage = async (imageAsset) => {
        setSelectedImage(imageAsset);

        // Add user message with image preview
        const userMessage = {
            id: Date.now(),
            text: "📷 Image uploaded for analysis",
            isAI: false,
            hasImage: true,
            imageUri: imageAsset.uri,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        // Automatically analyze the image
        await analyzeImage(imageAsset);
    };

    const analyzeImage = async (imageAsset) => {
        setIsAnalyzing(true);

        // Add "analyzing" message
        const analyzingMessage = {
            id: Date.now() + 1,
            text: "🔍 Analyzing your plant image...\n\nPlease wait while I examine the image for any signs of disease or health issues. This usually takes 10-30 seconds.",
            isAI: true,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, analyzingMessage]);

        try {
            // Validate base64 data
            if (!imageAsset.base64) {
                throw new Error('Image data is missing. Please try again.');
            }

            console.log('📸 Starting disease detection...');
            console.log('📦 Image info:', {
                width: imageAsset.width,
                height: imageAsset.height,
                base64Length: imageAsset.base64.length,
                fileSize: imageAsset.fileSize
            });

            // Prepare base64 image (clean base64 without data URI prefix)
            const base64Image = imageAsset.base64;

            console.log('🚀 Sending to backend:', `${process.env.EXPO_PUBLIC_API_URL}/api/disease/detect`);

            // Call API directly
            const response = await diseaseAPI.detect({
                image: base64Image,
                cropType: message.trim() || 'unknown',
                notes: `Uploaded at ${new Date().toLocaleString()}`
            });

            console.log('✅ Received response:', response.success);

            if (response.success && response.data) {
                const prediction = response.data.prediction;
                const confidenceEmoji = getConfidenceEmoji(prediction.confidencePercentage);
                const confidenceLevel = getConfidenceLevel(prediction.confidencePercentage);
                const diseaseInfo = prediction.disease.replace(/_/g, ' ');

                let recommendationText = '';
                if (prediction.confidencePercentage >= 80) {
                    recommendationText = '✅ High confidence detection! This diagnosis is reliable. I recommend:\n\n• Take immediate action if disease is confirmed\n• Consult with agricultural expert for treatment plan\n• Monitor other plants in the vicinity\n• Document the affected area';
                } else if (prediction.confidencePercentage >= 60) {
                    recommendationText = '⚠️ Moderate confidence. To improve accuracy:\n\n• Take another photo in better lighting\n• Capture closer view of affected area\n• Ensure photo is clear and focused\n• Try photographing multiple leaves';
                } else {
                    recommendationText = '❌ Low confidence detected. Please:\n\n• Retake photo with better lighting\n• Focus on the diseased area\n• Clean the lens if photo is blurry\n• Consider consulting an expert directly';
                }

                const responseText = `📊 Analysis Results:\n\n${confidenceEmoji} Disease: ${diseaseInfo}\n\n📈 Confidence: ${prediction.confidencePercentage.toFixed(1)}%\n🎯 Level: ${confidenceLevel}\n\n${recommendationText}`;

                const aiResponse = {
                    id: Date.now() + 2,
                    text: responseText,
                    isAI: true,
                    prediction: prediction,
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, aiResponse]);
                setMessage('');
            } else {
                throw new Error(response.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Disease detection error:', error);

            let errorText = '❌ Analysis Failed\n\n';
            if (error.message && error.message.includes('Cannot reach backend')) {
                errorText += 'Cannot connect to server.\n\nMake sure:\n• Backend is running on http://192.168.1.41:3000\n• Your phone and computer are on the same WiFi\n• Windows Firewall allows port 3000';
            } else if (error.message && error.message.includes('timeout')) {
                errorText += 'Request timeout. The server is taking too long.\n\nPlease try again.';
            } else {
                errorText += `Error: ${error.message || 'Unknown error occurred'}\n\nPlease try again or contact support.`;
            }

            const errorMessage = {
                id: Date.now() + 2,
                text: errorText,
                isAI: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsAnalyzing(false);
            setSelectedImage(null);
        }
    };

    const getConfidenceLevel = (confidence) => {
        if (confidence >= 90) return 'Very High Confidence';
        if (confidence >= 75) return 'High Confidence';
        if (confidence >= 60) return 'Moderate Confidence';
        return 'Low Confidence - May need verification';
    };

    const getConfidenceEmoji = (confidence) => {
        if (confidence >= 90) return '🟢';
        if (confidence >= 75) return '🟡';
        if (confidence >= 60) return '🟠';
        return '🔴';
    };

    const handleFileUpload = () => {
        showImageSourceOptions();
    };

    const MessageBubble = ({ msg }) => (
        <View style={{
            flexDirection: 'row',
            justifyContent: msg.isAI ? 'flex-start' : 'flex-end',
            marginBottom: 16,
            paddingHorizontal: 16
        }}>
            {msg.isAI && (
                <View style={{
                    backgroundColor: '#667eea',
                    borderRadius: 20,
                    padding: 8,
                    marginRight: 8,
                    alignSelf: 'flex-start',
                    shadowColor: '#667eea',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3
                }}>
                    <Ionicons name="leaf" size={20} color="#ffffff" />
                </View>
            )}
            <View style={{
                backgroundColor: msg.isAI ? colors.surface : '#667eea',
                borderRadius: 16,
                padding: 14,
                maxWidth: '75%',
                borderBottomLeftRadius: msg.isAI ? 4 : 16,
                borderBottomRightRadius: msg.isAI ? 16 : 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
            }}>
                {msg.hasImage && msg.imageUri && (
                    <View style={{
                        marginBottom: 10,
                        borderRadius: 12,
                        overflow: 'hidden'
                    }}>
                        <Image
                            source={{ uri: msg.imageUri }}
                            style={{
                                width: 220,
                                height: 220,
                                borderRadius: 12
                            }}
                            resizeMode="cover"
                        />
                    </View>
                )}
                <Text style={{
                    color: msg.isAI ? colors.text : '#ffffff',
                    fontSize: 15,
                    lineHeight: 24
                }}>
                    {msg.text}
                </Text>
                <Text style={{
                    color: msg.isAI ? colors.textSecondary : 'rgba(255,255,255,0.7)',
                    fontSize: 11,
                    marginTop: 8
                }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background[0] }}>
            <LinearGradient
                colors={colors.background}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    paddingTop: Platform.OS === 'ios' ? 60 : 40,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }}>
                    <TouchableOpacity
                        onPress={onBackPress}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 12,
                            padding: 8,
                            marginRight: 12
                        }}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={{
                            fontSize: 20,
                            fontWeight: '700',
                            color: colors.text
                        }}>
                            Disease Detection
                        </Text>
                        <Text style={{
                            fontSize: 13,
                            color: colors.textSecondary,
                            marginTop: 2
                        }}>
                            AI-powered crop disease analysis
                        </Text>
                    </View>
                    {messages.length > 0 && (
                        <TouchableOpacity
                            onPress={clearChatHistory}
                            style={{
                                backgroundColor: 'rgba(255, 59, 48, 0.15)',
                                borderRadius: 12,
                                padding: 8
                            }}
                        >
                            <Ionicons name="trash-outline" size={22} color="#ff3b30" />
                        </TouchableOpacity>
                    )}
                </View>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    {/* Chat Messages */}
                    <ScrollView
                        ref={(ref) => { this.scrollView = ref; }}
                        style={{ flex: 1 }}
                        contentContainerStyle={{
                            paddingTop: 20,
                            paddingBottom: 20,
                            flexGrow: 1
                        }}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={() => {
                            this.scrollView?.scrollToEnd({ animated: true });
                        }}
                    >
                        {isLoadingHistory ? (
                            <View style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <ActivityIndicator size="large" color="#667eea" />
                                <Text style={{
                                    color: colors.textSecondary,
                                    marginTop: 12,
                                    fontSize: 14
                                }}>
                                    Loading history...
                                </Text>
                            </View>
                        ) : (
                            <>
                                {messages.length === 0 && !isAnalyzing && (
                                    <View style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        paddingHorizontal: 40
                                    }}>
                                        <View style={{
                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                            borderRadius: 60,
                                            padding: 20,
                                            marginBottom: 24
                                        }}>
                                            <Ionicons name="camera-outline" size={60} color="#667eea" />
                                        </View>
                                        <Text style={{
                                            fontSize: 24,
                                            fontWeight: '700',
                                            color: colors.text,
                                            marginBottom: 12,
                                            textAlign: 'center'
                                        }}>
                                            Disease Detection
                                        </Text>
                                        <Text style={{
                                            fontSize: 16,
                                            color: colors.textSecondary,
                                            textAlign: 'center',
                                            lineHeight: 24
                                        }}>
                                            Take or upload a photo of your crop to detect diseases using AI-powered analysis
                                        </Text>
                                        <TouchableOpacity
                                            onPress={handleFileUpload}
                                            style={{
                                                backgroundColor: '#667eea',
                                                borderRadius: 16,
                                                paddingVertical: 16,
                                                paddingHorizontal: 32,
                                                marginTop: 32,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                shadowColor: '#667eea',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 8,
                                                elevation: 5
                                            }}
                                        >
                                            <Ionicons name="camera" size={24} color="#ffffff" />
                                            <Text style={{
                                                color: '#ffffff',
                                                fontSize: 18,
                                                fontWeight: '600',
                                                marginLeft: 12
                                            }}>
                                                Get Started
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} msg={msg} />
                        ))}
                        {isAnalyzing && (
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                paddingHorizontal: 16,
                                marginTop: 8,
                                alignItems: 'center'
                            }}>
                                <View style={{
                                    backgroundColor: colors.surface,
                                    borderRadius: 20,
                                    padding: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center'
                                }}>
                                    <ActivityIndicator size="small" color="#667eea" />
                                    <Text style={{
                                        color: colors.text,
                                        marginLeft: 12,
                                        fontSize: 14,
                                        fontWeight: '500'
                                    }}>
                                        Analyzing image
                                    </Text>
                                    <Text style={{
                                        color: colors.textSecondary,
                                        fontSize: 14
                                    }}>
                                        ...
                                    </Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>

                    {/* Input Bar - Only show when there are messages */}
                    {messages.length > 0 && (
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor: colors.surface,
                            borderTopWidth: 1,
                            borderTopColor: 'rgba(255, 255, 255, 0.1)'
                        }}>
                            <View style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.background[0],
                                borderRadius: 24,
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                marginRight: 8
                            }}>
                                <Text style={{
                                    flex: 1,
                                    color: colors.textSecondary,
                                    fontSize: 15
                                }}>
                                    Add another image...
                                </Text>
                            </View>

                            {/* Image Upload Button */}
                            <TouchableOpacity
                                onPress={handleFileUpload}
                                disabled={isAnalyzing}
                                style={{
                                    backgroundColor: isAnalyzing ? colors.surface : '#667eea',
                                    borderRadius: 24,
                                    padding: 12,
                                    shadowColor: '#667eea',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 4,
                                    elevation: 3
                                }}
                            >
                                <Ionicons
                                    name="camera"
                                    size={24}
                                    color={isAnalyzing ? colors.textSecondary : "#ffffff"}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
};

export default DiseaseDetection;
