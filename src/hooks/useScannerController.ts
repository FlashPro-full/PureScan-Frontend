import { useCallback, useRef, useState } from 'react';
import { mockScanResults } from '../features/scanner/mockResults';
import type { HistoryItem, ScanResult, ScanFilter } from '../features/scanner/types';
import { apiJson } from '../api/client';

type ExtendedWindow = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
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

  const processingRef = useRef(false);

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
      //
    }
  }, [sound]);

  const appendHistory = useCallback((barcode: string, result: ScanResult) => {
    const newItem = {
      barcode,
      ...result,
      userId: userEmail || undefined,
      timestamp: new Date(),
    };
    setScanHistory((prev) => [newItem, ...prev.slice(0, 9)]);
  }, [userEmail]);

  const submitScan = useCallback(
    async (barcode: string): Promise<ScanResult | null> => {
      try {
        const response = await apiJson<{
          product: any;
          pricing: any;
          recommendation: any;
        }>('/scan', {
          method: 'POST',
          body: JSON.stringify({ barcode, submittedBy: userEmail || undefined }),
        });

        const result: ScanResult = {
          title: response.product?.title || 'Unknown Item',
          category: response.product?.category || 'Unknown',
          itemType: (response.product?.itemType || 'other').toLowerCase(),
          image: response.product?.images?.[0] || '',
          currentPrice: response.pricing?.buyBoxPrice ?? 0,
          suggestedPrice: response.pricing?.buyBoxPrice ?? 0,
          recommendation: (response.recommendation?.decision ?? 'discard').toLowerCase(),
          profit: response.recommendation?.profit ?? 0,
          margin: response.recommendation?.margin ?? '0%',
          author: response.product?.author,
          publisher: response.product?.publisher,
        };
        setScannedItem(result);
        appendHistory(barcode, result);
        playChime();
        return result;
      } catch (error) {
        const status = (error as Error & { status?: number }).status;
        if (status === 404) {
          setScannedItem(null);
          return null;
        }
        console.warn('[scanner] scan failed', error);
        const fallback = mockScanResults[barcode] || DEFAULT_RESULT;
        const result = { ...fallback, userId: userEmail || undefined } as ScanResult;
        setScannedItem(result);
        appendHistory(barcode, result);
        playChime();
        return result;
      }
    },
    [userEmail, appendHistory, playChime],
  );

  const filteredHistory = useCallback(() => {
    return scanHistory.filter((item) => {
      if (filter.userId && item.userId !== filter.userId) return false;
      if (filter.itemType && filter.itemType !== 'all' && item.itemType !== filter.itemType) return false;
      if (filter.recommendation && filter.recommendation !== 'all' && item.recommendation !== filter.recommendation)
        return false;
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

  const allUsers = useCallback(() => {
    return scanHistory
      .map((item) => item.userId)
      .filter((userId, index, arr) => userId && arr.indexOf(userId) === index)
      .filter(Boolean) as string[];
  }, [scanHistory]);

  const processScan = useCallback(
    async (barcode: string) => {
      if (processingRef.current) return;
      processingRef.current = true;
      setIsScanning(false);
      try {
        await submitScan(barcode);
      } finally {
        processingRef.current = false;
      }
    },
    [submitScan],
  );

  const handleBarcodeDetected = useCallback(
    (barcode: string) => {
      const code = (typeof barcode === 'string' ? barcode : '').trim();
      if (!code) return;
      void processScan(code);
    },
    [processScan],
  );

  const handleCameraError = useCallback((err: unknown) => {
    const msg = err instanceof Error ? err.message : 'Camera access failed.';
    setCameraError(msg);
    setIsScanning(false);
  }, []);

  const clearCameraError = useCallback(() => {
    setCameraError(null);
  }, []);

  const handleCameraScan = useCallback(() => {
    if (isScanning) {
      setIsScanning(false);
      return;
    }
    setCameraError(null);
    setIsScanning(true);
    setScannedItem(null);
  }, [isScanning]);

  const handleManualScan = useCallback(async () => {
    const code = manualBarcode.trim();
    if (!code) return;
    await submitScan(code);
    setManualBarcode('');
  }, [manualBarcode, submitScan]);

  return {
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
    handleCameraError,
    handleBarcodeDetected,
    handleManualScan,
    clearCameraError,
  } as const;
}
