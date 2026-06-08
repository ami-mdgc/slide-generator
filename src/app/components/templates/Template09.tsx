import { SlideTemplateData } from "../../types/slide-template";
import { SafeArea } from "./SlideLayout";

interface BusinessData {
  name: string;
  color: string;
  values: number[];
}

interface Template09Data extends SlideTemplateData {
  title: string;
  months: string[];
  revenues: BusinessData[];
  profits: BusinessData[];
  colors?: { accent: string; primary: string };
}

const CHART_W = 832;
const CHART_H = 680;
const PAD_L   = 72;
const PAD_R   = 16;
const PAD_T   = 56;
const PAD_B   = 56;
const INNER_W = CHART_W - PAD_L - PAD_R; // 744
const INNER_H = CHART_H - PAD_T - PAD_B; // 568
const BASE_Y  = PAD_T + INNER_H;         // 624
const BAR_W   = 100;
const GX      = [0, 1, 2].map(i => PAD_L + (INNER_W / 3) * (i + 0.5));

function formatY(val: number) {
  if (val >= 100_000_000) return `${(val / 100_000_000).toFixed(1)}億`;
  return `${Math.round(val / 10_000).toLocaleString()}万`;
}

function StackedBarChart({
  chartTitle,
  months,
  businesses,
}: {
  chartTitle: string;
  months: string[];
  businesses: BusinessData[];
}) {
  const totals = [0, 1, 2].map(mi =>
    businesses.reduce((sum, b) => sum + (b.values[mi] ?? 0), 0)
  );
  const rawMax = Math.max(...totals, 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const normalized = rawMax / magnitude;
  const step = normalized <= 2 ? magnitude * 0.5 : normalized <= 5 ? magnitude : magnitude * 2;
  const maxTick = Math.ceil(rawMax / step) * step;
  const tickVals = Array.from({ length: Math.round(maxTick / step) }, (_, i) => (i + 1) * step);
  const bH = (v: number) => (v / maxTick) * INNER_H;

  return (
    <svg width={CHART_W} height={CHART_H} overflow="visible">
      {/* Chart title */}
      <text x={PAD_L + INNER_W / 2} y={36}
        textAnchor="middle" fontSize={32} fill="#18191e"
        fontFamily="Gen Interface JP Display:SemiBold, sans-serif">
        {chartTitle}
      </text>

      {/* Grid + Y-axis labels */}
      {tickVals.map(val => {
        const y = BASE_Y - bH(val);
        return (
          <g key={val}>
            <line x1={PAD_L} y1={y} x2={CHART_W - PAD_R} y2={y}
              stroke="#e5e7eb" strokeWidth={1} strokeDasharray="5 4" />
            <text x={PAD_L - 8} y={y + 6} textAnchor="end" fontSize={16}
              fill="#9ca3af" fontFamily="Gen Interface JP Display:Regular, sans-serif">
              {formatY(val)}
            </text>
          </g>
        );
      })}
      <line x1={PAD_L} y1={BASE_Y} x2={CHART_W - PAD_R} y2={BASE_Y}
        stroke="#d1d5db" strokeWidth={2} />

      {/* Stacked bars */}
      {GX.map((cx, mi) => {
        let accH = 0;
        return (
          <g key={mi}>
            {businesses.map(biz => {
              const val = biz.values[mi] ?? 0;
              const h = bH(val);
              const y = BASE_Y - accH - h;
              accH += h;
              return h > 0 ? (
                <rect key={biz.name} x={cx - BAR_W / 2} y={y} width={BAR_W} height={h}
                  fill={biz.color} />
              ) : null;
            })}
            <text x={cx} y={BASE_Y + 36} textAnchor="middle" fontSize={20}
              fill="#18191e" fontFamily="Gen Interface JP Display:Medium, sans-serif">
              {months[mi]?.match(/(\d+月)/)?.[1] ?? months[mi] ?? ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Template09({ data }: { data: Template09Data }) {
  const legendBiz = data.revenues.length > 0 ? data.revenues : data.profits;

  return (
    <div className="bg-white relative size-full" data-name="template09">
      <SafeArea>
        {/* Title */}
        <div className="absolute left-0 top-0">
          <p className="font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] text-[#18191e] text-[64px] whitespace-nowrap">
            {data.title}
          </p>
        </div>

        {/* Two charts */}
        <div className="absolute left-0 top-[125px] flex gap-[64px]">
          <StackedBarChart chartTitle="売上" months={data.months} businesses={data.revenues} />
          <StackedBarChart chartTitle="粗利" months={data.months} businesses={data.profits} />
        </div>

        {/* Legend — グラフ下中央 */}
        <div className="absolute left-0 right-0 bottom-0 flex justify-center gap-[32px] items-center" style={{ height: 80 }}>
          {legendBiz.map(biz => (
            <div key={biz.name} className="flex items-center gap-[8px]">
              <div style={{ width: 14, height: 14, backgroundColor: biz.color, flexShrink: 0, borderRadius: 2 }} />
              <span style={{ fontSize: 22, color: '#18191e', fontFamily: 'Gen Interface JP Display:Regular, sans-serif' }}>
                {biz.name}
              </span>
            </div>
          ))}
        </div>
      </SafeArea>
    </div>
  );
}
