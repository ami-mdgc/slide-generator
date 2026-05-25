# Figmaデザインシステム作成ガイド

このアプリケーションと連携するFigmaデザインシステムを作成する手順です。

## 1. Figmaで新規ファイルを作成

1. Figmaを開く
2. 「New design file」をクリック
3. ファイル名を「営業資料デザインシステム」に変更

## 2. カラーバリアブルを作成

**Variables パネルを開く:**
- 右サイドバーの「Local variables」をクリック
- 「Create variable」→「Color」を選択

**以下のカラーバリアブルを作成:**

```
Primary Color
├─ 値: #1e40af (ブルー)
└─ 用途: メインカラー（見出しなど）

Secondary Color
├─ 値: #64748b (グレー)
└─ 用途: サブカラー（サブ見出しなど）

Background Color
├─ 値: #ffffff (ホワイト)
└─ 用途: スライド背景

Text Color
├─ 値: #1e293b (ダークグレー)
└─ 用途: 本文テキスト

Accent Color
├─ 値: #3b82f6 (ライトブルー)
└─ 用途: 強調表示
```

## 3. タイポグラフィ（テキストスタイル）を作成

**テキストツールで以下を作成:**

1. **Heading 1**
   - フォントサイズ: 48px
   - フォントウェイト: Bold (700)
   - カラー: Primary Color変数を適用

2. **Heading 2**
   - フォントサイズ: 36px
   - フォントウェイト: Bold (700)
   - カラー: Primary Color変数を適用

3. **Heading 3**
   - フォントサイズ: 24px
   - フォントウェイト: SemiBold (600)
   - カラー: Secondary Color変数を適用

4. **Body**
   - フォントサイズ: 18px
   - フォントウェイト: Regular (400)
   - カラー: Text Color変数を適用

**スタイルとして保存:**
- テキストを選択 → 右サイドバー「Text」の「＋」アイコン → 名前を付けて保存

## 4. スペーシング変数を作成

**Number 変数として作成:**

```
Padding/Compact = 32
Padding/Normal = 48
Padding/Spacious = 64
```

## 5. コンポーネントを作成

### SlideTitle コンポーネント

1. フレームを作成（W: 1280, H: 200）
2. Heading 1 テキストを配置
3. 右クリック → 「Create component」
4. 名前: "SlideTitle"

### BulletList コンポーネント

1. Auto layoutフレームを作成
2. 箇条書きアイコン（丸）+ Body テキスト
3. 複数行作成して縦にスタック
4. コンポーネント化
5. 名前: "BulletList"

## 6. ライブラリとして公開

1. 右上の「↑」（Share）をクリック
2. 「Publish」タブを選択
3. 「Publish library」をクリック
4. 変更内容を記述して公開

## 7. Personal Access Tokenを取得

### ⚠️ 重要: 正しいスコープを選択してください

1. Figma → Settings → Account
2. 「Personal access tokens」セクションまでスクロール
3. 「Create new token」をクリック
4. トークンに名前を付ける（例: "営業資料アプリ連携"）
5. **【最重要】Scopes で以下を必ず選択:**
   - ✅ **File variables** （Variables APIにアクセスするために必須！）
   - ✅ **File content** （推奨）
6. 「Generate token」をクリック
7. 生成されたトークンをコピー（`figd_` で始まる長い文字列）
8. ⚠️ **トークンは一度しか表示されません**。必ずコピーして安全な場所に保存してください

### トークンの確認方法

トークンが正しく作成されたか確認:
1. Settings → Account → Personal access tokens
2. 作成したトークンの「Scopes」列に「**File variables**」と「File content」が表示されているか確認
3. 「File variables」が表示されていない場合は、トークンを削除して再作成

### よくある問題

**403エラー「file_variables:read scope required」が出る場合:**
- トークン作成時に「**File variables**」スコープを選択し忘れています
- 新しいトークンを作成し、必ず「**File variables**」にチェックを入れてください
- これはVariables APIにアクセスするために絶対に必要です

**参考:**
[Figma公式: Personal Access Tokensの管理](https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens)

## 8. ファイルURLを取得

1. ブラウザのアドレスバーからURLをコピー
2. 形式: `https://www.figma.com/file/[FILE_KEY]/...`
3. `FILE_KEY`部分をメモ

## 次のステップ

ファイルURLとPersonal Access Tokenを控えたら、このアプリケーションに戻って連携設定を行います。

---

**参考:**
- [Figma Variables ドキュメント](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma)
- [Create and use components](https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma)
