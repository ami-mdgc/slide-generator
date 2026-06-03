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

[KPI名1]: [実績値（達成率など）]
[KPI名2]: [実績値]
[KPI名3]: [実績値]

事業売上: [金額]
前月参考: [前月の金額]`,
      },
      {
        name: "KPIグラフ",
        templateId: "template06",
        role: "先々月・先月・当月目標の売上・粗利・獲得金額の棒グラフ比較",
        markdownFormat: `# 月次KPIグラフ

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
        markdownFormat: `# [タイトル（例：特記事項）]

## [サブタイトル（例：注目トピックス・今後の予定）]
- **[トピック名1]**: [説明]
- **[トピック名2]**: [説明]
- **[トピック名3]**: [説明]`,
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

export const BUSINESS_COLORS: Record<string, { primary: string; accent: string }> = {
  不用品回収の窓口: { primary: "#FFDE35", accent: "#4ABFD7" },
  みんなの買取:     { primary: "#5969a7", accent: "#5969a7" },
  おそうじ合衆国:   { primary: "#059669", accent: "#10b981" },
  "gaiheki+":       { primary: "#BB8DBE", accent: "#46C3E6" },
  解体相談所:       { primary: "#FF5C25", accent: "#FF5C25" },
};
