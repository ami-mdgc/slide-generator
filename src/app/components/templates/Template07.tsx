import { SlideTemplateData } from "../../types/slide-template";

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
const C_W = 1728;
const C_H = 400;
const C_PAD_TOP = 32;
const C_PAD_BTM = 48;
const C_CHART_H = C_H - C_PAD_TOP - C_PAD_BTM; // 320px
const C_BASE_Y  = C_PAD_TOP + C_CHART_H;
const C_GX = [C_W * 0.22, C_W * 0.50, C_W * 0.78];
const C_BAR_W = 110;
const C_BAR_GAP = 14;

export default function Template07({ data }: { data: Template07Data }) {
  const accent  = data.colors?.accent  || "#c4ab46";
  const primary = data.colors?.primary || "#5969a7";
  const PRIMARY_LIGHT = primary + "55";

  const months = data.months.length >= 3
    ? data.months.slice(0, 3)
    : ["先々月", "先月", "当月目標"];

  const revenue     = data.chartMetrics.find(m => m.label.includes("売上"));
  const profit      = data.chartMetrics.find(m => m.label.includes("粗利"));
  const acquisition = data.chartMetrics.find(m => m.label.includes("獲得"));

  const allVals = [...(revenue?.values ?? []), ...(acquisition?.values ?? [])];
  const maxVal  = Math.max(...allVals, 1);
  const bH = (v: number) => (v / maxVal) * C_CHART_H;

  const revX = (i: number) => C_GX[i] - C_BAR_GAP / 2 - C_BAR_W;
  const acqX = (i: number) => C_GX[i] + C_BAR_GAP / 2;

  const tableRows: { metric: ChartMetric | undefined; label: string; swatchColor: string; swatchBorder?: string }[] = [
    { metric: revenue,     label: "事業売上", swatchColor: PRIMARY_LIGHT, swatchBorder: primary },
    { metric: profit,      label: "事業粗利", swatchColor: accent },
    { metric: acquisition, label: "獲得金額", swatchColor: "#34D399" },
  ];

  return (
    <div className="bg-white relative size-full overflow-hidden" data-name="template07">
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[10px]" style={{ backgroundColor: primary }} />

      {/* Title */}
      <div className="absolute left-[96px] top-[72px]">
        <p className="font-['Gen_Interface_JP_Display:Medium',sans-serif] text-[52px] text-[#18191e] whitespace-nowrap leading-none">
          {data.title}
        </p>
      </div>

      {/* ── CHART ────────────────────────────── */}
      <svg
        width={C_W} height={C_H}
        style={{ position: "absolute", left: 96, top: 148 }}
        overflow="visible"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(t => (
          <line key={t}
            x1={0} y1={C_PAD_TOP + C_CHART_H * (1 - t)}
            x2={C_W} y2={C_PAD_TOP + C_CHART_H * (1 - t)}
            stroke="#e5e7eb" strokeWidth={1} strokeDasharray="5 4"
          />
        ))}
        <line x1={0} y1={C_BASE_Y} x2={C_W} y2={C_BASE_Y} stroke="#d1d5db" strokeWidth={2} />

        {C_GX.map((_, i) => {
          const revH  = revenue     ? bH(revenue.values[i])     : 0;
          const profH = profit      ? bH(profit.values[i])      : 0;
          const acqH  = acquisition ? bH(acquisition.values[i]) : 0;
          const revTop = C_BASE_Y - revH;
          const acqTop = C_BASE_Y - acqH;
          const rx = revX(i);
          const ax = acqX(i);

          return (
            <g key={i}>
              {/* 売上バー上部（薄い） */}
              <rect x={rx} y={revTop} width={C_BAR_W} height={revH - profH}
                fill={PRIMARY_LIGHT} rx={4} />
              {/* 粗利部分（下、accent） */}
              <rect x={rx} y={C_BASE_Y - profH} width={C_BAR_W} height={profH}
                fill={accent} />
              {/* 獲得バー */}
              <rect x={ax} y={acqTop} width={C_BAR_W} height={acqH}
                fill="#34D399" opacity={i === 0 ? 0.55 : i === 1 ? 0.78 : 1} rx={4} />
              {/* X label */}
              <text x={C_GX[i]} y={C_BASE_Y + 32}
                textAnchor="middle" fontSize={20}
                fill="#18191e" fontFamily="Gen Interface JP Display:Medium, sans-serif">
                {months[i]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* ── TABLE ──────────────────────────────────────────── */}
      <div style={{ position: "absolute", left: 96, top: 568, width: C_W }}>
        {/* Header row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "180px 1fr 1fr 1fr",
          borderBottom: "2px solid #e5e7eb",
          paddingBottom: 8,
          marginBottom: 4,
        }}>
          <div />
          {months.map((m, i) => (
            <div key={i} style={{
              textAlign: "center",
              fontSize: 20,
              fontWeight: 600,
              color: "#6b7280",
              fontFamily: "Gen Interface JP Display:SemiBold, sans-serif",
            }}>{m}</div>
          ))}
        </div>

        {/* Data rows */}
        {tableRows.map(({ metric, label, swatchColor, swatchBorder }, ri) => (
          <div key={ri} style={{
            display: "grid",
            gridTemplateColumns: "180px 1fr 1fr 1fr",
            borderBottom: ri < tableRows.length - 1 ? "1px solid #f3f4f6" : "none",
            alignItems: "center",
          }}>
            {/* Row label */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0" }}>
              <div style={{
                width: 14, height: 14, flexShrink: 0,
                backgroundColor: swatchColor,
                border: swatchBorder ? `1.5px solid ${swatchBorder}` : undefined,
                borderRadius: 2,
              }} />
              <span style={{
                fontSize: 20, color: "#18191e",
                fontFamily: "Gen Interface JP Display:Regular, sans-serif",
              }}>{label}</span>
            </div>
            {/* Values */}
            {metric
              ? metric.formatted.slice(0, 3).map((v, i) => (
                  <div key={i} style={{
                    textAlign: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#18191e",
                    fontFamily: "Gen Interface JP Display:Bold, sans-serif",
                    padding: "14px 0",
                  }}>{v}</div>
                ))
              : [0, 1, 2].map(i => (
                  <div key={i} style={{ textAlign: "center", color: "#9ca3af", padding: "14px 0" }}>-</div>
                ))
            }
          </div>
        ))}
      </div>
    </div>
  );
}
