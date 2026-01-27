
import {
  BarChart3,
  Scan,
  Package,
  Camera,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiJson } from '../api/client';

type Recommendation = 'keep' | 'discard' | 'warn';
type Rating = 'FBA' | 'FBM' | 'FBC' | 'Trash';
type InventoryItem = { id: string; rating: Rating; timestamp: string };
type RecentScan = {
  id: string;
  title: string;
  barcode: string;
  category: string;
  scanTime: string;
  currentPrice: string;
  recommendation: Recommendation;
  marketplace: string;
};

type ApiInventoryItem = {
  id?: string | number;
  rating?: Rating;
  timestamp?: string;
  title?: string;
  barcode?: string | number;
  category?: string;
  scannedPrice?: number | string;
};

const Dashboard = () => {
  // Recent scans (UI list)
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);

  const removeRecent = (id: string) => {
    setRecentScans((prev) => prev.filter((s) => s.id !== id));
  };

  const [items, setItems] = useState<InventoryItem[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiJson<{ items: ApiInventoryItem[] }>('/inventory');
        const list: ApiInventoryItem[] = Array.isArray(data?.items) ? data.items : [];
        setItems(
          list.map((i) => ({
            id: String(i.id),
            rating: (i.rating as Rating) ?? 'FBA',
            timestamp: String(i.timestamp || new Date().toISOString()),
          })),
        );
        setRecentScans(
          list
            .slice(0, 3)
            .map((item) => {
              const price = Number(item.scannedPrice ?? 0);
              const recommendation: Recommendation = item.rating === 'Trash' ? 'discard' : 'keep';
              return {
                id: String(item.id),
                title: item.title || 'Unknown Item',
                barcode: item.barcode ? String(item.barcode) : '—',
                category: item.category || 'Unknown',
                scanTime: new Date(item.timestamp || Date.now()).toLocaleTimeString(),
                currentPrice: `$${price.toFixed(2)}`,
                recommendation,
                marketplace: 'Amazon',
              };
            }),
        );
      } catch (err) {
        console.warn('[dashboard] failed to load inventory summary', err);
        setItems([]);
      }
    };

    void load();
  }, []);

  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayScans = useMemo(
    () => items.filter((i) => i.timestamp.slice(0, 10) === todayKey).length,
    [items, todayKey]
  );
  const totalScanned = items.length;
  const keepCount = items.filter((i) => i.rating !== 'Trash').length;
  const keepRate = totalScanned ? Math.round((keepCount / totalScanned) * 100) : 0;

  const stats = [
    { label: "Today's Scans", value: todayScans, icon: Scan, change: '' },
    { label: "Keep Ratio", value: `${keepCount} / ${totalScanned} (${keepRate}%)`, icon: BarChart3, change: '' },
    { label: "Items to Keep", value: keepCount, icon: Package, change: '' },
  ];

  const getRecommendationIcon = (recom: Recommendation) => {
    switch(recom) {
      case 'keep': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'discard': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getRecommendationBadge = (recom: Recommendation) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch(recom) {
      case 'keep': return `${baseClasses} bg-green-100 text-green-800`;
      case 'discard': return `${baseClasses} bg-red-100 text-red-800`;
      default: return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-100 rounded-2xl shadow border border-gray-300 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    <p className="text-sm text-red-600 mt-1">{stat.change}</p>
                  </div>
                  <div className="p-3 rounded-full bg-red-50">
                    <stat.icon className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Scans */}
            <div className="lg:col-span-2 bg-gray-100 rounded-2xl shadow border border-gray-300">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Scans</h2>
                  <Link to="/inventory" className="text-red-600 hover:opacity-90 text-sm font-medium">
                    View All
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {recentScans.map((scan) => (
                  <div key={scan.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{scan.title}</h3>
                          <span className={getRecommendationBadge(scan.recommendation)}>
                            {scan.recommendation}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{scan.category}</span>
                          <span>•</span>
                          <span>{scan.scanTime}</span>
                          <span>•</span>
                          <span>{scan.barcode}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-gray-900">
                          <span className="text-sm">Current: <strong>{scan.currentPrice}</strong></span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRecommendationIcon(scan.recommendation)}
                        <button
                          className="p-2 text-gray-400 hover:text-[#ED1C24]"
                          onClick={() => removeRecent(scan.id)}
                          title="Remove"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Marketplace Status */}
            <div className="space-y-6">
              {/* Quick Actions */}
                  <div className="bg-gray-100 rounded-2xl shadow border border-gray-300 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                  <Link to="/scanner" className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                    <Camera className="w-4 h-4" />
                    <span>Start Scanning</span>
                  </Link>
                  <Link to="/analytics" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                    <span>View Analytics</span>
                  </Link>
                </div>
              </div>

              {/* Marketplace Status */}
              <div className="bg-gray-100 rounded-2xl shadow border border-gray-300 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketplace Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-bold text-sm">A</span>
                      </div>
                      <span className="font-medium text-gray-900">Amazon</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Connected</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Status */}
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-gray-900">Pro Subscription</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Active until March 15, 2025</p>
                <Link to="/settings?tab=subscription" className="w-full inline-flex items-center justify-center bg-white text-red-600 border border-red-200 py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                  Manage Subscription
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
