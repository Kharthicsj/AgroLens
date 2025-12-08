import React, { useState } from 'react';
import { View } from 'react-native';
import Home from '../pages/Home';
import UserProfile from '../pages/UserProfile';
import CropRecommendation from '../pages/CropRecommendation';
import FertilizerRecommendation from '../pages/FertilizerRecommendation';
import TabNavigator from '../components/TabNavigator';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const MainApp = () => {
	const [currentTab, setCurrentTab] = useState('Home');
	const [currentPage, setCurrentPage] = useState('Home');
	const { colors } = useTheme();

	const handleTabPress = (tabId) => {
		setCurrentTab(tabId);
		setCurrentPage(tabId);
	};

	const handleNavigateToPage = (pageName) => {
		setCurrentPage(pageName);
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
			default:
				return <Home onNavigateToPage={handleNavigateToPage} />;
		}
	};

	return (
		<View style={{ flex: 1, backgroundColor: colors.background[0] }}>
			{currentPage !== 'CropRecommendation' && currentPage !== 'FertilizerRecommendation' && <Header />}
			<View style={{ flex: 1 }}>
				{renderCurrentScreen()}
			</View>
			{currentPage !== 'CropRecommendation' && currentPage !== 'FertilizerRecommendation' && (
				<TabNavigator
					currentTab={currentTab}
					onTabPress={handleTabPress}
				/>
			)}
		</View>
	);
};

export default MainApp;
