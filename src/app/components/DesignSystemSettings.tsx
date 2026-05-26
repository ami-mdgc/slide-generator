import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Palette, Settings, ArrowLeft } from "lucide-react";
import { DesignSystem } from "../types/design-system";
import { BUSINESS_COLORS } from "../data/slide-structures";
import { cn } from "./ui/utils";

const buildPresets = (): DesignSystem[] =>
  Object.entries(BUSINESS_COLORS).map(([name, colors]) => ({
    id: name,
    name,
    colors: {
      primary: colors.primary,
      secondary: colors.primary,
      background: "#ffffff",
      text: "#18191e",
      accent: colors.accent,
    },
    fonts: { heading: "system-ui, sans-serif", body: "system-ui, sans-serif" },
    layout: { titleAlignment: "left", contentPadding: "normal" },
  }));

interface DesignSystemSettingsProps {
  currentDesignSystem: DesignSystem;
  onDesignSystemChange: (designSystem: DesignSystem) => void;
}

type View = "presets" | "edit";

export function DesignSystemSettings({ currentDesignSystem, onDesignSystemChange }: DesignSystemSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("presets");
  const [presets, setPresets] = useState<DesignSystem[]>(buildPresets);
  const [editTarget, setEditTarget] = useState<DesignSystem | null>(null);

  const handlePresetSelect = (preset: DesignSystem) => {
    onDesignSystemChange(preset);
  };

  const handleEditOpen = () => {
    setEditTarget({ ...currentDesignSystem });
    setView("edit");
  };

  const handleEditColorChange = (key: "primary" | "accent", value: string) => {
    if (!editTarget) return;
    setEditTarget({
      ...editTarget,
      colors: { ...editTarget.colors, [key]: value, secondary: key === "primary" ? value : editTarget.colors.secondary },
    });
  };

  const handleEditSave = () => {
    if (!editTarget) return;
    const updated = presets.map((p) => (p.id === editTarget.id ? editTarget : p));
    setPresets(updated);
    onDesignSystemChange(editTarget);
    setView("presets");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setView("presets"); }}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3">
          <Palette className="h-4 w-4" />
          デザイン設定
        </button>
      </DialogTrigger>

      <DialogContent className="p-0 overflow-hidden" style={{ width: 580, height: 518, maxWidth: "none" }}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b shrink-0">
            <div className="flex items-center gap-2">
              {view === "edit" && (
                <button onClick={() => setView("presets")} className="p-1 rounded hover:bg-muted transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <DialogTitle className="text-base font-semibold">
                {view === "presets" ? "デザイン設定" : `${editTarget?.name} のカラー編集`}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              {view === "presets" ? "事業ごとのブランドカラーを選択してください" : "プライマリとアクセントカラーを編集できます"}
            </DialogDescription>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto px-6 py-5">
            {view === "presets" && (
              <div className="grid grid-cols-2 gap-3">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border text-left transition-all hover:border-primary",
                      currentDesignSystem.id === preset.id && "border-primary border-2 bg-primary/5"
                    )}
                  >
                    <div className="flex gap-1.5 shrink-0">
                      <div className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: preset.colors.primary }} />
                      <div className="w-6 h-6 rounded-full border border-black/10" style={{ backgroundColor: preset.colors.accent }} />
                    </div>
                    <span className="text-sm font-medium truncate">{preset.name}</span>
                  </button>
                ))}
              </div>
            )}

            {view === "edit" && editTarget && (
              <div className="space-y-5">
                {/* Preset selector */}
                <div className="flex gap-2 flex-wrap">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setEditTarget({ ...p })}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-full border transition-colors",
                        editTarget.id === p.id ? "border-primary bg-primary/10 font-medium" : "border-border hover:border-primary/50"
                      )}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                {/* Color inputs */}
                <div className="space-y-3">
                  {(["primary", "accent"] as const).map((key) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="text-sm w-32 shrink-0 text-muted-foreground">
                        {key === "primary" ? "プライマリ" : "アクセント"}
                      </label>
                      <input
                        type="color"
                        value={editTarget.colors[key]}
                        onChange={(e) => handleEditColorChange(key, e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-border"
                      />
                      <input
                        type="text"
                        value={editTarget.colors[key]}
                        onChange={(e) => handleEditColorChange(key, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border rounded-md font-mono bg-background"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t shrink-0 flex justify-between items-center">
            {view === "presets" ? (
              <>
                <span />
                <button
                  onClick={handleEditOpen}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="カラーを編集"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setView("presets")}
                  className="px-4 py-2 text-sm rounded-md border hover:bg-muted transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleEditSave}
                  className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  保存
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
