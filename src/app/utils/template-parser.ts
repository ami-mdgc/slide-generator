import { Slide } from "./markdown-parser";
import { SlideTemplateData } from "../types/slide-template";

interface ParsedSlideMetadata {
  slideType?: string;
  date?: string;
  [key: string]: any;
}

export function parseSlideMetadata(markdown: string): ParsedSlideMetadata {
  const metadata: ParsedSlideMetadata = {};

  // Extract frontmatter (YAML between ---)
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const lines = frontmatter.split('\n');

    lines.forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        metadata[key] = value.trim();
      }
    });
  }

  return metadata;
}

export function parseTemplate01Data(slide: Slide, content: string): SlideTemplateData {
  const lines = content.split('\n').filter(line => line.trim());

  // Extract title
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : slide.title || '';

  const summaryItems: { text: string }[] = [];
  const metrics: { label: string; value: string; reference?: string }[] = [];

  // metrics セクションの開始を判定（¥マーク or 既知のメトリクス名）
  const isMetricStart = (line: string) =>
    /^(事業売上|事業粗利|獲得金額|営業利益)[:：]/.test(line) ||
    /[:：]\s*¥/.test(line);

  let currentSection = 'summary';

  lines.forEach(line => {
    if (line.startsWith('#')) return;

    if (isMetricStart(line)) currentSection = 'metrics';

    if (currentSection === 'summary') {
      if (line.startsWith('-') || line.startsWith('*')) {
        summaryItems.push({ text: line.trim() });
      } else {
        // コロンあり・なしどちらもサマリーに追加
        summaryItems.push({ text: line.trim() });
      }
    } else {
      const metricMatch = line.match(/(.+?)[:：]\s*(.+)/);
      if (metricMatch) {
        const [, label, value] = metricMatch;
        if (label.includes('参考') || label.includes('前月')) {
          if (metrics.length > 0) metrics[metrics.length - 1].reference = line.trim();
        } else {
          metrics.push({ label: label.trim(), value: value.trim() });
        }
      }
    }
  });

  // Fill in default metrics if not enough
  while (metrics.length < 3) {
    metrics.push({
      label: '事業売上',
      value: '¥37,249,030',
      reference: '3月参考：¥37,249,030',
    });
  }

  return {
    title,
    summaryItems: summaryItems.slice(0, 3),
    metrics: metrics.slice(0, 3),
  };
}

export function parseTemplate02Data(slide: Slide, content: string): SlideTemplateData {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : slide.title || '';

  const sections: { heading: string; subheading: string; items: string[] }[] = [];
  const sectionMatches = content.matchAll(/##\s+(.+?)\n([^#]+)/g);

  for (const match of sectionMatches) {
    const heading = match[1].trim();
    const sectionContent = match[2];

    const lines = sectionContent.split('\n');
    const subheadingMatch = lines.find(line => /^\*\*(.+)\*\*$/.test(line.trim()));
    const subheading = subheadingMatch
      ? subheadingMatch.trim().replace(/^\*\*|\*\*$/g, '')
      : '';

    const items = lines
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^[-]\s+/, '').trim());

    sections.push({
      heading: heading,
      subheading,
      items: items.length > 0 ? items : ['テキストテキストテキスト'],
    });
  }

  return { title, sections };
}

export function parseTemplate03Data(slide: Slide, content: string): SlideTemplateData {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : slide.title || '';

  const themeMatch = content.match(/##\s*テーマ\s*\n([\s\S]+?)(?=\n##|$)/);
  const theme = {
    label: '今月のテーマ',
    text: themeMatch ? themeMatch[1].trim().replace(/[「」]/g, '') : '',
  };

  const metrics: { label: string; value: string; reference: string }[] = [];
  const goalSection = content.match(/##\s*目標\s*\n([\s\S]+?)(?=\n##|$)/);

  if (goalSection) {
    const lines = goalSection[1].split('\n').filter(l => l.trim());
    for (const line of lines) {
      const metricMatch = line.match(/(.+?)[:：]\s*(.+)/);
      if (!metricMatch) continue;
      const [, label, value] = metricMatch;
      if (label.includes('参考') || label.includes('前月')) {
        if (metrics.length > 0) {
          metrics[metrics.length - 1].reference = line.trim();
        }
      } else {
        metrics.push({ label: label.trim(), value: value.trim(), reference: '' });
      }
    }
  }

  return { title, theme, metrics: metrics.slice(0, 3) };
}

export function parseTemplate04Data(slide: Slide, content: string): SlideTemplateData {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : slide.title || '';

  const initiatives: { smallHeading: string; heading: string; items: { label: string; text: string }[] }[] = [];
  const sectionMatches = content.matchAll(/##\s+(.+?)\n([\s\S]*?)(?=##|$)/g);

  let sectionIndex = 0;
  for (const match of sectionMatches) {
    const heading = match[1].trim();
    const sectionContent = match[2];

    const items: { label: string; text: string }[] = [];
    const listMatches = sectionContent.matchAll(/[-*]\s+\*\*(.+?)\*\*\s*\n\s*[-*]\s+(.+)/g);

    for (const listMatch of listMatches) {
      items.push({
        label: listMatch[1].trim(),
        text: listMatch[2].trim(),
      });
    }

    if (items.length === 0) {
      items.push({ label: '背景', text: 'テキストテキストテキスト' });
      items.push({ label: '打ち手', text: 'テキストテキストテキスト' });
      items.push({ label: '狙い', text: 'テキストテキストテキスト' });
    }

    initiatives.push({
      smallHeading: `施策${sectionIndex + 1}`,
      heading: heading,
      items,
    });
    sectionIndex++;
  }

  return { title, initiatives };
}

export function parseTemplate05Data(slide: Slide, content: string): SlideTemplateData {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : slide.title || '';

  const sections: { heading: string; items: string[] }[] = [];
  const blocks = content.split(/^(?=\*\*)/m);

  for (const block of blocks) {
    const headingMatch = block.match(/^\*\*(.+?)\*\*/);
    if (!headingMatch) continue;
    const heading = headingMatch[1].trim();
    const items = block
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim());
    // Trim leading/trailing empty items
    while (items.length > 0 && items[0] === '') items.shift();
    while (items.length > 0 && items[items.length - 1] === '') items.pop();
    sections.push({ heading, items });
  }

  return { title, sections };
}

export function parseTemplateCoverData(slide: Slide, content: string): SlideTemplateData {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : slide.title || '';

  const lines = content.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
  const subtitle = lines[0]?.trim() || '';
  const date = lines[1]?.trim() || '';

  return { title, subtitle, date };
}

export function parseTemplate06Data(slide: Slide, content: string): SlideTemplateData {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : slide.title || '';

  // Extract ## sections as months
  const sectionRe = /##\s+(.+?)\n([\s\S]*?)(?=\n##|$)/g;
  const months: string[] = [];
  // label → [value per month]
  const metricMap: Record<string, { values: number[]; formatted: string[] }> = {};
  const metricOrder: string[] = [];

  const parseNum = (s: string) => parseInt(s.replace(/[¥,\s]/g, ''), 10) || 0;

  let match: RegExpExecArray | null;
  while ((match = sectionRe.exec(content)) !== null) {
    const monthLabel = match[1].trim();
    months.push(monthLabel);
    const sectionContent = match[2];

    const lines = sectionContent.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const m = line.match(/^(.+?)[:：]\s*(.+)$/);
      if (!m) continue;
      const label = m[1].trim();
      const raw = m[2].trim();
      if (!metricMap[label]) {
        metricMap[label] = { values: [], formatted: [] };
        metricOrder.push(label);
      }
      metricMap[label].values.push(parseNum(raw));
      metricMap[label].formatted.push(raw);
    }
  }

  const metrics = metricOrder.map(label => ({
    label,
    values: metricMap[label].values,
    formatted: metricMap[label].formatted,
  }));

  return { title, months, metrics };
}

export function parseTemplate07Data(slide: Slide, content: string): SlideTemplateData {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : slide.title || '';

  // Summary bullets (before first ## section)
  const beforeSections = content.replace(/^---.*$/m, '').split(/\n##/)[0];
  const summaryItems = beforeSections
    .split('\n')
    .filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'))
    .map(l => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);

  // KPI metrics (label: value / 前月参考: value pattern)
  const kpis: { label: string; value: string; reference?: string }[] = [];
  const metricLines = beforeSections.split('\n').filter(l => !l.startsWith('#') && !l.startsWith('-') && !l.startsWith('*'));
  for (const line of metricLines) {
    const m = line.match(/^(.+?)[:：]\s*(.+)$/);
    if (!m) continue;
    const [, label, value] = m;
    if (label.includes('参考') || label.includes('前月')) {
      if (kpis.length > 0) kpis[kpis.length - 1].reference = line.trim();
    } else {
      kpis.push({ label: label.trim(), value: value.trim() });
    }
  }

  // Chart data (## sections)
  const parseNum = (s: string) => parseInt(s.replace(/[¥,\s]/g, ''), 10) || 0;
  const months: string[] = [];
  const metricMap: Record<string, { values: number[]; formatted: string[] }> = {};
  const metricOrder: string[] = [];
  const sectionRe = /##\s+(.+?)\n([\s\S]*?)(?=\n##|$)/g;
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(content)) !== null) {
    months.push(m[1].trim());
    for (const line of m[2].split('\n').filter(l => l.trim())) {
      const mm = line.match(/^(.+?)[:：]\s*(.+)$/);
      if (!mm) continue;
      const label = mm[1].trim();
      const raw   = mm[2].trim();
      if (!metricMap[label]) { metricMap[label] = { values: [], formatted: [] }; metricOrder.push(label); }
      metricMap[label].values.push(parseNum(raw));
      metricMap[label].formatted.push(raw);
    }
  }
  const chartMetrics = metricOrder.map(label => ({ label, ...metricMap[label] }));

  return { title, summaryItems, kpis, months, chartMetrics };
}

export function parseTemplate08Data(slide: Slide, content: string): SlideTemplateData {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : slide.title || '';

  const tableLines = content.split('\n').filter(l => l.trim().startsWith('|'));
  const parseRow = (line: string) =>
    line.split('|').slice(1, -1).map(cell => cell.trim());

  const headers = tableLines.length > 0 ? parseRow(tableLines[0]) : [];
  const rows = tableLines.length > 2 ? tableLines.slice(2).map(parseRow) : [];

  return { title, headers, rows };
}

export function parseTemplate09Data(slide: Slide, content: string): SlideTemplateData {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : slide.title || '';

  // タイトルから月を抽出（例: 月次サマリー（4月→5月→6月目標））
  const monthsMatch = title.match(/[（(](.+?)[）)]/);
  const months = monthsMatch
    ? monthsMatch[1].split(/[→\->]/).map(s => s.trim())
    : ['先々月', '先月', '今月'];

  // チャート用カラー（白背景で視認しやすい色、事業順）
  const CHART_COLORS_LIST = ['#5969a7', '#FFDE35', '#47C3E6', '#BB8DBE', '#546366', '#04A760', '#FA6E31'];

  const parseSection = (sectionContent: string) => {
    let bizIdx = 0;
    const result: { name: string; color: string; values: number[] }[] = [];
    for (const line of sectionContent.split('\n')) {
      const m = line.match(/^(.+?)[:：]\s*(.+)$/);
      if (!m) continue;
      const name = m[1].trim();
      // 桁区切りカンマ（数字と数字の間）を除去してから値を分割
      const cleaned = m[2].replace(/(\d),(\d)/g, '$1$2');
      const values = cleaned.split(/,\s*/).map(v => parseInt(v.replace(/[¥\s]/g, ''), 10) || 0);
      const color = CHART_COLORS_LIST[bizIdx] || '#94a3b8';
      bizIdx++;
      result.push({ name, color, values });
    }
    return result;
  };

  const sections = content.split(/^##\s+/m);
  const revenueRaw = sections.find(s => s.startsWith('売上'));
  const profitRaw  = sections.find(s => s.startsWith('粗利'));

  return {
    title,
    months,
    revenues: revenueRaw ? parseSection(revenueRaw) : [],
    profits:  profitRaw  ? parseSection(profitRaw)  : [],
  };
}

export function parseTemplate10Data(slide: Slide, content: string): SlideTemplateData {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : slide.title || '';

  const CHART_COLORS_LIST = ['#5969a7', '#FFDE35', '#47C3E6', '#BB8DBE', '#546366', '#04A760', '#FA6E31'];

  let bizIdx = 0;
  const businesses: { name: string; comment: string; color: string }[] = [];

  for (const line of content.split('\n')) {
    if (line.startsWith('#')) continue;
    const m = line.match(/^(.+?)[:：]\s*(.+)$/);
    if (!m) continue;
    const name = m[1].trim();
    const comment = m[2].trim();
    const color = CHART_COLORS_LIST[bizIdx] || '#18191e';
    bizIdx++;
    businesses.push({ name, comment, color });
  }

  return { title, businesses };
}

export function parseTemplateData(
  templateId: string,
  slide: Slide,
  content: string,
  colors?: { accent: string; primary: string }
): SlideTemplateData {
  const c = colors || { accent: '#c4ab46', primary: '#5969a7' };

  switch (templateId) {
    case 'templateCover':
      return { ...parseTemplateCoverData(slide, content), colors: c };
    case 'template01':
      return { ...parseTemplate01Data(slide, content), colors: c };
    case 'template02':
      return { ...parseTemplate02Data(slide, content), colors: c };
    case 'template03':
      return { ...parseTemplate03Data(slide, content), colors: c };
    case 'template04':
      return { ...parseTemplate04Data(slide, content), colors: c };
    case 'template05':
      return { ...parseTemplate05Data(slide, content), colors: c };
    case 'template06':
      return { ...parseTemplate06Data(slide, content), colors: c };
    case 'template07':
      return { ...parseTemplate07Data(slide, content), colors: c };
    case 'template08':
      return { ...parseTemplate08Data(slide, content), colors: c };
    case 'template09':
      return { ...parseTemplate09Data(slide, content), colors: c };
    case 'template10':
      return { ...parseTemplate10Data(slide, content), colors: c };
    default:
      return { title: slide.title || '', content, colors: c };
  }
}
