import { useState } from 'react';
import { Button, Card } from '@tremor/react';
import { AlertTriangle, ExternalLink, Shield, CheckCircle, X, Loader } from 'lucide-react';

interface AmazonConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (credentials: { sellerId: string; accessToken: string; refreshToken: string }) => void;
}

const AmazonConnectionModal = ({ isOpen, onClose, onConnect }: AmazonConnectionModalProps) => {
  const [step, setStep] = useState<'info' | 'connect' | 'success'>('info');
  const [isConnecting, setIsConnecting] = useState(false);
  const [sellerId, setSellerId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  const handleConnect = async () => {
    if (!sellerId.trim() || !accessToken.trim() || !refreshToken.trim()) {
      return;
    }

    setIsConnecting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onConnect({ sellerId, accessToken, refreshToken });
      setStep('success');
    } catch (error) {
      console.error('Failed to connect Amazon account:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleFinish = () => {
    onClose();
    setStep('info');
    setSellerId('');
    setAccessToken('');
    setRefreshToken('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <div className="p-6">
          {step === 'info' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Connect Amazon Account</h2>
                    <p className="text-gray-600">Required for AWS Selling Partner API compliance</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 hover:shadow-md active:bg-gray-200 active:shadow-sm rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-orange-800 mb-1">Account Connection Required</h3>
                      <p className="text-sm text-orange-700">
                        To comply with Amazon's terms of service and AWS Selling Partner API requirements, 
                        you must connect your Amazon Seller account before using the barcode scanner.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">What you'll need:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Active Amazon Seller Central account</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Selling Partner API access permissions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Developer credentials (Seller ID, Access Token, Refresh Token)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">How to get your credentials:</h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Go to your Amazon Seller Central Developer Console</li>
                    <li>2. Navigate to "Apps & Services" → "Develop Apps"</li>
                    <li>3. Create or select your PureScan application</li>
                    <li>4. Copy your Seller ID, Access Token, and Refresh Token</li>
                  </ol>
                  <a
                    href="https://sellercentral.amazon.com/developer/console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Open Seller Central <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={onClose} variant="light" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => setStep('connect')} 
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 'connect' && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Enter Your Credentials</h2>
                  <p className="text-gray-600">Connect your Amazon Seller account</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 hover:shadow-md active:bg-gray-200 active:shadow-sm rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seller ID
                  </label>
                  <input
                    type="text"
                    value={sellerId}
                    onChange={(e) => setSellerId(e.target.value)}
                    placeholder="A1XXXXXXXXXXX"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Token
                  </label>
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="Atza|IwEBxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refresh Token
                  </label>
                  <input
                    type="password"
                    value={refreshToken}
                    onChange={(e) => setRefreshToken(e.target.value)}
                    placeholder="Atzr|IwEBxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Your credentials are encrypted and stored securely. We never share your Amazon data with third parties.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep('info')} variant="light" className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleConnect} 
                  disabled={!sellerId.trim() || !accessToken.trim() || !refreshToken.trim() || isConnecting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-400"
                >
                  {isConnecting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect Account'
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 'success' && (
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Account Connected!</h2>
                  <p className="text-gray-600">
                    Your Amazon Seller account has been successfully connected. You can now use all scanner features.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-700">
                    <strong>Connected Account:</strong> {sellerId}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  onClick={handleFinish} 
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  Start Scanning
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AmazonConnectionModal;