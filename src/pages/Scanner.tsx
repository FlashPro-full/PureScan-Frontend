import { useState, useEffect } from 'react';
import {
  Camera,
  Scan,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FlashlightOff,
  Volume2,
  VolumeX,
  CameraOff,
  HelpCircle,
  Shield,
} from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { useScannerController } from '../hooks/useScannerController';
import ScanFilters from '../components/scanner/ScanFilters';
import AmazonConnectionModal from '../components/amazon/AmazonConnectionModal';
import type { Recommendation } from '../features/scanner/types';

const getRecommendationColor = (rec: Recommendation | string) => {
  switch (rec) {
    case 'keep':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'discard':
      return 'text-[#ED1C24] bg-red-50 border-red-200';
    default:
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  }
};

const getRecommendationIcon = (rec: Recommendation | string) => {
  switch (rec) {
    case 'keep':
      return <CheckCircle className="w-5 h-5" />;
    case 'discard':
      return <XCircle className="w-5 h-5" />;
    default:
      return <AlertTriangle className="w-5 h-5" />;
  }
};

const Scanner = () => {
  const { role, user } = useSession();
  const {
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
    filteredHistory,
    filter,
    setFilter,
    clearFilter,
    allUsers,
    cameraError,
    handleCameraScan,
    handleManualScan,
  } = useScannerController(user?.email || null);
  const [showExtHelp, setShowExtHelp] = useState(false);
  const [isAmazonConnected, setIsAmazonConnected] = useState(false);
  const [showAmazonModal, setShowAmazonModal] = useState(false);

  useEffect(() => {
    // Check if Amazon account is connected
    const connected = localStorage.getItem('amazon-connected') === 'true';
    setIsAmazonConnected(connected);
    
    // Show modal if not connected and user is admin
    if (!connected && role === 'admin') {
      setShowAmazonModal(true);
    }
  }, [role]);

  const handleAmazonConnect = (credentials: { sellerId: string; accessToken: string; refreshToken: string }) => {
    setIsAmazonConnected(true);
    setShowAmazonModal(false);
    console.log('Amazon account connected:', credentials.sellerId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Scan className="w-6 h-6 text-red-600" />
                <h1 className="text-xl font-bold text-gray-900">Barcode Scanner</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 hover:shadow-md active:bg-gray-200 active:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50">
                <FlashlightOff className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSound(!sound)}
                className={`p-2 rounded-lg hover:bg-gray-100 hover:shadow-md active:bg-gray-200 active:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ${sound ? 'text-red-600' : 'text-gray-400'}`}
              >
                {sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Amazon Connection Requirement - Admin Only */}
      {role === 'admin' && (
        <AmazonConnectionModal
          isOpen={showAmazonModal}
          onClose={() => setShowAmazonModal(false)}
          onConnect={handleAmazonConnect}
        />
      )}

      {/* Amazon Connection Warning - Admin Only */}
      {!isAmazonConnected && role === 'admin' && (
        <div className="bg-orange-50 border-b border-orange-200 px-6 py-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm text-orange-800">
                <strong>Amazon Account Required:</strong> Connect your Amazon Selling Partner account to comply with AWS API requirements.
              </p>
            </div>
            <button
              onClick={() => setShowAmazonModal(true)}
              className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 hover:shadow-lg active:bg-orange-800 active:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            >
              Connect Account
            </button>
          </div>
        </div>
      )}

      {/* Amazon Connection Info for Users */}
      {!isAmazonConnected && role !== 'admin' && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                <strong>Amazon Account Connection:</strong> Your admin needs to connect the Amazon Selling Partner account to enable scanning.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col h-[calc(100vh-81px)]">
        {/* Main Scanning Area - Top */}
        <div className="flex-1 p-6">
          <div className="h-full flex space-x-6">
            {/* Scanning Interface */}
            <div className="flex-1 space-y-6">
              {/* Scan Mode Toggle */}
              <div className="bg-white rounded-2xl shadow border border-gray-200 p-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setScanMode('camera')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${
                      scanMode === 'camera'
                        ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md active:bg-gray-300 active:shadow-sm'
                    }`}
                  >
                    <Camera className="w-5 h-5 mx-auto mb-1" />
                    Camera Scanner
                  </button>
                  <button
                    onClick={() => setScanMode('manual')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 ${
                      scanMode === 'manual'
                        ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md active:bg-gray-300 active:shadow-sm'
                    }`}
                  >
                    <Zap className="w-5 h-5 mx-auto mb-1" />
                    External Scanner
                  </button>
                </div>
              </div>

              {/* Camera Scanner */}
              {scanMode === 'camera' && (
                <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 flex-1 flex flex-col">
                  <div className="text-center flex-1 flex flex-col">
                    {/* Video Container with fixed aspect ratio for mobile */}
                    <div className="relative bg-black rounded-lg mb-4 overflow-hidden w-full aspect-video sm:aspect-auto sm:flex-1 sm:min-h-[400px] max-h-[60vh] sm:max-h-none">
                      <video 
                        ref={videoRef} 
                        className="w-full h-full object-cover" 
                        muted 
                        playsInline 
                        style={{ minHeight: '200px' }}
                      />
                      {cameraError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 text-white p-4">
                          <div className="text-center">
                            <CameraOff className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium">Camera Error</p>
                            <p className="text-sm opacity-75">{cameraError}</p>
                          </div>
                        </div>
                      )}
                      {!isScanning && !cameraError && (
                        <div className="absolute inset-0 flex items-center justify-center text-white bg-gray-800/50">
                          <div className="text-center">
                            <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-200" />
                            <p className="text-lg font-medium">Camera Ready</p>
                            <p className="text-sm opacity-75">Tap scan to start</p>
                          </div>
                        </div>
                      )}
                      {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-3/4 h-1/2 border-4 border-dashed border-red-500 rounded-lg" />
                          <div className="absolute top-0 bottom-0 w-full h-1 bg-red-500 animate-[scan-beam_2s_infinite]" />
                          <style>{`
                            @keyframes scan-beam {
                              0% { transform: translateY(0); }
                              100% { transform: translateY(100vh); }
                            }
                          `}</style>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleCameraScan}
                      disabled={!!cameraError || !isAmazonConnected}
                      className="bg-red-500 hover:bg-red-600 hover:shadow-lg active:bg-red-700 active:shadow-md disabled:bg-gray-400 disabled:hover:shadow-none text-white px-6 py-3 sm:px-8 rounded-lg font-medium transition-all duration-150 flex items-center space-x-2 mx-auto text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    >
                      <Scan className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{isScanning ? 'Stop Scan' : 'Start Scan'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Manual Scanner */}
              {scanMode === 'manual' && (
                <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 relative flex-1">
                  <button
                    onClick={() => setShowExtHelp((v) => !v)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-50 hover:bg-gray-100 hover:shadow-md active:bg-gray-200 active:shadow-sm border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    title="External scanner tips"
                  >
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                  </button>
                  {showExtHelp && (
                    <div className="absolute top-14 right-4 w-64 rounded-lg border border-blue-200 bg-white shadow-lg p-3 text-left z-10">
                      <p className="text-sm font-semibold text-blue-800 mb-1">External Scanner Tips</p>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                        <li>Click input then scan the barcode</li>
                        <li>Ensure your scanner sends Enter/Return</li>
                        <li>Use the input to trigger scans manually</li>
                        <li>Toggle sound as needed</li>
                      </ul>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <Zap className="w-16 h-16 mx-auto mb-4 text-red-500" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Scan Any Barcode</h3>
                    <p className="text-gray-600">UPC, EAN, Code 128, QR Code, and more</p>
                  </div>

                  <div className="space-y-4">
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Barcode Number</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={manualBarcode}
                          onChange={(event) => setManualBarcode(event.target.value)}
                          onKeyDown={(event) => event.key === 'Enter' && handleManualScan()}
                          placeholder="Scan or enter barcode..."
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                          autoFocus
                        />
                        <button
                          onClick={handleManualScan}
                          disabled={!manualBarcode.trim() || !isAmazonConnected}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium"
                        >
                          Scan Item
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Current Scan Result - Side Panel */}
            {scannedItem && (
              <div className="w-80 bg-white rounded-2xl shadow border border-gray-200 p-6">
                <div className="animate-[fade-in_0.5s]">
                  <style>{`
                    @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                  `}</style>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Scan Result</h3>
                  <div className="space-y-4">
                    {scannedItem.image && (
                      <img
                        src={scannedItem.image as string}
                        alt={scannedItem.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-32 object-cover rounded bg-gray-100"
                      />
                    )}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{scannedItem.title}</h4>
                      {(scannedItem.author || scannedItem.publisher) && (
                        <p className="text-sm text-gray-600">{scannedItem.author || scannedItem.publisher}</p>
                      )}
                      {scannedItem.category && (
                        <p className="text-sm text-gray-500">{scannedItem.category}</p>
                      )}
                    </div>
                    
                    <div className={`px-4 py-3 rounded-lg border flex items-center justify-center space-x-2 ${getRecommendationColor(scannedItem.recommendation)}`}>
                      {getRecommendationIcon(scannedItem.recommendation)}
                      <span className="font-bold text-lg capitalize">{scannedItem.recommendation}</span>
                    </div>

                    {typeof scannedItem.currentPrice === 'number' && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Price:</span>
                          <span className="font-semibold">${scannedItem.currentPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Suggested Price:</span>
                          <span className="font-semibold">${scannedItem.suggestedPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Profit:</span>
                          <span className={`font-semibold ${scannedItem.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${scannedItem.profit.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section - Filters and Recent Scans */}
        <div className="bg-white border-t border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scan Filters */}
            <div className="lg:col-span-1">
              <ScanFilters
                filter={filter}
                onFilterChange={setFilter}
                onClearFilters={clearFilter}
                totalScans={scanHistory.length}
                filteredScans={filteredHistory.length}
                allUsers={allUsers}
                currentUser={user?.email || undefined}
              />
            </div>

            {/* Scan History */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Recent Scans</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 hover:bg-white rounded-lg transition-colors">
                        {item.image ? (
                          <img
                            src={item.image as string}
                            alt={(item.title as string) || 'Item'}
                            referrerPolicy="no-referrer"
                            className="w-8 h-10 object-cover rounded bg-gray-100"
                          />
                        ) : (
                          <div className="w-8 h-10 rounded bg-gray-100" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.title as string}</p>
                          <p className="text-xs text-gray-500">{item.timestamp?.toLocaleTimeString?.() || ''}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getRecommendationColor(item.recommendation)}`}>
                          {item.recommendation}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      {scanHistory.length === 0 ? 'No scans yet' : 'No scans match your filters'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Session Stats - Admin Only */}
          {role === 'admin' && (
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Today's Session</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{scanHistory.length}</div>
                  <div className="text-sm text-gray-600">Total Scans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {scanHistory.filter((item) => item.recommendation === 'keep').length}
                  </div>
                  <div className="text-sm text-gray-600">Items to Keep</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {scanHistory.filter((item) => item.recommendation === 'discard').length}
                  </div>
                  <div className="text-sm text-gray-600">Items to Discard</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${scanHistory.reduce((sum, item) => sum + (item.profit || 0), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total Profit</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scanner;