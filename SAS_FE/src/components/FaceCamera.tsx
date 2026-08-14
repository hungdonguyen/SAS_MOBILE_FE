/**
 * FaceCamera — In-app live camera component with ML Kit face detection.
 *
 * Clones the web FaceVerifyStep behavior:
 *   - Live camera preview inside the app (no native camera app)
 *   - Real-time ML Kit face detection via VisionCamera frame processor
 *   - Auto-countdown (3s) when face is properly centered in the oval
 *   - Auto-capture when countdown reaches 0 — NO manual button
 *   - Color-coded oval border feedback (amber=scanning, blue=detected, green=good, red=lost)
 *   - Warning banners for face position errors (too close / too far / off-center)
 *
 * VisionCamera v4 + react-native-vision-camera-face-detector v1
 */
import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import AppIcon from './Icon/AppIcon';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FaceStatus = 'none' | 'too_close' | 'too_far' | 'off_center' | 'good';

export interface FaceCameraHandle {
  /** Manually trigger a capture — for fallback use only */
  triggerCapture: () => void;
}

interface FaceCameraProps {
  /** Called with base64 JPEG when face is auto-captured */
  onCapture: (base64: string) => void;
  /** Block auto-capture while parent is uploading / processing */
  isProcessing?: boolean;
  /** Seconds to wait after face detected before auto-capture */
  countdownSeconds?: number;
  /** 'front' (selfie) or 'back' — default 'front' */
  facing?: 'front' | 'back';
}

// ─── Constants ───────────────────────────────────────────────────────────────
const DEFAULT_COUNTDOWN = 3;
const OVAL_WIDTH = 260;
const OVAL_HEIGHT = 320;

// ─── Border colors ────────────────────────────────────────────────────────────
const BORDER = {
  scanning: '#F59E0B',
  detected: '#3B82F6',
  good: '#10B981',
  lost: '#EF4444',
  idle: 'rgba(255,255,255,0.25)',
};

// ─── Component ────────────────────────────────────────────────────────────────
const FaceCamera = forwardRef<FaceCameraHandle, FaceCameraProps>(
  (
    {
      onCapture,
      isProcessing = false,
      countdownSeconds = DEFAULT_COUNTDOWN,
      facing = 'front',
    },
    ref,
  ) => {
    const cameraRef = useRef<InstanceType<typeof Camera>>(null);
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice(facing);
    const { detectFaces } = useFaceDetector({ performanceMode: 'fast' });

    // ── State ─────────────────────────────────────────────────────────────────
    const [permissionGranted, setPermissionGranted] = useState(hasPermission);
    const [faceStatus, setFaceStatus] = useState<FaceStatus>('none');
    const [countdown, setCountdown] = useState<number | null>(null);
    const [captured, setCaptured] = useState(false);

    // refs for worklet-safe access
    const capturedRef = useRef(false);
    const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownValueRef = useRef(countdownSeconds);

    // ── Animation: pulsing oval ───────────────────────────────────────────────
    const pulseScale = useSharedValue(1);
    useEffect(() => {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.035, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }, []);
    const ovalAnimStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }],
    }));

    // ── Permissions ────────────────────────────────────────────────────────────
    useEffect(() => {
      if (hasPermission) { setPermissionGranted(true); return; }
      (async () => {
        if (Platform.OS === 'android') {
          const r = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Quyền Camera',
              message: 'SAS Mobile cần Camera để nhận diện khuôn mặt.',
              buttonPositive: 'Cho phép',
              buttonNegative: 'Từ chối',
            },
          );
          setPermissionGranted(r === PermissionsAndroid.RESULTS.GRANTED);
        } else {
          const ok = await requestPermission();
          setPermissionGranted(ok);
        }
      })();
    }, [hasPermission, requestPermission]);

    // ── Expose manual trigger via ref ─────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      triggerCapture: () => doCapture(),
    }));

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    useEffect(() => () => { stopCountdown(); }, []);

    // ── Countdown control ─────────────────────────────────────────────────────
    const startCountdown = useCallback(() => {
      if (countdownTimerRef.current !== null) return; // already running
      countdownValueRef.current = countdownSeconds;
      setCountdown(countdownSeconds);

      countdownTimerRef.current = setInterval(() => {
        countdownValueRef.current -= 1;
        setCountdown(countdownValueRef.current);
        if (countdownValueRef.current <= 0) {
          stopCountdown();
          doCapture();
        }
      }, 1000);
    }, [countdownSeconds]);

    const stopCountdown = useCallback(() => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setCountdown(null);
      countdownValueRef.current = countdownSeconds;
    }, [countdownSeconds]);

    // ── Capture frame → base64 → call onCapture ───────────────────────────────
    const doCapture = useCallback(async () => {
      if (capturedRef.current || isProcessing) return;
      capturedRef.current = true;
      setCaptured(true);

      try {
        if (!cameraRef.current) throw new Error('Camera not ready');
        const photo = await cameraRef.current.takeSnapshot({ quality: 85 });

        // Convert file path to base64 using fetch + FileReader
        const path = Platform.OS === 'android' ? `file://${photo.path}` : photo.path;
        const res = await fetch(path);
        const blob = await res.blob();
        const base64 = await blobToBase64(blob);
        if (base64) {
          onCapture(base64);
        } else {
          throw new Error('Failed to read image');
        }
      } catch (err: any) {
        console.log('[FaceCamera] capture error:', err.message);
        capturedRef.current = false;
        setCaptured(false);
        setFaceStatus('none');
        Alert.alert('Lỗi chụp ảnh', 'Không thể chụp ảnh. Thử lại.');
      }
    }, [isProcessing, onCapture]);

    // ── JS callbacks called from frame processor ──────────────────────────────
    const onFaceGood = useCallback(() => {
      setFaceStatus('good');
      startCountdown();
    }, [startCountdown]);

    const onFaceLost = useCallback((status: FaceStatus) => {
      setFaceStatus(status);
      stopCountdown();
    }, [stopCountdown]);

    // ── Frame processor (runs on camera thread via Reanimated worklet) ─────────
    const frameProcessor = useFrameProcessor(
      (frame) => {
        'worklet';
        if (capturedRef.current || isProcessing) return;

        const faces = detectFaces(frame);

        if (faces.length === 0) {
          runOnJS(onFaceLost)('none');
          return;
        }

        const face = faces[0];
        const fw = frame.width;
        const fh = frame.height;

        const faceW = face.bounds.width / fw;
        const faceH = face.bounds.height / fh;
        const cx = (face.bounds.x + face.bounds.width / 2) / fw;
        const cy = (face.bounds.y + face.bounds.height / 2) / fh;

        if (faceW > 0.78 || faceH > 0.82) {
          runOnJS(onFaceLost)('too_close');
          return;
        }
        if (faceW < 0.16 || faceH < 0.18) {
          runOnJS(onFaceLost)('too_far');
          return;
        }
        if (Math.abs(cx - 0.5) > 0.22 || Math.abs(cy - 0.5) > 0.22) {
          runOnJS(onFaceLost)('off_center');
          return;
        }

        runOnJS(onFaceGood)();
      },
      [detectFaces, isProcessing, onFaceGood, onFaceLost],
    );

    // ── Derived display values ────────────────────────────────────────────────
    const getBorderColor = () => {
      if (captured || isProcessing) return BORDER.good;
      switch (faceStatus) {
        case 'good': return countdown !== null && countdown <= 1 ? BORDER.good : BORDER.detected;
        case 'too_close':
        case 'too_far':
        case 'off_center': return BORDER.lost;
        default: return BORDER.scanning;
      }
    };

    const getWarning = (): string | null => {
      switch (faceStatus) {
        case 'none': return 'Không tìm thấy khuôn mặt';
        case 'too_close': return 'Quá gần — lùi ra xa hơn';
        case 'too_far': return 'Quá xa — lại gần hơn';
        case 'off_center': return 'Căn khuôn mặt vào giữa oval';
        default: return null;
      }
    };

    const getStatusText = () => {
      if (isProcessing) return 'Đang xử lý AI...';
      if (captured) return '✓ Đã chụp ảnh!';
      switch (faceStatus) {
        case 'good': return countdown !== null ? `Giữ nguyên... ${countdown}s` : 'Khuôn mặt OK!';
        case 'too_close': return 'Lùi ra xa hơn';
        case 'too_far': return 'Lại gần hơn';
        case 'off_center': return 'Căn giữa khuôn mặt';
        default: return 'Đặt khuôn mặt vào khung oval';
      }
    };

    const getStatusColor = () => {
      if (captured || faceStatus === 'good') return '#10B981';
      if (faceStatus === 'none') return '#94A3B8';
      return '#EF4444';
    };

    // ── Error states ──────────────────────────────────────────────────────────
    if (!permissionGranted) {
      return (
        <View style={styles.centeredState}>
          <AppIcon name="camera-outline" size={44} color="#94A3B8" />
          <Text style={styles.errorTitle}>Chưa có quyền Camera</Text>
          <Text style={styles.errorSub}>
            Vào Settings → Apps → SAS Mobile → Permissions → Camera để bật.
          </Text>
        </View>
      );
    }

    if (!device) {
      return (
        <View style={styles.centeredState}>
          <AppIcon name="camera-outline" size={44} color="#94A3B8" />
          <Text style={styles.errorTitle}>Không tìm thấy camera {facing}</Text>
        </View>
      );
    }

    // ── Main render ───────────────────────────────────────────────────────────
    const borderColor = getBorderColor();
    const warning = getWarning();

    return (
      <View style={styles.wrapper}>
        {/* Status line above oval */}
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>

        {/* Oval camera frame */}
        <Animated.View
          style={[
            styles.ovalFrame,
            ovalAnimStyle,
            { borderColor, shadowColor: borderColor },
          ]}
        >
          {/* Live camera feed */}
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={!captured && !isProcessing}
            frameProcessor={frameProcessor}
            photo={true}
            enableZoomGesture={false}
          />

          {/* Warning banner — face position errors */}
          {!captured && !isProcessing && warning && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>⚠️ {warning}</Text>
            </View>
          )}

          {/* Processing overlay */}
          {(isProcessing || captured) && (
            <View style={styles.overlay}>
              {isProcessing
                ? <ActivityIndicator size="large" color="#FFFFFF" />
                : <AppIcon name="checkmark-circle-outline" size={52} color="#10B981" />
              }
              <Text style={styles.overlayText}>
                {isProcessing ? 'Đang phân tích AI...' : 'Đã chụp ✓'}
              </Text>
            </View>
          )}

          {/* Countdown circle inside oval */}
          {countdown !== null && countdown > 0 && !captured && !isProcessing && (
            <View style={styles.countdownBubbleInOval}>
              <Text style={styles.countdownBubbleText}>{countdown}</Text>
            </View>
          )}
        </Animated.View>

        {/* Countdown badge below oval */}
        <View style={styles.countdownRow}>
          {countdown !== null && countdown > 0 && !captured && (
            <View style={[styles.countdownBadge, { backgroundColor: borderColor }]}>
              <Text style={styles.countdownBadgeNum}>{countdown}</Text>
            </View>
          )}
        </View>

        {/* AI engine label */}
        <View style={styles.aiBadge}>
          <AppIcon name="hardware-chip-outline" size={11} color="#7C3AED" />
          <Text style={styles.aiBadgeText}>ML Kit Face Detection • Auto-Capture</Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsBox}>
          <View style={styles.tipsHeader}>
            <AppIcon name="bulb-outline" size={14} color="#D97706" />
            <Text style={styles.tipsTitle}>Lưu ý</Text>
          </View>
          {[
            'Đảm bảo ánh sáng tốt, không bóng đổ',
            'Nhìn thẳng, không nghiêng mặt hay đội mũ',
            'Ứng dụng tự động chụp — không cần bấm nút',
          ].map((tip, i) => (
            <Text key={i} style={styles.tipText}>• {tip}</Text>
          ))}
        </View>
      </View>
    );
  },
);

// ─── Helper ───────────────────────────────────────────────────────────────────
function blobToBase64(blob: Blob): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const r = reader.result as string;
        resolve(r.split(',')[1] ?? null);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    } catch {
      resolve(null);
    }
  });
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', width: '100%' },
  statusText: {
    fontSize: 14, fontWeight: '700', textAlign: 'center',
    marginBottom: 12, minHeight: 20,
  },
  ovalFrame: {
    width: OVAL_WIDTH,
    height: OVAL_HEIGHT,
    borderRadius: OVAL_WIDTH / 2,
    overflow: 'hidden',
    borderWidth: 3,
    backgroundColor: '#0F172A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  warningBanner: {
    position: 'absolute', top: 14, left: 14, right: 14, zIndex: 10,
    backgroundColor: 'rgba(239,68,68,0.92)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center',
  },
  warningText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center',
    justifyContent: 'center', zIndex: 20,
  },
  overlayText: {
    color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginTop: 12,
  },
  countdownBubbleInOval: {
    position: 'absolute', bottom: 20, alignSelf: 'center',
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(59,130,246,0.88)', alignItems: 'center',
    justifyContent: 'center', zIndex: 15,
  },
  countdownBubbleText: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  countdownRow: { height: 60, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  countdownBadge: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
  countdownBadgeNum: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  aiBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#EDE9FE',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 14,
  },
  aiBadgeText: { fontSize: 11, fontWeight: '600', color: '#7C3AED' },
  tipsBox: {
    width: '100%', backgroundColor: '#FFFBEB', borderWidth: 1,
    borderColor: '#FDE68A', borderRadius: 14, padding: 14,
  },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  tipsTitle: { fontSize: 13, fontWeight: '700', color: '#B45309' },
  tipText: { fontSize: 12, color: '#92400E', lineHeight: 20 },
  centeredState: {
    height: OVAL_HEIGHT + 80, alignItems: 'center',
    justifyContent: 'center', padding: 24, gap: 10,
  },
  errorTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  errorSub: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18 },
});

export default FaceCamera;
