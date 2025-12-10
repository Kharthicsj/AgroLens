import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from './Icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const Header = ({ title = "AgroLens" }) => {
	const navigation = useNavigation();
	const { colors } = useTheme();

	const handleSettingsPress = () => {
		navigation.navigate('Settings');
	};

	return (
		<SafeAreaView edges={['top']} style={{ backgroundColor: colors.background[0] }}>
			<View style={{
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				paddingHorizontal: 20,
				paddingVertical: 16,
				backgroundColor: colors.surface,
				borderBottomWidth: 1,
				borderBottomColor: colors.border
			}}>
				{/* Agriculture Icon and Title */}
				<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
					<View style={{
						backgroundColor: 'rgba(102, 126, 234, 0.2)',
						borderRadius: 10,
						padding: 8,
						marginRight: 12
					}}>
						<Icon name="leaf" size={24} color="#667eea" />
					</View>
					<Text style={{
						fontSize: 20,
						fontWeight: '700',
						color: colors.text,
						letterSpacing: 0.5
					}}>
						{title}
					</Text>
				</View>

				{/* Settings Icon */}
				<TouchableOpacity
					onPress={handleSettingsPress}
					style={{
						backgroundColor: colors.surface,
						borderRadius: 10,
						padding: 8
					}}
				>
					<Icon name="settings-outline" size={24} color={colors.text} />
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

export default Header;
