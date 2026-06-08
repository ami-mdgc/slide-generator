export interface SlideDefinition {
  name: string;
  templateId?: string;
  role: string;
  markdownFormat: string; // Gemini への出力形式指示
}

export interface SlideStructure {
  label: string;
  slides: SlideDefinition[];
}

const COVER_SLIDE: SlideDefinition = {
  name: "表紙",
  templateId: "templateCover",
  role: "プレゼンテーションのタイトルスライド",
  markdownFormat: `# [タイトル]\n\n[サブタイトル]\n\n[日付]`,
};

export const SLIDE_STRUCTURES: Record<string, SlideStructure> = {
  月次総会: {
    label: "月次総会",
    slides: [
      COVER_SLIDE,
      {
        name: "先月の振り返り",
        templateId: "template01",
        role: "先月の実績KPI・数値・達成状況のサマリー",
        markdownFormat: `# [タイトル（例：先月の振り返り（YYYY年MM月実績））]

- [成果・振り返り1（具体的な内容）]
- [成果・振り返り2]
- [成果・振り返り3]

事業売上: [金額]
前月参考: [前月の金額]
事業粗利: [金額]
前月参考: [前月の金額]
獲得金額: [金額]
前月参考: [前月の金額]`,
      },
      {
        name: "前月比較",
        templateId: "template08",
        role: "先月と今月のKPIを比較するテーブル",
        markdownFormat: `# 前月比較（[先月]月→[今月]月）

| 指標 | [先月]月結果 | [今月]月結果 | 前月差 |
|---|---|---|---|
| 事業売上 | ¥0 | ¥0 | ±¥0 |
| 広告費 | ¥0 | ¥0 | ±¥0 |
| 事業粗利 | ¥0 | ¥0 | ±¥0 |
| 獲得金額 | ¥0 | ¥0 | ±¥0 |
| CV数 | 0件 | 0件 | ±0件 |
| 顧客単価 | ¥0 | ¥0 | ±¥0 |`,
      },
      {
        name: "変動要因",
        templateId: "template02",
        role: "前月比の増加・減少要因の分析",
        markdownFormat: `# [タイトル（例：3→4月の変動要因）]

## [増加要因の見出し]
- [増加要因1（金額や数値を含む）]
- [増加要因2]
- [増加要因3]

## [減少要因の見出し]
- [減少要因1]
- [減少要因2]`,
      },
      {
        name: "今月のテーマと目標",
        templateId: "template03",
        role: "今月のテーマ・方針と目標KPI",
        markdownFormat: `# [タイトル（例：今月のテーマと目標（YYYY年MM月計画））]

## テーマ
[今月のテーマや方針を一言で]

## 目標
- 売上目標: [値]
- 新規顧客獲得: [件数]
- [KPI名]: [目標値]`,
      },
      {
        name: "今月の施策",
        templateId: "template04",
        role: "今月の具体的なアクションプラン・施策",
        markdownFormat: `# [タイトル（例：今月の施策）]

## [施策名1]
- **背景**
- [背景の説明]
- **打ち手**
- [具体的な施策内容]
- **狙い**
- [期待する効果]

## [施策名2]
- **背景**
- [背景の説明]
- **打ち手**
- [具体的な施策内容]
- **狙い**
- [期待する効果]

## [施策名3]
- **背景**
- [背景の説明]
- **打ち手**
- [具体的な施策内容]
- **狙い**
- [期待する効果]`,
      },
      {
        name: "事業数字の推移",
        templateId: "template07",
        role: "3期間（先々月・先月・当月目標）の売上・粗利・獲得金額の推移グラフ",
        markdownFormat: `# 事業数字の推移

事業売上: ¥0
前月参考: ¥0
事業粗利: ¥0
前月参考: ¥0
獲得金額: ¥0
前月参考: ¥0

## 先々月（MM月）
事業売上: ¥0
事業粗利: ¥0
獲得金額: ¥0

## 先月（MM月）
事業売上: ¥0
事業粗利: ¥0
獲得金額: ¥0

## 当月目標（MM月）
事業売上: ¥0
事業粗利: ¥0
獲得金額: ¥0`,
      },
      {
        name: "特記事項",
        templateId: "template05",
        role: "その他の重要情報・トピックス・今後の予定",
        markdownFormat: `# 特記事項

なしと書いている場合は、特記事項のスライドは飛ばしてください

**[見出し1]**
- [内容1]
- [内容2]

**[見出し2]**
- [内容1]
- [内容2]`,
      },
    ],
  },
  四半期報告: {
    label: "四半期報告",
    slides: [
      COVER_SLIDE,
      {
        name: "四半期サマリー",
        role: "四半期全体の業績サマリーと主要KPI",
        markdownFormat: `# 四半期サマリー

- [KPI1]: [実績]
- [KPI2]: [実績]
- [KPI3]: [実績]`,
      },
      {
        name: "KPI達成状況",
        role: "各KPIの目標対比・達成率の詳細",
        markdownFormat: `# KPI達成状況

## [KPI項目1]
- [達成率や実績の詳細]

## [KPI項目2]
- [達成率や実績の詳細]`,
      },
      {
        name: "課題と対策",
        role: "今期の課題と具体的な対応策",
        markdownFormat: `# 課題と対策

## [課題1]
- [課題の詳細]
- [対策内容]

## [課題2]
- [課題の詳細]
- [対策内容]`,
      },
      {
        name: "次四半期計画",
        role: "次四半期の目標・方針・施策",
        markdownFormat: `# 次四半期計画

## テーマ
[次四半期のテーマ]

## 目標
- [目標1]: [値]
- [目標2]: [値]`,
      },
    ],
  },
  提案資料: {
    label: "提案資料",
    slides: [
      COVER_SLIDE,
      {
        name: "課題の整理",
        role: "顧客が抱える現状の課題",
        markdownFormat: `# 課題の整理

## 現状
- [現状の問題点1]
- [現状の問題点2]

## 課題の本質
[課題の本質を一言で]`,
      },
      {
        name: "提案内容",
        role: "具体的なソリューションの提案",
        markdownFormat: `# 提案内容

## [提案の概要]

- [提案のポイント1]
- [提案のポイント2]
- [提案のポイント3]`,
      },
      {
        name: "期待効果",
        role: "導入による効果・メリット",
        markdownFormat: `# 期待効果

- **[効果1]**: [説明]
- **[効果2]**: [説明]
- **[効果3]**: [説明]`,
      },
      {
        name: "スケジュール・費用",
        role: "導入スケジュールと費用感",
        markdownFormat: `# スケジュール・費用

## スケジュール
- [フェーズ1]: [期間と内容]
- [フェーズ2]: [期間と内容]

## 費用
- [費用項目]: [金額]`,
      },
    ],
  },
  通常: {
    label: "通常",
    slides: [], // Geminiが自由に生成
  },
};

export const SUMMARY_SLIDE_DEFS: SlideDefinition[] = [
  {
    name: "月次サマリーグラフ",
    templateId: "template09",
    role: "全事業の売上・粗利の月次推移スタックグラフ",
    markdownFormat: `# 月次サマリー（[MM]月→[MM]月→[MM]月目標）

## 売上
みんなの買取: ¥X, ¥X, ¥X
不用品回収の窓口: ¥X, ¥X, ¥X
おそうじ合衆国: ¥X, ¥X, ¥X
gaiheki+: ¥X, ¥X, ¥X
解体相談所: ¥X, ¥X, ¥X
SENBATSU: ¥X, ¥X, ¥X
GEKITAI: ¥X, ¥X, ¥X

## 粗利
みんなの買取: ¥X, ¥X, ¥X
不用品回収の窓口: ¥X, ¥X, ¥X
おそうじ合衆国: ¥X, ¥X, ¥X
gaiheki+: ¥X, ¥X, ¥X
解体相談所: ¥X, ¥X, ¥X
SENBATSU: ¥X, ¥X, ¥X
GEKITAI: ¥X, ¥X, ¥X`,
  },
  {
    name: "各事業サマリー",
    templateId: "template10",
    role: "各事業の月次一言コメント",
    markdownFormat: `# 各事業サマリー（[MM]月）

みんなの買取: [一言コメント]
不用品回収の窓口: [一言コメント]
おそうじ合衆国: [一言コメント]
gaiheki+: [一言コメント]
解体相談所: [一言コメント]
SENBATSU: [一言コメント]
GEKITAI: [一言コメント]`,
  },
  {
    name: "メディア事業部総括",
    templateId: "template05",
    role: "メディア事業部全体の月次振り返りと課題",
    markdownFormat: `# メディア事業部総括

**今月の成果**
- [成果を記入]
- [成果を記入]

**課題と対策**
- [課題を記入]
- [課題を記入]

**来月の方針**
- [方針を記入]`,
  },
];

export const BUSINESS_COLORS: Record<string, { primary: string; accent: string }> = {
  不用品回収の窓口: { primary: "#FFDE35", accent: "#4ABFD7" },
  みんなの買取:     { primary: "#5969a7", accent: "#5969a7" },
  おそうじ合衆国:   { primary: "#47C3E6", accent: "#47C3E6" },
  "gaiheki+":       { primary: "#BB8DBE", accent: "#46C3E6" },
  解体相談所:       { primary: "#546366", accent: "#546366" },
  SENBATSU:         { primary: "#04A760", accent: "#04A760" },
  GEKITAI:          { primary: "#FA6E31", accent: "#FA6E31" },
};
