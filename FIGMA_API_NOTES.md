# Figma API連携に関する技術メモ

## 概要

このアプリケーションは、Figma REST APIを使用してデザインシステム（カラーバリアブル、テキストスタイル）を同期します。

## 実装内容

### エンドポイント

```
GET https://api.figma.com/v1/files/:file_key/variables/local
GET https://api.figma.com/v1/files/:file_key/styles
```

### 認証

Personal Access Token（PAT）を使用してAPI認証を行います。

## CORS制限について

### 開発環境

Figma APIは通常、ブラウザからの直接アクセスにCORS制限があります。

**対処方法:**

1. **ブラウザ拡張機能（開発時のみ）**
   - CORS Unblockerなどの拡張機能を使用
   - セキュリティリスクがあるため、開発時のみ使用推奨

2. **バックエンドプロキシ（推奨）**
   ```javascript
   // 例: Express.jsでのプロキシサーバー
   app.get('/api/figma/*', async (req, res) => {
     const figmaUrl = req.params[0];
     const response = await fetch(`https://api.figma.com/v1/${figmaUrl}`, {
       headers: {
         'X-Figma-Token': req.headers['x-figma-token']
       }
     });
     const data = await response.json();
     res.json(data);
   });
   ```

### 本番環境での推奨構成

```
ブラウザ
  ↓
Next.js/Express サーバー（プロキシ）
  ↓
Figma REST API
```

## セキュリティ考慮事項

### Personal Access Tokenの管理

- **ローカルストレージに保存**: 現在の実装（簡易版）
- **推奨**: サーバーサイドで暗号化して保存
- **本番環境**: 環境変数やシークレット管理サービスを使用

### トークンの権限

Figma PATには以下の権限スコープがあります：
- File content (read) - ファイル内容の読み取り
- File variables (read) - バリアブルの読み取り

最小限の権限のみを付与することを推奨します。

## 同期頻度

- **手動同期**: ユーザーが「同期」ボタンをクリック
- **自動同期（オプション）**: 
  - ページロード時に前回同期から一定時間経過していれば自動同期
  - 例: 24時間ごと

```typescript
// 自動同期の例
useEffect(() => {
  const lastSync = localStorage.getItem('lastSyncTime');
  const now = new Date().getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  
  if (!lastSync || (now - new Date(lastSync).getTime() > oneDay)) {
    // 自動同期実行
    handleAutoSync();
  }
}, []);
```

## エラーハンドリング

以下のエラーケースに対応：

1. **無効なアクセストークン** → ユーザーにトークン再入力を促す
2. **ファイルが見つからない** → URL確認を促す
3. **ネットワークエラー** → リトライ機能
4. **レート制限** → 適切な待機時間を設定

## 今後の拡張可能性

- [ ] テキストスタイルのフォントファミリー同期
- [ ] スペーシング変数の同期
- [ ] Figma Webhooksでのリアルタイム同期
- [ ] コンポーネントプロパティの同期
- [ ] プラグインとしての実装（CORS問題解消）

## 参考リンク

- [Figma API Documentation](https://www.figma.com/developers/api)
- [Variables API](https://www.figma.com/developers/api#variables)
- [Managing Personal Access Tokens](https://help.figma.com/hc/en-us/articles/8085703771159)
