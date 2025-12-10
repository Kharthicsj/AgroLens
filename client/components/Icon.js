import React from 'react';
import { View } from 'react-native';
import {
    ArrowLeft,
    ChevronRight,
    ChevronDown,
    X,
    XCircle,
    Camera,
    Search,
    Trash2,
    Check,
    CheckCircle,
    Leaf,
    FlaskConical,
    Wrench,
    Layers,
    MapPin,
    Globe,
    Building,
    Settings,
    Info,
    AlertCircle,
    ArrowUpCircle,
    LogOut,
    Edit,
    Lock,
    Home,
    Droplet,
    Bug,
    User,
    Eye,
    EyeOff
} from 'lucide-react-native';

// Map icon names to Lucide components for consistent API
const iconMap = {
    // Navigation
    'arrow-back': ArrowLeft,
    'chevron-forward': ChevronRight,
    'chevron-down': ChevronDown,
    'close': X,
    'close-circle': XCircle,

    // Actions
    'camera': Camera,
    'camera-outline': Camera,
    'search': Search,
    'trash-outline': Trash2,
    'checkmark': Check,
    'checkmark-circle': CheckCircle,

    // Objects & Nature
    'leaf': Leaf,
    'leaf-outline': Leaf,
    'flask': FlaskConical,
    'flask-outline': FlaskConical,
    'construct-outline': Wrench,
    'layers': Layers,

    // Location & Places
    'location': MapPin,
    'earth': Globe,
    'business': Building,

    // UI Elements
    'settings': Settings,
    'settings-outline': Settings,
    'information-circle': Info,
    'information-circle-outline': Info,
    'alert-circle-outline': AlertCircle,
    'arrow-up-circle': ArrowUpCircle,

    // User & Account
    'log-out': LogOut,
    'log-out-outline': LogOut,
    'create-outline': Edit,
    'lock-closed-outline': Lock,

    // Tab icons
    'home': Home,
    'water': Droplet,
    'bug': Bug,
    'person': User,

    // Password visibility
    'eye': Eye,
    'eye-off': EyeOff,
    'eye-outline': Eye,
    'eye-off-outline': EyeOff
};

const Icon = ({ name, size = 24, color = '#000', style }) => {
    const IconComponent = iconMap[name] || Info;

    return (
        <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
            <IconComponent size={size} color={color} strokeWidth={2} />
        </View>
    );
};

export default Icon;
