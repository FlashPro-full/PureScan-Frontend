import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Card } from '@tremor/react';
import type { WidgetData } from './DashboardWidget';

interface DashboardCustomizerProps {
  onAddWidget: (widget: WidgetData) => void;
  isEditing: boolean;
  showAddWidget: boolean;
  onToggleAddWidget: (show: boolean) => void;
}

const availableChartTypes = [
  { value: 'bar', label: 'Bar Chart', description: 'Compare values across categories' },
  { value: 'line', label: 'Line Chart', description: 'Show trends over time' },
  { value: 'area', label: 'Area Chart', description: 'Display volume over time' },
  { value: 'donut', label: 'Donut Chart', description: 'Show proportions' },
  { value: 'category', label: 'Category Bar', description: 'Simple progress bars' },
  { value: 'metric', label: 'Metric Card', description: 'Key performance indicators' },
];

const DashboardCustomizer = ({ onAddWidget, isEditing, showAddWidget, onToggleAddWidget }: DashboardCustomizerProps) => {
  const [newWidgetType, setNewWidgetType] = useState<string>('bar');

  const handleAddWidget = () => {
    const newWidget: WidgetData = {
      id: `widget-${Date.now()}`,
      title: `New ${availableChartTypes.find(t => t.value === newWidgetType)?.label || 'Widget'}`,
      type: newWidgetType as any,
      data: generateSampleData(newWidgetType),
      config: {
        index: 'name',
        categories: ['value'],
        colors: ['blue'],
        showLegend: true,
      },
      size: 'medium',
      position: { x: 0, y: 0 },
    };

    onAddWidget(newWidget);
    onToggleAddWidget(false);
  };

  const generateSampleData = (type: string) => {
    switch (type) {
      case 'bar':
      case 'line':
      case 'area':
        return [
          { name: 'Jan', value: 400 },
          { name: 'Feb', value: 300 },
          { name: 'Mar', value: 200 },
          { name: 'Apr', value: 278 },
          { name: 'May', value: 189 },
        ];
      
      case 'donut':
        return [
          { name: 'FBA', value: 45 },
          { name: 'FBM', value: 30 },
          { name: 'FBC', value: 25 },
        ];
      
      case 'category':
        return [
          { name: 'Active', value: 70 },
          { name: 'Pending', value: 30 },
        ];
      
      case 'metric':
        return [
          { name: 'Total Sales', value: 12543 },
        ];
      
      default:
        return [];
    }
  };

  return (
    <div className="mb-6">
      {isEditing && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Widget</h2>
        </div>
      )}

      {showAddWidget && (
        <Card className="p-4 mb-4">
          <h3 className="text-lg font-medium mb-4">Add New Widget</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableChartTypes.map((type) => (
              <div
                key={type.value}
                onClick={() => setNewWidgetType(type.value)}
                className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-md active:shadow-sm transition-all duration-150 ${
                  newWidgetType === type.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <h4 className="font-medium text-gray-900">{type.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{type.description}</p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => onToggleAddWidget(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md active:bg-gray-100 active:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            >
              <X className="w-4 h-4 inline mr-2" />
              Cancel
            </button>
            <button
              onClick={handleAddWidget}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 hover:shadow-lg active:bg-blue-700 active:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Widget
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardCustomizer;