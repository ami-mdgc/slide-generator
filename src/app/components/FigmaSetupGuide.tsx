import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { BookOpen, ExternalLink } from "lucide-react";

export function FigmaSetupGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3">
          <BookOpen className="h-4 w-4" />
          セットアップガイド
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Figmaデザインシステム作成ガイド</DialogTitle>
          <DialogDescription>
            Figmaでデザインシステムを作成する手順を説明します
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-auto max-h-[70vh] pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <h3 className="mb-2">1. Figmaで新規ファイルを作成</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Figmaを開く</li>
                <li>「New design file」をクリック</li>
                <li>ファイル名を「営業資料デザインシステム」に変更</li>
              </ol>
            </section>

            <section>
              <h3 className="mb-2">2. カラーバリアブルを作成</h3>
              <p className="mb-2 text-muted-foreground">Variables パネルを開く:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
                <li>右サイドバーの「Local variables」をクリック</li>
                <li>「Create variable」→「Color」を選択</li>
              </ul>

              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div>
                  <p className="font-medium">Primary Color</p>
                  <p className="text-xs text-muted-foreground">値: #1e40af (ブルー)</p>
                  <p className="text-xs text-muted-foreground">用途: メインカラー（見出しなど）</p>
                </div>

                <div>
                  <p className="font-medium">Secondary Color</p>
                  <p className="text-xs text-muted-foreground">値: #64748b (グレー)</p>
                  <p className="text-xs text-muted-foreground">用途: サブカラー（サブ見出しなど）</p>
                </div>

                <div>
                  <p className="font-medium">Background Color</p>
                  <p className="text-xs text-muted-foreground">値: #ffffff (ホワイト)</p>
                  <p className="text-xs text-muted-foreground">用途: スライド背景</p>
                </div>

                <div>
                  <p className="font-medium">Text Color</p>
                  <p className="text-xs text-muted-foreground">値: #1e293b (ダークグレー)</p>
                  <p className="text-xs text-muted-foreground">用途: 本文テキスト</p>
                </div>

                <div>
                  <p className="font-medium">Accent Color</p>
                  <p className="text-xs text-muted-foreground">値: #3b82f6 (ライトブルー)</p>
                  <p className="text-xs text-muted-foreground">用途: 強調表示</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="mb-2">3. タイポグラフィ（テキストスタイル）を作成</h3>
              <div className="space-y-3">
                <div className="bg-muted p-3 rounded">
                  <p className="font-medium">Heading 1（または H1）</p>
                  <p className="text-xs text-muted-foreground">フォントサイズ: 48px / フォントウェイト: Bold (700) / 行間: 1.2</p>
                  <p className="text-xs text-muted-foreground">カラー: Primary Color変数を適用</p>
                </div>

                <div className="bg-muted p-3 rounded">
                  <p className="font-medium">Heading 2（または H2）</p>
                  <p className="text-xs text-muted-foreground">フォントサイズ: 36px / フォントウェイト: Bold (700) / 行間: 1.3</p>
                  <p className="text-xs text-muted-foreground">カラー: Primary Color変数を適用</p>
                </div>

                <div className="bg-muted p-3 rounded">
                  <p className="font-medium">Heading 3（または H3）</p>
                  <p className="text-xs text-muted-foreground">フォントサイズ: 24px / フォントウェイト: SemiBold (600) / 行間: 1.4</p>
                  <p className="text-xs text-muted-foreground">カラー: Secondary Color変数を適用</p>
                </div>

                <div className="bg-muted p-3 rounded">
                  <p className="font-medium">Body（または Paragraph）</p>
                  <p className="text-xs text-muted-foreground">フォントサイズ: 18px / フォントウェイト: Regular (400) / 行間: 1.5</p>
                  <p className="text-xs text-muted-foreground">カラー: Text Color変数を適用</p>
                </div>
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                💡 スタイルとして保存: テキストを選択 → 右サイドバー「Text」の「＋」アイコン → 名前を付けて保存
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                ⚠️ 重要: スタイル名に「H1」「H2」「H3」「Body」などを含めてください（アプリが自動認識します）
              </p>
            </section>

            <section>
              <h3 className="mb-2">4. スペーシング（余白）を設定（オプション）</h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Frameを作成して、Auto layoutでスペーシングを定義すると、スライドの余白が自動適用されます
              </p>

              <div className="bg-muted p-3 rounded space-y-2">
                <p className="font-medium text-sm">「Slide Template」という名前のFrameを作成</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-2">
                  <li>Padding Top: 64px（上の余白）</li>
                  <li>Padding Bottom: 64px（下の余白）</li>
                  <li>Padding Left/Right: 80px（左右の余白）</li>
                  <li>Item spacing: 24px（コンテンツ間の間隔）</li>
                </ul>
              </div>

              <div className="bg-muted p-3 rounded space-y-2 mt-3">
                <p className="font-medium text-sm">「List」という名前のFrameを作成</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-2">
                  <li>Item spacing: 16px（箇条書き項目の間隔）</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="mb-2">5. ライブラリとして公開</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>右上の「↑」（Share）をクリック</li>
                <li>「Publish」タブを選択</li>
                <li>「Publish library」をクリック</li>
                <li>変更内容を記述して公開</li>
              </ol>
            </section>

            <section>
              <h3 className="mb-2">6. ファイルURLを取得</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2 mb-3">
                <li>ブラウザのアドレスバーからURLをコピー</li>
                <li>このアプリの「Figma連携」に貼り付け</li>
              </ol>

              <p className="text-xs text-muted-foreground mb-2">対応するURL形式:</p>
              <div className="bg-muted p-3 rounded space-y-1 text-xs font-mono">
                <p>https://www.figma.com/file/[FILE_KEY]/...</p>
                <p>https://www.figma.com/design/[FILE_KEY]/...</p>
                <p>https://figma.com/file/[FILE_KEY]/...</p>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                💡 ヒント: URLの /file/ または /design/ の直後の英数字がファイルキーです
              </p>
            </section>

            <section>
              <h3 className="mb-2">7. Personal Access Tokenを取得</h3>
              <ol className="list-decimal list-inside space-y-1 ml-2 mb-2">
                <li>Figma → Settings → Account</li>
                <li>「Personal access tokens」セクション</li>
                <li>「Create new token」をクリック</li>
                <li>名前を入力（例: "営業資料アプリ連携"）</li>
                <li className="font-bold text-primary">
                  ⚠️ Scopes で以下を選択（重要！）
                  <div className="ml-6 mt-1 space-y-1 bg-muted p-2 rounded text-xs">
                    <div>✅ <strong>File variables</strong> ← 必須！</div>
                    <div>✅ File content ← 推奨</div>
                  </div>
                </li>
                <li>生成されたトークンをコピー</li>
              </ol>

              <a
                href="https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:underline text-xs"
              >
                詳しい手順を見る
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </section>

            <section className="border-t pt-4">
              <h3 className="mb-2">参考リンク</h3>
              <ul className="space-y-1">
                <li>
                  <a
                    href="https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline text-xs"
                  >
                    Figma Variables ガイド
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://help.figma.com/hc/en-us/articles/360038662654-Guide-to-components-in-Figma"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline text-xs"
                  >
                    Figma Components ガイド
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
