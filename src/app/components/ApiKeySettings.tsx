import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { KeyRound, Check } from "lucide-react";
import { getApiKey, setApiKey } from "../services/gemini";

export function ApiKeySettings() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  const hasKey = !!getApiKey();

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setKey("");
      setSaved(false);
    }
  };

  const handleSave = () => {
    if (!key.trim()) return;
    setApiKey(key.trim());
    setSaved(true);
    setTimeout(() => setOpen(false), 800);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <KeyRound className="h-4 w-4 mr-2" />
          APIキー
          {hasKey && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gemini APIキー設定</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <p className="text-sm text-muted-foreground">
            Google AI Studio で取得した APIキーを入力してください。
            キーはブラウザのlocalStorageにのみ保存され、外部に送信されません。
          </p>
          {hasKey && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
              <Check className="h-4 w-4" />
              APIキーが設定済みです
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {hasKey ? "新しいAPIキー（変更する場合のみ）" : "APIキー"}
            </label>
            <Input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIza..."
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={!key.trim()}>
              {saved ? <><Check className="h-4 w-4 mr-2" />保存しました</> : "保存"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
