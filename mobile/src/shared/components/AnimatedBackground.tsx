// src/shared/components/AnimatedBackground.tsx
// Fondo animado con orbes flotantes usado en las pantallas de autenticación.
// Cada orbe anima de forma independiente (posición Y, posición X, escala y
// opacidad) con tiempos y delays distintos para dar sensación de profundidad.

import { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

interface OrbProps {
  size: number;
  color: string;
  top: number;
  left: number;
  delay: number;
  duration: number;
  floatY: number;
  floatX?: number;
}

function Orb({ size, color, top, left, delay, duration, floatY, floatX = 0 }: OrbProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-floatY, { duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(floatY, { duration, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    translateX.value = withDelay(
      delay + 300,
      withRepeat(
        withSequence(
          withTiming(-floatX, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) }),
          withTiming(floatX, { duration: duration * 1.3, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.12, { duration: duration * 0.8, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.9, { duration: duration * 0.8, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration * 0.6 }),
          withTiming(0.5, { duration: duration * 0.6 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          top,
          left,
        },
        animStyle,
      ]}
    />
  );
}

export default function AnimatedBackground() {
  return (
    <View style={{ position: 'absolute', width: W, height: H, overflow: 'hidden' }}>
      {/* Orbe grande superior izquierda */}
      <Orb size={320} color="rgba(26,107,58,0.35)" top={-80} left={-100} delay={0} duration={4000} floatY={25} floatX={12} />
      {/* Orbe mediano superior derecha */}
      <Orb size={220} color="rgba(45,158,87,0.25)" top={60} left={W - 140} delay={800} duration={5200} floatY={30} floatX={15} />
      {/* Orbe pequeño centro */}
      <Orb size={120} color="rgba(6,214,130,0.18)" top={H * 0.3} left={W * 0.4} delay={1200} duration={3800} floatY={20} floatX={20} />
      {/* Orbe grande inferior izquierda */}
      <Orb size={280} color="rgba(15,74,40,0.4)" top={H * 0.55} left={-80} delay={400} duration={6000} floatY={18} floatX={8} />
      {/* Orbe mediano inferior derecha */}
      <Orb size={200} color="rgba(26,107,58,0.28)" top={H * 0.7} left={W - 120} delay={1600} duration={4600} floatY={22} floatX={10} />
      {/* Orbe accent teal */}
      <Orb size={100} color="rgba(6,214,160,0.2)" top={H * 0.15} left={W * 0.3} delay={2000} duration={3400} floatY={15} floatX={18} />
    </View>
  );
}
