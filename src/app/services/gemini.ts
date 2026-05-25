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
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `APIエラー: ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export interface GeneratedSlide {
  title: string;
  content: string;
}

export async function generateSlidesFromText(
  rawText: string,
  slideType: string
): Promise<GeneratedSlide[]> {
  const prompt = `あなたはプレゼンテーション作成の専門家です。
以下の原稿・メモを、ビジネスプレゼンテーションのスライド構成に変換してください。
スライドタイプ: ${slideType}

【原稿・メモ】
${rawText}

【出力形式】
以下のJSON形式のみで返してください。説明文や前置きは不要です。

{
  "slides": [
    {
      "title": "スライドタイトル",
      "content": "# タイトル\n\n- 箇条書き1\n- 箇条書き2\n\n**重要な数値や情報**"
    }
  ]
}

【ルール】
- contentはマークダウン形式で記述する
- 1枚のスライドに詰め込みすぎない（箇条書きは最大5項目）
- タイトルは簡潔に（15文字以内）
- 重要な数値・KPIは**太字**にする
- スライド枚数は原稿の量に応じて3〜8枚程度`;

  const text = await call(prompt);

  // JSONを抽出
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("スライドの生成に失敗しました");

  const parsed = JSON.parse(match[0]);
  return parsed.slides as GeneratedSlide[];
}

export async function editSlideWithAI(
  currentContent: string,
  instruction: string
): Promise<string> {
  const prompt = `あなたはプレゼンテーション編集アシスタントです。
以下のスライドコンテンツに対して、指示に従って修正してください。

【現在のスライドコンテンツ】
${currentContent}

【修正指示】
${instruction}

【ルール】
- 修正後のマークダウンコンテンツのみを返す
- 説明文や前置きは一切不要
- マークダウンの形式を保つ
- 元の情報を不用意に削除しない`;

  return await call(prompt);
}
