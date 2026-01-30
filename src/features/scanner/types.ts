export type Recommendation = 'keep' | 'discard' | 'warn';

export type ScanResult = {
  title: string;
  category: string;
  itemType: string;
  image: string;
  currentPrice: number;
  suggestedPrice: number;
  averagePrice?: number;
  salesRank?: string;
  recommendation: Recommendation | string;
  profit: number;
  margin: string;
  priceHistory?: string;
  author?: string;
  publisher?: string;
  platform?: string;
  userId?: string;
};

export type HistoryItem = ScanResult & { barcode: string; timestamp: Date };

export type ScanFilter = {
  userId?: string;
  itemType?: string;
  recommendation?: Recommendation | 'all';
  startDate?: Date;
  endDate?: Date;
};
