import { useCallback, useEffect, useRef, useState } from 'react';
import { mockScanResults } from '../features/scanner/mockResults';
import type { HistoryItem, ScanResult, ScanFilter } from '../features/scanner/types';
import { apiFetch, apiJson } from '../api/client';

type BarcodeDetectorInstance = {
  detect: (video: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};

type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorInstance;

type ExtendedWindow = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
  BarcodeDetector?: BarcodeDetectorConstructor;
};

type ScanMode = 'camera' | 'manual';

const DEFAULT_RESULT: ScanResult = {
  title: 'Unknown Item',
  category: 'Unknown',
  itemType: 'other',
  image: '',
  currentPrice: 0,
  suggestedPrice: 0,
  recommendation: 'discard',
  profit: 0,
  margin: '0%',
};

export function useScannerController(userEmail?: string | null) {
  const [scanMode, setScanMode] = useState<ScanMode>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [sound, setSound] = useState(true);
  const [manualBarcode, setManualBarcode] = useState('');
  const [scannedItem, setScannedItem] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<HistoryItem[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ScanFilter>({
    itemType: 'all',
    recommendation: 'all',
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const playChime = useCallback(() => {
    if (!sound) return;
    try {
      const { AudioContext, webkitAudioContext } = window as ExtendedWindow;
      const AudioCtor = AudioContext ?? webkitAudioContext;
      if (!AudioCtor) return;
      const audioContext = new AudioCtor();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch {
      // Best effort only
    }
  }, [sound]);

  const recordScan = useCallback(
    async (barcode: string, result: ScanResult) => {
      try {
        await apiFetch('/api/scans', {
          method: 'POST',
          body: JSON.stringify({
            type: (result.category || '').toLowerCase().includes('book')
              ? 'book'
              : (result.category || '').toLowerCase().includes('video')
              ? 'game'
              : 'movie',
            title: result.title,
            barcode,
            metadata: {
              category: result.category,
              profit: result.profit,
              recommendation: result.recommendation,
              submittedBy: userEmail || undefined,
            },
          }),
        });
      } catch (error) {
        console.warn('[scanner] failed to record scan', error);
      }
    },
    [userEmail],
  );

  const appendHistory = useCallback((barcode: string, result: ScanResult) => {
    const newItem = { 
      barcode, 
      ...result, 
      userId: userEmail || undefined,
      timestamp: new Date() 
    };
    setScanHistory((prev) => [newItem, ...prev.slice(0, 9)]);
  }, [userEmail]);

  const resolveResult = useCallback(async (barcode: string) => {
    try {
      const response = await apiJson<{
        product: any;
        pricing: any;
        recommendation: any;
      }>('/api/products/lookup', {
        method: 'POST',
        body: JSON.stringify({ barcode }),
      });

      return {
        title: response.product.title || 'Unknown Item',
        category: response.product.category || 'Unknown',
        itemType: (response.product.itemType || 'other').toLowerCase(),
        image: response.product.images?.[0] || '',
        currentPrice: response.pricing.buyBoxPrice || 0,
        suggestedPrice: response.pricing.buyBoxPrice || 0,
        recommendation: response.recommendation.decision.toLowerCase() || 'discard',
        profit: response.recommendation.profit || 0,
        margin: response.recommendation.margin || '0%',
        author: response.product.author,
        publisher: response.product.publisher,
        userId: userEmail || undefined,
      };
    } catch (error) {
      console.warn('[scanner] product lookup failed, using default', error);
      const result = mockScanResults[barcode] || DEFAULT_RESULT;
      return { ...result, userId: userEmail || undefined };
    }
  }, [userEmail]);

  // Filter scan history based on current filter
  const filteredHistory = useCallback(() => {
    return scanHistory.filter((item) => {
      if (filter.userId && item.userId !== filter.userId) return false;
      if (filter.itemType && filter.itemType !== 'all' && item.itemType !== filter.itemType) return false;
      if (filter.recommendation && filter.recommendation !== 'all' && item.recommendation !== filter.recommendation) return false;
      if (filter.startDate && item.timestamp < filter.startDate) return false;
      if (filter.endDate && item.timestamp > filter.endDate) return false;
      return true;
    });
  }, [scanHistory, filter]);

  const clearFilter = useCallback(() => {
    setFilter({
      itemType: 'all',
      recommendation: 'all',
    });
  }, []);

  // Get unique users from scan history
  const allUsers = useCallback(() => {
    const users = scanHistory
      .map(item => item.userId)
      .filter((userId, index, arr) => userId && arr.indexOf(userId) === index)
      .filter(Boolean) as string[];
    return users;
  }, [scanHistory]);

  const processScan = useCallback(async (barcode: string) => {
    setIsScanning(false);
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    const result = await resolveResult(barcode);
    setScannedItem(result);
    appendHistory(barcode, result);
    void recordScan(barcode, result);
    playChime();
  }, [appendHistory, playChime, recordScan, resolveResult]);

  const detectBarcode = useCallback(async () => {
    if (!videoRef.current) return;
    const { BarcodeDetector: BarcodeDetectorCtor } = window as ExtendedWindow;
    if (!BarcodeDetectorCtor) {
      setCameraError('Barcode scanning is not supported by this browser.');
      setIsScanning(false);
      return;
    }
    if (videoRef.current.readyState < 2) {
      scanLoopRef.current = requestAnimationFrame(detectBarcode);
      return;
    }

    const detector = new BarcodeDetectorCtor({ formats: ['ean_13', 'upc_a', 'upc_e', 'code_128', 'qr_code'] });
    try {
      const barcodes = await detector.detect(videoRef.current);
      if (barcodes.length > 0) {
        await processScan(barcodes[0].rawValue);
      } else {
        scanLoopRef.current = requestAnimationFrame(detectBarcode);
      }
    } catch (error) {
      console.error('Barcode detection failed:', error);
      scanLoopRef.current = requestAnimationFrame(detectBarcode);
    }
  }, [processScan]);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera access is not supported in this browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      streamRef.current = stream;
    } catch (error) {
      console.error('Camera access denied:', error);
      setCameraError('Camera access was denied. Please enable it in your browser settings.');
    }
  }, [stopCamera]);

  useEffect(() => {
    if (scanMode === 'camera') {
      void startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [scanMode, startCamera, stopCamera]);

  const handleCameraScan = useCallback(() => {
    if (isScanning) {
      setIsScanning(false);
      if (scanLoopRef.current) {
        cancelAnimationFrame(scanLoopRef.current);
        scanLoopRef.current = null;
      }
      return;
    }
    setIsScanning(true);
    setScannedItem(null);
    scanLoopRef.current = requestAnimationFrame(detectBarcode);
  }, [detectBarcode, isScanning]);

  const handleManualScan = useCallback(async () => {
    const code = manualBarcode.trim();
    if (!code) return;
    const result = await resolveResult(code);
    setScannedItem(result);
    appendHistory(code, result);
    void recordScan(code, result);
    playChime();
    setManualBarcode('');
  }, [appendHistory, manualBarcode, playChime, recordScan, resolveResult]);

  return {
    videoRef,
    scanMode,
    setScanMode,
    isScanning,
    sound,
    setSound,
    manualBarcode,
    setManualBarcode,
    scannedItem,
    scanHistory,
    filteredHistory: filteredHistory(),
    filter,
    setFilter,
    clearFilter,
    allUsers: allUsers(),
    cameraError,
    isAnalyzing: false,
    handleCameraScan,
    handleManualScan,
  } as const;
}
