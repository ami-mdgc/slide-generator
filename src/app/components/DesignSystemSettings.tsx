import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Palette, Settings } from "lucide-react";
import { DesignSystem, DEFAULT_DESIGN_SYSTEMS } from "../types/design-system";
import { cn } from "./ui/utils";

interface DesignSystemSettingsProps {
  currentDesignSystem: DesignSystem;
  onDesignSystemChange: (designSystem: DesignSystem) => void;
}

export function DesignSystemSettings({ currentDesignSystem, onDesignSystemChange }: DesignSystemSettingsProps) {
  const [customSystem, setCustomSystem] = useState<DesignSystem>(currentDesignSystem);
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetSelect = (preset: DesignSystem) => {
    setCustomSystem(preset);
    onDesignSystemChange(preset);
  };

  const handleColorChange = (key: keyof DesignSystem["colors"], value: string) => {
    const updated = {
      ...customSystem,
      colors: {
        ...customSystem.colors,
        [key]: value,
      },
    };
    setCustomSystem(updated);
  };

  const handleApplyCustom = () => {
    onDesignSystemChange(customSystem);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3">
          <Palette className="h-4 w-4" />
          デザイン設定
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>デザインシステム設定</DialogTitle>
          <DialogDescription>
            プリセットから選択するか、カスタムでデザインシステムを設定します
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">プリセット</TabsTrigger>
            <TabsTrigger value="custom">カスタム設定</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              プリセットからデザインテーマを選択してください
            </p>

            <div className="grid grid-cols-2 gap-4">
              {DEFAULT_DESIGN_SYSTEMS.map((preset) => (
                <Card
                  key={preset.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:border-primary",
                    currentDesignSystem.id === preset.id && "border-primary border-2"
                  )}
                  onClick={() => handlePresetSelect(preset)}
                >
                  <h4 className="mb-3">{preset.name}</h4>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: preset.colors.primary }}
                      />
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: preset.colors.secondary }}
                      />
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: preset.colors.accent }}
                      />
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p>配置: {preset.layout.titleAlignment === "left" ? "左揃え" : preset.layout.titleAlignment === "center" ? "中央揃え" : "右揃え"}</p>
                      <p>余白: {preset.layout.contentPadding === "compact" ? "コンパクト" : preset.layout.contentPadding === "normal" ? "標準" : "広め"}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="mb-3">カラー設定</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>プライマリーカラー</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customSystem.colors.primary}
                        onChange={(e) => handleColorChange("primary", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={customSystem.colors.primary}
                        onChange={(e) => handleColorChange("primary", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>セカンダリーカラー</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customSystem.colors.secondary}
                        onChange={(e) => handleColorChange("secondary", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={customSystem.colors.secondary}
                        onChange={(e) => handleColorChange("secondary", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>背景色</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customSystem.colors.background}
                        onChange={(e) => handleColorChange("background", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={customSystem.colors.background}
                        onChange={(e) => handleColorChange("background", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>テキストカラー</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customSystem.colors.text}
                        onChange={(e) => handleColorChange("text", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={customSystem.colors.text}
                        onChange={(e) => handleColorChange("text", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>アクセントカラー</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={customSystem.colors.accent}
                        onChange={(e) => handleColorChange("accent", e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={customSystem.colors.accent}
                        onChange={(e) => handleColorChange("accent", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3">レイアウト設定</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>タイトル配置</Label>
                    <div className="flex gap-2">
                      {(["left", "center", "right"] as const).map((alignment) => (
                        <Button
                          key={alignment}
                          variant={customSystem.layout.titleAlignment === alignment ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCustomSystem({
                            ...customSystem,
                            layout: { ...customSystem.layout, titleAlignment: alignment }
                          })}
                        >
                          {alignment === "left" ? "左揃え" : alignment === "center" ? "中央揃え" : "右揃え"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>余白サイズ</Label>
                    <div className="flex gap-2">
                      {(["compact", "normal", "spacious"] as const).map((padding) => (
                        <Button
                          key={padding}
                          variant={customSystem.layout.contentPadding === padding ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCustomSystem({
                            ...customSystem,
                            layout: { ...customSystem.layout, contentPadding: padding }
                          })}
                        >
                          {padding === "compact" ? "コンパクト" : padding === "normal" ? "標準" : "広め"}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleApplyCustom}>
                適用
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
