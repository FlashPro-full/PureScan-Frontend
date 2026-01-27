import { useState, useEffect } from 'react';
import { Button, Card } from '@tremor/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Scan, 
  BarChart3, 
  Users, 
  Settings,
  CheckCircle,
  ArrowRight,
  Camera,
  Zap
} from 'lucide-react';
import { useSession } from '../../contexts/SessionContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  icon: React.ElementType;
}

interface UserOnboardingProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

const UserOnboarding = ({ onComplete, onSkip }: UserOnboardingProps) => {
  const { role } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to PureScan!',
      description: 'Your comprehensive barcode scanning and inventory management platform',
      icon: CheckCircle,
      content: (
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <Scan className="w-10 h-10 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Started with PureScan</h3>
            <p className="text-gray-600">
              PureScan helps you scan barcodes, analyze products, and manage your inventory with ease. 
              Let's take a quick tour of the key features.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Your Role:</strong> {role === 'admin' ? 'Administrator' : 'User'}
              <br />
              {role === 'admin' 
                ? 'You have full access to all features including team management and billing.'
                : 'You can scan items, view analytics, and manage inventory.'
              }
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'scanner',
      title: 'Barcode Scanner',
      description: 'Scan any barcode and get instant recommendations',
      icon: Scan,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <h4 className="font-medium text-gray-900">Camera Scanner</h4>
              <p className="text-sm text-gray-600">Use your device camera to scan barcodes</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <h4 className="font-medium text-gray-900">External Scanner</h4>
              <p className="text-sm text-gray-600">Connect an external barcode scanner</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Supported Barcodes:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
              <div>• UPC-A & UPC-E</div>
              <div>• EAN-13 & EAN-8</div>
              <div>• Code 128</div>
              <div>• QR Codes</div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Every scan gives you:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ <strong>Keep/Discard Recommendation</strong> - Clear decision for every item</li>
              <li>📊 <strong>Profit Analysis</strong> - Current vs suggested pricing</li>
              <li>📈 <strong>Market Data</strong> - Sales rank and price history</li>
              <li>🔍 <strong>Product Details</strong> - Title, category, and metadata</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Customizable Dashboard',
      description: 'Monitor your key metrics with personalized widgets',
      icon: BarChart3,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">$12.5K</div>
              <div className="text-sm text-blue-700">Revenue</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">241</div>
              <div className="text-sm text-green-700">Orders</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Dashboard Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>📊 <strong>Interactive Charts</strong> - Revenue, inventory, and performance metrics</li>
              <li>⚡ <strong>Real-time Data</strong> - Live updates from your Amazon Selling Partner account</li>
              <li>🎯 <strong>Customizable Widgets</strong> - Add, remove, and resize widgets to your liking</li>
              <li>📅 <strong>Time Filtering</strong> - View data for different time periods</li>
            </ul>
          </div>
          {role === 'admin' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Admin Tip:</strong> Click the pencil icon in the top right to edit your dashboard layout and add custom widgets.
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      description: 'Deep insights into your sales performance and inventory',
      icon: BarChart3,
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Analytics Overview:</h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Sales trends and revenue analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Category performance breakdown</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Inventory health monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Fulfillment method analysis</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Key Benefits:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>📈 <strong>Profit Optimization</strong> - Identify your most profitable products</li>
              <li>📦 <strong>Inventory Insights</strong> - Track stock levels and reorder points</li>
              <li>🎯 <strong>Performance Tracking</strong> - Monitor KPIs and growth metrics</li>
              <li>📊 <strong>Custom Views</strong> - Filter and segment data by various criteria</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'amazon',
      title: 'Amazon Integration',
      description: 'Connect your Amazon Selling Partner account for compliance',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Settings className="w-6 h-6 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800 mb-1">Amazon Account Required</h4>
                <p className="text-sm text-orange-700">
                  To comply with AWS Selling Partner API requirements, you must connect your Amazon account before scanning products.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">What you'll need:</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span><strong>Amazon Seller Account</strong> - Active seller central account</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span><strong>API Permissions</strong> - Authorized access to your selling data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <span><strong>Compliance Verification</strong> - Meets AWS security requirements</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This integration ensures all product data and recommendations 
              comply with Amazon's terms of service and provide accurate market insights.
            </p>
          </div>
        </div>
      )
    }
  ];

  // Add team management step for admins
  if (role === 'admin') {
    steps.splice(4, 0, {
      id: 'team',
      title: 'Team Management',
      description: 'Manage your team members and subscription',
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium text-gray-900">Team Members</h4>
              <p className="text-sm text-gray-600">Invite and manage users</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Settings className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium text-gray-900">Billing</h4>
              <p className="text-sm text-gray-600">Manage subscription</p>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 mb-2">Subscription Pricing:</h4>
            <div className="space-y-1 text-sm text-purple-700">
              <div>• Base plan: 1 admin + 1 user included</div>
              <div>• Additional admins: $20/month each</div>
              <div>• Additional users: $5/month each</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Admin Features:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>👥 <strong>User Management</strong> - Add, remove, and assign roles</li>
              <li>⚙️ <strong>Dashboard Editing</strong> - Customize layouts and widgets</li>
              <li>📊 <strong>Analytics Access</strong> - View team performance metrics</li>
              <li>💳 <strong>Billing Control</strong> - Manage subscription and payments</li>
            </ul>
          </div>
        </div>
      )
    });
  }

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompleted = localStorage.getItem('onboarding-completed') === 'true';
    if (!hasCompleted) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setIsVisible(false);
    onSkip?.();
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentStepData.title}</h2>
                <p className="text-gray-600">{currentStepData.description}</p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="light"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                onClick={handleSkip}
                variant="light"
                className="text-gray-600"
              >
                Skip Tutorial
              </Button>
              <Button
                onClick={handleNext}
                className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep === steps.length - 1 ? <ArrowRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserOnboarding;