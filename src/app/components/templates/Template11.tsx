import { SlideTemplateData } from "../../types/slide-template";
import { SafeArea } from "./SlideLayout";

interface ChartMetric {
  label: string;
  values: number[];
  formatted: string[];
}

interface Template11Data extends SlideTemplateData {
  title: string;
  quarters: string[];
  chartMetrics: ChartMetric[];
  colors?: { accent: string; primary: string };
}

// ── Chart constants ─────────────────────────
const C_W             = 1728;
const C_H             = 490;
const C_PAD_TOP       = 32;
const C_PAD_BTM       = 48;
const C_CHART_H       = C_H - C_PAD_TOP - C_PAD_BTM; // 410px
const C_BASE_Y        = C_PAD_TOP + C_CHART_H;
const C_LABEL_W       = 80;  // 左Y軸ラベル幅
const C_TABLE_LABEL_W = 140; // テーブル行ラベル幅
const C_COL_W         = (C_W - C_TABLE_LABEL_W) / 4;
const C_GX            = [0, 1, 2, 3].map(i => C_TABLE_LABEL_W + C_COL_W * (i + 0.5));
const C_BAR_W         = 110;

export default function Template11({ data }: { data: Template11Data }) {
  const primary       = data.colors?.primary || "#5969a7";
  const PRIMARY_LIGHT = primary + "55";

  const quarters = data.quarters.length >= 4
    ? data.quarters.slice(0, 4)
    : ["Q1", "Q2", "Q3", "Q4"];

  const revenue = data.chartMetrics.find(m => m.label.includes("売上"));
  const profit  = data.chartMetrics.find(m => m.label.includes("粗利"));

  // Y軸スケール
  const allVals   = [...(revenue?.values ?? []), ...(profit?.values ?? [])];
  const rawMax    = Math.max(...allVals, 1);
  const STEP      = 10_000_000;
  const maxTick   = Math.ceil(rawMax / STEP) * STEP;
  const tickVals  = Array.from({ length: maxTick / STEP }, (_, i) => (i + 1) * STEP);
  const bH        = (v: number) => (v / maxTick) * C_CHART_H;
  const barX      = (i: number) => C_GX[i] - C_BAR_W / 2;

  const tableRows = [
    { metric: revenue, label: "事業売上", swatchColor: PRIMARY_LIGHT, swatchBorder: primary },
    { metric: profit,  label: "事業粗利", swatchColor: primary },
  ];

  return (
    <div className="bg-white relative size-full overflow-hidden" data-name="template11">
      <SafeArea>
        {/* Title */}
        <div className="absolute h-[77px] left-0 top-0 w-[920px]">
          <p className="[word-break:break-word] absolute font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] left-0 not-italic text-[#18191e] text-[64px] top-0 whitespace-nowrap">
            {data.title}
          </p>
        </div>

        {/* ── CHART ────────────────────────────── */}
        <svg
          width={C_W} height={C_H}
          style={{ position: "absolute", left: 0, top: 125 }}
          overflow="visible"
        >
          {/* グリッド・Y軸目盛り */}
          {tickVals.map(val => {
            const y     = C_PAD_TOP + C_CHART_H * (1 - val / maxTick);
            const label = `${(val / 10_000).toLocaleString()}万`;
            return (
              <g key={val}>
                <line x1={C_LABEL_W} y1={y} x2={C_W} y2={y}
                  stroke="#e5e7eb" strokeWidth={1} strokeDasharray="5 4" />
                <text x={C_LABEL_W - 8} y={y + 6}
                  textAnchor="end" fontSize={18} fill="#9ca3af"
                  fontFamily="Gen Interface JP Display:Regular, sans-serif">
                  {label}
                </text>
              </g>
            );
          })}

          {/* ベースライン */}
          <line x1={C_LABEL_W} y1={C_BASE_Y} x2={C_W} y2={C_BASE_Y}
            stroke="#d1d5db" strokeWidth={2} />

          {/* 積み上げ棒グラフ */}
          {C_GX.map((_, i) => {
            const revH  = revenue ? bH(revenue.values[i] ?? 0) : 0;
            const profH = profit  ? bH(profit.values[i] ?? 0)  : 0;
            const revTop = C_BASE_Y - revH;
            const rx = barX(i);
            return (
              <g key={i}>
                {/* 売上のうち粗利以外の部分（薄い色） */}
                <rect x={rx} y={revTop} width={C_BAR_W} height={Math.max(0, revH - profH)}
                  fill={PRIMARY_LIGHT} rx={4} />
                {/* 粗利部分（濃い色） */}
                <rect x={rx} y={C_BASE_Y - profH} width={C_BAR_W} height={profH}
                  fill={primary} />
                {/* X軸ラベル */}
                <text x={C_GX[i]} y={C_BASE_Y + 32}
                  textAnchor="middle" fontSize={20} fill="#18191e"
                  fontFamily="Gen Interface JP Display:Medium, sans-serif">
                  {quarters[i]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* ── TABLE ──────────────────────────────────────────── */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
          {tableRows.map(({ metric, label, swatchColor, swatchBorder }, ri) => (
            <div key={ri} style={{
              display: "grid",
              gridTemplateColumns: `${C_TABLE_LABEL_W}px 1fr 1fr 1fr 1fr`,
              borderBottom: ri < tableRows.length - 1 ? "1px solid #f3f4f6" : "none",
              alignItems: "center",
            }}>
              {/* 行ラベル */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0" }}>
                <div style={{
                  width: 14, height: 14, flexShrink: 0,
                  backgroundColor: swatchColor,
                  border: swatchBorder ? `1.5px solid ${swatchBorder}` : undefined,
                  borderRadius: 2,
                }} />
                <span style={{
                  fontSize: 28, color: "#18191e",
                  fontFamily: "Gen Interface JP Display:Regular, sans-serif",
                }}>{label}</span>
              </div>
              {/* 値 */}
              {metric
                ? metric.formatted.slice(0, 4).map((v, i) => (
                    <div key={i} style={{
                      textAlign: "center", fontSize: 38, fontWeight: 500,
                      color: "#18191e",
                      fontFamily: "Gen Interface JP Display:Bold, sans-serif",
                      padding: "14px 0",
                    }}>{v}</div>
                  ))
                : [0, 1, 2, 3].map(i => (
                    <div key={i} style={{ textAlign: "center", color: "#9ca3af", padding: "14px 0" }}>-</div>
                  ))
              }
            </div>
          ))}
        </div>
      </SafeArea>
    </div>
  );
}
