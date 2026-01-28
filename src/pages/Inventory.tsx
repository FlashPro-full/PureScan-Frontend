import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch, apiJson } from '../api/client';

type Rating = 'Movies' | 'Games' | 'Music' | 'Videos';

type InventoryItem = {
  id: string;
  barcode: string;
  title: string;
  author?: string;
  category?: string;
  image?: string;
  scannedPrice: number;
  rating: Rating;
  timestamp: string;
};

const ratingStyles: Record<Rating, string> = {
  Movies: 'bg-red-50 text-red-700 border border-red-200',
  Games: 'bg-blue-50 text-blue-700 border border-blue-200',
  Music: 'bg-amber-50 text-amber-700 border border-amber-200',
  Videos: 'bg-rose-50 text-rose-700 border border-rose-200',
};

const Inventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<Rating | 'All'>('All');

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson<{ items: InventoryItem[] }>('/inventory');
      const items = (data?.items ?? []).map((item: any) => ({
        id: item.id,
        barcode: item.barcode,
        title: item.title,
        author: item.author || undefined,
        category: item.category || undefined,
        image: item.image || undefined,
        scannedPrice: parseFloat(item.scannedPrice) || 0,
        rating: item.rating || 'FBA',
        timestamp: item.timestamp || item.createdAt || new Date().toISOString(),
      }));
      setItems(items);
      setError(null);
    } catch (err) {
      console.error('[inventory] failed to load items', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery = !q
        || item.title.toLowerCase().includes(q)
        || (item.author?.toLowerCase().includes(q) ?? false)
        || item.barcode.includes(q);
      const matchesRating = ratingFilter === 'All' || item.rating === ratingFilter;
      return matchesQuery && matchesRating;
    });
  }, [items, query, ratingFilter]);

  const updateItem = async (id: string, patch: Partial<InventoryItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    try {
      await apiFetch(`/inventory/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ rating: patch.rating }),
      });
    } catch (err) {
      console.error('[inventory] failed to update item', err);
      setError(err instanceof Error ? err.message : 'Failed to update item');
      void loadInventory();
    }
  };

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    try {
      await apiFetch(`/inventory/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('[inventory] failed to delete item', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      void loadInventory();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void loadInventory()}
                className="text-sm px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Refresh
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-[#ED1C24]">{error}</p>
          )}
        </div>
      </header>

      <div className="p-6">
        <div className="bg-gray-100 border border-gray-300 rounded-2xl p-4 mb-6 shadow">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or barcode"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {/* Desktop: Button layout */}
            <div className="hidden md:flex items-center gap-2">
              {(['All', 'Movies', 'Games', 'Music', 'Videos'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => setRatingFilter(category as any)}
                  className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                    ratingFilter === category
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Mobile: Dropdown layout */}
            <div className="md:hidden">
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {(['All', 'Movies', 'Games', 'Music', 'Videos'] as const).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 border border-gray-300 rounded-2xl overflow-hidden shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Barcode</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Rating</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Price at Scan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Scanned</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      Loading inventory…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-10 h-14 object-cover rounded bg-gray-100"
                            />
                          ) : (
                            <div className="w-10 h-14 rounded bg-gray-100" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.title}</div>
                            {item.author && <div className="text-xs text-gray-500">{item.author}</div>}
                            {item.category && <div className="text-xs text-gray-400">{item.category}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.barcode}</td>
                      <td className="px-4 py-3">
                        <select
                          value={item.rating}
                          onChange={(e) => updateItem(item.id, { rating: e.target.value as Rating })}
                          className={`px-2 py-1 rounded text-xs font-medium ${ratingStyles[item.rating]}`}
                        >
                          {(['Movies', 'Games', 'Music', 'Videos'] as Rating[]).map((rating) => (
                            <option key={rating} value={rating}>
                              {rating}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">{'$' + item.scannedPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(item.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
