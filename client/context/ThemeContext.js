import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};

export const ThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState('dark'); // 'light' or 'dark'
	const [isLoading, setIsLoading] = useState(true);

	// Load theme from storage on app start
	useEffect(() => {
		loadTheme();
	}, []);

	const loadTheme = async () => {
		try {
			const savedTheme = await AsyncStorage.getItem('app_theme');
			if (savedTheme) {
				setTheme(savedTheme);
			}
		} catch (error) {
			console.error('Error loading theme:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const toggleTheme = async () => {
		try {
			const newTheme = theme === 'dark' ? 'light' : 'dark';
			setTheme(newTheme);
			await AsyncStorage.setItem('app_theme', newTheme);
		} catch (error) {
			console.error('Error saving theme:', error);
		}
	};

	const setDarkTheme = async () => {
		try {
			setTheme('dark');
			await AsyncStorage.setItem('app_theme', 'dark');
		} catch (error) {
			console.error('Error saving theme:', error);
		}
	};

	const setLightTheme = async () => {
		try {
			setTheme('light');
			await AsyncStorage.setItem('app_theme', 'light');
		} catch (error) {
			console.error('Error saving theme:', error);
		}
	};

	// Theme colors
	const colors = {
		dark: {
			background: ['#0f0f23', '#1a1a3e', '#2d2d5f'],
			surface: 'rgba(255, 255, 255, 0.1)',
			surfaceVariant: 'rgba(255, 255, 255, 0.05)',
			text: '#ffffff',
			textSecondary: 'rgba(255, 255, 255, 0.7)',
			textTertiary: 'rgba(255, 255, 255, 0.5)',
			primary: '#667eea',
			primaryLight: 'rgba(102, 126, 234, 0.2)',
			accent: '#764ba2',
			success: '#2ecc71',
			warning: '#f39c12',
			error: '#e74c3c',
			border: 'rgba(255, 255, 255, 0.2)',
			shadow: '#000000'
		},
		light: {
			background: ['#f8fafc', '#e2e8f0', '#cbd5e0'],
			surface: 'rgba(0, 0, 0, 0.05)',
			surfaceVariant: 'rgba(0, 0, 0, 0.02)',
			text: '#2d3748',
			textSecondary: 'rgba(45, 55, 72, 0.8)',
			textTertiary: 'rgba(45, 55, 72, 0.6)',
			primary: '#667eea',
			primaryLight: 'rgba(102, 126, 234, 0.1)',
			accent: '#764ba2',
			success: '#2ecc71',
			warning: '#f39c12',
			error: '#e74c3c',
			border: 'rgba(0, 0, 0, 0.1)',
			shadow: '#000000'
		}
	};

	const currentColors = colors[theme];

	const value = {
		theme,
		colors: currentColors,
		isDark: theme === 'dark',
		isLight: theme === 'light',
		isLoading,
		toggleTheme,
		setDarkTheme,
		setLightTheme
	};

	return (
		<ThemeContext.Provider value={value}>
			{children}
		</ThemeContext.Provider>
	);
};
