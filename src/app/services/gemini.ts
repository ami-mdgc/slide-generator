import { SlideDefinition } from "../data/slide-structures";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export function getApiKey(): string {
  return localStorage.getItem("gemini_api_key") || "";
}

export function setApiKey(key: string) {
  localStorage.setItem("gemini_api_key", key);
}

async function call(prompt: string): Promise<string> {
  const key = getApiKey();
  if (!key) throw new Error("APIキーが設定されていません");

  const res = await fetch(`${GEMINI_API_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `APIエラー: ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

/** テンプレート構成に原稿を当てはめてスライドを生成 */
export async function generateSlidesWithStructure(
  rawText: string,
  slides: SlideDefinition[]
): Promise<{ slideIndex: number; content: string }[]> {
  const structureDesc = slides
    .map(
      (s, i) =>
        `### スライド${i + 1}「${s.name}」\n役割: ${s.role}\n出力形式:\n${s.markdownFormat}`
    )
    .join("\n\n");

  const prompt = `あなたは営業資料スライド作成の専門家です。
以下の原稿を分析し、指定されたスライド構成の各スライドの内容を生成してください。

## スライド構成と出力形式

${structureDesc}

## 原稿
${rawText}

## 指示
- 原稿の情報を各スライドの「役割」に合わせて振り分ける
- 原稿にない情報は補完しない（空欄または「—」とする）
- 各スライドは上記「出力形式」の構造を忠実に守る
- 数値・KPIは原稿から正確に抜き出す
- 以下のJSONのみ返す（説明不要）

{"slides":[{"slideIndex":0,"content":"..."},{"slideIndex":1,"content":"..."}]}`;

  const text = await call(prompt);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("スライドの生成に失敗しました");

  const parsed = JSON.parse(match[0]);
  return parsed.slides as { slideIndex: number; content: string }[];
}

/** 通常タイプ用：自由生成 */
export async function generateSlidesFromText(
  rawText: string
): Promise<{ title: string; content: string }[]> {
  const prompt = `あなたはプレゼンテーション作成の専門家です。
以下の原稿をビジネスプレゼンテーションのスライドに変換してください。

【原稿】
${rawText}

【出力形式】JSONのみ返してください（説明不要）
{"slides":[{"title":"タイトル","content":"# タイトル\n\n- 項目1\n- 項目2"}]}

【ルール】
- 1枚に詰め込みすぎない（箇条書き最大5項目）
- 重要な数値は**太字**
- スライド枚数は3〜7枚`;

  const text = await call(prompt);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("スライドの生成に失敗しました");

  const parsed = JSON.parse(match[0]);
  return parsed.slides;
}

/** AI修正アシスタント */
export async function editSlideWithAI(
  currentContent: string,
  instruction: string
): Promise<string> {
  const prompt = `あなたはプレゼンテーション編集アシスタントです。
以下のスライドを指示に従って修正してください。

【現在のスライド】
${currentContent}

【修正指示】
${instruction}

【ルール】
- 修正後のマークダウンのみを返す（説明不要）
- 既存の形式・構造を維持する
- 元の情報を不用意に削除しない`;

  return await call(prompt);
}
