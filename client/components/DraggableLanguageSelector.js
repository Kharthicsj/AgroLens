import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, PanResponder, Animated, Dimensions } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import Icon from './Icon';
import LanguageSelectionModal from './LanguageSelectionModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DraggableLanguageSelector = () => {
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const { getCurrentLanguageInfo } = useLanguage();

    // Initial position - top right corner
    const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - 180, y: 60 })).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: pan.x._value,
                    y: pan.y._value
                });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (e, gesture) => {
                pan.flattenOffset();

                // Get final position
                let finalX = pan.x._value;
                let finalY = pan.y._value;

                // Boundary constraints
                const minX = 20;
                const maxX = SCREEN_WIDTH - 160;
                const minY = 60;
                const maxY = SCREEN_HEIGHT - 120;

                // Apply boundaries
                if (finalX < minX) finalX = minX;
                if (finalX > maxX) finalX = maxX;
                if (finalY < minY) finalY = minY;
                if (finalY > maxY) finalY = maxY;

                // Animate to constrained position
                Animated.spring(pan, {
                    toValue: { x: finalX, y: finalY },
                    useNativeDriver: false,
                    friction: 7
                }).start();

                // If it was a tap (no significant movement), open modal
                if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
                    setShowLanguageModal(true);
                }
            },
        })
    ).current;

    return (
        <>
            <Animated.View
                style={{
                    position: 'absolute',
                    zIndex: 999,
                    transform: [{ translateX: pan.x }, { translateY: pan.y }]
                }}
                {...panResponder.panHandlers}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: 'rgba(102, 126, 234, 0.25)',
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 25,
                        borderWidth: 1.5,
                        borderColor: 'rgba(102, 126, 234, 0.4)',
                        shadowColor: '#667eea',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                >
                    <Icon name="globe" size={18} color="#fff" />
                    <Text
                        style={{
                            color: '#fff',
                            fontSize: 13,
                            marginLeft: 8,
                            fontWeight: '600',
                            maxWidth: 100,
                        }}
                        numberOfLines={1}
                    >
                        {getCurrentLanguageInfo().nativeName}
                    </Text>
                    <View
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.5)',
                            marginLeft: 8,
                        }}
                    />
                </View>
            </Animated.View>

            <LanguageSelectionModal
                visible={showLanguageModal}
                onClose={() => setShowLanguageModal(false)}
            />
        </>
    );
};

export default DraggableLanguageSelector;
