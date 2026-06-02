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

  // Extract summary items (lines with bullet points or key-value pairs)
  const summaryItems: { text: string }[] = [];
  const metrics: { label: string; value: string; reference?: string }[] = [];

  let currentSection = 'summary';

  lines.forEach(line => {
    // Skip title line
    if (line.startsWith('#')) return;

    // Detect metrics section
    if (line.includes('事業売上') || line.includes('3月参考')) {
      currentSection = 'metrics';
    }

    if (currentSection === 'summary') {
      // Parse bullet points or key-value pairs
      if (line.startsWith('-') || line.startsWith('*')) {
        summaryItems.push({ text: line.substring(1).trim() });
      } else if (line.includes(':')) {
        summaryItems.push({ text: line.trim() });
      }
    } else if (currentSection === 'metrics') {
      // Parse metrics
      const metricMatch = line.match(/(.+?)[:：]\s*(.+)/);
      if (metricMatch) {
        const [, label, value] = metricMatch;

        // Check if it's a reference line
        if (label.includes('参考') || label.includes('前月')) {
          if (metrics.length > 0) {
            metrics[metrics.length - 1].reference = line.trim();
          }
        } else {
          metrics.push({
            label: label.trim(),
            value: value.trim(),
          });
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

  // Fill in default summary items if not enough
  while (summaryItems.length < 3) {
    summaryItems.push({
      text: 'テキストテキストテキストテキストテキスト',
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

  while (sections.length < 2) {
    sections.push({
      heading: '中見出し',
      subheading: '小見出し',
      items: ['テキストテキストテキスト'],
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
      .map(line => line.replace(/^-\s*/, '').trim())
      .filter(Boolean);
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
    default:
      return { title: slide.title || '', content, colors: c };
  }
}
