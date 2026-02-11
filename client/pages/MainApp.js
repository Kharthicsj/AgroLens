import React, { useState, useEffect } from 'react';
import { View, Modal, Text, TouchableOpacity, Alert } from 'react-native';
import Home from '../pages/Home';
import UserProfile from '../pages/UserProfile';
import CropRecommendation from '../pages/CropRecommendation';
import FertilizerRecommendation from '../pages/FertilizerRecommendation';
import DiseaseDetection from '../pages/DiseaseDetection';
import TabNavigator from '../components/TabNavigator';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';

const MainApp = () => {
	const [currentTab, setCurrentTab] = useState('Home');
	const [currentPage, setCurrentPage] = useState('Home');
	const [showLoginModal, setShowLoginModal] = useState(false);
	const { colors } = useTheme();
	const { isGuest, setIntendedPage, intendedDestination } = useAuth();
	const navigation = useNavigation();

	// Handle navigation to intended destination after login
	useEffect(() => {
		if (intendedDestination && !isGuest) {
			// User just logged in and had an intended destination
			setCurrentPage(intendedDestination);
			if (intendedDestination === 'Profile') {
				setCurrentTab('Profile');
			}
			// Clear intended destination after navigating
			setIntendedPage(null);
		}
	}, [intendedDestination, isGuest]);

	const handleTabPress = (tabId) => {
		// Check if guest is trying to access Profile
		if (isGuest && tabId === 'Profile') {
			setIntendedPage('Profile');
			setShowLoginModal(true);
			return;
		}

		setCurrentTab(tabId);
		setCurrentPage(tabId);
	};

	const handleNavigateToPage = (pageName) => {
		// Check if guest is trying to access Disease Detection
		if (isGuest && pageName === 'DiseaseDetection') {
			setIntendedPage('DiseaseDetection');
			setShowLoginModal(true);
			return;
		}

		setCurrentPage(pageName);
	};

	const handleLoginNow = () => {
		setShowLoginModal(false);
		navigation.navigate('Signin');
	};

	const handleBackToHome = () => {
		setCurrentPage('Home');
		setCurrentTab('Home');
	};

	const renderCurrentScreen = () => {
		switch (currentPage) {
			case 'Home':
				return <Home onNavigateToPage={handleNavigateToPage} />;
			case 'Profile':
				return <UserProfile />;
			case 'CropRecommendation':
				return <CropRecommendation onBackPress={handleBackToHome} />;
			case 'FertilizerRecommendation':
				return <FertilizerRecommendation onBackPress={handleBackToHome} />;
			case 'DiseaseDetection':
				return <DiseaseDetection onBackPress={handleBackToHome} />;
			default:
				return <Home onNavigateToPage={handleNavigateToPage} />;
		}
	};

	return (
		<View style={{ flex: 1, backgroundColor: colors.background[0] }}>
			{currentPage !== 'CropRecommendation' && currentPage !== 'FertilizerRecommendation' && currentPage !== 'DiseaseDetection' && <Header />}
			<View style={{ flex: 1 }}>
				{renderCurrentScreen()}
			</View>
			{currentPage !== 'CropRecommendation' && currentPage !== 'FertilizerRecommendation' && currentPage !== 'DiseaseDetection' && (
				<TabNavigator
					currentTab={currentTab}
					onTabPress={handleTabPress}
				/>
			)}

			{/* Login Required Modal */}
			<Modal
				visible={showLoginModal}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setShowLoginModal(false)}
			>
				<View style={{
					flex: 1,
					backgroundColor: 'rgba(0, 0, 0, 0.85)',
					justifyContent: 'center',
					alignItems: 'center',
					padding: 20
				}}>
					<View style={{
						backgroundColor: '#1a1a3e',
						borderRadius: 20,
						padding: 24,
						width: '100%',
						maxWidth: 400,
						alignItems: 'center',
						borderWidth: 1,
						borderColor: 'rgba(102, 126, 234, 0.3)'
					}}>
						<View style={{
							backgroundColor: 'rgba(102, 126, 234, 0.2)',
							borderRadius: 50,
							padding: 16,
							marginBottom: 16
						}}>
							<Icon name="lock-closed" size={32} color="#667eea" />
						</View>

						<Text style={{
							fontSize: 22,
							fontWeight: '700',
							color: colors.text,
							marginBottom: 8,
							textAlign: 'center'
						}}>
							Login Required
						</Text>

						<Text style={{
							fontSize: 14,
							color: colors.textSecondary,
							textAlign: 'center',
							marginBottom: 24,
							lineHeight: 20
						}}>
							This feature is only available to registered users. Please sign in or create an account to continue.
						</Text>

						<TouchableOpacity
							onPress={handleLoginNow}
							activeOpacity={0.8}
							style={{ width: '100%' }}
						>
							<LinearGradient
								colors={['#667eea', '#764ba2']}
								style={{
									borderRadius: 12,
									paddingVertical: 14,
									paddingHorizontal: 24,
									alignItems: 'center'
								}}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
							>
								<Text style={{
									color: '#fff',
									fontSize: 16,
									fontWeight: '600'
								}}>
									Login Now
								</Text>
							</LinearGradient>
						</TouchableOpacity>

						<TouchableOpacity
							onPress={() => setShowLoginModal(false)}
							style={{
								marginTop: 12,
								paddingVertical: 10,
								paddingHorizontal: 20,
								borderRadius: 8
							}}
							activeOpacity={0.7}
						>
							<Text style={{
								color: '#999',
								fontSize: 14,
								fontWeight: '500'
							}}>
								Maybe Later
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
};

export default MainApp;
