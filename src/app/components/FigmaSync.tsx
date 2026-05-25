import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, Link2, AlertCircle, CheckCircle2 } from "lucide-react";
import { FigmaDesignSystemSync, extractFileKeyFromUrl } from "../services/figma-sync";
import { DesignSystem } from "../types/design-system";
import { FigmaSetupGuide } from "./FigmaSetupGuide";
import { FigmaTokenGuide } from "./FigmaTokenGuide";

interface FigmaSyncProps {
  onDesignSystemSync: (designSystem: DesignSystem) => void;
}

export function FigmaSync({ onDesignSystemSync }: FigmaSyncProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [figmaUrl, setFigmaUrl] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSync = async () => {
    setError(null);
    setSuccess(false);

    // Validate inputs
    if (!figmaUrl.trim()) {
      setError("FigmaファイルのURLまたはファイルキーを入力してください");
      return;
    }

    if (!accessToken.trim()) {
      setError("アクセストークンを入力してください");
      return;
    }

    // Try to extract file key from URL, or use input as-is if it looks like a file key
    let fileKey = extractFileKeyFromUrl(figmaUrl);

    // If extraction failed, check if the input itself is a valid file key format
    if (!fileKey) {
      const trimmedInput = figmaUrl.trim();
      // Figma file keys are typically 22+ alphanumeric characters with hyphens/underscores
      if (/^[a-zA-Z0-9_-]{22,}$/.test(trimmedInput)) {
        fileKey = trimmedInput;
      }
    }

    if (!fileKey) {
      console.error("Failed to extract file key from:", figmaUrl);
      setError(
        "無効なFigma URLまたはファイルキーです。\n" +
        "例: https://www.figma.com/file/xxxxx/... または https://www.figma.com/design/xxxxx/..."
      );
      return;
    }

    console.log("Extracted file key:", fileKey);
    setIsLoading(true);

    try {
      const syncService = new FigmaDesignSystemSync(fileKey, accessToken);
      console.log("Starting sync with Figma...");
      const designSystem = await syncService.syncDesignSystem();

      // Save to localStorage
      localStorage.setItem("figmaFileKey", fileKey);
      localStorage.setItem("figmaAccessToken", accessToken);
      localStorage.setItem("lastSyncTime", new Date().toISOString());

      onDesignSystemSync(designSystem);
      setSuccess(true);
      console.log("Sync completed successfully");

      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Sync error:", err);
      const errorMessage = err instanceof Error ? err.message : "不明なエラー";

      // Check if it's a 403 error
      if (errorMessage.includes("403")) {
        setError(
          `アクセス権限エラー (403)\n\n` +
          "❌ アクセストークンのスコープが不足しています\n\n" +
          "📋 必要なスコープ（どちらか1つでOK）:\n" +
          "✅ File variables (file_variables:read) ← Variables使用\n" +
          "✅ File content (file_content:read) ← Styles使用\n\n" +
          "💡 解決手順:\n" +
          "1. Figma → Settings → Account → Personal access tokens\n" +
          "2. 「Create new token」をクリック\n" +
          "3. Scopesで「File content」にチェック\n" +
          "   （有料プランなら「File variables」も推奨）\n" +
          "4. 生成されたトークンをコピーしてこのアプリに貼り付け\n\n" +
          "詳しい手順は「トークンの取得方法」リンクをクリックしてください。\n\n" +
          "または「JSONインポート」機能をご利用ください（最も簡単）"
        );
      } else {
        setError(
          `同期エラー: ${errorMessage}\n\n` +
          "確認事項:\n" +
          "- アクセストークンが正しいか\n" +
          "- ファイルへのアクセス権限があるか\n" +
          "- ネットワーク接続が正常か"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSync = async () => {
    const savedFileKey = localStorage.getItem("figmaFileKey");
    const savedAccessToken = localStorage.getItem("figmaAccessToken");

    if (!savedFileKey || !savedAccessToken) return;

    try {
      const syncService = new FigmaDesignSystemSync(savedFileKey, savedAccessToken);
      const designSystem = await syncService.syncDesignSystem();
      onDesignSystemSync(designSystem);
      localStorage.setItem("lastSyncTime", new Date().toISOString());
    } catch (err) {
      console.error("Auto-sync failed:", err);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3">
            <Link2 className="h-4 w-4" />
            Figma連携
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Figmaデザインシステム連携</DialogTitle>
                <DialogDescription>
                  Figmaファイルのバリアブルとスタイルをこのアプリケーションに同期します
                </DialogDescription>
              </div>
              <FigmaSetupGuide />
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs space-y-1">
                <div>
                  <strong>2つの方法があります:</strong>
                </div>
                <div className="ml-2 space-y-1">
                  <div>✅ <strong>File variables</strong> スコープ → Variablesから取得（推奨）</div>
                  <div>✅ <strong>File content</strong> スコープ → Stylesから取得（フォールバック）</div>
                </div>
                <div className="text-muted-foreground mt-2">
                  ※ どちらか1つでも動作します。無料プランの場合はFile contentのみでOK
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="figma-url">FigmaファイルURL またはファイルキー</Label>
              <Input
                id="figma-url"
                type="text"
                placeholder="https://www.figma.com/file/xxxxx/... または https://www.figma.com/design/xxxxx/..."
                value={figmaUrl}
                onChange={(e) => setFigmaUrl(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Figmaファイルのブラウザアドレスバーからコピー（/file/ または /design/ を含むURL）
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="access-token">Personal Access Token</Label>
                <FigmaTokenGuide />
              </div>
              <Input
                id="access-token"
                type="password"
                placeholder="figd_xxxxxxxxxxxx"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Scopesで「<strong>File variables</strong>」または「<strong>File content</strong>」を選択してください
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm whitespace-pre-line">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-600 dark:text-green-400">
                  Figmaデザインシステムの同期が完了しました！
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-xs text-muted-foreground">
                {localStorage.getItem("lastSyncTime") && (
                  <span>
                    最終同期:{" "}
                    {new Date(localStorage.getItem("lastSyncTime")!).toLocaleString("ja-JP")}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {localStorage.getItem("figmaFileKey") && (
                  <Button
                    variant="outline"
                    onClick={handleAutoSync}
                    disabled={isLoading}
                  >
                    再同期
                  </Button>
                )}
                <Button onClick={handleSync} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      同期中...
                    </>
                  ) : (
                    "同期開始"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
