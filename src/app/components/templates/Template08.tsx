import { SlideTemplateData } from "../../types/slide-template";
import { SafeArea } from "./SlideLayout";

interface Template08Data extends SlideTemplateData {
  title: string;
  headers: string[];
  rows: string[][];
  colors?: { accent: string; primary: string };
}

export default function Template08({ data }: { data: Template08Data }) {
  const accent = data.colors?.accent || '#c4ab46';
  const primary = data.colors?.primary || '#5969a7';
  const { headers, rows } = data;

  const headerTextColor = (() => {
    const hex = primary.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000000' : '#ffffff';
  })();

  // 「差」を含む列インデックスを差分列として扱う
  const diffColIndex = headers.findIndex(h => h.includes('差'));

  // 広告費は下がる方が良いので+/-の色を反転
  const INVERTED_ROWS = ['広告費'];

  const getDiffColor = (cell: string, rowLabel?: string) => {
    const t = cell.trim();
    const invert = rowLabel ? INVERTED_ROWS.includes(rowLabel) : false;
    if (t.startsWith('+')) return invert ? '#dc2626' : '#059669';
    if (t.startsWith('-')) return invert ? '#059669' : '#dc2626';
    return undefined;
  };

  const headerHeight = 72;
  const rowHeightPct = `${(100 - (headerHeight / (888 - 125)) * 100) / rows.length}%`;

  return (
    <div className="bg-white relative size-full" data-name="template08">
      <SafeArea>
        {/* Title */}
        <div className="absolute left-0 top-0">
          <p className="font-['Gen_Interface_JP_Display:Medium',sans-serif] leading-[normal] text-[#18191e] text-[64px] whitespace-nowrap">
            {data.title}
          </p>
        </div>

        {/* Table */}
        <div className="absolute left-0 right-0 top-[125px] h-full" style={{ bottom: 0, height: 'auto' }}>
          <table className="w-full border-collapse h-full" style={{ tableLayout: 'fixed', height: '100%' }}>
            <colgroup>
              <col style={{ width: 280 }} />
            </colgroup>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="text-left px-[40px] font-['Gen_Interface_JP_Display:SemiBold',sans-serif]"
                    style={{ backgroundColor: primary, color: headerTextColor, verticalAlign: 'middle', height: headerHeight, boxSizing: 'border-box', fontSize: i === 0 ? 32 : 36 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ height: rowHeightPct, backgroundColor: ri % 2 === 0 ? '#f5f5f5' : '#ffffff' }}>
                  {row.map((cell, ci) => {
                    const isDiffCol = ci === diffColIndex;
                    const diffColor = isDiffCol ? getDiffColor(cell, row[0]) : undefined;
                    return (
                      <td
                        key={ci}
                        className="px-[40px] font-['Gen_Interface_JP_Display:Regular',sans-serif] leading-[1.4]"
                        style={{
                          fontSize: ci === 0 ? 32 : 36,
                          color: diffColor || '#18191e',
                          fontWeight: isDiffCol ? 700 : ci === 0 ? 500 : 400,
                          verticalAlign: 'middle',
                        }}
                      >
                        {cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SafeArea>
    </div>
  );
}
