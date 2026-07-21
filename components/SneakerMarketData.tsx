import Image from "next/image";
import Link from "next/link";

interface SneakerMarketDataProps {
  stockxUrl?: string | null;
  goatUrl?: string | null;
}

export default function SneakerMarketData({
  stockxUrl,
  goatUrl,
}: SneakerMarketDataProps) {
  // Placeholder values until live market data is connected
  const lowestAsk = "$325";
  const highestBid = "$295";
  const lastSale = "$310";

  return (
    <section className="h-full rounded-lg border border-zinc-700 bg-[#111111] p-6">
      <h2 className="mb-5 text-lg font-bold uppercase tracking-wide text-white">
        Market Data
      </h2>

      {/* Marketplace Logos */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          {stockxUrl ? (
            <Link
              href={stockxUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/images/stockx-logo.png"
                alt="StockX"
                width={90}
                height={22}
              />
            </Link>
          ) : (
            <Image
              src="/images/stockx-logo.png"
              alt="StockX"
              width={90}
              height={22}
              className="opacity-40"
            />
          )}
        </div>

        <div>
          {goatUrl ? (
            <Link
              href={goatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-80"
            >
              <Image
                src="/images/goat-logo.png"
                alt="GOAT"
                width={70}
                height={22}
              />
            </Link>
          ) : (
            <Image
              src="/images/goat-logo.png"
              alt="GOAT"
              width={70}
              height={22}
              className="opacity-40"
            />
          )}
        </div>
      </div>

      {/* Lowest Ask */}
      <div className="grid grid-cols-3 items-center border-b border-zinc-800 py-3">
        <div className="text-left text-2xl font-bold text-white">
          {lowestAsk}
        </div>

        <div className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Lowest Ask
        </div>

        <div className="text-right text-2xl font-bold text-white">
          {lowestAsk}
        </div>
      </div>

      {/* Highest Bid */}
      <div className="grid grid-cols-3 items-center border-b border-zinc-800 py-3">
        <div className="text-left text-2xl font-bold text-white">
          {highestBid}
        </div>

        <div className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Highest Bid
        </div>

        <div className="text-right text-2xl font-bold text-white">
          {highestBid}
        </div>
      </div>

      {/* Last Sale */}
      <div className="grid grid-cols-3 items-center py-3">
        <div className="text-left text-2xl font-bold text-white">
          {lastSale}
        </div>

        <div className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Last Sale
        </div>

        <div className="text-right text-2xl font-bold text-white">
          {lastSale}
        </div>
      </div>
    </section>
  );
}