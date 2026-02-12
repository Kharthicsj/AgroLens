import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Alert,
	Dimensions,
	useWindowDimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { userAPI } from '../services/api';
import { authUtils } from '../utils/auth';

const Home = ({ onNavigateToPage }) => {
	const { user } = useAuth();
	const { colors } = useTheme();
	const { t } = useTranslation();
	const [userDetails, setUserDetails] = useState(null);
	const [currentLocation, setCurrentLocation] = useState(null);
	const [locationLoading, setLocationLoading] = useState(true);
	const { width: windowWidth, height: windowHeight } = useWindowDimensions();

	// Determine if landscape mode
	const isLandscape = windowWidth > windowHeight;

	// Calculate responsive padding
	const horizontalPadding = Math.max(windowWidth * 0.05, 16);
	const cardMargin = Math.max(windowWidth * 0.03, 12);

	// Fetch user's current location
	const getCurrentLocation = async () => {
		try {
			// Request permission to access location
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				// Silently handle permission denial - location is optional
				setLocationLoading(false);
				setCurrentLocation(t('locationNotAvailable'));
				return;
			}

			// Get current position with timeout
			const location = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced,
			});

			// Reverse geocode to get address
			const [address] = await Location.reverseGeocodeAsync({
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			});

			if (address) {
				const cityName = address.city || address.district || address.subregion || 'Unknown Location';
				setCurrentLocation(cityName);
			}
		} catch (error) {
			// Silently handle location errors - location is optional
			setCurrentLocation('Location not available');
		} finally {
			setLocationLoading(false);
		}
	};

	// Fetch user data from API
	const fetchUserData = async () => {
		try {
			// Only fetch if user is authenticated
			const token = await authUtils.getToken();
			if (!token) {
				return;
			}

			const response = await userAPI.fetchUserData();
			if (response.success) {
				setUserDetails(response.userData);
			}
		} catch (err) {
			// Silently fail and use context user data
		}
	};

	// Fetch user data on component mount
	useEffect(() => {
		fetchUserData();
		getCurrentLocation();
	}, []);

	// Use API data if available, otherwise fall back to context data
	const displayUser = userDetails || user;

	const FeatureCard = ({ icon, title, description, color, onPress }) => (
		<TouchableOpacity
			onPress={onPress}
			style={{
				backgroundColor: 'rgba(26, 26, 62, 0.6)',
				borderRadius: 16,
				padding: isLandscape ? 16 : 20,
				marginBottom: cardMargin,
				borderLeftWidth: 5,
				borderLeftColor: color,
				minHeight: isLandscape ? 100 : 115,
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 3 },
				shadowOpacity: 0.15,
				shadowRadius: 6,
				zIndex: 1,
				position: 'relative'
			}}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
				<View style={{
					width: isLandscape ? 40 : 46,
					height: isLandscape ? 40 : 46,
					borderRadius: 12,
					backgroundColor: `${color}20`,
					justifyContent: 'center',
					alignItems: 'center',
					marginRight: 14
				}}>
					<Icon name={icon} size={isLandscape ? 22 : 24} color={color} />
				</View>
				<Text style={{
					fontSize: isLandscape ? 17 : 18,
					fontWeight: '700',
					color: '#ffffff',
					flex: 1,
					letterSpacing: 0.2
				}}>
					{title}
				</Text>
			</View>
			<Text style={{
				fontSize: isLandscape ? 12 : 13,
				color: 'rgba(255, 255, 255, 0.7)',
				lineHeight: isLandscape ? 17 : 19,
				paddingLeft: isLandscape ? 54 : 60
			}}>
				{description}
			</Text>
		</TouchableOpacity>
	);

	return (
		<View style={{ flex: 1, backgroundColor: colors.background[0] }}>
			<LinearGradient
				colors={colors.background}
				style={{ flex: 1 }}
			>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{
						paddingHorizontal: horizontalPadding,
						paddingTop: 30,
						paddingBottom: 100,
						flexGrow: 1
					}}
					showsVerticalScrollIndicator={false}
				>
					{/* Welcome Section */}
					<View style={{ marginBottom: isLandscape ? 20 : 32 }}>
						<Text style={{
							fontSize: isLandscape ? 24 : 28,
							fontWeight: '800',
							color: colors.text,
							marginBottom: 8
						}}>
							{t('hello')}{displayUser?.name ? `, ${displayUser.name}` : ''}!
						</Text>

						<Text style={{
							fontSize: isLandscape ? 14 : 16,
							color: colors.textSecondary,
							lineHeight: 22
						}}>
							{t('smartFarming')}
						</Text>

						{/* User current location */}
						{locationLoading ? (
							<View style={{
								flexDirection: 'row',
								alignItems: 'center',
								marginTop: 12,
								backgroundColor: colors.surface,
								borderRadius: 8,
								padding: 8,
								alignSelf: 'flex-start'
							}}>
								<Icon name="location" size={16} color="#667eea" />
								<Text style={{
									color: colors.textSecondary,
									fontSize: 14,
									marginLeft: 6
								}}>
									{t('loading')}
								</Text>
							</View>
						) : currentLocation ? (
							<View style={{
								flexDirection: 'row',
								alignItems: 'center',
								marginTop: 12,
								backgroundColor: colors.surface,
								borderRadius: 8,
								padding: 8,
								alignSelf: 'flex-start'
							}}>
								<Icon name="location" size={16} color="#667eea" />
								<Text style={{
									color: colors.textSecondary,
									fontSize: 14,
									marginLeft: 6
								}}>
									{currentLocation}
								</Text>
							</View>
						) : null}
					</View>

					{/* Features Section */}
					<Text style={{
						fontSize: isLandscape ? 18 : 20,
						fontWeight: '700',
						color: colors.text,
						marginBottom: isLandscape ? 12 : 16
					}}>
						{t('farmManagement')}
					</Text>

					<FeatureCard
						icon="leaf-outline"
						title={t('cropRecommendation')}
						description={t('detailedCropRecommendations')}
						color="#667eea"
						onPress={() => onNavigateToPage && onNavigateToPage('CropRecommendation')}
					/>

					<FeatureCard
						icon="nutrition-outline"
						title={t('fertilizerRecommendation')}
						description={t('detailedFertilizerGuidance')}
						color="#3498db"
						onPress={() => onNavigateToPage && onNavigateToPage('FertilizerRecommendation')}
					/>

					<FeatureCard
						icon="bug-outline"
						title={t('diseaseDetection')}
						description={t('detailedDetectDiseases')}
						color="#e74c3c"
						onPress={() => onNavigateToPage && onNavigateToPage('DiseaseDetection')}
					/>
				</ScrollView>
			</LinearGradient>
		</View>
	);
};

export default Home;
