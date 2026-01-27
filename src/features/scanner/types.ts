export type Recommendation = 'keep' | 'discard' | 'warn';

export type ItemType = 'books' | 'video_games' | 'music' | 'videos' | 'other';

export type ScanResult = {
  title: string;
  category: string;
  itemType: ItemType;
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
  itemType?: ItemType | 'all';
  recommendation?: Recommendation | 'all';
  startDate?: Date;
  endDate?: Date;
};
