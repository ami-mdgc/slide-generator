import { SlideTemplateData } from "../../types/slide-template";

interface MetricData {
  label: string;
  values: number[];
  formatted: string[];
}

interface Template06Data extends SlideTemplateData {
  title: string;
  months: string[];
  metrics: MetricData[];
  colors?: { accent: string; primary: string };
}

const SVG_W = 1680;
const SVG_H = 700;
const PAD_TOP = 72;
const PAD_BTM = 80;
const PAD_L   = 24;
const CHART_H = SVG_H - PAD_TOP - PAD_BTM; // 548px
const BASE_Y  = PAD_TOP + CHART_H;          // 620

// 3 group X centers
const GX = [
  PAD_L + (SVG_W - PAD_L * 2) * 0.2,
  PAD_L + (SVG_W - PAD_L * 2) * 0.5,
  PAD_L + (SVG_W - PAD_L * 2) * 0.8,
];

const BAR_W = 140; // width per bar
const BAR_GAP = 20; // gap between 売上 bar and 獲得 bar in a group

export default function Template06({ data }: { data: Template06Data }) {
  const accent  = data.colors?.accent  || "#c4ab46";
  const primary = data.colors?.primary || "#5969a7";

  const months = data.months.length >= 3
    ? data.months.slice(0, 3)
    : ["先々月", "先月", "当月目標"];

  const revenue     = data.metrics.find(m => m.label.includes("売上"));
  const profit      = data.metrics.find(m => m.label.includes("粗利"));
  const acquisition = data.metrics.find(m => m.label.includes("獲得"));

  // 全バーを同一スケールで（売上が最大になるはず）
  const allVals = [
    ...(revenue?.values ?? []),
    ...(acquisition?.values ?? []),
  ];
  const maxVal = Math.max(...allVals, 1);

  const bH = (v: number) => (v / maxVal) * CHART_H;

  // 売上バー左端・獲得バー左端
  const revBarX = (i: number) => GX[i] - BAR_GAP / 2 - BAR_W;
  const acqBarX = (i: number) => GX[i] + BAR_GAP / 2;

  // 粗利の不透明度（薄い primary で残りを塗る）
  const PRIMARY_LIGHT = primary + "55"; // 33% opacity

  return (
    <div className="bg-white relative size-full overflow-hidden" data-name="template06">
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[10px]" style={{ backgroundColor: primary }} />

      {/* Title */}
      <div className="absolute left-[96px] top-[72px]">
        <p className="font-['Gen_Interface_JP_Display:Medium',sans-serif] text-[58px] text-[#18191e] whitespace-nowrap leading-none">
          {data.title}
        </p>
      </div>

      <svg
        width={SVG_W} height={SVG_H}
        style={{ position: "absolute", left: 120, top: 190 }}
        overflow="visible"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(t => (
          <line key={t}
            x1={PAD_L} y1={PAD_TOP + CHART_H * (1 - t)}
            x2={SVG_W - PAD_L} y2={PAD_TOP + CHART_H * (1 - t)}
            stroke="#e5e7eb" strokeWidth={1} strokeDasharray="6 4"
          />
        ))}

        {/* Baseline */}
        <line x1={PAD_L} y1={BASE_Y} x2={SVG_W - PAD_L} y2={BASE_Y}
          stroke="#d1d5db" strokeWidth={2} />

        {GX.map((_, i) => {
          const revH   = revenue     ? bH(revenue.values[i])     : 0;
          const profH  = profit      ? bH(profit.values[i])      : 0;
          const acqH   = acquisition ? bH(acquisition.values[i]) : 0;

          const revTop = BASE_Y - revH;
          const acqTop = BASE_Y - acqH;

          const rx = revBarX(i);
          const ax = acqBarX(i);

          return (
            <g key={i}>
              {/* ── 売上バー（上部: 売上-粗利 部分、薄い primary） ── */}
              <rect
                x={rx} y={revTop}
                width={BAR_W} height={revH - profH}
                fill={PRIMARY_LIGHT}
                rx={5} ry={5}
              />
              {/* ── 粗利部分（下部、accent） ── */}
              <rect
                x={rx} y={BASE_Y - profH}
                width={BAR_W} height={profH}
                fill={accent}
                rx={0}
              />
              {/* 上角を丸く見せる補完（粗利が小さいとき） */}
              {profH > 0 && revH - profH > 8 && (
                <rect x={rx} y={revTop} width={BAR_W} height={8}
                  fill={PRIMARY_LIGHT} />
              )}

              {/* 売上 合計ラベル */}
              {revenue && (
                <text x={rx + BAR_W / 2} y={revTop - 10}
                  textAnchor="middle" fontSize={19}
                  fill="#18191e" fontFamily="Gen Interface JP, sans-serif" fontWeight="700">
                  {revenue.formatted[i]}
                </text>
              )}

              {/* 粗利 ラベル（セル内） */}
              {profit && profH > 36 && (
                <text x={rx + BAR_W / 2} y={BASE_Y - profH / 2 + 7}
                  textAnchor="middle" fontSize={17}
                  fill="white" fontFamily="Gen Interface JP, sans-serif" fontWeight="700">
                  {profit.formatted[i]}
                </text>
              )}

              {/* ── 獲得バー ── */}
              <rect
                x={ax} y={acqTop}
                width={BAR_W} height={acqH}
                fill="#34D399"
                rx={5}
              />
              {acquisition && (
                <text x={ax + BAR_W / 2} y={acqTop - 10}
                  textAnchor="middle" fontSize={19}
                  fill="#18191e" fontFamily="Gen Interface JP, sans-serif" fontWeight="700">
                  {acquisition.formatted[i]}
                </text>
              )}

              {/* X-axis label */}
              <text x={GX[i]} y={BASE_Y + 44}
                textAnchor="middle" fontSize={26}
                fill="#18191e" fontFamily="Gen Interface JP Display:Medium, sans-serif">
                {months[i]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute flex items-center"
        style={{ bottom: 36, left: "50%", transform: "translateX(-50%)", gap: 40, whiteSpace: "nowrap" }}>
        {revenue && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 14, backgroundColor: PRIMARY_LIGHT, borderRadius: 3, border: `1px solid ${primary}` }} />
            <span className="font-['Gen_Interface_JP_Display:Regular',sans-serif]"
              style={{ fontSize: 22, color: "#18191e" }}>{revenue.label}</span>
          </div>
        )}
        {profit && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 14, backgroundColor: accent, borderRadius: 3 }} />
            <span className="font-['Gen_Interface_JP_Display:Regular',sans-serif]"
              style={{ fontSize: 22, color: "#18191e" }}>{profit.label}（売上内訳）</span>
          </div>
        )}
        {acquisition && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 20, height: 14, backgroundColor: "#34D399", borderRadius: 3 }} />
            <span className="font-['Gen_Interface_JP_Display:Regular',sans-serif]"
              style={{ fontSize: 22, color: "#18191e" }}>{acquisition.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
