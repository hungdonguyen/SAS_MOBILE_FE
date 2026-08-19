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
 * VisionCamera v4 + react-native-vision-camera-face-detector v1 + react-native-worklets-core
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
import { useRunOnJS } from 'react-native-worklets-core';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import AppIcon from './Icon/AppIcon';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FaceStatus = 'none' | 'too_close' | 'too_far' | 'off_center' | 'good';

export interface FaceCaptureData {
  base64: string;
  uri: string;
}

export interface FaceCameraHandle {
  /** Manually trigger a capture — for fallback use only */
  triggerCapture: () => void;
  /** Reset the camera state to allow taking another photo */
  reset: () => void;
}

interface FaceCameraProps {
  /** Called with { base64, uri } when face is auto-captured */
  onCapture: (data: FaceCaptureData) => void;
  /** Block auto-capture while parent is uploading / processing */
  isProcessing?: boolean;
  /** Seconds to wait after face detected before auto-capture */
  countdownSeconds?: number;
  /** 'front' (selfie) or 'back' — default 'front' */
  facing?: 'front' | 'back';
}

const DEFAULT_COUNTDOWN = 3;
const FRAME_WIDTH = '100%';
const FRAME_ASPECT_RATIO = 3 / 4;

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
    const requestedDevice = useCameraDevice(facing);
    const fallbackBack = useCameraDevice('back');
    const fallbackFront = useCameraDevice('front');
    // Mặc định ưu tiên requestedDevice, nếu không có thì lấy camera bất kỳ (back hoặc front)
    const device = requestedDevice || fallbackFront || fallbackBack;
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
    }, [pulseScale]);

    const ovalAnimStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }],
    }));

    // ── Permissions ────────────────────────────────────────────────────────────
    useEffect(() => {
      if (hasPermission) {
        setPermissionGranted(true);
        return;
      }
      (async () => {
        const ok = await requestPermission();
        setPermissionGranted(ok);
      })();
    }, [hasPermission, requestPermission]);

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

        let photoPath = '';
        try {
          // 1. Prefer takeSnapshot for fast, optimal resolution capture (typically 300KB-800KB)
          // to dramatically speed up network upload and AI processing
          const snapshot = await cameraRef.current.takeSnapshot({ quality: 90 });
          photoPath = snapshot.path;
        } catch {
          // 2. Fallback to takePhoto if takeSnapshot is unavailable
          const photo = await cameraRef.current.takePhoto({
            enableShutterSound: false,
          });
          photoPath = photo.path;
        }

        const fileUri = Platform.OS === 'android' ? `file://${photoPath}` : photoPath;
        let base64 = '';

        try {
          const res = await fetch(fileUri);
          const blob = await res.blob();
          const rawBase64 = await blobToBase64(blob);
          base64 = rawBase64 || '';
        } catch (readErr) {
          console.log('[FaceCamera] read blob warning:', readErr);
        }

        onCapture({
          base64,
          uri: fileUri,
        });
      } catch (err) {
        console.log('[FaceCamera] capture error:', (err as any).message);
        capturedRef.current = false;
        setCaptured(false);
        setFaceStatus('none');
        Alert.alert('Capture Error', 'Could not capture photo. Please try again.');
      }
    }, [isProcessing, onCapture]);

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
    }, [countdownSeconds, stopCountdown, doCapture]);

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    useEffect(() => () => {
      stopCountdown();
    }, [stopCountdown]);

    // ── Expose manual trigger via ref ─────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      triggerCapture: () => doCapture(),
      reset: () => {
        capturedRef.current = false;
        setCaptured(false);
        setFaceStatus('none');
        stopCountdown();
      }
    }));

    // ── JS callbacks called from frame processor ──────────────────────────────
    const notifyFaceGood = useRunOnJS(() => {
      setFaceStatus('good');
      startCountdown();
    }, [startCountdown]);

    const notifyFaceLost = useRunOnJS((status: FaceStatus) => {
      setFaceStatus(status);
      stopCountdown();
    }, [stopCountdown]);

    // ── Frame processor (runs on camera thread via worklet) ───────────────────
    const frameProcessor = useFrameProcessor(
      (frame) => {
        'worklet';
        if (capturedRef.current || isProcessing) return;

        const faces = detectFaces(frame);

        if (!faces || faces.length === 0) {
          notifyFaceLost('none');
          return;
        }

        const face = faces[0];
        const fw = frame.width;
        const fh = frame.height;

        // Position check: Face should be in central region of frame
        const faceCenterX = face.bounds.x + face.bounds.width / 2;
        const faceCenterY = face.bounds.y + face.bounds.height / 2;
        const frameCenterX = fw / 2;
        const frameCenterY = fh / 2;

        const horizontalTolerance = fw * 0.35;
        const verticalTolerance = fh * 0.35;

        const horizontalOk = Math.abs(faceCenterX - frameCenterX) <= horizontalTolerance;
        const verticalOk = Math.abs(faceCenterY - frameCenterY) <= verticalTolerance;

        if (!horizontalOk || !verticalOk) {
          notifyFaceLost('off_center');
          return;
        }

        // Size check: Face size relative to smaller dimension
        const faceSize = Math.max(face.bounds.width, face.bounds.height);
        const minFaceSize = Math.min(fw, fh) * 0.18;
        const maxFaceSize = Math.min(fw, fh) * 0.75;

        if (faceSize < minFaceSize) {
          notifyFaceLost('too_far');
          return;
        }
        if (faceSize > maxFaceSize) {
          notifyFaceLost('too_close');
          return;
        }

        // Face Angle / Pose check: Looking reasonably straight (<= 25 degrees)
        const maxAngle = 25;
        if (
          (face.pitchAngle !== undefined && Math.abs(face.pitchAngle) > maxAngle) ||
          (face.rollAngle !== undefined && Math.abs(face.rollAngle) > maxAngle) ||
          (face.yawAngle !== undefined && Math.abs(face.yawAngle) > maxAngle)
        ) {
          notifyFaceLost('off_center');
          return;
        }

        notifyFaceGood();
      },
      [detectFaces, isProcessing, notifyFaceGood, notifyFaceLost],
    );

    // ── Derived display values ────────────────────────────────────────────────
    const getBorderColor = () => {
      if (captured || isProcessing) return BORDER.good;
      switch (faceStatus) {
        case 'good':
          return countdown !== null && countdown <= 1 ? BORDER.good : BORDER.detected;
        case 'too_close':
        case 'too_far':
        case 'off_center':
          return BORDER.lost;
        default:
          return BORDER.scanning;
      }
    };

    const getWarning = (): string | null => {
      switch (faceStatus) {
        case 'none':
          return 'No face detected';
        case 'too_close':
          return 'Too close — move further back';
        case 'too_far':
          return 'Too far — move closer';
        case 'off_center':
          return 'Center your face and look straight';
        default:
          return null;
      }
    };

    const getStatusText = () => {
      if (isProcessing) return 'Processing AI...';
      if (captured) return '✓ Photo Captured!';
      switch (faceStatus) {
        case 'good':
          return countdown !== null ? `Hold steady... ${countdown}s` : 'Face OK!';
        case 'too_close':
          return 'Move further back';
        case 'too_far':
          return 'Move closer';
        case 'off_center':
          return 'Center face & look straight';
        default:
          return 'Position face inside the frame';
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
          <Text style={styles.errorTitle}>Camera Permission Required</Text>
          <Text style={styles.errorSub}>
            Go to Settings → Apps → SAS Mobile → Permissions → Camera to enable.
          </Text>
        </View>
      );
    }

    if (!device) {
      return (
        <View style={styles.centeredState}>
          <AppIcon name="camera-outline" size={44} color="#94A3B8" />
          <Text style={styles.errorTitle}>No Camera Found</Text>
          <Text style={{textAlign: 'center', marginTop: 10, color: '#64748B'}}>
            Please check your camera connection (DroidCam) or Emulator settings.
          </Text>
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
              {isProcessing ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <AppIcon name="checkmark-circle-outline" size={52} color="#10B981" />
              )}
              <Text style={styles.overlayText}>
                {isProcessing ? 'Analyzing AI...' : 'Captured ✓'}
              </Text>
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
            <Text style={styles.tipsTitle}>Tips</Text>
          </View>
          {[
            'Ensure good lighting without harsh shadows',
            'Look straight, do not tilt head or wear hats',
            'Auto-capture enabled — no button press needed',
          ].map((tip, i) => (
            <Text key={i} style={styles.tipText}>
              • {tip}
            </Text>
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
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    minHeight: 20,
  },
  ovalFrame: {
    width: FRAME_WIDTH as any,
    aspectRatio: FRAME_ASPECT_RATIO,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
    backgroundColor: '#0F172A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  warningBanner: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    zIndex: 10,
    backgroundColor: 'rgba(239,68,68,0.92)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  warningText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  countdownRow: { height: 60, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  countdownBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  countdownBadgeNum: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  aiBadgeText: { fontSize: 11, fontWeight: '600', color: '#7C3AED' },
  tipsBox: {
    width: '100%',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
  },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  tipsTitle: { fontSize: 13, fontWeight: '700', color: '#B45309' },
  tipText: { fontSize: 12, color: '#92400E', lineHeight: 20 },
  centeredState: {
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  errorTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  errorSub: { fontSize: 12, color: '#64748B', textAlign: 'center', lineHeight: 18 },
});

export default FaceCamera;
