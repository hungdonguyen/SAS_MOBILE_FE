import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  type?: 'ionicons' | 'feather' | 'material';
  style?: StyleProp<ViewStyle>;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class IconErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('Vector icon render failed, using visual fallback symbol:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const IconContent: React.FC<AppIconProps> = ({
  name,
  size = 20,
  color = '#333',
  type = 'ionicons',
  style,
}) => {
  let iconComponent = <Ionicons name={name} size={size} color={color} />;

  if (type === 'feather') {
    iconComponent = <Feather name={name} size={size} color={color} />;
  } else if (type === 'material') {
    iconComponent = <MaterialCommunityIcons name={name} size={size} color={color} />;
  }

  if (style) {
    return <View style={style}>{iconComponent}</View>;
  }

  return iconComponent;
};

const AppIcon: React.FC<AppIconProps> = (props) => {
  const { name, size = 20, color = '#333', style } = props;

  const fallbackSymbols: Record<string, string> = {
    'school-outline': '🎓',
    'people-outline': '👥',
    'checkmark-circle-outline': '✓',
    'time-outline': '🕒',
    'search-outline': '🔍',
    'location-outline': '📍',
    'calendar-outline': '📅',
    'chevron-forward-outline': '›',
    'funnel-outline': '⚡',
    'notifications-outline': '🔔',
    'log-out-outline': '↳',
    'download-outline': '⤓',
    'moon-outline': '🌙',
    'trending-up': '↗',
    'close-circle': '✕',
  };

  const symbol = fallbackSymbols[name] || '•';

  const fallbackView = (
    <View style={[styles.fallback, { width: size, height: size }, style]}>
      <Text style={{ fontSize: size * 0.75, color, lineHeight: size }}>{symbol}</Text>
    </View>
  );

  return (
    <IconErrorBoundary fallback={fallbackView}>
      <IconContent {...props} />
    </IconErrorBoundary>
  );
};

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppIcon;
