import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	Switch,
	Alert,
	StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../components/Icon';
import LanguageSelectionModal from '../components/LanguageSelectionModal';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

const Settings = () => {
	const navigation = useNavigation();
	const { theme, colors, isDark, toggleTheme } = useTheme();
	const { logout } = useAuth();
	const { getCurrentLanguageInfo } = useLanguage();
	const { t } = useTranslation();

	// Settings state
	const [notifications, setNotifications] = useState(true);
	const [autoSync, setAutoSync] = useState(true);
	const [locationServices, setLocationServices] = useState(true);
	const [dataUsage, setDataUsage] = useState(false);
	const [showLanguageModal, setShowLanguageModal] = useState(false);

	const handleThemeToggle = (value) => {
		toggleTheme();
	};

	const handleNotificationToggle = (value) => {
		setNotifications(value);
		Alert.alert(
			t('notifications'),
			value ? 'Push notifications have been enabled.' : 'Push notifications have been disabled.',
			[{ text: 'OK' }]
		);
	};

	const handleAutoSyncToggle = (value) => {
		setAutoSync(value);
		Alert.alert(
			t('autoSync'),
			value ? 'Data will now sync automatically.' : 'Auto sync has been disabled.',
			[{ text: 'OK' }]
		);
	};

	const handleLocationToggle = (value) => {
		setLocationServices(value);
		Alert.alert(
			t('locationServices'),
			value ? 'Location access has been enabled for better agricultural insights.' : 'Location services have been disabled.',
			[{ text: 'OK' }]
		);
	};

	const handleDataUsageToggle = (value) => {
		setDataUsage(value);
		Alert.alert(
			'Cellular Data',
			value ? 'App will now use cellular data for syncing.' : 'App will only sync over WiFi.',
			[{ text: 'OK' }]
		);
	};

	const SettingItem = ({ icon, title, subtitle, onPress, rightComponent, hasArrow = true }) => (
		<TouchableOpacity
			onPress={onPress}
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				backgroundColor: colors.surface,
				borderRadius: 16,
				padding: 16,
				marginBottom: 12,
				borderWidth: 1,
				borderColor: colors.border
			}}
			activeOpacity={0.7}
		>
			<View style={{
				backgroundColor: colors.primaryLight,
				borderRadius: 12,
				padding: 8,
				marginRight: 12
			}}>
				<Icon name={icon} size={20} color={colors.primary} />
			</View>

			<View style={{ flex: 1 }}>
				<Text style={{
					color: colors.text,
					fontSize: 16,
					fontWeight: '600',
					marginBottom: 2
				}}>
					{title}
				</Text>
				{subtitle && (
					<Text style={{
						color: colors.textTertiary,
						fontSize: 12
					}}>
						{subtitle}
					</Text>
				)}
			</View>

			{rightComponent || (hasArrow && (
				<Icon
					name="chevron-forward"
					size={20}
					color={colors.textTertiary}
				/>
			))}
		</TouchableOpacity>
	);

	const ToggleItem = ({ icon, title, subtitle, value, onToggle, color = colors.primary }) => (
		<View style={{
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: colors.surface,
			borderRadius: 16,
			padding: 16,
			marginBottom: 12,
			borderWidth: 1,
			borderColor: colors.border
		}}>
			<View style={{
				backgroundColor: `${color}20`,
				borderRadius: 12,
				padding: 8,
				marginRight: 12
			}}>
				<Icon name={icon} size={20} color={color} />
			</View>

			<View style={{ flex: 1 }}>
				<Text style={{
					color: colors.text,
					fontSize: 16,
					fontWeight: '600',
					marginBottom: 2
				}}>
					{title}
				</Text>
				{subtitle && (
					<Text style={{
						color: colors.textTertiary,
						fontSize: 12
					}}>
						{subtitle}
					</Text>
				)}
			</View>

			<Switch
				value={value}
				onValueChange={onToggle}
				trackColor={{ false: colors.border, true: color }}
				thumbColor={value ? '#ffffff' : colors.textTertiary}
				ios_backgroundColor={colors.border}
			/>
		</View>
	);

	const SectionHeader = ({ title }) => (
		<Text style={{
			color: colors.textSecondary,
			fontSize: 14,
			fontWeight: '700',
			marginTop: 24,
			marginBottom: 16,
			marginLeft: 4,
			textTransform: 'uppercase',
			letterSpacing: 1
		}}>
			{title}
		</Text>
	);

	const showAbout = () => {
		Alert.alert(
			t('aboutApp'),
			`${t('version')} 1.0.0\n\nA comprehensive agricultural management platform designed to help farmers optimize their operations.\n\n© 2025 ${t('appName')}. All rights reserved.`,
			[{ text: 'OK' }]
		);
	};

	const showPrivacyPolicy = () => {
		Alert.alert(
			t('privacyPolicy'),
			'Your privacy is important to us. We collect and use your data only to provide better agricultural insights and improve our services.\n\nWe do not share your personal information with third parties without your consent.',
			[{ text: 'OK' }]
		);
	};

	const showTermsOfService = () => {
		Alert.alert(
			t('termsOfService'),
			`By using ${t('appName')}, you agree to our terms and conditions. Please use the platform responsibly and in accordance with agricultural best practices.`,
			[{ text: 'OK' }]
		);
	};

	const showHelpSupport = () => {
		Alert.alert(
			t('helpSupport'),
			`Need help with ${t('appName')}?\n\n📧 Email: support@agrolens.com\n📞 Phone: +1 (555) 123-4567\n🌐 Website: www.agrolens.com\n\nOur support team is available 24/7 to assist you.`,
			[{ text: 'OK' }]
		);
	};

	const handleLogout = async () => {
		Alert.alert(
			t('logout'),
			'Are you sure you want to logout?',
			[
				{ text: t('cancel'), style: 'cancel' },
				{
					text: t('logout'),
					style: 'destructive',
					onPress: async () => {
						await logout();
					}
				}
			]
		);
	};

	return (
		<>
			<StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background[0]} />
			<LinearGradient
				colors={colors.background}
				style={{ flex: 1 }}
			>
				{/* Header */}
				<View style={{
					flexDirection: 'row',
					alignItems: 'center',
					paddingHorizontal: 20,
					paddingTop: 60,
					paddingBottom: 20,
					borderBottomWidth: 1,
					borderBottomColor: colors.border
				}}>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						style={{
							backgroundColor: colors.surface,
							borderRadius: 12,
							padding: 8,
							marginRight: 16
						}}
					>
						<Icon name="arrow-back" size={24} color={colors.text} />
					</TouchableOpacity>

					<Text style={{
						color: colors.text,
						fontSize: 24,
						fontWeight: '700',
						flex: 1
					}}>
						{t('settings')}
					</Text>

					<View style={{
						backgroundColor: colors.primaryLight,
						borderRadius: 12,
						padding: 8
					}}>
						<Icon name="settings" size={24} color={colors.primary} />
					</View>
				</View>

				{/* Settings Content */}
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ padding: 20 }}
					showsVerticalScrollIndicator={false}
				>
					{/* Appearance */}
					<SectionHeader title="Appearance" />

					<ToggleItem
						icon="moon"
						title={t('darkMode')}
						subtitle="Switch between light and dark modes"
						value={isDark}
						onToggle={handleThemeToggle}
						color={colors.primary}
					/>
					{/* Language */}
					<SectionHeader title={t('language')} />

					<SettingItem
						icon="globe"
						title={t('language')}
						subtitle={getCurrentLanguageInfo().nativeName}
						onPress={() => setShowLanguageModal(true)}
						rightComponent={
							<View style={{
								backgroundColor: colors.primaryLight,
								paddingHorizontal: 8,
								paddingVertical: 4,
								borderRadius: 8
							}}>
								<Text style={{
									color: colors.primary,
									fontSize: 12,
									fontWeight: '600'
								}}>
									{getCurrentLanguageInfo().code.toUpperCase()}
								</Text>
							</View>
						}
						hasArrow={true}
					/>
					{/* Language */}
					<SectionHeader title={t('language')} />

					<SettingItem
						icon="globe"
						title={t('changeLanguage')}
						subtitle={getCurrentLanguageInfo().nativeName}
						onPress={() => setShowLanguageModal(true)}
					/>

					{/* Notifications */}
					<SectionHeader title={t('notifications')} />

					<ToggleItem
						icon="notifications"
						title={t('notifications')}
						subtitle="Receive updates and alerts"
						value={notifications}
						onToggle={handleNotificationToggle}
						color={colors.success}
					/>

					{/* Data & Storage */}
					<SectionHeader title="Data & Storage" />

					<ToggleItem
						icon="sync"
						title={t('autoSync')}
						subtitle="Automatically sync your data"
						value={autoSync}
						onToggle={handleAutoSyncToggle}
						color={colors.warning}
					/>

					<ToggleItem
						icon="location"
						title={t('locationServices')}
						subtitle="Allow location access for better insights"
						value={locationServices}
						onToggle={handleLocationToggle}
						color="#9b59b6"
					/>

					<ToggleItem
						icon="cellular"
						title={t('dataUsage')}
						subtitle="Download data over mobile network"
						value={dataUsage}
						onToggle={handleDataUsageToggle}
						color="#34495e"
					/>

					{/* Support */}
					<SectionHeader title="Support & Legal" />

					<SettingItem
						icon="help-circle"
						title={t('helpSupport')}
						subtitle="Get help with using AgroLens"
						onPress={showHelpSupport}
					/>

					<SettingItem
						icon="document-text"
						title={t('privacyPolicy')}
						subtitle="How we handle your data"
						onPress={showPrivacyPolicy}
					/>

					<SettingItem
						icon="document"
						title={t('termsOfService')}
						subtitle="Terms and conditions"
						onPress={showTermsOfService}
					/>

					<SettingItem
						icon="information-circle"
						title={t('aboutApp')}
						subtitle="App version and information"
						onPress={showAbout}
					/>

					{/* Logout */}
					<SectionHeader title="Account" />

					<TouchableOpacity
						onPress={handleLogout}
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							backgroundColor: `${colors.error}15`,
							borderRadius: 16,
							padding: 16,
							marginBottom: 12,
							borderWidth: 1,
							borderColor: `${colors.error}30`
						}}
						activeOpacity={0.7}
					>
						<View style={{
							backgroundColor: `${colors.error}20`,
							borderRadius: 12,
							padding: 8,
							marginRight: 12
						}}>
							<Icon name="log-out" size={20} color={colors.error} />
						</View>

						<View style={{ flex: 1 }}>
							<Text style={{
								color: colors.error,
								fontSize: 16,
								fontWeight: '600'
							}}>
								{t('logout')}
							</Text>
							<Text style={{
								color: `${colors.error}70`,
								fontSize: 12
							}}>
								Sign out of your account
							</Text>
						</View>

						<Icon
							name="chevron-forward"
							size={20}
							color={`${colors.error}60`}
						/>
					</TouchableOpacity>

					{/* App Version */}
					<View style={{
						alignItems: 'center',
						marginTop: 40,
						marginBottom: 20
					}}>
						<Text style={{
							color: colors.textTertiary,
							fontSize: 12,
							fontWeight: '500'
						}}>
							{t('appName')} v1.0.0
						</Text>
						<Text style={{
							color: colors.textTertiary,
							fontSize: 10,
							marginTop: 4,
							opacity: 0.7
						}}>
							Made with ❤️ for farmers
						</Text>
					</View>
				</ScrollView>

				{/* Language Selection Modal */}
				<LanguageSelectionModal
					visible={showLanguageModal}
					onClose={() => setShowLanguageModal(false)}
				/>
			</LinearGradient>
		</>
	);
};

export default Settings;
