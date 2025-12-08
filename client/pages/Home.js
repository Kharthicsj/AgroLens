import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../services/api';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import { authUtils } from '../utils/auth';
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f

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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
				// Silently handle permission denial - location is optional
				setLocationLoading(false);
				setCurrentLocation('Location not available');
				return;
			}

			// Get current position with timeout
=======
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
				Alert.alert(
					'Permission Denied',
					'Location permission is required to show your current city.',
					[{ text: 'OK' }]
				);
				setLocationLoading(false);
				return;
			}

			// Get current position
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
			// Silently handle location errors - location is optional
			setCurrentLocation('Location not available');
=======
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
			console.error('Error getting location:', error);
			Alert.alert(
				'Location Error',
				'Unable to fetch your current location. Please try again.',
				[{ text: 'OK' }]
			);
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
		} finally {
			setLocationLoading(false);
		}
	};

	// Fetch user data from API
	const fetchUserData = async () => {
		try {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
			// Only fetch if user is authenticated
			const token = await authUtils.getToken();
			if (!token) {
				return;
			}

=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
			const response = await userAPI.fetchUserData();
			if (response.success) {
				setUserDetails(response.userData);
			}
		} catch (err) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
			// Silently fail and use context user data
=======
			console.error('Error fetching user data:', err);
			// Fallback to context user data if API fails
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
			console.error('Error fetching user data:', err);
			// Fallback to context user data if API fails
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
			console.error('Error fetching user data:', err);
			// Fallback to context user data if API fails
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
		<TouchableOpacity
=======
		<TouchableOpacity 
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
		<TouchableOpacity 
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
		<TouchableOpacity 
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
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
					<Ionicons name={icon} size={24} color={color} />
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
				<ScrollView
					style={{ flex: 1 }}
=======
				<ScrollView 
					style={{ flex: 1 }} 
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
				<ScrollView 
					style={{ flex: 1 }} 
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
				<ScrollView 
					style={{ flex: 1 }} 
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
							<View style={{
								flexDirection: 'row',
								alignItems: 'center',
=======
							<View style={{ 
								flexDirection: 'row', 
								alignItems: 'center', 
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
							<View style={{ 
								flexDirection: 'row', 
								alignItems: 'center', 
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
							<View style={{ 
								flexDirection: 'row', 
								alignItems: 'center', 
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
								marginTop: 12,
								backgroundColor: colors.surface,
								borderRadius: 8,
								padding: 8,
								alignSelf: 'flex-start'
							}}>
								<Ionicons name="location" size={16} color="#667eea" />
								<Text style={{
									color: colors.textSecondary,
									fontSize: 14,
									marginLeft: 6
								}}>
									Fetching location...
								</Text>
							</View>
						) : currentLocation ? (
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
							<View style={{
								flexDirection: 'row',
								alignItems: 'center',
=======
							<View style={{ 
								flexDirection: 'row', 
								alignItems: 'center', 
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
							<View style={{ 
								flexDirection: 'row', 
								alignItems: 'center', 
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
							<View style={{ 
								flexDirection: 'row', 
								alignItems: 'center', 
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
								marginTop: 12,
								backgroundColor: colors.surface,
								borderRadius: 8,
								padding: 8,
								alignSelf: 'flex-start'
							}}>
								<Ionicons name="location" size={16} color="#667eea" />
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
						onPress={() => onNavigateToPage && onNavigateToPage('FertilizerRecommendation')}
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
=======
>>>>>>> 502f3d24e98042d3fd45ef530d41bbec5f6ba10f
					/>

					<FeatureCard
						icon="bug-outline"
						title="Disease Detection"
						description="Early detection and identification of crop diseases using AI-powered image analysis to protect your harvest"
						color="#e74c3c"
					/>
				</ScrollView>
			</LinearGradient>
		</View>
	);
};

export default Home;
