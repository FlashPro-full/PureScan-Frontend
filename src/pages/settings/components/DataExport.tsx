import { useState } from 'react';
import { apiJson } from '../../../api/client';

type InventoryItem = {
  id: string;
  barcode?: string;
  title?: string;
  author?: string;
  category?: string;
  scannedPrice?: number;
  rating?: string;
  timestamp?: string;
};

const sanitizeForCSV = (value: unknown) => {
  let str = String(value ?? '');
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const DataExport = () => {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      const data = await apiJson<{ items: InventoryItem[] }>('/inventory');
      const list = data?.items ?? [];
      const fromDate = new Date(`${from}T00:00:00`).getTime();
      const toDate = new Date(`${to}T23:59:59`).getTime();
      const rows = list.filter((item) => {
        if (!item.timestamp) return false;
        const ts = new Date(item.timestamp).getTime();
        return ts >= fromDate && ts <= toDate;
      });

      const headers = ['id', 'barcode', 'title', 'author', 'category', 'scannedPrice', 'rating', 'timestamp'];
      const lines = [headers.join(',')];
      for (const row of rows) {
        const line = headers
          .map((key) => sanitizeForCSV((row as Record<string, unknown>)[key]))
          .join(',');
        lines.push(line);
      }

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `inventory_${from}_to_${to}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[settings] export failed', err);
      setError(err instanceof Error ? err.message : 'Failed to download data');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
      <p className="text-sm text-gray-600">Download your inventory as CSV for a chosen date range.</p>
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1" />
        <button
          onClick={() => void handleDownload()}
          disabled={downloading}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          {downloading ? 'Preparing…' : 'Download CSV'}
        </button>
      </div>
      {error && <p className="text-sm text-[#ED1C24]">{error}</p>}
    </div>
  );
};

export default DataExport;
