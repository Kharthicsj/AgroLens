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
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fertilizerAPI } from '../services/api';

// Fertilizer abbreviation to full name mapping
const fertilizerMapping = {
    'MOP': 'Muriate of Potash (MOP)',
    'DAP': 'Di-Ammonium Phosphate (DAP)',
    'SSP': 'Single Super Phosphate (SSP)',
    'TSP': 'Triple Super Phosphate (TSP)',
    'UREA': 'Urea',
    'CAN': 'Calcium Ammonium Nitrate (CAN)',
    'SOP': 'Sulphate of Potash (SOP)',
    'NPK': 'NPK Complex Fertilizer',
    'ZnSO4': 'Zinc Sulphate (ZnSO4)',
    'FeSO4': 'Ferrous Sulphate (FeSO4)',
    'MgSO4': 'Magnesium Sulphate (MgSO4)',
    'Borax': 'Borax (Boron)',
    'Gypsum': 'Gypsum (Calcium Sulphate)',
    'Lime': 'Agricultural Lime (Calcium Carbonate)',
    'Compost': 'Organic Compost',
    'FYM': 'Farm Yard Manure (FYM)',
    'Vermicompost': 'Vermicompost',
    'Neem Cake': 'Neem Cake',
    'Bone Meal': 'Bone Meal',
    'Rock Phosphate': 'Rock Phosphate'
};

// Stage abbreviation mapping
const stageAbbreviations = {
    'DAP': 'Days After Planting',
    'DAS': 'Days After Sowing',
    'DAT': 'Days After Transplanting',
    'DAE': 'Days After Emergence',
    'WAP': 'Weeks After Planting',
    'MAT': 'Months After Transplanting'
};

// Function to convert stage abbreviations to readable format
const getStageDisplayText = (stageText) => {
    if (!stageText) return '';

    let displayText = stageText;
    Object.keys(stageAbbreviations).forEach(abbr => {
        const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
        displayText = displayText.replace(regex, stageAbbreviations[abbr]);
    });

    return displayText;
};

// Function to convert fertilizer abbreviations to readable format
const getFertilizerDisplayName = (fertilizerName) => {
    if (!fertilizerName || fertilizerName === 'N/A') return 'Not Applicable';

    // Check if it's a direct match
    if (fertilizerMapping[fertilizerName]) {
        return fertilizerMapping[fertilizerName];
    }

    // Check if it contains any known abbreviations
    let displayName = fertilizerName;
    Object.keys(fertilizerMapping).forEach(abbr => {
        const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
        if (regex.test(fertilizerName)) {
            displayName = displayName.replace(regex, fertilizerMapping[abbr]);
        }
    });

    return displayName;
};

const FertilizerRecommendation = ({ onBackPress }) => {
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
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);
    const [cropSearchQuery, setCropSearchQuery] = useState('');

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
            if (soilTypes.includes('Red Sand')) {
                setSelectedSoil('Red Sand');
            } else {
                setSelectedSoil(soilTypes[0]);
            }
        }
        else if (selectedSoil && soilTypes.length && !soilTypes.includes(selectedSoil)) {
            if (soilTypes.includes('Red Sand')) {
                setSelectedSoil('Red Sand');
            } else {
                setSelectedSoil(soilTypes[0]);
            }
        }
        else if (soilTypes.length === 0) {
            setSelectedSoil(null);
        }
    }, [soilTypes]);

    const soilFilteredRecommendations = useMemo(() => {
        return locationRecommendations.filter((item) => {
            if (selectedSoil) {
                return item.Soil_Type === selectedSoil;
            }
            return true;
        });
    }, [locationRecommendations, selectedSoil]);

    const availableCrops = useMemo(() => {
        const unique = new Set();
        soilFilteredRecommendations.forEach((item) => {
            if (item.Crop_Name) unique.add(item.Crop_Name);
        });
        return Array.from(unique).sort();
    }, [soilFilteredRecommendations]);

    const filteredRecommendations = useMemo(() => {
        if (selectedCrop) {
            return soilFilteredRecommendations.filter((item) => item.Crop_Name === selectedCrop);
        }
        return soilFilteredRecommendations;
    }, [soilFilteredRecommendations, selectedCrop]);

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
        setSelectedSoil('Red Sand');
        setSelectedCrop(null);
        setShowLocationModal(false);
        setSearchQuery('');
    };

    const handleCropSelect = (crop) => {
        setSelectedCrop(crop);
        setShowCropModal(false);
        setCropSearchQuery('');
    };

    const filteredCrops = useMemo(() => {
        if (!cropSearchQuery.trim()) {
            return availableCrops;
        }
        const query = cropSearchQuery.toLowerCase();
        return availableCrops.filter(crop => crop.toLowerCase().includes(query));
    }, [availableCrops, cropSearchQuery]);

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
                            <Icon name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={{
                            fontSize: 24,
                            fontWeight: '700',
                            color: colors.text,
                            flex: 1
                        }}>
                            Fertilizer Recommendation
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
                                    <Icon name="location" size={20} color="#667eea" />
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
                            <Icon name="chevron-down" size={20} color={colors.textSecondary} />
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
                                            onPress={() => {
                                                setSelectedSoil(soil);
                                                setSelectedCrop(null);
                                            }}
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

                    {/* Crop Selection Section */}
                    {availableCrops.length > 0 && selectedSoil && (
                        <View style={{ marginBottom: 24 }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: colors.text,
                                marginBottom: 12,
                                marginLeft: 4
                            }}>
                                Select Crop
                            </Text>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderRadius: 16,
                                    padding: 18,
                                    borderWidth: 1,
                                    borderColor: selectedCrop ? '#4caf5060' : colors.textSecondary + '40',
                                    backgroundColor: selectedCrop ? '#4caf5010' : 'transparent'
                                }}
                                onPress={() => setShowCropModal(true)}
                                activeOpacity={0.8}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <View style={{
                                        borderRadius: 10,
                                        padding: 8,
                                        marginRight: 12
                                    }}>
                                        <Icon name="leaf" size={20} color="#4caf50" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            color: colors.text,
                                            fontSize: 16,
                                            fontWeight: '600'
                                        }}>
                                            {selectedCrop || 'Select a crop'}
                                        </Text>
                                    </View>
                                </View>
                                <Icon name="chevron-down" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
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

                    {!loading && !error && selectedLocation && selectedSoil && !selectedCrop && availableCrops.length > 0 && (
                        <View style={{
                            borderRadius: 16,
                            padding: 24,
                            marginBottom: 16,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#4caf5040',
                            backgroundColor: '#4caf5010'
                        }}>
                            <Icon name="information-circle-outline" size={48} color="#4caf50" />
                            <Text style={{
                                fontSize: 18,
                                fontWeight: '600',
                                color: colors.text,
                                marginTop: 16,
                                marginBottom: 8,
                                textAlign: 'center'
                            }}>
                                Select a Crop
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                color: colors.textSecondary,
                                textAlign: 'center',
                                lineHeight: 20
                            }}>
                                Please select a crop from the dropdown above to view its fertilizer schedule for {selectedLocation} - {selectedSoil} soil.
                            </Text>
                        </View>
                    )}

                    {!loading && !error && selectedLocation && selectedSoil && selectedCrop && filteredRecommendations.length === 0 && (
                        <View style={{
                            borderRadius: 16,
                            padding: 24,
                            marginBottom: 16,
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: colors.textSecondary + '40'
                        }}>
                            <Icon name="flask-outline" size={48} color={colors.textSecondary} />
                            <Text style={{
                                fontSize: 18,
                                fontWeight: '600',
                                color: colors.text,
                                marginTop: 16,
                                marginBottom: 8,
                                textAlign: 'center'
                            }}>
                                No fertilizer schedule found
                            </Text>
                            <Text style={{
                                fontSize: 14,
                                color: colors.textSecondary,
                                textAlign: 'center',
                                lineHeight: 20
                            }}>
                                No data available for {selectedCrop} in {selectedLocation} with {selectedSoil} soil.
                            </Text>
                        </View>
                    )}

                    {!loading && !error && selectedCrop && filteredRecommendations.length > 0 && (
                        <>
                            {/* Fertilizer Schedules Section */}
                            <View style={{
                                borderRadius: 20,
                                padding: 20,
                                marginBottom: 40,
                                borderWidth: 1,
                                borderColor: '#3498db40',
                                backgroundColor: '#3498db05'
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    <View style={{
                                        marginRight: 12
                                    }}>
                                        <Icon name="flask" size={24} color="#3498db" />
                                    </View>
                                    <Text style={{
                                        fontSize: 20,
                                        fontWeight: '700',
                                        color: colors.text
                                    }}>
                                        Fertilizer Schedule
                                    </Text>
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 16,
                                    flexWrap: 'wrap'
                                }}>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginRight: 12,
                                        marginBottom: 4
                                    }}>
                                        <Icon name="leaf" size={14} color="#4caf50" style={{ marginRight: 4 }} />
                                        <Text style={{
                                            fontSize: 14,
                                            color: colors.text,
                                            fontWeight: '600'
                                        }}>
                                            {selectedCrop}
                                        </Text>
                                    </View>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginRight: 12,
                                        marginBottom: 4
                                    }}>
                                        <Icon name="location" size={14} color="#667eea" style={{ marginRight: 4 }} />
                                        <Text style={{
                                            fontSize: 14,
                                            color: colors.textSecondary
                                        }}>
                                            {selectedLocation}
                                        </Text>
                                    </View>
                                    <View style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginBottom: 4
                                    }}>
                                        <Icon name="earth" size={14} color="#ff6b35" style={{ marginRight: 4 }} />
                                        <Text style={{
                                            fontSize: 14,
                                            color: colors.textSecondary
                                        }}>
                                            {selectedSoil}
                                        </Text>
                                    </View>
                                </View>
                                {filteredRecommendations.map((item, idx) => (
                                    <View key={idx} style={{
                                        borderRadius: 14,
                                        padding: 18,
                                        marginBottom: idx < filteredRecommendations.length - 1 ? 12 : 0,
                                        backgroundColor: colors.surface,
                                        borderWidth: 1,
                                        borderColor: colors.textSecondary + '25'
                                    }}>
                                        {/* Basal Application */}
                                        <View style={{
                                            marginBottom: 12,
                                            paddingBottom: 12,
                                            borderBottomWidth: 1,
                                            borderBottomColor: colors.textSecondary + '15'
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                                <View style={{
                                                    backgroundColor: '#3498db20',
                                                    borderRadius: 6,
                                                    padding: 4,
                                                    marginRight: 8
                                                }}>
                                                    <Icon name="layers" size={14} color="#3498db" />
                                                </View>
                                                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                                                    Basal Application
                                                </Text>
                                            </View>
                                            <Text style={{ color: colors.text, fontSize: 15, marginLeft: 30, lineHeight: 20 }}>
                                                {getFertilizerDisplayName(item.Basal_Fertilizer)}
                                            </Text>
                                            {item.Basal_Dosage_kg_per_acre && (
                                                <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 30, marginTop: 4 }}>
                                                    Dosage: {item.Basal_Dosage_kg_per_acre} kg/acre
                                                </Text>
                                            )}
                                        </View>

                                        {/* Topdress 1 */}
                                        <View style={{
                                            marginBottom: 12,
                                            paddingBottom: 12,
                                            borderBottomWidth: 1,
                                            borderBottomColor: colors.textSecondary + '15'
                                        }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                                <View style={{
                                                    backgroundColor: '#4caf5020',
                                                    borderRadius: 6,
                                                    padding: 4,
                                                    marginRight: 8
                                                }}>
                                                    <Icon name="arrow-up-circle" size={14} color="#4caf50" />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                                                        Topdress 1 (First Top Application)
                                                    </Text>
                                                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2, fontStyle: 'italic' }}>
                                                        Meaning: First supplementary fertilizer application
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={{ color: colors.text, fontSize: 15, marginLeft: 30, lineHeight: 20, marginTop: 8 }}>
                                                {getFertilizerDisplayName(item.Topdress1_Fertilizer)}
                                            </Text>
                                            {item.Topdress1_Stage && (
                                                <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 30, marginTop: 4 }}>
                                                    Stage: {getStageDisplayText(item.Topdress1_Stage)}
                                                </Text>
                                            )}
                                            {item.Topdress1_Dosage_kg_per_acre && (
                                                <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 30, marginTop: 2 }}>
                                                    Dosage: {item.Topdress1_Dosage_kg_per_acre} kg/acre
                                                </Text>
                                            )}
                                        </View>

                                        {/* Topdress 2 */}
                                        <View style={{ marginBottom: item.Notes ? 12 : 0 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                                                <View style={{
                                                    backgroundColor: '#ff6b3520',
                                                    borderRadius: 6,
                                                    padding: 4,
                                                    marginRight: 8
                                                }}>
                                                    <Icon name="arrow-up-circle" size={14} color="#ff6b35" />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                                                        Topdress 2 (Second Top Application)
                                                    </Text>
                                                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2, fontStyle: 'italic' }}>
                                                        Meaning: Second supplementary fertilizer application
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={{ color: colors.text, fontSize: 15, marginLeft: 30, lineHeight: 20, marginTop: 8 }}>
                                                {getFertilizerDisplayName(item.Topdress2_Fertilizer)}
                                            </Text>
                                            {item.Topdress2_Stage && (
                                                <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 30, marginTop: 4 }}>
                                                    Stage: {getStageDisplayText(item.Topdress2_Stage)}
                                                </Text>
                                            )}
                                            {item.Topdress2_Dosage_kg_per_acre && (
                                                <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 30, marginTop: 2 }}>
                                                    Dosage: {item.Topdress2_Dosage_kg_per_acre} kg/acre
                                                </Text>
                                            )}
                                        </View>

                                        {/* Notes */}
                                        {item.Notes ? (
                                            <View style={{
                                                marginTop: 12,
                                                paddingTop: 12,
                                                borderTopWidth: 1,
                                                borderTopColor: colors.textSecondary + '20',
                                                backgroundColor: '#ffc10720',
                                                padding: 12,
                                                borderRadius: 8
                                            }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                                    <Icon name="information-circle" size={16} color="#ffc107" style={{ marginRight: 6, marginTop: 2 }} />
                                                    <Text style={{ color: colors.text, fontSize: 13, flex: 1, lineHeight: 18 }}>
                                                        {item.Notes}
                                                    </Text>
                                                </View>
                                            </View>
                                        ) : null}
                                    </View>
                                ))}
                            </View>
                        </>
                    )}
                </ScrollView>

                {/* Location Selection Modal */}
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
                                            <Icon name="location" size={20} color="#667eea" />
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
                                        <Icon name="close" size={16} color="#ffffff" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={{
                                    fontSize: 14,
                                    color: 'rgba(255,255,255,0.7)',
                                    marginTop: 8,
                                    marginLeft: 52
                                }}>
                                    Select your district for fertilizer recommendations
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
                                    <Icon name="search" size={18} color="rgba(255,255,255,0.5)" />
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
                                            <Icon name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
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
                                                    <Icon
                                                        name="business"
                                                        size={16}
                                                        color={selectedLocation === location ? '#fff' : 'rgba(255,255,255,0.7)'}
                                                    />
                                                </View>
                                                <Text style={{
                                                    color: selectedLocation === location ? '#fff' : 'rgba(255,255,255,0.9)',
                                                    fontSize: 15,
                                                    fontWeight: selectedLocation === location ? '600' : '400'
                                                }}>
                                                    {location}
                                                </Text>
                                            </View>
                                            {selectedLocation === location && (
                                                <Icon name="checkmark-circle" size={20} color="#fff" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Crop Selection Modal */}
                <Modal
                    visible={showCropModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowCropModal(false)}
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
                                            backgroundColor: "#4caf5020",
                                            borderRadius: 10,
                                            padding: 8,
                                            marginRight: 12
                                        }}>
                                            <Icon name="leaf" size={20} color="#4caf50" />
                                        </View>
                                        <Text style={{
                                            fontSize: 18,
                                            fontWeight: '700',
                                            color: '#ffffff'
                                        }}>
                                            Choose Crop
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setShowCropModal(false)}
                                        style={{
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                            borderRadius: 20,
                                            padding: 6
                                        }}
                                    >
                                        <Icon name="close" size={16} color="#ffffff" />
                                    </TouchableOpacity>
                                </View>
                                <Text style={{
                                    fontSize: 14,
                                    color: 'rgba(255,255,255,0.7)',
                                    marginTop: 8,
                                    marginLeft: 52
                                }}>
                                    Select crop for {selectedSoil} soil
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
                                    <Icon name="search" size={18} color="rgba(255,255,255,0.5)" />
                                    <TextInput
                                        style={{
                                            flex: 1,
                                            marginLeft: 8,
                                            color: '#ffffff',
                                            fontSize: 15,
                                            paddingVertical: 4
                                        }}
                                        placeholder="Search crop..."
                                        placeholderTextColor="rgba(255,255,255,0.4)"
                                        value={cropSearchQuery}
                                        onChangeText={setCropSearchQuery}
                                        autoCapitalize="words"
                                    />
                                    {cropSearchQuery.length > 0 && (
                                        <TouchableOpacity onPress={() => setCropSearchQuery('')}>
                                            <Icon name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Crop Options */}
                            <ScrollView style={{
                                maxHeight: 300,
                                backgroundColor: '#2a2d3a'
                            }}>
                                <View style={{ paddingVertical: 8 }}>
                                    {filteredCrops.length === 0 && (
                                        <Text style={{
                                            textAlign: 'center',
                                            color: 'rgba(255,255,255,0.7)',
                                            paddingVertical: 16
                                        }}>
                                            {cropSearchQuery ? 'No crops found' : 'No crops available.'}
                                        </Text>
                                    )}
                                    {filteredCrops.map((crop, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                paddingVertical: 18,
                                                paddingHorizontal: 24,
                                                backgroundColor: selectedCrop === crop ? '#4caf50' : 'transparent',
                                                marginHorizontal: 12,
                                                marginVertical: 2,
                                                borderRadius: 12
                                            }}
                                            onPress={() => handleCropSelect(crop)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                <View style={{
                                                    backgroundColor: selectedCrop === crop ? 'rgba(255,255,255,0.2)' : '#3a3d4a',
                                                    borderRadius: 8,
                                                    padding: 8,
                                                    marginRight: 12
                                                }}>
                                                    <Icon
                                                        name="leaf"
                                                        size={16}
                                                        color={selectedCrop === crop ? '#fff' : 'rgba(255,255,255,0.7)'}
                                                    />
                                                </View>
                                                <Text style={{
                                                    color: selectedCrop === crop ? '#fff' : 'rgba(255,255,255,0.9)',
                                                    fontSize: 15,
                                                    fontWeight: selectedCrop === crop ? '600' : '400'
                                                }}>
                                                    {crop}
                                                </Text>
                                            </View>
                                            {selectedCrop === crop && (
                                                <Icon name="checkmark-circle" size={20} color="#fff" />
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </LinearGradient>
        </View>
    );
};

export default FertilizerRecommendation;