import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../services/api';
import { authUtils } from '../utils/auth';

const Home = ({ onNavigateToPage }) => {
	const { user } = useAuth();
	const { colors } = useTheme();
	const [userDetails, setUserDetails] = useState(null);
	const [currentLocation, setCurrentLocation] = useState(null);
	const [locationLoading, setLocationLoading] = useState(true);

	// Fetch user's current location
	const getCurrentLocation = async () => {
		try {
			// Request permission to access location
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				// Silently handle permission denial - location is optional
				setLocationLoading(false);
				setCurrentLocation('Location not available');
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
			style={{
				backgroundColor: colors.surface,
				borderRadius: 16,
				padding: 20,
				marginBottom: 16,
				borderLeftWidth: 4,
				borderLeftColor: color
			}}
			onPress={onPress}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
				<View style={{
					backgroundColor: `${color}20`,
					borderRadius: 10,
					padding: 8,
					marginRight: 12
				}}>
					<Icon name={icon} size={24} color={color} />
				</View>
				<Text style={{
					fontSize: 18,
					fontWeight: '600',
					color: colors.text
				}}>
					{title}
				</Text>
			</View>
			<Text style={{
				fontSize: 14,
				color: colors.textSecondary,
				lineHeight: 20
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
					contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
					showsVerticalScrollIndicator={false}
				>
					{/* Welcome Section */}
					<View style={{ marginBottom: 32 }}>
						<Text style={{
							fontSize: 28,
							fontWeight: '800',
							color: colors.text,
							marginBottom: 8
						}}>
							Welcome Home{displayUser?.name ? `, ${displayUser.name}` : ''}!
						</Text>

						<Text style={{
							fontSize: 16,
							color: colors.textSecondary,
							lineHeight: 22
						}}>
							Manage your agricultural activities and monitor your crops with ease
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
									Fetching location...
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
						fontSize: 20,
						fontWeight: '700',
						color: colors.text,
						marginBottom: 16
					}}>
						Farm Management
					</Text>

					<FeatureCard
						icon="leaf-outline"
						title="Crop Recommendation"
						description="Get personalized crop suggestions based on soil type and climate conditions to maximize your yield"
						color="#667eea"
						onPress={() => onNavigateToPage && onNavigateToPage('CropRecommendation')}
					/>

					<FeatureCard
						icon="nutrition-outline"
						title="Fertilizer Recommendation"
						description="Receive precise fertilizer recommendations tailored to your crop requirements"
						color="#3498db"
						onPress={() => onNavigateToPage && onNavigateToPage('FertilizerRecommendation')}
					/>

					<FeatureCard
						icon="bug-outline"
						title="Disease Detection"
						description="Early detection and identification of crop diseases using AI-powered image analysis to protect your harvest"
						color="#e74c3c"
						onPress={() => onNavigateToPage && onNavigateToPage('DiseaseDetection')}
					/>
				</ScrollView>
			</LinearGradient>
		</View>
	);
};

export default Home;
