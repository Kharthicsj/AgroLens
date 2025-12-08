import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	Alert,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from './LoadingSpinner';
import ModernInput from './ModernInput';
import PasswordInput from './PasswordInput';
import { userAPI } from '../services/api';

const EditProfileModal = ({ visible, onClose, userDetails, onProfileUpdated }) => {
	// Basic form state
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');
	const [location, setLocation] = useState('');
	
	// Password change state
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	
	// UI state
	const [loading, setLoading] = useState(false);
	const [showPasswordSection, setShowPasswordSection] = useState(false);
	const [errors, setErrors] = useState({});

	// Initialize form data when modal opens
	useEffect(() => {
		if (visible && userDetails) {
			setName(userDetails.name || '');
			setPhone(userDetails.phone || '');
			setLocation(userDetails.location || '');
			// Always reset password fields
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			setErrors({});
			setShowPasswordSection(false);
		}
	}, [visible, userDetails]);

	const validateForm = () => {
		const newErrors = {};

		// Name validation
		if (!name.trim()) {
			newErrors.name = 'Name is required';
		} else if (name.trim().length < 2) {
			newErrors.name = 'Name must be at least 2 characters';
		}

		// Phone validation (optional but if provided, should be valid)
		if (phone && !/^\d{10}$/.test(phone.replace(/\s/g, ''))) {
			newErrors.phone = 'Please enter a valid 10-digit phone number';
		}

		// Password validation (only if user wants to change password)
		if (showPasswordSection) {
			if (!currentPassword) {
				newErrors.currentPassword = 'Current password is required';
			}
			if (!newPassword) {
				newErrors.newPassword = 'New password is required';
			} else if (newPassword.length < 6) {
				newErrors.newPassword = 'Password must be at least 6 characters';
			}
			if (newPassword !== confirmPassword) {
				newErrors.confirmPassword = 'Passwords do not match';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = async () => {
		if (!validateForm()) {
			return;
		}

		setLoading(true);
		try {
			const updateData = {
				name: name.trim(),
				phone: phone.trim(),
				location: location.trim()
			};

			// Include password data only if user wants to change password
			if (showPasswordSection) {
				updateData.currentPassword = currentPassword;
				updateData.newPassword = newPassword;
			}

			const response = await userAPI.updateProfile(updateData);

			if (response.success) {
				Alert.alert(
					'Success',
					'Profile updated successfully!',
					[
						{
							text: 'OK',
							onPress: () => {
								onProfileUpdated(response.userData);
								handleClose();
							}
						}
					]
				);
			}
		} catch (error) {
			Alert.alert(
				'Error',
				error.message || 'Failed to update profile'
			);
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		// Reset all form fields
		setName('');
		setPhone('');
		setLocation('');
		setCurrentPassword('');
		setNewPassword('');
		setConfirmPassword('');
		setErrors({});
		setShowPasswordSection(false);
		onClose();
	};

	const togglePasswordSection = () => {
		setShowPasswordSection(!showPasswordSection);
		// Clear password fields when toggling
		if (showPasswordSection) {
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
			// Clear password-related errors
			const newErrors = { ...errors };
			delete newErrors.currentPassword;
			delete newErrors.newPassword;
			delete newErrors.confirmPassword;
			setErrors(newErrors);
		}
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
			onRequestClose={handleClose}
		>
			<KeyboardAvoidingView 
				style={{ flex: 1 }} 
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<LinearGradient
					colors={['#0f0f23', '#1a1a3e', '#2d2d5f']}
					style={{ flex: 1 }}
				>
					{/* Header */}
					<View style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
						paddingHorizontal: 20,
						paddingTop: 60,
						paddingBottom: 20,
						borderBottomWidth: 1,
						borderBottomColor: 'rgba(255, 255, 255, 0.1)'
					}}>
						<TouchableOpacity
							onPress={handleClose}
							style={{
								backgroundColor: 'rgba(255, 255, 255, 0.1)',
								borderRadius: 10,
								padding: 8
							}}
						>
							<Ionicons name="close" size={24} color="#ffffff" />
						</TouchableOpacity>
						
						<Text style={{
							color: '#ffffff',
							fontSize: 18,
							fontWeight: '700'
						}}>
							Edit Profile
						</Text>
						
						<TouchableOpacity
							onPress={handleSave}
							disabled={loading}
							style={{
								backgroundColor: loading ? 'rgba(102, 126, 234, 0.5)' : '#667eea',
								borderRadius: 10,
								paddingVertical: 8,
								paddingHorizontal: 16,
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'center',
								minWidth: 80,
								height: 40
							}}
						>
							{loading ? (
								<ActivityIndicator size="small" color="#ffffff" />
							) : (
								<Text style={{
									color: '#ffffff',
									fontSize: 14,
									fontWeight: '600'
								}}>
									Save
								</Text>
							)}
						</TouchableOpacity>
					</View>

					{/* Form */}
					<ScrollView 
						style={{ flex: 1 }} 
						contentContainerStyle={{ padding: 20 }}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						{/* Basic Information */}
						<Text style={{
							color: '#ffffff',
							fontSize: 20,
							fontWeight: '700',
							marginBottom: 20
						}}>
							Basic Information
						</Text>

						{/* Name Input */}
						<View style={{ marginBottom: 16 }}>
							<ModernInput
								label="Full Name *"
								value={name}
								onChangeText={setName}
								placeholder="Enter your full name"
								autoCapitalize="words"
								autoCorrect={false}
								darkTheme={true}
							/>
							{errors.name && (
								<Text style={{
									color: '#e74c3c',
									fontSize: 12,
									marginTop: -12,
									marginLeft: 4
								}}>
									{errors.name}
								</Text>
							)}
						</View>

						{/* Phone Input */}
						<View style={{ marginBottom: 16 }}>
							<ModernInput
								label="Phone Number"
								value={phone}
								onChangeText={setPhone}
								placeholder="Enter your phone number"
								keyboardType="phone-pad"
								autoCapitalize="none"
								autoCorrect={false}
								darkTheme={true}
							/>
							{errors.phone && (
								<Text style={{
									color: '#e74c3c',
									fontSize: 12,
									marginTop: -12,
									marginLeft: 4
								}}>
									{errors.phone}
								</Text>
							)}
						</View>

						{/* Location Input */}
						<View style={{ marginBottom: 16 }}>
							<ModernInput
								label="Location"
								value={location}
								onChangeText={setLocation}
								placeholder="Enter your location"
								autoCapitalize="words"
								autoCorrect={false}
								darkTheme={true}
							/>
							{errors.location && (
								<Text style={{
									color: '#e74c3c',
									fontSize: 12,
									marginTop: -12,
									marginLeft: 4
								}}>
									{errors.location}
								</Text>
							)}
						</View>

						{/* Password Section Toggle */}
						<TouchableOpacity
							onPress={togglePasswordSection}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								backgroundColor: 'rgba(255, 255, 255, 0.1)',
								borderRadius: 16,
								padding: 18,
								marginTop: 20,
								marginBottom: 20,
								borderWidth: 1,
								borderColor: showPasswordSection ? '#667eea' : 'rgba(255, 255, 255, 0.2)'
							}}
						>
							<Ionicons 
								name="lock-closed-outline" 
								size={22} 
								color={showPasswordSection ? '#667eea' : '#ffffff'} 
								style={{ marginRight: 14 }} 
							/>
							<Text style={{
								color: showPasswordSection ? '#667eea' : '#ffffff',
								fontSize: 16,
								fontWeight: '600',
								flex: 1
							}}>
								Change Password
							</Text>
							<Ionicons 
								name={showPasswordSection ? "chevron-up" : "chevron-down"} 
								size={20} 
								color={showPasswordSection ? '#667eea' : 'rgba(255, 255, 255, 0.6)'} 
							/>
						</TouchableOpacity>

						{/* Password Fields */}
						{showPasswordSection && (
							<View style={{
								backgroundColor: 'rgba(255, 255, 255, 0.05)',
								borderRadius: 16,
								padding: 20,
								marginBottom: 20
							}}>
								<Text style={{
									color: '#ffffff',
									fontSize: 18,
									fontWeight: '700',
									marginBottom: 20,
									textAlign: 'center'
								}}>
									Password Change
								</Text>

								{/* Current Password */}
								<View style={{ marginBottom: 16 }}>
									<Text style={{
										color: '#ffffff',
										fontSize: 14,
										fontWeight: '600',
										marginBottom: 8,
										marginLeft: 4
									}}>
										Current Password *
									</Text>
									<View style={{
										backgroundColor: 'rgba(255, 255, 255, 0.1)',
										borderRadius: 12,
										borderWidth: errors.currentPassword ? 2 : 1,
										borderColor: errors.currentPassword ? '#e74c3c' : 'rgba(255, 255, 255, 0.2)',
										paddingHorizontal: 16,
										paddingVertical: 4
									}}>
										<PasswordInput
											value={currentPassword}
											onChangeText={setCurrentPassword}
											placeholder="Enter your current password"
											style={{
												backgroundColor: 'transparent',
												borderWidth: 0,
												padding: 0,
												minHeight: 48
											}}
										/>
									</View>
									{errors.currentPassword && (
										<Text style={{
											color: '#e74c3c',
											fontSize: 12,
											marginTop: 4,
											marginLeft: 4
										}}>
											{errors.currentPassword}
										</Text>
									)}
								</View>

								{/* New Password */}
								<View style={{ marginBottom: 16 }}>
									<Text style={{
										color: '#ffffff',
										fontSize: 14,
										fontWeight: '600',
										marginBottom: 8,
										marginLeft: 4
									}}>
										New Password *
									</Text>
									<View style={{
										backgroundColor: 'rgba(255, 255, 255, 0.1)',
										borderRadius: 12,
										borderWidth: errors.newPassword ? 2 : 1,
										borderColor: errors.newPassword ? '#e74c3c' : 'rgba(255, 255, 255, 0.2)',
										paddingHorizontal: 16,
										paddingVertical: 4
									}}>
										<PasswordInput
											value={newPassword}
											onChangeText={setNewPassword}
											placeholder="Enter your new password"
											showStrengthIndicator={true}
											style={{
												backgroundColor: 'transparent',
												borderWidth: 0,
												padding: 0,
												minHeight: 48
											}}
										/>
									</View>
									{errors.newPassword && (
										<Text style={{
											color: '#e74c3c',
											fontSize: 12,
											marginTop: 4,
											marginLeft: 4
										}}>
											{errors.newPassword}
										</Text>
									)}
								</View>

								{/* Confirm Password */}
								<View style={{ marginBottom: 16 }}>
									<Text style={{
										color: '#ffffff',
										fontSize: 14,
										fontWeight: '600',
										marginBottom: 8,
										marginLeft: 4
									}}>
										Confirm New Password *
									</Text>
									<View style={{
										backgroundColor: 'rgba(255, 255, 255, 0.1)',
										borderRadius: 12,
										borderWidth: errors.confirmPassword ? 2 : 1,
										borderColor: errors.confirmPassword ? '#e74c3c' : 'rgba(255, 255, 255, 0.2)',
										paddingHorizontal: 16,
										paddingVertical: 4
									}}>
										<PasswordInput
											value={confirmPassword}
											onChangeText={setConfirmPassword}
											placeholder="Confirm your new password"
											matchPassword={newPassword}
											showMatchIndicator={true}
											style={{
												backgroundColor: 'transparent',
												borderWidth: 0,
												padding: 0,
												minHeight: 48
											}}
										/>
									</View>
									{errors.confirmPassword && (
										<Text style={{
											color: '#e74c3c',
											fontSize: 12,
											marginTop: 4,
											marginLeft: 4
										}}>
											{errors.confirmPassword}
										</Text>
									)}
								</View>
							</View>
						)}

						{/* Info Note */}
						<View style={{
							backgroundColor: 'rgba(102, 126, 234, 0.2)',
							borderRadius: 12,
							padding: 16,
							marginTop: 20,
							marginBottom: 40
						}}>
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
								<Ionicons name="information-circle" size={20} color="#667eea" />
								<Text style={{
									color: '#667eea',
									fontSize: 14,
									fontWeight: '600',
									marginLeft: 8
								}}>
									Note
								</Text>
							</View>
							<Text style={{
								color: 'rgba(255, 255, 255, 0.8)',
								fontSize: 12,
								lineHeight: 18
							}}>
								• Fields marked with * are required{'\n'}
								• Your email address cannot be changed{'\n'}
								• Password must be at least 6 characters long
							</Text>
						</View>
					</ScrollView>
				</LinearGradient>
			</KeyboardAvoidingView>
		</Modal>
	);
};

export default EditProfileModal;
