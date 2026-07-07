import { SlideTemplateData } from "../../types/slide-template";
import { SafeArea } from "./SlideLayout";
import { useRef, useLayoutEffect, useState } from "react";

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

const LABEL_W = 156;               // テーブルの事業名列幅
const CHART_W = 832;
const PAD_L   = LABEL_W + 16;     // 172 — Y軸はラベル列+16px右から開始
const PAD_R   = 8;
const PAD_T   = 48;
const PAD_B   = 40;
const INNER_W = CHART_W - PAD_L - PAD_R; // 652
const BAR_W   = 100;
const GX      = [0, 1, 2].map(i => PAD_L + (INNER_W / 3) * (i + 0.5));
const COL_W   = INNER_W / 3;      // テーブル列幅（グラフと同じ幅）


function formatY(val: number) {
  if (val >= 100_000_000) return `${(val / 100_000_000).toFixed(1)}億`;
  return `${Math.round(val / 10_000).toLocaleString()}万`;
}


function BusinessTable({ businesses, showLabel = true, marginLeft = 0 }: { businesses: BusinessData[]; showLabel?: boolean; marginLeft?: number }) {
  const tblCols = `${LABEL_W}px ${16 + marginLeft}px repeat(3, ${COL_W}px) ${PAD_R}px`;
  const totals = [0, 1, 2].map(mi =>
    businesses.reduce((sum, b) => sum + (b.values[mi] ?? 0), 0)
  );
  return (
    <div style={{ width: CHART_W + marginLeft, marginTop: 8, flexShrink: 0 }}>
      {businesses.map(biz => (
        <div key={biz.name} style={{
          display: 'grid',
          gridTemplateColumns: tblCols,
          borderBottom: '1px solid #f3f4f6',
          alignItems: 'center',
          height: 40,
        }}>
          {showLabel ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, backgroundColor: biz.color, flexShrink: 0, borderRadius: 2 }} />
              <span style={{ fontSize: 16, color: '#18191e', fontFamily: 'Gen Interface JP Display:Regular, sans-serif', whiteSpace: 'nowrap' }}>
                {biz.name}
              </span>
            </div>
          ) : (
            <div />
          )}
          <div />
          {biz.values.slice(0, 3).map((v, i) => {
            const man = Math.round(v / 10_000);
            return (
              <div key={i} style={{ textAlign: 'center', fontSize: 21, color: man > 0 ? '#18191e' : '#d1d5db', fontFamily: 'Gen Interface JP Display:SemiBold, sans-serif' }}>
                {man > 0 ? `${man.toLocaleString()}万` : '—'}
              </div>
            );
          })}
          <div />
        </div>
      ))}
      {/* 合計行 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: tblCols,
        borderTop: '2px solid #d1d5db',
        alignItems: 'center',
        height: 44,
        backgroundColor: '#f9fafb',
      }}>
        {showLabel ? (
          <div style={{ fontSize: 16, color: '#18191e', fontFamily: 'Gen Interface JP Display:SemiBold, sans-serif', whiteSpace: 'nowrap' }}>
            合計
          </div>
        ) : (
          <div />
        )}
        <div />
        {totals.map((total, i) => {
          const man = Math.round(total / 10_000);
          return (
            <div key={i} style={{ textAlign: 'center', fontSize: 21, color: '#18191e', fontFamily: 'Gen Interface JP Display:SemiBold, sans-serif' }}>
              {man > 0 ? `${man.toLocaleString()}万` : '—'}
            </div>
          );
        })}
        <div />
      </div>
    </div>
  );
}

function StackedBarChart({
  months,
  businesses,
  svgMarginLeft = 0,
  chartH,
}: {
  months: string[];
  businesses: BusinessData[];
  svgMarginLeft?: number;
  chartH: number;
}) {
  const innerH = chartH - PAD_T - PAD_B;
  const baseY = PAD_T + innerH;

  const totals = [0, 1, 2].map(mi =>
    businesses.reduce((sum, b) => sum + (b.values[mi] ?? 0), 0)
  );
  const rawMax = Math.max(...totals, 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const normalized = rawMax / magnitude;
  const step = normalized <= 2 ? magnitude * 0.5 : normalized <= 5 ? magnitude : magnitude * 2;
  const maxTick = Math.ceil(rawMax / step) * step;
  const tickVals = Array.from({ length: Math.round(maxTick / step) }, (_, i) => (i + 1) * step);
  const bH = (v: number) => (v / maxTick) * innerH;

  return (
    <svg width={CHART_W} height={chartH} overflow="visible" style={{ display: 'block', marginLeft: svgMarginLeft }}>
      {/* Grid + Y-axis labels */}
      {tickVals.map(val => {
        const y = baseY - bH(val);
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
      <line x1={PAD_L} y1={baseY} x2={CHART_W - PAD_R} y2={baseY}
        stroke="#d1d5db" strokeWidth={2} />

      {/* Stacked bars */}
      {GX.map((cx, mi) => {
        let accH = 0;
        return (
          <g key={mi}>
            {businesses.map(biz => {
              const val = biz.values[mi] ?? 0;
              const h = bH(val);
              const y = baseY - accH - h;
              accH += h;
              if (h <= 0) return null;
              return (
                <rect key={biz.name} x={cx - BAR_W / 2} y={y} width={BAR_W} height={h}
                  fill={biz.color} />
              );
            })}
            <text x={cx} y={baseY + 36} textAnchor="middle" fontSize={20}
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
  const [chartH, setChartH] = useState(200);
  const chartWrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (chartWrapperRef.current) {
      setChartH(chartWrapperRef.current.clientHeight);
    }
  });

  return (
    <div className="bg-white relative size-full" data-name="template09">
      <SafeArea>
        {/* Title */}
        <div className="absolute left-0 top-0">
          <p className="font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] text-[#18191e] text-[64px] whitespace-nowrap">
            {data.title}
          </p>
        </div>

        {/* Two charts + tables */}
        <div className="absolute left-0 top-[96px] bottom-0 flex gap-0">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginLeft: 54, width: CHART_W, textAlign: 'center', flexShrink: 0 }}>
              <p style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'Gen Interface JP Display:SemiBold, sans-serif', color: '#18191e', backgroundColor: '#dbeafe', padding: '2px 16px', borderRadius: 6 }}>売上</p>
            </div>
            <div ref={chartWrapperRef} style={{ flex: 1, minHeight: 0 }}>
              <StackedBarChart months={data.months} businesses={data.revenues} svgMarginLeft={54} chartH={chartH} />
            </div>
            <BusinessTable businesses={data.revenues} marginLeft={54} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginLeft: 54, width: CHART_W, textAlign: 'center', flexShrink: 0 }}>
              <p style={{ fontSize: 24, fontWeight: 'bold', fontFamily: 'Gen Interface JP Display:SemiBold, sans-serif', color: '#18191e', backgroundColor: '#dcfce7', padding: '2px 16px', borderRadius: 6 }}>粗利</p>
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <StackedBarChart months={data.months} businesses={data.profits} chartH={chartH} />
            </div>
            <BusinessTable businesses={data.profits} showLabel={false} />
          </div>
        </div>
      </SafeArea>
    </div>
  );
}
