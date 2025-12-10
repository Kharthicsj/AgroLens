import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	Alert,
	RefreshControl,
	ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../services/api';
import EditProfileModal from '../components/EditProfileModal';

const UserProfile = () => {
	const navigation = useNavigation();
	const { logout } = useAuth();
	const { colors } = useTheme();
	const [userDetails, setUserDetails] = useState(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState(null);
	const [editModalVisible, setEditModalVisible] = useState(false);

	// Fetch user data from API
	const fetchUserData = async (showRefreshLoader = false) => {
		try {
			if (showRefreshLoader) {
				setRefreshing(true);
			} else {
				setLoading(true);
			}
			setError(null);

			const response = await userAPI.fetchUserData();

			if (response.success) {
				setUserDetails(response.userData);
			} else {
				setError(response.message || 'Failed to fetch user data');
			}
		} catch (err) {
			console.error('Error fetching user data:', err);
			setError(err.message || 'Failed to fetch user data');
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	// Fetch user data on component mount
	useEffect(() => {
		fetchUserData();
	}, []);

	// Handle pull to refresh
	const onRefresh = () => {
		fetchUserData(true);
	};

	// Handle profile update success
	const handleProfileUpdated = (updatedUserData) => {
		setUserDetails(updatedUserData);
	};

	const handleLogout = async () => {
		Alert.alert(
			'Logout',
			'Are you sure you want to logout?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Logout',
					style: 'destructive',
					onPress: async () => {
						await logout();
					}
				}
			]
		);
	};

	// Handle navigation to Settings page
	const handleSettingsNavigation = () => {
		navigation.navigate('Settings');
	};

	const ProfileItem = ({ icon, title, value, onPress, editable = false }) => (
		<TouchableOpacity
			onPress={onPress}
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				backgroundColor: colors.surface,
				borderRadius: 12,
				padding: 16,
				marginBottom: 12,
				opacity: editable ? 1 : 0.8
			}}
		>
			<View style={{
				backgroundColor: colors.border,
				borderRadius: 8,
				padding: 8,
				marginRight: 12
			}}>
				<Icon name={icon} size={20} color={colors.text} />
			</View>
			<View style={{ flex: 1 }}>
				<Text style={{
					color: colors.textSecondary,
					fontSize: 12,
					marginBottom: 2
				}}>
					{title}
				</Text>
				<Text style={{
					color: colors.text,
					fontSize: 16,
					fontWeight: '600'
				}}>
					{value}
				</Text>
			</View>
			{editable && (
				<Icon name="create-outline" size={20} color="#667eea" />
			)}
		</TouchableOpacity>
	);

	// Show loading spinner while fetching data
	if (loading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background[0] }}>
				<LinearGradient
					colors={colors.background}
					style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
				>
					<ActivityIndicator size="large" color={colors.text} />
					<Text style={{
						color: colors.textSecondary,
						fontSize: 16,
						marginTop: 20
					}}>
						Loading profile...
					</Text>
				</LinearGradient>
			</SafeAreaView>
		);
	}

	// Show error state
	if (error && !userDetails) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: colors.background[0] }}>
				<LinearGradient
					colors={colors.background}
					style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}
				>
					<Icon name="alert-circle-outline" size={64} color="#e74c3c" />
					<Text style={{
						color: colors.text,
						fontSize: 18,
						fontWeight: '600',
						textAlign: 'center',
						marginTop: 16,
						marginBottom: 8
					}}>
						Failed to Load Profile
					</Text>
					<Text style={{
						color: colors.textSecondary,
						fontSize: 14,
						textAlign: 'center',
						marginBottom: 24
					}}>
						{error}
					</Text>
					<TouchableOpacity
						onPress={() => fetchUserData()}
						style={{
							borderRadius: 12,
							overflow: 'hidden'
						}}
					>
						<LinearGradient
							colors={['#667eea', '#764ba2']}
							style={{
								paddingVertical: 12,
								paddingHorizontal: 24,
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							<Text style={{
								color: colors.text,
								fontSize: 16,
								fontWeight: '600'
							}}>
								Retry
							</Text>
						</LinearGradient>
					</TouchableOpacity>
				</LinearGradient>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: colors.background[0] }}>
			<LinearGradient
				colors={colors.background}
				style={{ flex: 1 }}
			>
				<ScrollView
					style={{ flex: 1 }}
					contentContainerStyle={{ padding: 24 }}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							tintColor="#667eea"
							colors={['#667eea']}
						/>
					}
				>
					{/* Profile Header */}
					<View style={{ alignItems: 'center', marginBottom: 32 }}>
						<View style={{
							width: 100,
							height: 100,
							borderRadius: 50,
							backgroundColor: 'rgba(102, 126, 234, 0.3)',
							alignItems: 'center',
							justifyContent: 'center',
							marginBottom: 16,
							borderWidth: 3,
							borderColor: '#667eea'
						}}>
							<Text style={{
								fontSize: 36,
								fontWeight: '800',
								color: colors.text,
								textTransform: 'uppercase'
							}}>
								{userDetails?.name ? userDetails.name.charAt(0) : 'U'}
							</Text>
						</View>
						<Text style={{
							fontSize: 24,
							fontWeight: '700',
							color: colors.text,
							marginBottom: 8
						}}>
							{userDetails?.name || 'User'}
						</Text>
						<Text style={{
							fontSize: 16,
							color: colors.textSecondary
						}}>
							{userDetails?.email || 'No email'}
						</Text>

						{/* Edit Profile Button */}
						<TouchableOpacity
							onPress={() => setEditModalVisible(true)}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								backgroundColor: 'rgba(102, 126, 234, 0.2)',
								borderRadius: 10,
								paddingVertical: 8,
								paddingHorizontal: 16,
								marginTop: 16
							}}
						>
							<Icon name="create-outline" size={16} color="#667eea" />
							<Text style={{
								color: '#667eea',
								fontSize: 14,
								fontWeight: '600',
								marginLeft: 6
							}}>
								Edit Profile
							</Text>
						</TouchableOpacity>
					</View>

					{/* Profile Information */}
					<Text style={{
						fontSize: 18,
						fontWeight: '600',
						color: colors.text,
						marginBottom: 16
					}}>
						Profile Information
					</Text>

					<ProfileItem
						icon="person-outline"
						title="Full Name"
						value={userDetails?.name || 'Not provided'}
						onPress={() => setEditModalVisible(true)}
						editable={true}
					/>

					<ProfileItem
						icon="mail-outline"
						title="Email Address"
						value={userDetails?.email || 'Not provided'}
						onPress={() => { }}
						editable={false}
					/>

					<ProfileItem
						icon="call-outline"
						title="Phone Number"
						value={userDetails?.phone || 'Not provided'}
						onPress={() => setEditModalVisible(true)}
						editable={true}
					/>

					<ProfileItem
						icon="location-outline"
						title="Location"
						value={userDetails?.location || 'Not provided'}
						onPress={() => setEditModalVisible(true)}
						editable={true}
					/>

					{/* User ID Section (for debugging/admin purposes) */}
					{userDetails?._id && (
						<ProfileItem
							icon="finger-print-outline"
							title="User ID"
							value={userDetails._id.slice(-8).toUpperCase()}
							onPress={() => { }}
						/>
					)}

					{/* Settings Section */}
					<Text style={{
						fontSize: 18,
						fontWeight: '600',
						color: colors.text,
						marginTop: 32,
						marginBottom: 16
					}}>
						Settings
					</Text>

					<ProfileItem
						icon="notifications-outline"
						title="Notifications"
						value="Enabled"
						onPress={handleSettingsNavigation}
					/>

					<ProfileItem
						icon="shield-checkmark-outline"
						title="Privacy & Security"
						value="Manage"
						onPress={handleSettingsNavigation}
					/>

					<ProfileItem
						icon="help-circle-outline"
						title="Help & Support"
						value="Get help"
						onPress={handleSettingsNavigation}
					/>

					{/* Logout Button */}
					<TouchableOpacity
						onPress={handleLogout}
						style={{
							borderRadius: 16,
							overflow: 'hidden',
							marginTop: 32,
							marginBottom: 100
						}}
					>
						<LinearGradient
							colors={['#e74c3c', '#c0392b']}
							style={{
								paddingVertical: 18,
								paddingHorizontal: 32,
								alignItems: 'center',
								justifyContent: 'center',
								minHeight: 56,
								flexDirection: 'row'
							}}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
						>
							<Icon name="log-out-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
							<Text style={{
								color: '#ffffff',
								fontSize: 18,
								fontWeight: '700',
								letterSpacing: 0.5
							}}>
								Logout
							</Text>
						</LinearGradient>
					</TouchableOpacity>
				</ScrollView>

				{/* Edit Profile Modal */}
				<EditProfileModal
					visible={editModalVisible}
					onClose={() => setEditModalVisible(false)}
					userDetails={userDetails}
					onProfileUpdated={handleProfileUpdated}
				/>
			</LinearGradient>
		</SafeAreaView>
	);
};

export default UserProfile;
