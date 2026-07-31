import { useState, useEffect } from "react";
import { Slide } from "../utils/markdown-parser";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface SlideFormEditorProps {
  slide: Slide;
  onUpdate: (content: string) => void;
}

// --- Shared UI ---
function FL({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-muted-foreground mb-1">{children}</p>;
}
function FSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">{title}</p>
      {children}
    </div>
  );
}
function FRow({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-2">{children}</div>;
}

// --- templateCover ---
interface CoverForm { title: string; subtitle: string; date: string; }

function parseCover(c: string): CoverForm {
  const title = c.match(/^#\s+(.+)$/m)?.[1] ?? "";
  const lines = c.split("\n").filter(l => l.trim() && !l.startsWith("#"));
  return { title, subtitle: lines[0]?.trim() ?? "", date: lines[1]?.trim() ?? "" };
}
function serializeCover(f: CoverForm): string {
  return `# ${f.title}\n\n${f.subtitle}\n\n${f.date}`;
}

function CoverFormFields({ content, onUpdate }: { content: string; onUpdate: (s: string) => void }) {
  const [f, setF] = useState(() => parseCover(content));
  useEffect(() => setF(parseCover(content)), [content]);
  const upd = (patch: Partial<CoverForm>) => {
    const next = { ...f, ...patch };
    setF(next);
    onUpdate(serializeCover(next));
  };
  return (
    <div className="space-y-4">
      <div><FL>タイトル</FL><Input value={f.title} onChange={e => upd({ title: e.target.value })} placeholder="プレゼンテーションタイトル" /></div>
      <div><FL>サブタイトル</FL><Input value={f.subtitle} onChange={e => upd({ subtitle: e.target.value })} placeholder="サブタイトル（任意）" /></div>
      <div><FL>日付</FL><Input value={f.date} onChange={e => upd({ date: e.target.value })} placeholder="例: 2024年5月" /></div>
    </div>
  );
}

// --- template01 ---
interface KpiRow { name: string; value: string; }
interface MetricRow { name: string; value: string; reference: string; target: string; }
interface T01Form { title: string; kpis: KpiRow[]; metrics: MetricRow[]; }

const DEFAULT_METRIC_NAMES = ["事業売上", "事業粗利", "獲得金額"];

function parseT01(c: string): T01Form {
  const title = c.match(/^#\s+(.+)$/m)?.[1] ?? "";
  const kpis: KpiRow[] = [];
  const metrics: MetricRow[] = [];
  const isMetricStart = (l: string) => /^(事業売上|事業粗利|獲得金額|営業利益)[:：]/.test(l) || /[:：]\s*¥/.test(l);
  let inMetrics = false;
  for (const line of c.split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    if (isMetricStart(line)) inMetrics = true;
    if (!inMetrics) {
      if (line.startsWith("-") || line.startsWith("*")) kpis.push({ name: "", value: line.replace(/^[-*]\s*/, "").trim() });
      continue;
    }
    const m = line.match(/^(.+?)[:：]\s*(.+)$/);
    if (!m) continue;
    const label = m[1].trim();
    const value = m[2].trim();
    if (label === '目標') {
      if (metrics.length > 0) metrics[metrics.length - 1].target = value;
    } else if (label.includes('参考') || label.includes('前月')) {
      if (metrics.length > 0) metrics[metrics.length - 1].reference = value;
    } else if (metrics.length < 3) {
      metrics.push({ name: label, value, reference: "", target: "" });
    }
  }
  while (kpis.length < 3) kpis.push({ name: "", value: "" });
  while (metrics.length < 3) metrics.push({ name: DEFAULT_METRIC_NAMES[metrics.length] ?? "", value: "", reference: "", target: "" });
  return { title, kpis: kpis.slice(0, 3), metrics: metrics.slice(0, 3) };
}
function serializeT01(f: T01Form): string {
  const kpiLines = f.kpis.filter(k => k.value).map(k => `- ${k.value}`).join("\n");
  const metricLines = f.metrics.map(m =>
    `${m.name}: ${m.value}\n前月参考: ${m.reference}\n目標: ${m.target}`
  ).join("\n");
  return `# ${f.title}\n\n${kpiLines}\n\n${metricLines}`;
}

function T01FormFields({ content, onUpdate }: { content: string; onUpdate: (s: string) => void }) {
  const [f, setF] = useState(() => parseT01(content));
  useEffect(() => setF(parseT01(content)), [content]);
  const upd = (patch: Partial<T01Form>) => {
    const next = { ...f, ...patch };
    setF(next);
    onUpdate(serializeT01(next));
  };
  const updKpi = (i: number, patch: Partial<KpiRow>) => {
    const kpis = f.kpis.map((k, idx) => idx === i ? { ...k, ...patch } : k);
    upd({ kpis });
  };
  const updMetric = (i: number, patch: Partial<MetricRow>) => {
    const metrics = f.metrics.map((m, idx) => idx === i ? { ...m, ...patch } : m);
    upd({ metrics });
  };
  return (
    <div className="space-y-5">
      <div><FL>タイトル</FL><Input value={f.title} onChange={e => upd({ title: e.target.value })} /></div>
      <FSection title="振り返りポイント">
        {f.kpis.map((kpi, i) => (
          <Input key={i} value={kpi.value} onChange={e => updKpi(i, { value: e.target.value })} placeholder={`振り返り${i + 1}`} />
        ))}
      </FSection>
      <FSection title="実績KPI">
        {f.metrics.map((m, i) => (
          <div key={i} className="space-y-1.5 p-2.5 rounded-lg bg-muted/40">
            <p className="text-xs font-medium text-muted-foreground">{m.name}</p>
            <FRow>
              <span className="text-xs text-muted-foreground whitespace-nowrap self-center">実績</span>
              <Input className="flex-1" value={m.value} onChange={e => updMetric(i, { value: e.target.value })} placeholder="¥0" />
            </FRow>
            <FRow>
              <span className="text-xs text-muted-foreground whitespace-nowrap self-center">前月参考</span>
              <Input className="flex-1" value={m.reference} onChange={e => updMetric(i, { reference: e.target.value })} placeholder="¥0" />
            </FRow>
            <FRow>
              <span className="text-xs text-muted-foreground whitespace-nowrap self-center">目標</span>
              <Input className="flex-1" value={m.target} onChange={e => updMetric(i, { target: e.target.value })} placeholder="¥0" />
            </FRow>
          </div>
        ))}
      </FSection>
    </div>
  );
}

// --- template02 ---
interface T02Section { heading: string; items: string[]; }
interface T02Form { title: string; sections: T02Section[]; }

function parseT02(c: string): T02Form {
  const title = c.match(/^#\s+(.+)$/m)?.[1] ?? "";
  const sections: T02Section[] = [];
  for (const m of c.matchAll(/##\s+(.+?)\n([\s\S]*?)(?=##|$)/g)) {
    const items = m[2].split("\n")
      .filter(l => l.trim().startsWith("-"))
      .map(l => l.replace(/^-\s+/, "").trim());
    sections.push({ heading: m[1].trim(), items: items.length ? items : ["", "", ""] });
  }
  while (sections.length < 2) sections.push({ heading: "", items: ["", "", ""] });
  return { title, sections: sections.slice(0, 2) };
}
function serializeT02(f: T02Form): string {
  const secs = f.sections.map(s =>
    `## ${s.heading}\n${s.items.filter(Boolean).map(i => `- ${i}`).join("\n")}`
  ).join("\n\n");
  return `# ${f.title}\n\n${secs}`;
}

function T02FormFields({ content, onUpdate }: { content: string; onUpdate: (s: string) => void }) {
  const [f, setF] = useState(() => parseT02(content));
  useEffect(() => setF(parseT02(content)), [content]);
  const upd = (patch: Partial<T02Form>) => {
    const next = { ...f, ...patch };
    setF(next);
    onUpdate(serializeT02(next));
  };
  const updSection = (si: number, patch: Partial<T02Section>) => {
    const sections = f.sections.map((s, i) => i === si ? { ...s, ...patch } : s);
    upd({ sections });
  };
  const updItem = (si: number, ii: number, val: string) => {
    const items = f.sections[si].items.map((item, i) => i === ii ? val : item);
    updSection(si, { items });
  };
  return (
    <div className="space-y-5">
      <div><FL>タイトル</FL><Input value={f.title} onChange={e => upd({ title: e.target.value })} /></div>
      {f.sections.map((sec, si) => (
        <FSection key={si} title={`セクション${si + 1}`}>
          <div><FL>見出し</FL><Input value={sec.heading} onChange={e => updSection(si, { heading: e.target.value })} placeholder="例：増加要因" /></div>
          {[0, 1, 2].map(ii => (
            <div key={ii}>
              <FL>項目{ii + 1}</FL>
              <Input value={sec.items[ii] ?? ""} onChange={e => updItem(si, ii, e.target.value)} placeholder="内容を入力" />
            </div>
          ))}
        </FSection>
      ))}
    </div>
  );
}

// --- template03 ---
interface GoalRow { name: string; value: string; projected: string; }
interface T03Form { title: string; theme: string; goals: GoalRow[]; }

function parseT03(c: string): T03Form {
  const title = c.match(/^#\s+(.+)$/m)?.[1] ?? "";
  const theme = c.match(/##\s*テーマ\s*\n(.+)/)?.[1]?.trim() ?? "";
  const goals: GoalRow[] = [];
  const goalSection = c.match(/##\s*目標\s*\n([\s\S]+)/)?.[1] ?? "";
  for (const line of goalSection.split("\n")) {
    const m = line.match(/^[-*]?\s*(.+?)[:：]\s*(.+)$/);
    if (!m) continue;
    const label = m[1].trim();
    const value = m[2].trim();
    if (label.includes('想定着地')) {
      if (goals.length > 0) goals[goals.length - 1].projected = value;
    } else if (!label.includes('参考') && !label.includes('前月')) {
      if (goals.length < 3) goals.push({ name: label, value, projected: "" });
    }
  }
  while (goals.length < 3) goals.push({ name: "", value: "", projected: "" });
  return { title, theme, goals: goals.slice(0, 3) };
}
function serializeT03(f: T03Form): string {
  const goalLines = f.goals.map(g =>
    `${g.name}: ${g.value}\n想定着地: ${g.projected || '---'}`
  ).join("\n");
  return `# ${f.title}\n\n## テーマ\n${f.theme}\n\n## 目標\n${goalLines}`;
}

function T03FormFields({ content, onUpdate }: { content: string; onUpdate: (s: string) => void }) {
  const [f, setF] = useState(() => parseT03(content));
  useEffect(() => setF(parseT03(content)), [content]);
  const upd = (patch: Partial<T03Form>) => {
    const next = { ...f, ...patch };
    setF(next);
    onUpdate(serializeT03(next));
  };
  const updGoal = (i: number, patch: Partial<GoalRow>) => {
    const goals = f.goals.map((g, idx) => idx === i ? { ...g, ...patch } : g);
    upd({ goals });
  };
  return (
    <div className="space-y-5">
      <div><FL>タイトル</FL><Input value={f.title} onChange={e => upd({ title: e.target.value })} /></div>
      <div><FL>今月のテーマ</FL><Input value={f.theme} onChange={e => upd({ theme: e.target.value })} placeholder="テーマを一言で" /></div>
      <FSection title="目標KPI">
        {f.goals.map((g, i) => (
          <div key={i} className="space-y-1.5 p-2.5 rounded-lg bg-muted/40">
            <FRow>
              <Input className="flex-1" value={g.name} onChange={e => updGoal(i, { name: e.target.value })} placeholder={`目標${i + 1}名`} />
              <Input className="w-28" value={g.value} onChange={e => updGoal(i, { value: e.target.value })} placeholder="目標値" />
            </FRow>
            <FRow>
              <span className="text-xs text-muted-foreground whitespace-nowrap self-center">想定着地</span>
              <Input className="flex-1" value={g.projected} onChange={e => updGoal(i, { projected: e.target.value })} placeholder="想定着地（例：¥0）" />
            </FRow>
          </div>
        ))}
      </FSection>
    </div>
  );
}

// --- template04 ---
interface Initiative { name: string; background: string; approach: string; goal: string; }
interface T04Form { title: string; initiatives: Initiative[]; }

function parseT04(c: string): T04Form {
  const title = c.match(/^#\s+(.+)$/m)?.[1] ?? "";
  const initiatives: Initiative[] = [];
  for (const m of c.matchAll(/##\s+(.+?)\n([\s\S]*?)(?=##|$)/g)) {
    const sec = m[2];
    const bg = sec.match(/\*\*背景\*\*\s*\n[-*]\s*(.+)/)?.[1]?.trim() ?? "";
    const ap = sec.match(/\*\*打ち手\*\*\s*\n[-*]\s*(.+)/)?.[1]?.trim() ?? "";
    const gl = sec.match(/\*\*狙い\*\*\s*\n[-*]\s*(.+)/)?.[1]?.trim() ?? "";
    initiatives.push({ name: m[1].trim(), background: bg, approach: ap, goal: gl });
  }
  while (initiatives.length < 3) initiatives.push({ name: "", background: "", approach: "", goal: "" });
  return { title, initiatives: initiatives.slice(0, 3) };
}
function serializeT04(f: T04Form): string {
  const secs = f.initiatives.map(i =>
    `## ${i.name}\n- **背景**\n- ${i.background}\n- **打ち手**\n- ${i.approach}\n- **狙い**\n- ${i.goal}`
  ).join("\n\n");
  return `# ${f.title}\n\n${secs}`;
}

function T04FormFields({ content, onUpdate }: { content: string; onUpdate: (s: string) => void }) {
  const [f, setF] = useState(() => parseT04(content));
  useEffect(() => setF(parseT04(content)), [content]);
  const upd = (patch: Partial<T04Form>) => {
    const next = { ...f, ...patch };
    setF(next);
    onUpdate(serializeT04(next));
  };
  const updInit = (i: number, patch: Partial<Initiative>) => {
    const initiatives = f.initiatives.map((init, idx) => idx === i ? { ...init, ...patch } : init);
    upd({ initiatives });
  };
  return (
    <div className="space-y-5">
      <div><FL>タイトル</FL><Input value={f.title} onChange={e => upd({ title: e.target.value })} /></div>
      {f.initiatives.map((init, i) => (
        <FSection key={i} title={`施策${i + 1}`}>
          <div><FL>施策名</FL><Input value={init.name} onChange={e => updInit(i, { name: e.target.value })} placeholder="施策名" /></div>
          <div><FL>背景</FL><Input value={init.background} onChange={e => updInit(i, { background: e.target.value })} placeholder="背景の説明" /></div>
          <div><FL>打ち手</FL><Input value={init.approach} onChange={e => updInit(i, { approach: e.target.value })} placeholder="具体的な施策内容" /></div>
          <div><FL>狙い</FL><Input value={init.goal} onChange={e => updInit(i, { goal: e.target.value })} placeholder="期待する効果" /></div>
        </FSection>
      ))}
    </div>
  );
}

// --- template05 ---
interface TopicRow { heading: string; text: string; }
interface T05Form { title: string; subtitle: string; topics: TopicRow[]; }

function parseT05(c: string): T05Form {
  const title = c.match(/^#\s+(.+)$/m)?.[1] ?? "";
  const subtitle = c.match(/##\s+(.+)$/m)?.[1] ?? "";
  const topics: TopicRow[] = [];
  for (const m of c.matchAll(/[-*]\s+\*\*(.+?)\*\*[:：]?\s*(.+)/g)) {
    if (topics.length < 3) topics.push({ heading: m[1].trim(), text: m[2].trim() });
  }
  while (topics.length < 3) topics.push({ heading: "", text: "" });
  return { title, subtitle, topics: topics.slice(0, 3) };
}
function serializeT05(f: T05Form): string {
  const topicLines = f.topics.map(t => `- **${t.heading}**: ${t.text}`).join("\n");
  return `# ${f.title}\n\n## ${f.subtitle}\n${topicLines}`;
}

function T05FormFields({ content, onUpdate }: { content: string; onUpdate: (s: string) => void }) {
  const [f, setF] = useState(() => parseT05(content));
  useEffect(() => setF(parseT05(content)), [content]);
  const upd = (patch: Partial<T05Form>) => {
    const next = { ...f, ...patch };
    setF(next);
    onUpdate(serializeT05(next));
  };
  const updTopic = (i: number, patch: Partial<TopicRow>) => {
    const topics = f.topics.map((t, idx) => idx === i ? { ...t, ...patch } : t);
    upd({ topics });
  };
  return (
    <div className="space-y-5">
      <div><FL>タイトル</FL><Input value={f.title} onChange={e => upd({ title: e.target.value })} /></div>
      <div><FL>サブタイトル</FL><Input value={f.subtitle} onChange={e => upd({ subtitle: e.target.value })} placeholder="例：注目トピックス" /></div>
      <FSection title="トピック">
        {f.topics.map((t, i) => (
          <div key={i} className="space-y-1.5 p-3 rounded-lg bg-muted/50">
            <Input value={t.heading} onChange={e => updTopic(i, { heading: e.target.value })} placeholder={`トピック名${i + 1}`} className="text-xs" />
            <Input value={t.text} onChange={e => updTopic(i, { text: e.target.value })} placeholder="説明" className="text-xs" />
          </div>
        ))}
      </FSection>
    </div>
  );
}

// --- template06 KPIグラフ ---
interface T06MonthForm { label: string; values: { label: string; value: string }[]; }
interface T06Form { title: string; months: T06MonthForm[]; }

const DEFAULT_METRICS = ["事業売上", "事業粗利", "獲得金額"];

function parseT06(c: string): T06Form {
  const title = c.match(/^#\s+(.+)$/m)?.[1] ?? "";
  const months: T06MonthForm[] = [];
  const sectionRe = /##\s+(.+?)\n([\s\S]*?)(?=\n##|$)/g;
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(c)) !== null) {
    const label = m[1].trim();
    const lines = m[2].split("\n").filter(l => l.trim());
    const values = lines
      .map(line => { const mm = line.match(/^(.+?)[:：]\s*(.+)$/); return mm ? { label: mm[1].trim(), value: mm[2].trim() } : null; })
      .filter(Boolean) as { label: string; value: string }[];
    months.push({ label, values: values.length ? values : DEFAULT_METRICS.map(l => ({ label: l, value: "" })) });
  }
  if (months.length === 0) {
    ["先々月", "先月", "当月目標"].forEach(label =>
      months.push({ label, values: DEFAULT_METRICS.map(l => ({ label: l, value: "" })) })
    );
  }
  return { title, months };
}
function serializeT06(f: T06Form): string {
  const sections = f.months.map(month =>
    `## ${month.label}\n${month.values.map(v => `${v.label}: ${v.value}`).join("\n")}`
  ).join("\n\n");
  return `# ${f.title}\n\n${sections}`;
}

function T06FormFields({ content, onUpdate }: { content: string; onUpdate: (s: string) => void }) {
  const [f, setF] = useState(() => parseT06(content));
  useEffect(() => setF(parseT06(content)), [content]);
  const upd = (patch: Partial<T06Form>) => {
    const next = { ...f, ...patch };
    setF(next);
    onUpdate(serializeT06(next));
  };
  const updMonth = (mi: number, patch: Partial<T06MonthForm>) => {
    const months = f.months.map((m, i) => i === mi ? { ...m, ...patch } : m);
    upd({ months });
  };
  const updValue = (mi: number, vi: number, value: string) => {
    const months = f.months.map((m, i) => {
      if (i !== mi) return m;
      const values = m.values.map((v, j) => j === vi ? { ...v, value } : v);
      return { ...m, values };
    });
    upd({ months });
  };
  return (
    <div className="space-y-5">
      <div><FL>タイトル</FL><Input value={f.title} onChange={e => upd({ title: e.target.value })} placeholder="月次KPIグラフ" /></div>
      {f.months.map((month, mi) => (
        <FSection key={mi} title={`${mi + 1}列目`}>
          <div><FL>期間ラベル</FL><Input value={month.label} onChange={e => updMonth(mi, { label: e.target.value })} placeholder="先々月（3月）" /></div>
          {month.values.map((v, vi) => (
            <FRow key={vi}>
              <div className="w-24 shrink-0"><FL>{v.label}</FL></div>
              <Input value={v.value} onChange={e => updValue(mi, vi, e.target.value)} placeholder="¥0" />
            </FRow>
          ))}
        </FSection>
      ))}
    </div>
  );
}

// --- Free-form (no template) ---
function FreeFormFields({ content, onUpdate }: { content: string; onUpdate: (s: string) => void }) {
  const [val, setVal] = useState(content);
  useEffect(() => setVal(content), [content]);
  return (
    <div>
      <FL>マークダウン</FL>
      <Textarea
        value={val}
        onChange={e => { setVal(e.target.value); onUpdate(e.target.value); }}
        className="font-mono text-xs resize-none min-h-[300px]"
        placeholder={"# タイトル\n\n- 箇条書き1\n- 箇条書き2"}
      />
    </div>
  );
}

// --- Main export ---
export function SlideFormEditor({ slide, onUpdate }: SlideFormEditorProps) {
  const [rawMode, setRawMode] = useState(false);

  const formProps = { content: slide.content, onUpdate };

  const formContent = () => {
    if (rawMode) return <FreeFormFields {...formProps} />;
    switch (slide.templateId) {
      case "templateCover": return <CoverFormFields {...formProps} />;
      case "template01":    return <T01FormFields {...formProps} />;
      case "template02":    return <T02FormFields {...formProps} />;
      case "template03":    return <T03FormFields {...formProps} />;
      case "template04":    return <T04FormFields {...formProps} />;
      case "template05":    return <T05FormFields {...formProps} />;
      case "template06":    return <T06FormFields {...formProps} />;
      default:              return <FreeFormFields {...formProps} />;
    }
  };

  const hasStructuredForm = slide.templateId && slide.templateId !== "";

  return (
    <div className="flex flex-col gap-4">
      {formContent()}
      {hasStructuredForm && (
        <button
          onClick={() => setRawMode(p => !p)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 text-left"
        >
          {rawMode ? "フォームで編集" : "マークダウンで直接編集"}
        </button>
      )}
    </div>
  );
}
