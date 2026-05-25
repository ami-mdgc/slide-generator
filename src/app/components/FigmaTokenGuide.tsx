import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Key, ExternalLink, CheckCircle2 } from "lucide-react";

export function FigmaTokenGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
          トークンの取得方法
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Personal Access Tokenの取得方法
          </DialogTitle>
          <DialogDescription>
            Figma APIにアクセスするためのトークンを正しく設定する手順です
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          <section>
            <h3 className="mb-3 font-semibold">ステップ1: Figma設定を開く</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Figmaにログイン</li>
              <li>右上のプロフィールアイコンをクリック</li>
              <li>「Settings」を選択</li>
              <li>左サイドバーから「Account」タブを選択</li>
            </ol>
          </section>

          <section>
            <h3 className="mb-3 font-semibold">ステップ2: トークンを作成</h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>「Personal access tokens」セクションまでスクロール</li>
              <li>「Create new token」ボタンをクリック</li>
              <li>トークンに名前を付ける（例: "営業資料アプリ連携"）</li>
              <li className="font-bold text-primary">
                ⚠️ 重要: Scopesで以下を選択（プランに応じて）
                <div className="ml-6 mt-2 space-y-3 bg-muted p-3 rounded">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-mono text-xs font-bold">File variables</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">推奨</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6 mt-1">
                      Variablesから取得（有料プランで利用可能）
                    </p>
                  </div>

                  <div className="border-t pt-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-mono text-xs font-bold">File content</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">無料プランOK</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6 mt-1">
                      Stylesから取得（すべてのプランで利用可能）
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                    💡 どちらか1つでも動作します。無料プランの場合は「File content」のみでOK
                  </p>
                </div>
              </li>
              <li>「Generate token」をクリック</li>
            </ol>
          </section>

          <section>
            <h3 className="mb-3 font-semibold">ステップ3: トークンをコピー</h3>
            <Alert className="mb-3">
              <AlertDescription className="text-xs">
                <strong>注意:</strong> トークンは一度しか表示されません。必ずコピーして安全な場所に保存してください。
              </AlertDescription>
            </Alert>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>表示されたトークンをコピー（形式: <code className="bg-muted px-1 py-0.5 rounded text-xs">figd_xxxxxxxxxxxxx</code>）</li>
              <li>このアプリの「Personal Access Token」欄に貼り付け</li>
            </ol>
          </section>

          <section className="border-t pt-4">
            <h3 className="mb-3 font-semibold">よくある問題と解決方法</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">❌ 403エラー: アクセス権限がありません</h4>
                <p className="text-muted-foreground mb-2">原因:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                  <li className="font-bold">トークンに必要なスコープが付与されていない</li>
                  <li>トークンが無効または期限切れ</li>
                  <li>ファイルへのアクセス権限がない（プライベートファイルなど）</li>
                </ul>
                <p className="text-muted-foreground mt-2 mb-1">解決方法:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                  <li className="font-bold">無料プラン: 「File content」スコープを選択</li>
                  <li className="font-bold">有料プラン: 「File variables」と「File content」の両方を選択</li>
                  <li>ファイルが自分のアカウントで作成されたものか確認</li>
                  <li>チームファイルの場合、閲覧権限以上があるか確認</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">❌ 404エラー: ファイルが見つかりません</h4>
                <p className="text-muted-foreground mb-2">原因:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                  <li>ファイルキーが間違っている</li>
                  <li>ファイルが削除された</li>
                </ul>
                <p className="text-muted-foreground mt-2 mb-1">解決方法:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                  <li>URLを再度コピーして、正しいファイルキーか確認</li>
                  <li>Figmaでファイルが開けるか確認</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">❌ CORSエラー: ネットワークエラー</h4>
                <p className="text-muted-foreground mb-2">原因:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                  <li>ブラウザのCORS制限</li>
                </ul>
                <p className="text-muted-foreground mt-2 mb-1">解決方法:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                  <li>「JSONインポート」機能を使用（推奨）</li>
                  <li>バックエンドプロキシサーバーを構築</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="border-t pt-4">
            <h3 className="mb-2 font-semibold">参考リンク</h3>
            <a
              href="https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-primary hover:underline text-xs"
            >
              Figma公式ドキュメント: Personal Access Tokensの管理
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </section>

          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
            <AlertDescription className="text-xs">
              <strong>推奨:</strong> API連携が難しい場合は、「JSONインポート」機能をご利用ください。
              Figmaのカラー値を手動でコピーするだけで同じ結果が得られます。
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  );
}
