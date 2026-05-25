# Figma連携のCORS制限について

## 問題

Figma REST APIは、ブラウザから直接アクセスする際にCORS（Cross-Origin Resource Sharing）制限があります。
そのため、このWebアプリケーションから直接Figma APIを呼び出すことができません。

## エラーメッセージ

```
ネットワークエラーまたはCORS制限が発生しました。
Figma APIはブラウザからの直接アクセスに制限があります。
```

## 代替手段

### 方法1: JSONインポート機能を使用（推奨）

1. **Figmaでデザイントークンを手動でエクスポート**
   - Figmaファイルでカラーバリアブルの値を確認
   - 以下のJSON形式でコピー

2. **このアプリで「JSONインポート」ボタンをクリック**

3. **以下の形式でJSONを貼り付け**

```json
{
  "id": "my-design-system",
  "name": "営業資料デザインシステム",
  "colors": {
    "primary": "#1e40af",
    "secondary": "#64748b",
    "background": "#ffffff",
    "text": "#1e293b",
    "accent": "#3b82f6"
  },
  "fonts": {
    "heading": "system-ui, sans-serif",
    "body": "system-ui, sans-serif"
  },
  "layout": {
    "titleAlignment": "left",
    "contentPadding": "normal"
  }
}
```

### 方法2: Figmaプラグインを作成（上級者向け）

Figmaプラグインを作成して、デザイントークンをエクスポートする機能を実装できます。

**プラグインのメリット:**
- Figma内で直接実行できる
- CORS制限がない
- 自動化が可能

**参考:**
- [Figma Plugin API Documentation](https://www.figma.com/plugin-docs/)

### 方法3: バックエンドプロキシサーバーを構築（本番環境向け）

Next.jsやExpressなどのサーバーサイドでFigma APIを呼び出し、このアプリにデータを提供します。

**実装例（Next.js API Route）:**

```typescript
// pages/api/figma/sync.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { fileKey, accessToken } = req.body;

  try {
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/variables/local`,
      {
        headers: {
          'X-Figma-Token': accessToken,
        },
      }
    );

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Figma' });
  }
}
```

**クライアント側の変更:**

```typescript
// 現在のコード
const response = await fetch(`https://api.figma.com/v1/${endpoint}`, ...);

// プロキシ経由
const response = await fetch(`/api/figma/${endpoint}`, {
  method: 'POST',
  body: JSON.stringify({ fileKey, accessToken }),
});
```

## まとめ

現時点での推奨方法は **JSONインポート機能** です。

1. Figmaでカラーバリアブルの値を確認
2. JSON形式でコピー
3. このアプリの「JSONインポート」で貼り付け

これにより、Figmaのデザインシステムをこのアプリに簡単に反映できます。
