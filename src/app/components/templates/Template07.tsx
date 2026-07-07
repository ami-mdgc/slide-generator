import { SlideTemplateData } from "../../types/slide-template";
import { SafeArea } from "./SlideLayout";

interface ChartMetric {
  label: string;
  values: number[];
  formatted: string[];
}

interface Template07Data extends SlideTemplateData {
  title: string;
  summaryItems: string[];
  kpis: { label: string; value: string; reference?: string }[];
  months: string[];
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
const C_LABEL_W       = 80;   // 左Y軸ラベル幅
const C_RIGHT_LABEL_W = 80;   // 右Y軸ラベル幅
const C_TABLE_LABEL_W = 140;  // テーブル行ラベル幅
const C_CHART_RIGHT   = C_W - C_RIGHT_LABEL_W; // 1648px
const C_COL_W         = (C_CHART_RIGHT - C_TABLE_LABEL_W) / 3;
const C_GX            = [0, 1, 2].map(i => C_TABLE_LABEL_W + C_COL_W * (i + 0.5));
const C_BAR_W         = 130;

export default function Template07({ data }: { data: Template07Data }) {
  const accent      = data.colors?.accent  || "#c4ab46";
  const primary     = data.colors?.primary || "#5969a7";
  const PRIMARY_LIGHT = primary + "55";


  const months = data.months.length >= 3
    ? data.months.slice(0, 3)
    : ["先々月", "先月", "当月目標"];

  const revenue     = data.chartMetrics.find(m => m.label.includes("売上"));
  const profit      = data.chartMetrics.find(m => m.label.includes("粗利"));
  const acquisition = data.chartMetrics.find(m => m.label.includes("獲得"));

  // 左Y軸スケール（売上・粗利）
  const leftVals = [...(revenue?.values ?? []), ...(profit?.values ?? [])];
  const leftRawMax = Math.max(...leftVals, 1);
  const STEP    = 10_000_000;
  const maxTick = Math.ceil(leftRawMax / STEP) * STEP;
  const tickVals = Array.from({ length: maxTick / STEP }, (_, i) => (i + 1) * STEP);
  const bH = (v: number) => (v / maxTick) * C_CHART_H;

  // 右Y軸スケール（獲得金額）
  const acqVals    = acquisition?.values ?? [];
  const acqRawMax  = Math.max(...acqVals, 1);
  const ACQ_STEP   = 1_000_000;
  const acqMaxTick = Math.ceil(acqRawMax / ACQ_STEP) * ACQ_STEP;
  const acqTickVals = Array.from({ length: acqMaxTick / ACQ_STEP }, (_, i) => (i + 1) * ACQ_STEP);
  const acqBH = (v: number) => (v / acqMaxTick) * C_CHART_H;
  const acqPt = (i: number): [number, number] => [C_GX[i], C_BASE_Y - acqBH(acqVals[i] ?? 0)];

  const revX = (i: number) => C_GX[i] - C_BAR_W / 2;

  const tableRows: { metric: ChartMetric | undefined; label: string; swatchColor: string; swatchBorder?: string; isLine?: boolean }[] = [
    { metric: revenue,     label: "事業売上", swatchColor: PRIMARY_LIGHT, swatchBorder: primary },
    { metric: profit,      label: "事業粗利", swatchColor: primary },
    { metric: acquisition, label: "獲得金額", swatchColor: accent, isLine: true },
  ];

  return (
    <div className="bg-white relative size-full overflow-hidden" data-name="template07">
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
        {/* 左Y軸グリッド・ラベル */}
        <text x={C_LABEL_W - 8} y={C_BASE_Y - 16}
          textAnchor="end" fontSize={18} fill="#9ca3af"
          fontFamily="Gen Interface JP Display:Regular, sans-serif">
          <tspan x={C_LABEL_W - 8} dy="0">（売上・</tspan>
          <tspan x={C_LABEL_W - 8} dy="22">粗利）</tspan>
        </text>
        {tickVals.map(val => {
          const y = C_PAD_TOP + C_CHART_H * (1 - val / maxTick);
          const label = `${(val / 10_000).toLocaleString()}万`;
          return (
            <g key={val}>
              <line x1={C_LABEL_W} y1={y} x2={C_CHART_RIGHT} y2={y}
                stroke="#e5e7eb" strokeWidth={1} strokeDasharray="5 4" />
              <text x={C_LABEL_W - 8} y={y + 6}
                textAnchor="end" fontSize={18} fill="#9ca3af"
                fontFamily="Gen Interface JP Display:Regular, sans-serif">
                {label}
              </text>
            </g>
          );
        })}
        <line x1={C_LABEL_W} y1={C_BASE_Y} x2={C_CHART_RIGHT} y2={C_BASE_Y}
          stroke="#d1d5db" strokeWidth={2} />

        {/* 右Y軸ラベル（獲得金額） */}
        <text x={C_CHART_RIGHT + 10} y={C_BASE_Y + 6}
          textAnchor="start" fontSize={18} fill="#9ca3af"
          fontFamily="Gen Interface JP Display:Regular, sans-serif">
          （獲得）
        </text>
        {acqTickVals.map(val => {
          const y = C_PAD_TOP + C_CHART_H * (1 - val / acqMaxTick);
          const label = `${(val / 10_000).toLocaleString()}万`;
          return (
            <text key={val} x={C_CHART_RIGHT + 10} y={y + 6}
              textAnchor="start" fontSize={18} fill="#9ca3af"
              fontFamily="Gen Interface JP Display:Regular, sans-serif">
              {label}
            </text>
          );
        })}
        {/* 右Y軸ライン */}
        <line x1={C_CHART_RIGHT} y1={C_PAD_TOP} x2={C_CHART_RIGHT} y2={C_BASE_Y}
          stroke="#d1d5db" strokeWidth={1} />

        {/* バー（売上＋粗利スタック）*/}
        {C_GX.map((_, i) => {
          const revH  = revenue ? bH(revenue.values[i])  : 0;
          const profH = profit  ? bH(profit.values[i])   : 0;
          const revTop  = C_BASE_Y - revH;
          const rx = revX(i);
          return (
            <g key={i}>
              <rect x={rx} y={revTop} width={C_BAR_W} height={revH - profH}
                fill={PRIMARY_LIGHT} rx={4} />
              <rect x={rx} y={C_BASE_Y - profH} width={C_BAR_W} height={profH}
                fill={primary} />
              {/* X label */}
              <text x={C_GX[i]} y={C_BASE_Y + 32}
                textAnchor="middle" fontSize={20} fill="#18191e"
                fontFamily="Gen Interface JP Display:Medium, sans-serif">
                {months[i].match(/(\d+月)/)?.[1] ?? months[i]}
              </text>
            </g>
          );
        })}

        {/* 折れ線（獲得金額）*/}
        {acquisition && acqVals.length >= 2 && (
          <>
            <polyline
              points={C_GX.map((_, i) => acqPt(i).join(",")).join(" ")}
              fill="none" stroke={accent} strokeWidth={3}
            />
            {C_GX.map((_, i) => {
              const [cx, cy] = acqPt(i);
              return <circle key={i} cx={cx} cy={cy} r={7} fill={accent} />;
            })}
          </>
        )}
      </svg>

      {/* ── TABLE ──────────────────────────────────────────── */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
        {tableRows.map(({ metric, label, swatchColor, swatchBorder, isLine }, ri) => (
          <div key={ri} style={{
            display: "grid",
            gridTemplateColumns: `${C_TABLE_LABEL_W}px 1fr 1fr 1fr ${C_RIGHT_LABEL_W}px`,
            borderBottom: ri < tableRows.length - 1 ? "1px solid #f3f4f6" : "none",
            alignItems: "center",
          }}>
            {/* Row label */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0" }}>
              {isLine ? (
                <svg width={20} height={14} style={{ flexShrink: 0 }}>
                  <line x1={0} y1={7} x2={20} y2={7} stroke={swatchColor} strokeWidth={2.5} />
                  <circle cx={10} cy={7} r={4} fill={swatchColor} />
                </svg>
              ) : (
                <div style={{
                  width: 14, height: 14, flexShrink: 0,
                  backgroundColor: swatchColor,
                  border: swatchBorder ? `1.5px solid ${swatchBorder}` : undefined,
                  borderRadius: 2,
                }} />
              )}
              <span style={{
                fontSize: 28, color: "#18191e",
                fontFamily: "Gen Interface JP Display:Regular, sans-serif",
              }}>{label}</span>
            </div>
            {/* Values */}
            {metric
              ? metric.formatted.slice(0, 3).map((v, i) => (
                  <div key={i} style={{
                    textAlign: "center", fontSize: 38, fontWeight: 500,
                    color: "#18191e",
                    fontFamily: "Gen Interface JP Display:Bold, sans-serif",
                    padding: "14px 0",
                  }}>{v}</div>
                ))
              : [0, 1, 2].map(i => (
                  <div key={i} style={{ textAlign: "center", color: "#9ca3af", padding: "14px 0" }}>-</div>
                ))
            }
            {/* 右ラベル列スペーサー */}
            <div />
          </div>
        ))}
      </div>
      </SafeArea>
    </div>
  );
}
