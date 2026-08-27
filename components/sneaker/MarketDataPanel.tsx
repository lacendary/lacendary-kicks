"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MarketDataRecord, MarketHistoryPoint, SizeMarketHistoryPoint } from "@/app/lib/market";

type Props = { marketData: MarketDataRecord | null; retailPrice?: number | null; stockxUrl?: string | null; goatUrl?: string | null };
const money = (v: number | null) => v == null ? "—" : `$${v.toLocaleString()}`;
const count = (v: number | null) => v == null ? "—" : v.toLocaleString();
const day = (v: string) => new Date(`${v}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const stamp = (v: string | null) => v ? new Date(v).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—";

function Metric({ label, value, quiet = false }: { label: string; value: string; quiet?: boolean }) {
  return <div className={quiet ? "border-l border-zinc-800 pl-5" : ""}><div className="meta-text text-[0.68rem]">{label}</div><div className={quiet ? "mt-2 text-xl font-semibold text-zinc-300" : "mt-3 text-4xl font-semibold tracking-tight text-white"}>{value}</div></div>;
}

function History({ overall, sizes, selectedSize }: { overall: MarketHistoryPoint[]; sizes: SizeMarketHistoryPoint[]; selectedSize: string }) {
  const point = overall[overall.length - 1];
  const sizePoint = sizes[sizes.length - 1];
  if (!point) return <div className="flex min-h-[22rem] items-center justify-center border border-dashed border-zinc-800 text-sm text-zinc-600">No market history has been stored yet.</div>;
  return <div className="space-y-6">
    <div className="flex min-h-[22rem] flex-col justify-between rounded-lg border border-zinc-800 bg-[#080808] p-8 lg:p-10">
      <div className="flex items-center justify-between gap-4"><span className="meta-text">{selectedSize === "all" ? "Overall market observation" : `Size ${selectedSize} observation`}</span><span className="text-xs uppercase tracking-[0.12em] text-zinc-600">{day(point.date)}</span></div>
      <div><div className="font-bebas text-6xl leading-none text-white lg:text-7xl">{selectedSize === "all" ? money(point.marketAveragePrice) : money(sizePoint?.lowestAsk ?? null)}</div><div className="mt-3 text-sm text-zinc-500">{selectedSize === "all" ? "Market average price" : "Lowest ask"}</div></div>
    </div>
    <p className="panel-text max-w-2xl text-zinc-500">Lacendary market tracking began {day(point.date)}. More history will appear as daily observations accumulate.</p>
  </div>;
}

export default function MarketDataPanel({ marketData, retailPrice, stockxUrl, goatUrl }: Props) {
  const [selectedSize, setSelectedSize] = useState("all");
  const record = marketData;
  const sizes = useMemo(() => [...(record?.snapshot.sizes ?? [])].sort((a, b) => Number(a.size) - Number(b.size)), [record]);
  const sizeHistory = record?.sizeDaily.filter((point) => point.size === selectedSize) ?? [];
  const selected = selectedSize === "all" ? null : sizes.find((item) => item.size === selectedSize) ?? null;
  const selectedPoint = sizeHistory[sizeHistory.length - 1] ?? null;
  const overall = record?.overallDaily[record.overallDaily.length - 1] ?? null;
  if (!record || !overall) return <section className="panel panel-padding"><h1 className="panel-heading">Market Snapshot — All</h1><p className="panel-text mt-5">No locally persisted market data is available for this sneaker.</p></section>;
  const premium = overall.annual.pricePremium == null ? "—" : `${overall.annual.pricePremium > 0 ? "+" : ""}${(overall.annual.pricePremium * 100).toFixed(1)}%`;
  const sizeMarket = selectedPoint?.lowestAsk ?? selected?.lowestAsk ?? null;
  const context = overall.annual.pricePremium != null && overall.annual.pricePremium < 0 ? `Trading below retail with ${overall.last90Days.salesCount?.toLocaleString() ?? "limited"} recent sales and relatively low annual volatility.` : `Trading with ${overall.last90Days.salesCount?.toLocaleString() ?? "limited"} recent sales volume and measured annual volatility.`;
  return <section className="mx-auto w-full max-w-[1320px] space-y-8 pb-16">
    <div className="panel px-7 py-9 lg:px-12 lg:py-12">
      <div className="flex flex-wrap items-start justify-between gap-6"><div><div className="section-label">Market Data</div><h1 className="panel-heading mt-3 text-[2.4rem] lg:text-[3rem]">Market Snapshot <span className="text-zinc-700">—</span> <select aria-label="Market snapshot size" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} className="border-b border-red-600 bg-transparent text-white outline-none"><option value="all">All</option>{sizes.map((item) => <option key={item.size} value={item.size}>Size {item.size}</option>)}</select></h1></div><div className="pt-2 text-xs uppercase tracking-[0.12em] text-zinc-600">Market data: StockX via KicksDB</div></div>
      {selectedSize === "all" ? <><div className="mt-14 grid gap-8 border-y border-zinc-800 py-8 md:grid-cols-4"><Metric label="Retail" value={money(retailPrice ?? null)} /><Metric label="Market average" value={money(overall.marketAveragePrice)} /><Metric label="90-day average" value={money(overall.last90Days.averagePrice)} /><Metric label="Premium vs retail" value={premium} /></div><div className="mt-8 flex flex-wrap gap-x-10 gap-y-5"><Metric quiet label="1Y average" value={money(overall.annual.averagePrice)} /><Metric quiet label="1Y sales" value={count(overall.annual.salesCount)} /><Metric quiet label="Volatility" value={overall.annual.volatility == null ? "—" : overall.annual.volatility.toFixed(4)} /><Metric quiet label="GMV" value={money(overall.annual.totalDollars)} /></div></> : <div className="mt-14 grid gap-8 border-y border-zinc-800 py-8 md:grid-cols-5"><Metric label="Retail" value={money(retailPrice ?? null)} /><Metric label={`Size ${selectedSize} market`} value={money(sizeMarket)} /><Metric label="# of asks" value={count(selectedPoint?.totalAsks ?? selected?.totalAsks ?? null)} /><Metric label="30-day sales" value={count(selectedPoint?.salesCount30Days ?? selected?.salesCount30Days ?? null)} /><Metric label="60-day sales" value={count(selectedPoint?.salesCount60Days ?? selected?.salesCount60Days ?? null)} /></div>}
      <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-xs uppercase tracking-[0.1em] text-zinc-600"><span>Updated {stamp(overall.retrievedAt)}</span><span>Source updated {stamp(overall.sourceUpdatedAt)}</span></div>
    </div>

    <div className="panel px-7 py-9 lg:px-12 lg:py-11"><div className="flex flex-wrap items-end justify-between gap-5"><h2 className="panel-heading text-[2rem]">Price History</h2><div className="flex gap-1 rounded-full border border-zinc-800 p-1">{["3M", "6M", "1Y", "ALL"].map((range) => <button type="button" key={range} className={`rounded-full px-4 py-2 text-xs tracking-[0.12em] ${range === "ALL" ? "bg-zinc-800 text-white" : "text-zinc-600"}`}>{range}</button>)}</div></div><div className="mt-8"><History overall={record.overallDaily} sizes={sizeHistory} selectedSize={selectedSize} /></div></div>

    <div className="panel px-7 py-9 lg:px-12 lg:py-10"><h2 className="panel-heading text-[2rem]">Size Market</h2><div className="mt-6 -mx-2 overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><table className="min-w-[700px] w-full border-collapse text-center"><tbody><tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-[0.12em] text-zinc-600"><th className="w-28 pb-4 font-normal">Size</th>{sizes.map((item) => <th key={item.size} onClick={() => setSelectedSize(item.size)} className={`cursor-pointer pb-4 font-normal ${selectedSize === item.size ? "text-red-500" : ""}`}>{item.size}</th>)}</tr><tr className="text-left text-xs uppercase tracking-[0.12em] text-zinc-600"><th className="py-4 font-normal">Market</th>{sizes.map((item) => <td key={item.size} onClick={() => setSelectedSize(item.size)} className={`cursor-pointer py-4 text-center text-base tracking-normal ${selectedSize === item.size ? "font-semibold text-red-500" : "text-zinc-300"}`}>{money(item.lowestAsk)}</td>)}</tr><tr className="text-left text-xs uppercase tracking-[0.12em] text-zinc-600"><th className="pb-2 font-normal"># of asks</th>{sizes.map((item) => <td key={item.size} onClick={() => setSelectedSize(item.size)} className={`cursor-pointer pb-2 text-center text-sm tracking-normal ${selectedSize === item.size ? "text-red-500" : "text-zinc-400"}`}>{count(item.totalAsks)}</td>)}</tr></tbody></table></div></div>

    <div className="panel px-7 py-8 lg:px-12"><h2 className="panel-heading text-[1.8rem]">Market Health</h2><div className="mt-5 grid grid-cols-2 gap-y-6 border-y border-zinc-800 py-6 md:grid-cols-4"><Metric quiet label="90-day sales" value={count(overall.last90Days.salesCount)} /><Metric quiet label="1Y sales" value={count(overall.annual.salesCount)} /><Metric quiet label="Volatility" value={overall.annual.volatility == null ? "—" : overall.annual.volatility.toFixed(4)} /><Metric quiet label="GMV" value={money(overall.annual.totalDollars)} /></div></div>

    <div className="px-2 py-5 lg:px-5 lg:py-8"><div className="section-label">Market Context</div><p className="mt-4 max-w-4xl text-xl leading-relaxed text-zinc-300 lg:text-2xl">{selectedSize === "all" ? context : `Size ${selectedSize} is currently asking ${money(selectedPoint?.lowestAsk ?? selected?.lowestAsk ?? null)} across ${count(selectedPoint?.totalAsks ?? selected?.totalAsks ?? null)} asks.`}</p></div>

    <div className="panel px-7 py-9 lg:px-12 lg:py-10"><div className="meta-text">Available from</div><div className="mt-5 grid gap-4 md:grid-cols-3">{stockxUrl && <Link href={stockxUrl} target="_blank" rel="noopener noreferrer" className="group flex min-h-24 items-center justify-between rounded-lg border border-zinc-800 bg-[#0b0b0b] px-6 py-5 hover:border-red-700"><span className="font-bebas text-2xl text-white">StockX</span><span className="text-xs uppercase tracking-[0.12em] text-zinc-600 group-hover:text-red-500">View listings →</span></Link>}{goatUrl && <Link href={goatUrl} target="_blank" rel="noopener noreferrer" className="group flex min-h-24 items-center justify-between rounded-lg border border-zinc-800 bg-[#0b0b0b] px-6 py-5 hover:border-red-700"><span className="font-bebas text-2xl text-white">GOAT</span><span className="text-xs uppercase tracking-[0.12em] text-zinc-600 group-hover:text-red-500">View listings →</span></Link>}<div className="flex min-h-24 items-center justify-between rounded-lg border border-zinc-800 bg-[#0b0b0b] px-6 py-5"><span className="font-bebas text-2xl text-white">KicksDB</span><span className="text-xs uppercase tracking-[0.12em] text-zinc-600">Source</span></div></div></div>
  </section>;
}
