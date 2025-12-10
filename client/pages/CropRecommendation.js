import React, { useEffect, useMemo, useState } from 'react';
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Modal,
	ActivityIndicator,
	TextInput,
	BackHandler
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fertilizerAPI } from '../services/api';

const CropRecommendation = ({ onBackPress }) => {
	const { user } = useAuth();
	const { colors } = useTheme();
	const [selectedLocation, setSelectedLocation] = useState('Coimbatore');
	const [selectedSoil, setSelectedSoil] = useState('Red Sand');
	const [recommendations, setRecommendations] = useState([]);
	const [districts, setDistricts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [showLocationModal, setShowLocationModal] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	// Handle hardware back button
	useEffect(() => {
		const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
			if (onBackPress) {
				onBackPress();
				return true; // Prevent default behavior
			}
			return false;
		});

		return () => backHandler.remove();
	}, [onBackPress]);

	// Fetch districts and recommendations on mount
	useEffect(() => {
		let isMounted = true;
		const fetchData = async () => {
			try {
				setLoading(true);

				const [districtsResponse, recommendationsResponse] = await Promise.all([
					fertilizerAPI.getDistricts(),
					fertilizerAPI.list()
				]);

				if (isMounted) {
					const districtsList = districtsResponse.data || [];
					const recommendationsList = recommendationsResponse.data || [];

					setDistricts(districtsList);
					setRecommendations(recommendationsList);
					setError('');
				}
			} catch (err) {
				if (isMounted) {
					setError(err.message || 'Failed to load data');
				}
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		fetchData();
		return () => {
			isMounted = false;
		};
	}, []);

	const locations = useMemo(() => {
		return districts.length > 0 ? districts : ['Coimbatore'];
	}, [districts]);

	const locationRecommendations = useMemo(() => {
		if (!selectedLocation) return recommendations;
		return recommendations.filter((item) => item.District === selectedLocation);
	}, [recommendations, selectedLocation]);

	const soilTypes = useMemo(() => {
		const unique = new Set();
		locationRecommendations.forEach((item) => {
			if (item.Soil_Type) unique.add(item.Soil_Type);
		});
		return Array.from(unique);
	}, [locationRecommendations]);

	useEffect(() => {
		if (!selectedSoil && soilTypes.length > 0) {
			// Set to Red Sand if available, otherwise first available
			if (soilTypes.includes('Red Sand')) {
				setSelectedSoil('Red Sand');
			} else {
				setSelectedSoil(soilTypes[0]);
			}
		}
		// If selected soil no longer exists for location, reset to first available
		else if (selectedSoil && soilTypes.length && !soilTypes.includes(selectedSoil)) {
			if (soilTypes.includes('Red Sand')) {
				setSelectedSoil('Red Sand');
			} else {
				setSelectedSoil(soilTypes[0]);
			}
		}
		// If no soil types available, clear selection
		else if (soilTypes.length === 0) {
			setSelectedSoil(null);
		}
	}, [soilTypes]);

	const filteredRecommendations = useMemo(() => {
		return locationRecommendations.filter((item) => {
			if (selectedSoil) {
				return item.Soil_Type === selectedSoil;
			}
			return true;
		});
	}, [locationRecommendations, selectedSoil]);

	const recommendedCrops = useMemo(() => {
		const unique = new Set();
		filteredRecommendations.forEach((item) => {
			if (item.Crop_Name) unique.add(item.Crop_Name);
		});
		return Array.from(unique);
	}, [filteredRecommendations]);

	const handleLocationSelect = (location) => {
		setSelectedLocation(location);
		setSelectedSoil('Red Sand');
		setShowLocationModal(false);
		setSearchQuery('');
	};

	const filteredLocations = useMemo(() => {
		if (!searchQuery.trim()) {
			return locations;
		}
		const query = searchQuery.toLowerCase();
		return locations.filter(loc => loc.toLowerCase().includes(query));
	}, [locations, searchQuery]);

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
					{/* Header Section with Back Button */}
					<View style={{
						flexDirection: 'row',
						alignItems: 'center',
						marginBottom: 24,
						marginTop: 10
					}}>
						<TouchableOpacity
							onPress={onBackPress}
							style={{
								backgroundColor: colors.surface,
								borderRadius: 12,
								padding: 12,
								marginRight: 16
							}}
						>
							<Ionicons name="arrow-back" size={24} color={colors.text} />
						</TouchableOpacity>
						<Text style={{
							fontSize: 24,
							fontWeight: '700',
							color: colors.text,
							flex: 1
						}}>
							Crop Recommendation
						</Text>
					</View>

					{/* Location Selection Section */}
					<View style={{ marginBottom: 24 }}>
						<Text style={{
							fontSize: 16,
							fontWeight: '600',
							color: colors.text,
							marginBottom: 12,
							marginLeft: 4
						}}>
							Select Your Location
						</Text>
						<TouchableOpacity
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between',
								borderRadius: 16,
								padding: 18,
								borderWidth: 1,
								borderColor: colors.textSecondary + '40'
							}}
							onPress={() => setShowLocationModal(true)}
							activeOpacity={0.8}
						>
							<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
								<View style={{
									borderRadius: 10,
									padding: 8,
									marginRight: 12
								}}>
									<Ionicons name="location" size={20} color="#667eea" />
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{
										color: colors.textSecondary,
										fontSize: 12,
										marginBottom: 2
									}}>
										Current Location ({districts.length} districts available)
									</Text>
									<Text style={{
										color: colors.text,
										fontSize: 16,
										fontWeight: '600'
									}}>
										{selectedLocation || (loading ? 'Loading...' : 'Select a location')}
									</Text>
								</View>
							</View>
							<Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
						</TouchableOpacity>
					</View>

					{/* Soil Selection Section */}
					{soilTypes.length > 0 && (
						<View style={{ marginBottom: 20 }}>
							<Text style={{
								fontSize: 16,
								fontWeight: '600',
								color: colors.text,
								marginBottom: 12,
								marginLeft: 4
							}}>
								Select Soil Type
							</Text>
							<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
								{soilTypes.map((soil, index) => {
									const isSelected = soil === selectedSoil;
									return (
										<TouchableOpacity
											key={index}
											style={{
												borderRadius: 12,
												paddingHorizontal: 16,
												paddingVertical: 10,
												marginBottom: 10,
												marginRight: 8,
												borderWidth: 2,
												borderColor: isSelected ? '#667eea' : colors.textSecondary + '50',
												backgroundColor: isSelected ? '#667eea20' : 'transparent'
											}}
											onPress={() => setSelectedSoil(soil)}
										>
											<Text style={{
												fontSize: 14,
												color: colors.text,
												fontWeight: isSelected ? '700' : '600'
											}}>
												{soil}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</View>
					)}

					{/* Data States */}
					{loading && (
						<View style={{ alignItems: 'center', paddingVertical: 40 }}>
							<ActivityIndicator size="large" color={colors.text} />
							<Text style={{ marginTop: 12, color: colors.textSecondary }}>
								Loading recommendations...
							</Text>
						</View>
					)}

					{!loading && error !== '' && (
						<View style={{
							borderRadius: 12,
							padding: 16,
							marginBottom: 16,
							backgroundColor: '#ff6b3540'
						}}>
							<Text style={{ color: colors.text, fontWeight: '700', marginBottom: 4 }}>
								Unable to load data
							</Text>
							<Text style={{ color: colors.textSecondary }}>{error}</Text>
						</View>
					)}

					{!loading && !error && selectedLocation && filteredRecommendations.length === 0 && (
						<View style={{
							borderRadius: 16,
							padding: 24,
							marginBottom: 16,
							alignItems: 'center',
							borderWidth: 1,
							borderColor: colors.textSecondary + '40'
						}}>
							<Ionicons name="construct-outline" size={48} color={colors.textSecondary} />
							<Text style={{
								fontSize: 18,
								fontWeight: '600',
								color: colors.text,
								marginTop: 16,
								marginBottom: 8,
								textAlign: 'center'
							}}>
								No recommendations found
							</Text>
							<Text style={{
								fontSize: 14,
								color: colors.textSecondary,
								textAlign: 'center',
								lineHeight: 20
							}}>
								No data available for {selectedLocation} with {selectedSoil} soil. Try selecting a different location or soil type.
							</Text>
						</View>
					)}

					{!loading && !error && filteredRecommendations.length > 0 && (
						<>
							{/* Location Info Header */}
							<View style={{
								borderRadius: 20,
								padding: 24,
								marginBottom: 24,
								borderWidth: 1,
								borderColor: '#667eea40'
							}}>
								<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
									<View style={{
										marginRight: 16
									}}>
										<Ionicons name="location" size={26} color="#667eea" />
									</View>
									<View style={{ flex: 1 }}>
										<Text style={{
											fontSize: 22,
											fontWeight: '700',
											color: colors.text,
											marginBottom: 4
										}}>
											{selectedLocation} Agricultural Profile
										</Text>
										<Text style={{
											fontSize: 14,
											color: colors.textSecondary,
											lineHeight: 20
										}}>
											{filteredRecommendations.length} recommendation(s) available
										</Text>
									</View>
								</View>
							</View>

							{/* Soil Type Section */}
							<View style={{
								borderRadius: 20,
								padding: 24,
								marginBottom: 20,
								borderWidth: 1,
								borderColor: '#ff6b3540'
							}}>
								<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
									<View style={{
										marginRight: 16
									}}>
										<Ionicons name="earth" size={26} color="#ff6b35" />
									</View>
									<Text style={{
										fontSize: 20,
										fontWeight: '700',
										color: colors.text
									}}>
										Soil Types in your Area
									</Text>
								</View>
								<View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
									{soilTypes.length === 0 && (
										<Text style={{ color: colors.textSecondary }}>No soil information available.</Text>
									)}
									{soilTypes.map((soil, index) => {
										const isSelected = soil === selectedSoil;
										return (
											<View key={index} style={{
												borderRadius: 12,
												paddingHorizontal: 20,
												paddingVertical: 12,
												marginBottom: 8,
												marginRight: 8,
												borderWidth: 2,
												borderColor: isSelected ? '#667eea' : '#ff6b35',
												backgroundColor: isSelected ? '#667eea20' : 'transparent'
											}}>
												<Text style={{
													fontSize: 16,
													color: colors.text,
													fontWeight: isSelected ? '700' : '600'
												}}>
													{soil}
												</Text>
											</View>
										);
									})}
								</View>
							</View>

							{/* Recommended Crops Section */}
							<View style={{
								borderRadius: 20,
								padding: 24,
								marginBottom: 24,
								borderWidth: 1,
								borderColor: '#4caf5040'
							}}>
								<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
									<View style={{
										marginRight: 16
									}}>
										<Ionicons name="leaf" size={26} color="#4caf50" />
									</View>
									<Text style={{
										fontSize: 20,
										fontWeight: '700',
										color: colors.text
									}}>
										Recommended Crops
									</Text>
								</View>

								<View style={{
									flexDirection: 'row',
									flexWrap: 'wrap',
									justifyContent: 'space-between'
								}}>
									{recommendedCrops.length === 0 && (
										<Text style={{ color: colors.textSecondary }}>No crops listed.</Text>
									)}
									{recommendedCrops.map((crop, index) => (
										<View key={index} style={{
											borderRadius: 16,
											padding: 16,
											flexDirection: 'row',
											alignItems: 'center',
											marginBottom: 12,
											width: '47%',
											borderWidth: 2,
											borderColor: '#4caf50'
										}}>
											<View style={{
												marginRight: 12
											}}>
												<Ionicons name="leaf" size={20} color="#4caf50" />
											</View>
											<Text style={{
												fontSize: 14,
												color: colors.text,
												fontWeight: '600',
												flex: 1
											}}>
												{crop}
											</Text>
										</View>
									))}
								</View>
							</View>

						</>
					)}


				</ScrollView>

				{/* Modern Location Selection Modal */}
				<Modal
					visible={showLocationModal}
					transparent={true}
					animationType="fade"
					onRequestClose={() => setShowLocationModal(false)}
				>
					<View style={{
						flex: 1,
						justifyContent: 'center',
						alignItems: 'center',
						backgroundColor: 'rgba(0,0,0,0.6)',
						paddingHorizontal: 20
					}}>
						<View style={{
							backgroundColor: '#2a2d3a',
							borderRadius: 24,
							padding: 0,
							width: '100%',
							maxWidth: 320,
							shadowColor: '#000',
							shadowOffset: {
								width: 0,
								height: 10,
							},
							shadowOpacity: 0.3,
							shadowRadius: 20,
							elevation: 10,
							overflow: 'hidden'
						}}>
							{/* Modal Header */}
							<View style={{
								backgroundColor: '#2a2d3a',
								paddingVertical: 20,
								paddingHorizontal: 24,
								borderBottomWidth: 1,
								borderBottomColor: 'rgba(255,255,255,0.1)'
							}}>
								<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<View style={{
											backgroundColor: "#667eea20",
											borderRadius: 10,
											padding: 8,
											marginRight: 12
										}}>
											<Ionicons name="location" size={20} color="#667eea" />
										</View>
										<Text style={{
											fontSize: 18,
											fontWeight: '700',
											color: '#ffffff'
										}}>
											Choose Location
										</Text>
									</View>
									<TouchableOpacity
										onPress={() => setShowLocationModal(false)}
										style={{
											backgroundColor: 'rgba(255,255,255,0.1)',
											borderRadius: 20,
											padding: 6
										}}
									>
										<Ionicons name="close" size={16} color="#ffffff" />
									</TouchableOpacity>
								</View>
								<Text style={{
									fontSize: 14,
									color: 'rgba(255,255,255,0.7)',
									marginTop: 8,
									marginLeft: 52
								}}>
									Select your city for personalized recommendations
								</Text>
							</View>

							{/* Search Bar */}
							<View style={{
								paddingHorizontal: 16,
								paddingVertical: 12,
								backgroundColor: '#2a2d3a',
								borderBottomWidth: 1,
								borderBottomColor: 'rgba(255,255,255,0.1)'
							}}>
								<View style={{
									flexDirection: 'row',
									alignItems: 'center',
									backgroundColor: '#3a3d4a',
									borderRadius: 12,
									paddingHorizontal: 12,
									paddingVertical: 8,
									borderWidth: 1,
									borderColor: 'rgba(255,255,255,0.1)'
								}}>
									<Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" />
									<TextInput
										style={{
											flex: 1,
											marginLeft: 8,
											color: '#ffffff',
											fontSize: 15,
											paddingVertical: 4
										}}
										placeholder="Search district..."
										placeholderTextColor="rgba(255,255,255,0.4)"
										value={searchQuery}
										onChangeText={setSearchQuery}
										autoCapitalize="words"
									/>
									{searchQuery.length > 0 && (
										<TouchableOpacity onPress={() => setSearchQuery('')}>
											<Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
										</TouchableOpacity>
									)}
								</View>
							</View>

							{/* Location Options */}
							<ScrollView style={{
								maxHeight: 300,
								backgroundColor: '#2a2d3a'
							}}>
								<View style={{ paddingVertical: 8 }}>
									{loading && (
										<View style={{ paddingVertical: 20, alignItems: 'center' }}>
											<ActivityIndicator size="small" color="#667eea" />
											<Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
												Loading districts...
											</Text>
										</View>
									)}
									{!loading && filteredLocations.length === 0 && (
										<Text style={{
											textAlign: 'center',
											color: 'rgba(255,255,255,0.7)',
											paddingVertical: 16
										}}>
											{searchQuery ? 'No districts found' : 'No locations available yet.'}
										</Text>
									)}
									{!loading && filteredLocations.map((location, index) => (
										<TouchableOpacity
											key={index}
											style={{
												flexDirection: 'row',
												alignItems: 'center',
												justifyContent: 'space-between',
												paddingVertical: 18,
												paddingHorizontal: 24,
												backgroundColor: selectedLocation === location ? '#667eea' : 'transparent',
												marginHorizontal: 12,
												marginVertical: 2,
												borderRadius: 12
											}}
											onPress={() => handleLocationSelect(location)}
											activeOpacity={0.7}
										>
											<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
												<View style={{
													backgroundColor: selectedLocation === location ? 'rgba(255,255,255,0.2)' : '#3a3d4a',
													borderRadius: 8,
													padding: 8,
													marginRight: 12
												}}>
													<Ionicons
														name="business"
														size={16}
														color={selectedLocation === location ? '#fff' : 'rgba(255,255,255,0.7)'}
													/>
												</View>
												<Text style={{
													fontSize: 16,
													color: selectedLocation === location ? '#fff' : 'rgba(255,255,255,0.9)',
													fontWeight: selectedLocation === location ? '600' : '500'
												}}>
													{location}
												</Text>
											</View>
											{selectedLocation === location && (
												<View style={{
													backgroundColor: 'rgba(255,255,255,0.2)',
													borderRadius: 12,
													padding: 4
												}}>
													<Ionicons name="checkmark" size={16} color="#fff" />
												</View>
											)}
										</TouchableOpacity>
									))}
								</View>
							</ScrollView>

							{/* Modal Footer */}
							<View style={{
								backgroundColor: '#2a2d3a',
								paddingVertical: 16,
								paddingHorizontal: 24,
								borderTopWidth: 1,
								borderTopColor: 'rgba(255,255,255,0.1)'
							}}>
								<TouchableOpacity
									style={{
										backgroundColor: '#3a3d4a',
										borderRadius: 12,
										padding: 14,
										alignItems: 'center',
										borderWidth: 1,
										borderColor: 'rgba(255,255,255,0.1)'
									}}
									onPress={() => setShowLocationModal(false)}
									activeOpacity={0.8}
								>
									<Text style={{
										color: 'rgba(255,255,255,0.9)',
										fontSize: 16,
										fontWeight: '600'
									}}>
										Cancel
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</Modal>
			</LinearGradient>
		</View>
	);
};

export default CropRecommendation;
