import { useState } from 'react';
import { X, Settings } from 'lucide-react';
import { BarChart, Card, CategoryBar, Select, SelectItem, LineChart, AreaChart, DonutChart } from '@tremor/react';

export interface WidgetData {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'area' | 'donut' | 'category' | 'metric';
  data: any[];
  dataSource?: 'scanPerformance' | 'decisionOutcomes' | 'categoryPerformance' | 'topKeeps' | 'totalProfit' | 'hitRate';
  config: {
    index?: string;
    categories?: string[];
    colors?: string[];
    valueFormatter?: (value: number) => string;
    showLegend?: boolean;
  };
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
}

interface DashboardWidgetProps {
  widget: WidgetData;
  onRemove: (id: string) => void;
  onResize: (id: string, size: 'small' | 'medium' | 'large') => void;
  onUpdateWidget?: (id: string, updates: Partial<WidgetData>) => void;
  isEditing: boolean;
}

const DashboardWidget = ({ widget, onRemove, onResize, onUpdateWidget, isEditing }: DashboardWidgetProps) => {
  const [showSettings, setShowSettings] = useState(false);

  const availableDataSources = [
    { value: 'scanPerformance', label: 'Scan Performance' },
    { value: 'decisionOutcomes', label: 'Decision Outcomes' },
    { value: 'categoryPerformance', label: 'Category Performance' },
    { value: 'topKeeps', label: 'Top Profit Items' },
    { value: 'totalProfit', label: 'Total Profit Metric' },
    { value: 'hitRate', label: 'Hit Rate Metric' }
  ];

  const availableChartTypes = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'area', label: 'Area Chart' },
    { value: 'donut', label: 'Donut Chart' },
    { value: 'category', label: 'Category Bar' },
    { value: 'metric', label: 'Metric Card' }
  ];

  const handleDataSourceChange = (newDataSource: string) => {
    if (onUpdateWidget) {
      onUpdateWidget(widget.id, { dataSource: newDataSource as any });
    }
  };

  const handleChartTypeChange = (newType: string) => {
    if (onUpdateWidget) {
      onUpdateWidget(widget.id, { type: newType as any });
    }
  };

  const renderChart = () => {
    const { type, data, config } = widget;
    
    switch (type) {
      case 'bar':
        return (
          <BarChart
            data={data}
            index={config.index || 'name'}
            categories={config.categories || ['value']}
            colors={config.colors || ['blue']}
            showLegend={config.showLegend}
            valueFormatter={config.valueFormatter}
            className="h-full"
          />
        );
      
      case 'line':
        return (
          <LineChart
            data={data}
            index={config.index || 'name'}
            categories={config.categories || ['value']}
            colors={config.colors || ['blue']}
            showLegend={config.showLegend}
            valueFormatter={config.valueFormatter}
            className="h-full"
          />
        );
      
      case 'area':
        return (
          <AreaChart
            data={data}
            index={config.index || 'name'}
            categories={config.categories || ['value']}
            colors={config.colors || ['blue']}
            showLegend={config.showLegend}
            valueFormatter={config.valueFormatter}
            className="h-full"
          />
        );
      
      case 'donut':
        return (
          <DonutChart
            data={data}
            category="value"
            index={config.index || 'name'}
            colors={config.colors as any || ['blue', 'green', 'red', 'yellow']}
            valueFormatter={config.valueFormatter}
            className="h-full"
          />
        );
      
      case 'category':
        const values = data.map(item => item.value);
        return (
          <div className="space-y-4">
            <CategoryBar
              values={values}
              colors={(config.colors as any) || ['blue']}
              showLabels={true}
            />
            <div className="text-center">
              <p className="text-tremor-default text-tremor-content-strong">
                {data.reduce((sum, item) => sum + item.value, 0)} Total Items
              </p>
            </div>
          </div>
        );
      
      case 'metric':
        const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
        return (
          <div className="text-center py-8">
            <h3 className="text-3xl font-bold text-tremor-content-strong">
              {config.valueFormatter ? config.valueFormatter(total) : total.toLocaleString()}
            </h3>
            <p className="text-tremor-default text-tremor-content">
              {widget.title}
            </p>
          </div>
        );
      
      default:
        return <div className="p-4 text-center text-gray-500">Unknown chart type</div>;
    }
  };

  const getSizeClasses = () => {
    switch (widget.size) {
      case 'small':
        return 'col-span-1 row-span-1 h-48';
      case 'medium':
        return 'col-span-2 row-span-1 h-48';
      case 'large':
        return 'col-span-2 row-span-2 h-96';
      default:
        return 'col-span-1 row-span-1 h-48';
    }
  };

  return (
    <Card className={`relative ${getSizeClasses()} shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200 bg-white rounded-xl`}>
      {isEditing && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 bg-white rounded border shadow-sm hover:bg-gray-50 hover:shadow-md active:bg-gray-100 active:shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(widget.id)}
            className="p-1 bg-white rounded border shadow-sm hover:bg-red-50 hover:shadow-md active:bg-red-100 active:shadow-sm text-red-600 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {showSettings && isEditing && (
        <div className="absolute top-10 right-2 bg-white border rounded-lg shadow-lg p-4 z-20 min-w-64 max-w-72">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Chart Type</label>
              <Select value={widget.type} onValueChange={handleChartTypeChange}>
                {availableChartTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Data Source</label>
              <Select value={widget.dataSource || 'scanPerformance'} onValueChange={handleDataSourceChange}>
                {availableDataSources.map(source => (
                  <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
              <Select value={widget.size} onValueChange={(value) => onResize(widget.id, value as any)}>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </Select>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 h-full">
        <h3 className="text-lg font-medium text-tremor-content-strong mb-4">{widget.title}</h3>
        <div className="h-32">
          {renderChart()}
        </div>
      </div>
    </Card>
  );
};

export default DashboardWidget;