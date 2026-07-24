export type MarketData = {
  stockx: {
    lowestAsk: number | null;
    highestBid: number | null;
    lastSale: number | null;
    url: string;
  };
  goat: {
    lowestAsk: number | null;
    highestBid: number | null;
    lastSale: number | null;
    url: string;
  };
};

export async function getMarketData(
  stockxUrl: string,
  goatUrl: string
): Promise<MarketData> {
  throw new Error("Not implemented yet.");
}