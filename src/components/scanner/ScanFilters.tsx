import { useState } from 'react';
import { Select, SelectItem, Button } from '@tremor/react';
import { Filter, X } from 'lucide-react';
import type { ScanFilter, Recommendation } from '../../features/scanner/types';

interface ScanFiltersProps {
  filter: ScanFilter;
  onFilterChange: (filter: ScanFilter) => void;
  onClearFilters: () => void;
  totalScans: number;
  filteredScans: number;
  allUsers?: string[];
  currentUser?: string;
}

const ScanFilters = ({
  filter,
  onFilterChange,
  onClearFilters,
  totalScans,
  filteredScans,
  allUsers = [],
  currentUser,
}: ScanFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const itemTypeOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'books', label: 'Books' },
    { value: 'video_games', label: 'Video Games' },
    { value: 'music', label: 'Music' },
    { value: 'videos', label: 'Videos' },
    { value: 'other', label: 'Other' },
  ];

  const recommendationOptions = [
    { value: 'all', label: 'All Recommendations' },
    { value: 'keep', label: 'Keep' },
    { value: 'discard', label: 'Discard' },
    { value: 'warn', label: 'Warning' },
  ];

  const hasActiveFilters = 
    filter.itemType !== 'all' || 
    filter.recommendation !== 'all' ||
    filter.userId ||
    filter.startDate ||
    filter.endDate;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filter Scans</h3>
          <span className="text-sm text-gray-500">
            ({filteredScans} of {totalScans} scans)
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              onClick={onClearFilters}
              variant="light"
              size="xs"
              className="text-gray-600"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant="light"
            size="xs"
          >
            {isOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User
            </label>
            <Select
              value={filter.userId || 'all'}
              onValueChange={(value) => 
                onFilterChange({
                  ...filter,
                  userId: value === 'all' ? undefined : value
                })
              }
            >
              <SelectItem value="all">All Users</SelectItem>
              {currentUser && (
                <SelectItem value={currentUser}>My Scans</SelectItem>
              )}
              {allUsers.filter(user => user !== currentUser).map((user) => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Type
            </label>
            <Select
              value={filter.itemType || 'all'}
              onValueChange={(value) => 
                onFilterChange({
                  ...filter,
                  itemType: value as string | 'all'
                })
              }
            >
              {itemTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommendation
            </label>
            <Select
              value={filter.recommendation || 'all'}
              onValueChange={(value) => 
                onFilterChange({
                  ...filter,
                  recommendation: value as Recommendation | 'all'
                })
              }
            >
              {recommendationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filter.startDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => 
                  onFilterChange({
                    ...filter,
                    startDate: e.target.value ? new Date(e.target.value) : undefined
                  })
                }
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={filter.endDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => 
                  onFilterChange({
                    ...filter,
                    endDate: e.target.value ? new Date(e.target.value) : undefined
                  })
                }
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanFilters;