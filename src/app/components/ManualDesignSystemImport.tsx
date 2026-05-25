import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Upload, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { DesignSystem } from "../types/design-system";

interface ManualDesignSystemImportProps {
  onImport: (designSystem: DesignSystem) => void;
}

export function ManualDesignSystemImport({ onImport }: ManualDesignSystemImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const exampleJSON = {
    id: "custom-import",
    name: "カスタムデザインシステム",
    colors: {
      primary: "#1e40af",
      secondary: "#64748b",
      background: "#ffffff",
      text: "#1e293b",
      accent: "#3b82f6"
    },
    fonts: {
      heading: "system-ui, sans-serif",
      body: "system-ui, sans-serif"
    },
    typography: {
      h1Size: 48,
      h2Size: 36,
      h3Size: 24,
      bodySize: 18,
      h1Weight: 700,
      h2Weight: 700,
      h3Weight: 600,
      lineHeight: 1.5
    },
    spacing: {
      slideTop: 64,
      slideBottom: 64,
      slideLeft: 80,
      slideRight: 80,
      contentGap: 24,
      listItemGap: 16
    },
    layout: {
      titleAlignment: "left",
      contentPadding: "normal"
    }
  };

  const handleImport = () => {
    setError(null);
    setSuccess(false);

    try {
      const parsed = JSON.parse(jsonInput);

      // Validate structure
      if (!parsed.colors || !parsed.colors.primary || !parsed.colors.secondary) {
        throw new Error("無効な形式です。colorsオブジェクトにprimaryとsecondaryが必要です。");
      }

      const designSystem: DesignSystem = {
        id: parsed.id || "manual-import",
        name: parsed.name || "手動インポート",
        colors: {
          primary: parsed.colors.primary,
          secondary: parsed.colors.secondary,
          background: parsed.colors.background || "#ffffff",
          text: parsed.colors.text || "#000000",
          accent: parsed.colors.accent || parsed.colors.primary,
        },
        fonts: {
          heading: parsed.fonts?.heading || "system-ui, sans-serif",
          body: parsed.fonts?.body || "system-ui, sans-serif",
        },
        layout: {
          titleAlignment: parsed.layout?.titleAlignment || "left",
          contentPadding: parsed.layout?.contentPadding || "normal",
        },
      };

      onImport(designSystem);
      setSuccess(true);

      setTimeout(() => {
        setIsOpen(false);
        setJsonInput("");
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "JSONの解析に失敗しました");
    }
  };

  const loadExample = () => {
    setJsonInput(JSON.stringify(exampleJSON, null, 2));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3">
          <Upload className="h-4 w-4" />
          JSONインポート
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>デザインシステムをJSONでインポート</DialogTitle>
          <DialogDescription>
            FigmaからエクスポートしたデザインシステムのJSONを貼り付けてください
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>CORS制限の代替方法:</strong> Figma APIへの直接アクセスができない場合、
              Figmaプラグインや手動でエクスポートしたデザイントークンをJSON形式で貼り付けることができます。
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="json-input">デザインシステムJSON</Label>
              <Button variant="ghost" size="sm" onClick={loadExample}>
                サンプルを読み込む
              </Button>
            </div>
            <Textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={JSON.stringify(exampleJSON, null, 2)}
              className="font-mono text-xs"
              rows={16}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-600 dark:text-green-400">
                デザインシステムのインポートが完了しました！
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleImport} disabled={!jsonInput.trim()}>
              インポート
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-2 pt-4 border-t">
            <p className="font-medium">必須フィールド:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>colors.primary, secondary, background, text, accent</li>
            </ul>
            <p className="font-medium mt-3">オプション（Variablesの代わり）:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>typography: h1Size, h2Size, h3Size, bodySize, weights, lineHeight</li>
              <li>spacing: slideTop/Bottom/Left/Right, contentGap, listItemGap</li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              💡 無料プラン: Figma VariablesはAPI経由で読めませんが、JSONで直接指定できます
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
