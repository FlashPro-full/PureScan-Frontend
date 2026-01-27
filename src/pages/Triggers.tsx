import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Settings, Trash2 } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';

interface TriggerRule {
  id: string;
  name: string;
  minProfit: number;
  maxDimensions: { length: number; width: number; height: number };
  categories: string[];
  enabled: boolean;
}

interface TriggerGroup {
  id: string;
  name: string;
  description: string;
  outcome: 'FBA' | 'MF' | 'SBYB' | 'Reject';
  expanded: boolean;
  rules: TriggerRule[];
}

const CATEGORIES = ['Books', 'Videos', 'Games', 'Music'];

const Triggers = () => {
  const { role } = useSession();
  const [groups, setGroups] = useState<TriggerGroup[]>([
    {
      id: '1',
      name: 'High Profit FBA',
      description: 'Items with excellent profit margins for FBA',
      outcome: 'FBA',
      expanded: false,
      rules: [
        {
          id: '1-1',
          name: 'Books > $20 profit',
          minProfit: 20,
          maxDimensions: { length: 12, width: 9, height: 2 },
          categories: ['Books'],
          enabled: true,
        },
      ],
    },
    {
      id: '2',
      name: 'Merchant Fulfilled',
      description: 'Items suitable for merchant fulfillment',
      outcome: 'MF',
      expanded: false,
      rules: [],
    },
    {
      id: '3',
      name: 'Sell Back (SBYB)',
      description: 'Items for sell-back programs',
      outcome: 'SBYB',
      expanded: false,
      rules: [],
    },
  ]);

  const toggleGroup = (groupId: string) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, expanded: !group.expanded }
        : group
    ));
  };

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only administrators can configure triggers.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sourcing Triggers</h1>
            <p className="text-gray-600 mt-1">Configure decision rules for scanned items (Hit List → FBA → MF → SBYB → Reject)</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150">
            <Plus className="w-4 h-4" />
            Add Group
          </button>
        </div>
        
        {/* Category Filters */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Categories:</span>
          <div className="flex gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-800 transition duration-150"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trigger Groups */}
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            {/* Group Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="p-1 rounded hover:bg-gray-100 transition duration-150"
                  >
                    {group.expanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    group.outcome === 'FBA' ? 'bg-red-100 text-red-800' :
                    group.outcome === 'MF' ? 'bg-orange-100 text-orange-800' :
                    group.outcome === 'SBYB' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {group.outcome}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-150">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition duration-150">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Group Content (Rules) */}
            {group.expanded && (
              <div className="p-6">
                {group.rules.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No rules configured for this group</p>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150">
                      Add First Rule
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {group.rules.map((rule) => (
                      <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{rule.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Min Profit: ${rule.minProfit} | Categories: {rule.categories.join(', ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={rule.enabled}
                                onChange={() => {/* TODO: Handle rule toggle */}}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                            <button className="p-1 text-gray-600 hover:bg-gray-100 rounded transition duration-150">
                              <Settings className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-600 hover:bg-red-50 rounded transition duration-150">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-300 hover:text-red-600 transition duration-150">
                      + Add Rule to {group.name}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Triggers;