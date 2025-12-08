import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const TabNavigator = ({ currentTab, onTabPress }) => {
	const { colors } = useTheme();
	const tabs = [
		{ id: 'Home', name: 'Home', icon: 'home', activeIcon: 'home' },
		{ id: 'Profile', name: 'Profile', icon: 'person-outline', activeIcon: 'person' }
	];

	return (
		<LinearGradient
			colors={colors.background}
			style={{
				position: 'absolute',
				bottom: 0,
				left: 0,
				right: 0,
				borderTopWidth: 1,
				borderTopColor: 'rgba(255, 255, 255, 0.1)',
				paddingBottom: 20,
				paddingTop: 12,
				paddingHorizontal: 20
			}}
		>
			<View style={{
				flexDirection: 'row',
				justifyContent: 'space-around',
				alignItems: 'center'
			}}>
				{tabs.map((tab) => {
					const isActive = currentTab === tab.id;
					return (
						<TouchableOpacity
							key={tab.id}
							onPress={() => onTabPress(tab.id)}
							style={{
								alignItems: 'center',
								justifyContent: 'center',
								flex: 1,
								paddingVertical: 8
							}}
						>
							{isActive ? (
								<LinearGradient
									colors={['#667eea', '#764ba2']}
									style={{
										borderRadius: 20,
										paddingHorizontal: 16,
										paddingVertical: 8,
										alignItems: 'center',
										justifyContent: 'center',
										flexDirection: 'row'
									}}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 1 }}
								>
									<Ionicons
										name={tab.activeIcon}
										size={20}
										color={colors.text}
									/>
									<Text style={{
										color: colors.text,
										fontSize: 12,
										fontWeight: '600',
										marginLeft: 6
									}}>
										{tab.name}
									</Text>
								</LinearGradient>
							) : (
								<View style={{ alignItems: 'center' }}>
									<Ionicons
										name={tab.icon}
										size={20}
										color={colors.textSecondary}
									/>
									<Text style={{
										color: colors.textSecondary,
										fontSize: 10,
										fontWeight: '500',
										marginTop: 4
									}}>
										{tab.name}
									</Text>
								</View>
							)}
						</TouchableOpacity>
					);
				})}
			</View>
		</LinearGradient>
	);
};

export default TabNavigator;
