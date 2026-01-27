import { useState, useEffect, useMemo } from 'react';
import DashboardWidget, { type WidgetData } from '../components/dashboard/DashboardWidget';
import DashboardCustomizer from '../components/dashboard/DashboardCustomizer';
import { Card } from '@tremor/react';
import { useSession } from '../contexts/SessionContext';
import { Edit2, Plus } from 'lucide-react';

type Category = 'Books' | 'Videos' | 'Games' | 'Music';

const DASHBOARD_CONFIG_VERSION = '2.0';

// Sample data for sourcing analytics - in real app, this would come from scanning database
const generateSourcingData = (categories: Category[] = [], days: number = 7) => {
  // Generate data for the requested number of days
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseScanData = [
    { scans: 87, keeps: 23, profit: 1245, Books: 12, Videos: 5, Games: 4, Music: 2 },
    { scans: 102, keeps: 31, profit: 1876, Books: 18, Videos: 7, Games: 4, Music: 2 },
    { scans: 95, keeps: 28, profit: 1632, Books: 15, Videos: 6, Games: 5, Music: 2 },
    { scans: 118, keeps: 35, profit: 2104, Books: 20, Videos: 8, Games: 5, Music: 2 },
    { scans: 156, keeps: 42, profit: 2687, Books: 25, Videos: 9, Games: 6, Music: 2 },
    { scans: 203, keeps: 67, profit: 3542, Books: 35, Videos: 15, Games: 12, Music: 5 },
    { scans: 178, keeps: 51, profit: 3021, Books: 28, Videos: 12, Games: 8, Music: 3 },
  ];

  // Generate scan performance for requested days
  const scanPerformance = [];
  for (let i = 0; i < days; i++) {
    const baseData = baseScanData[i % baseScanData.length];
    const dayName = days <= 7 ? dayNames[i] : `Day ${i + 1}`;
    
    // Filter by categories if specified
    if (categories.length > 0 && categories.length < 4) {
      const categoryKeeps = categories.reduce((sum, cat) => sum + baseData[cat], 0);
      const keepRate = baseData.keeps / baseData.scans; // Original keep rate
      const categoryScans = Math.round(categoryKeeps / keepRate); // Derive scans from keeps
      const profitPerKeep = baseData.profit / baseData.keeps; // Original profit per keep
      const categoryProfit = Math.round(categoryKeeps * profitPerKeep); // Derive profit from keeps
      
      scanPerformance.push({
        name: dayName,
        scans: categoryScans,
        keeps: categoryKeeps,
        profit: categoryProfit,
        ...categories.reduce((acc, cat) => ({ ...acc, [cat]: baseData[cat] }), {})
      });
    } else {
      scanPerformance.push({
        name: dayName,
        ...baseData
      });
    }
  }

  // Calculate filtered decision outcomes
  const fullDecisionData = [
    { name: 'FBA', value: 42, profit: 1876, Books: 25, Videos: 8, Games: 7, Music: 2 },
    { name: 'MF', value: 28, profit: 1234, Books: 15, Videos: 6, Games: 5, Music: 2 },
    { name: 'SBYB', value: 15, profit: 542, Books: 8, Videos: 3, Games: 3, Music: 1 },
    { name: 'Reject', value: 315, profit: 0, Books: 180, Videos: 85, Games: 35, Music: 15 },
  ];

  const decisionOutcomes = fullDecisionData.map(decision => {
    if (categories.length > 0 && categories.length < 4) {
      const categoryValue = categories.reduce((sum, cat) => sum + decision[cat], 0);
      const categoryProfit = decision.name === 'Reject' ? 0 : Math.round(categoryValue * (decision.profit / decision.value));
      
      return {
        name: decision.name,
        value: categoryValue,
        profit: categoryProfit,
        ...categories.reduce((acc, cat) => ({ ...acc, [cat]: decision[cat] }), {})
      };
    }
    return decision;
  });

  // Category performance (filter if categories selected)
  const allCategories = [
    { name: 'Books', value: 228, avgProfit: 18.50, category: 'Books' },
    { name: 'Videos', value: 102, avgProfit: 24.75, category: 'Videos' },
    { name: 'Games', value: 50, avgProfit: 31.20, category: 'Games' },
    { name: 'Music', value: 25, avgProfit: 22.80, category: 'Music' },
  ];

  const categoryPerformance = categories.length > 0 && categories.length < 4
    ? allCategories.filter(item => categories.includes(item.category as Category))
    : allCategories;

  // Top keeps (filter if categories selected)
  const allTopKeeps = [
    { name: 'Advanced Calculus Textbook', profit: 45.20, outcome: 'FBA', category: 'Books' },
    { name: 'Rare Gaming Console', profit: 78.50, outcome: 'FBA', category: 'Games' },
    { name: 'Classic Movie Collection', profit: 32.75, outcome: 'MF', category: 'Videos' },
    { name: 'Programming Manual 2023', profit: 28.90, outcome: 'FBA', category: 'Books' },
    { name: 'Vintage Music Album', profit: 19.60, outcome: 'SBYB', category: 'Music' },
  ];

  const topKeeps = categories.length > 0 && categories.length < 4
    ? allTopKeeps.filter(item => categories.includes(item.category as Category))
    : allTopKeeps;

  return {
    scanPerformance,
    decisionOutcomes,
    categoryPerformance,
    topKeeps,
  };
};

const getDefaultWidgets = (sourcingData: any): WidgetData[] => [
  {
    id: 'profit-trends',
    title: 'Daily Profit Trends',
    type: 'area',
    data: sourcingData.scanPerformance,
    config: {
      index: 'name',
      categories: ['profit'],
      colors: ['red'],
      showLegend: false,
      valueFormatter: (value: number) => `$${value.toFixed(0)}`,
    },
    size: 'large',
    position: { x: 0, y: 0 },
  },
  {
    id: 'total-profit-metric',
    title: 'Total Profit This Period',
    type: 'metric',
    data: [{ name: 'Profit', value: sourcingData.scanPerformance.reduce((sum: number, day: any) => sum + day.profit, 0) }],
    config: {
      valueFormatter: (value: number) => `$${value.toLocaleString()}`,
    },
    size: 'small',
    position: { x: 2, y: 0 },
  },
  {
    id: 'hit-rate-metric',
    title: 'Keep Rate',
    type: 'metric',
    data: [{ 
      name: 'Rate', 
      value: sourcingData.scanPerformance.length > 0 ? 
        (sourcingData.scanPerformance.reduce((sum: number, day: any) => sum + day.keeps, 0) / 
         sourcingData.scanPerformance.reduce((sum: number, day: any) => sum + day.scans, 0)) * 100 : 0
    }],
    config: {
      valueFormatter: (value: number) => `${value.toFixed(1)}%`,
    },
    size: 'small',
    position: { x: 3, y: 0 },
  },
  {
    id: 'decision-outcomes',
    title: 'Decision Outcomes',
    type: 'donut',
    data: sourcingData.decisionOutcomes,
    config: {
      colors: ['red', 'orange', 'yellow', 'gray'],
      showLegend: true,
    },
    size: 'medium',
    position: { x: 0, y: 2 },
  },
  {
    id: 'category-performance',
    title: 'Category Performance',
    type: 'category',
    data: sourcingData.categoryPerformance,
    config: {
      colors: ['red', 'orange', 'amber', 'yellow'],
    },
    size: 'medium',
    position: { x: 2, y: 2 },
  },
  {
    id: 'top-keeps',
    title: 'Highest Profit Items',
    type: 'bar',
    data: sourcingData.topKeeps,
    config: {
      index: 'name',
      categories: ['profit'],
      colors: ['red'],
      showLegend: false,
      valueFormatter: (value: number) => `$${value.toFixed(2)}`,
    },
    size: 'large',
    position: { x: 0, y: 3 },
  },
];

const defaultWidgets = getDefaultWidgets(generateSourcingData([], 7));

const CustomizableDashboard = () => {
  const { role } = useSession();
  const [widgets, setWidgets] = useState<WidgetData[]>(defaultWidgets);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPeriod] = useState('7');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  // Load saved dashboard configuration with version migration
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        // Check if config has version and is current
        if (config.version === DASHBOARD_CONFIG_VERSION && config.widgets) {
          setWidgets(config.widgets);
        } else {
          // Reset to new default widgets for outdated configs
          console.log('Migrating dashboard config to version', DASHBOARD_CONFIG_VERSION);
          setWidgets(defaultWidgets);
        }
      } catch (error) {
        console.error('Failed to load dashboard config:', error);
        setWidgets(defaultWidgets);
      }
    }
  }, []);

  // Save dashboard configuration with version
  const saveDashboard = () => {
    const config = {
      version: DASHBOARD_CONFIG_VERSION,
      widgets: widgets,
    };
    localStorage.setItem('dashboard-config', JSON.stringify(config));
    setIsEditing(false);
  };

  // Handle category filter toggle
  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Generate filtered data based on selected period and categories (memoized to prevent render loops)
  const sourcingData = useMemo(() => 
    generateSourcingData(selectedCategories, parseInt(selectedPeriod)),
    [selectedCategories, selectedPeriod]
  );

  // Update widget data when filters change (preserve customizations)
  useEffect(() => {
    if (!isEditing) {
      setWidgets(prevWidgets => 
        prevWidgets.map(widget => {
          // Update widget data based on its type
          switch (widget.id) {
            case 'profit-trends':
              return { ...widget, data: sourcingData.scanPerformance };
            case 'total-profit-metric':
              return { 
                ...widget, 
                data: [{ 
                  name: 'Profit', 
                  value: sourcingData.scanPerformance.reduce((sum, day) => sum + day.profit, 0) 
                }] 
              };
            case 'hit-rate-metric':
              const totalScans = sourcingData.scanPerformance.reduce((sum, day) => sum + day.scans, 0);
              const totalKeeps = sourcingData.scanPerformance.reduce((sum, day) => sum + day.keeps, 0);
              return { 
                ...widget, 
                data: [{ 
                  name: 'Rate', 
                  value: totalScans > 0 ? (totalKeeps / totalScans) * 100 : 0 
                }] 
              };
            case 'decision-outcomes':
              return { ...widget, data: sourcingData.decisionOutcomes };
            case 'category-performance':
              return { ...widget, data: sourcingData.categoryPerformance };
            case 'top-keeps':
              return { ...widget, data: sourcingData.topKeeps };
            default:
              return widget;
          }
        })
      );
    }
  }, [selectedPeriod, selectedCategories, isEditing]);

  const handleAddWidget = (widget: WidgetData) => {
    setWidgets(prev => [...prev, widget]);
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };


  const handleResizeWidget = (id: string, size: 'small' | 'medium' | 'large') => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, size } : w));
  };

  const getWidgetDataForSource = (dataSource: string, sourcingData: any) => {
    switch (dataSource) {
      case 'scanPerformance':
        return {
          data: sourcingData.scanPerformance,
          config: { index: 'name', categories: ['scans', 'keeps'], colors: ['blue', 'red'] }
        };
      case 'decisionOutcomes':
        return {
          data: sourcingData.decisionOutcomes,
          config: { index: 'name', categories: ['value'], colors: ['green', 'blue', 'yellow', 'red'] }
        };
      case 'categoryPerformance':
        return {
          data: sourcingData.categoryPerformance,
          config: { index: 'name', categories: ['value'], colors: ['purple'] }
        };
      case 'topKeeps':
        return {
          data: sourcingData.topKeeps,
          config: { index: 'name', categories: ['profit'], colors: ['red'], valueFormatter: (v: number) => `$${v.toFixed(2)}` }
        };
      case 'totalProfit':
        const totalProfit = sourcingData.scanPerformance.reduce((sum: number, day: any) => sum + day.profit, 0);
        return {
          data: [{ name: 'Total Profit', value: totalProfit }],
          config: { index: 'name', categories: ['value'], colors: ['green'], valueFormatter: (v: number) => `$${v.toFixed(0)}` }
        };
      case 'hitRate':
        const totalScans = sourcingData.scanPerformance.reduce((sum: number, day: any) => sum + day.scans, 0);
        const totalKeeps = sourcingData.scanPerformance.reduce((sum: number, day: any) => sum + day.keeps, 0);
        const hitRate = totalScans > 0 ? (totalKeeps / totalScans) * 100 : 0;
        return {
          data: [{ name: 'Hit Rate', value: hitRate }],
          config: { index: 'name', categories: ['value'], colors: ['blue'], valueFormatter: (v: number) => `${v.toFixed(1)}%` }
        };
      default:
        return { data: [], config: { index: 'name', categories: ['value'], colors: ['blue'] } };
    }
  };

  const handleUpdateWidget = (id: string, updates: Partial<WidgetData>) => {
    setWidgets(prev => prev.map(w => {
      if (w.id === id) {
        const updatedWidget = { ...w, ...updates };
        
        // If dataSource changed, update data and config accordingly
        if (updates.dataSource && updates.dataSource !== w.dataSource) {
          const { data, config } = getWidgetDataForSource(updates.dataSource, sourcingData);
          updatedWidget.data = data;
          updatedWidget.config = { ...updatedWidget.config, ...config };
        }
        
        return updatedWidget;
      }
      return w;
    }));
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      saveDashboard();
    } else {
      setIsEditing(true);
    }
  };

  const [showAddWidget, setShowAddWidget] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sourcing Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your sourcing performance and profit analytics</p>
          </div>
          {role === 'admin' && (
            <div className="flex items-center gap-3">
              {isEditing && (
                <button
                  onClick={() => setShowAddWidget(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:shadow-lg active:bg-blue-700 active:shadow-md transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  title="Add new widget"
                >
                  <Plus className="w-4 h-4" />
                  Add Widget
                </button>
              )}
              <button
                onClick={handleToggleEdit}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  isEditing 
                    ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-lg active:bg-green-700 active:shadow-md focus:ring-green-500' 
                    : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg active:bg-red-700 active:shadow-md focus:ring-red-500'
                }`}
                title={isEditing ? 'Done editing' : 'Edit dashboard'}
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Done' : 'Edit'}
              </button>
            </div>
          )}
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Categories:</label>
          <div className="flex gap-2">
            {(['Books', 'Videos', 'Games', 'Music'] as Category[]).map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition duration-150 ${
                  selectedCategories.includes(category)
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Dashboard Customizer - Admin Only */}
      {role === 'admin' && (
        <DashboardCustomizer
          onAddWidget={handleAddWidget}
          isEditing={isEditing}
          showAddWidget={showAddWidget}
          onToggleAddWidget={setShowAddWidget}
        />
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-min">
        {widgets.map((widget) => (
          <DashboardWidget
            key={widget.id}
            widget={widget}
            onRemove={handleRemoveWidget}
            onResize={handleResizeWidget}
            onUpdateWidget={handleUpdateWidget}
            isEditing={role === 'admin' && isEditing}
          />
        ))}
      </div>

      {widgets.length === 0 && (
        <Card className="text-center p-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets configured</h3>
          <p className="text-gray-600 mb-4">
            {role === 'admin' 
              ? 'Add your first widget to get started with your customizable dashboard.'
              : 'Dashboard widgets are configured by your administrator.'
            }
          </p>
          {role === 'admin' && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150"
            >
              Add Widget
            </button>
          )}
        </Card>
      )}
    </div>
  );
};

export default CustomizableDashboard;