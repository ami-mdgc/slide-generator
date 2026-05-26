import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import { SLIDE_STRUCTURES, BUSINESS_COLORS } from "../data/slide-structures";
import { cn } from "./ui/utils";

export interface ProjectConfig {
  name: string;
  slideType: string;
  businessType: string;
}

interface ProjectSetupProps {
  onComplete: (config: ProjectConfig) => void;
}

const SLIDE_TYPE_LABELS = Object.keys(SLIDE_STRUCTURES);
const BUSINESS_TYPES = Object.keys(BUSINESS_COLORS);

export function ProjectSetup({ onComplete }: ProjectSetupProps) {
  const [name, setName] = useState("");
  const [slideType, setSlideType] = useState("月次総会");
  const [businessType, setBusinessType] = useState("デフォルト");

  const structure = SLIDE_STRUCTURES[slideType];
  const colors = BUSINESS_COLORS[businessType];

  const handleSubmit = () => {
    if (!name.trim()) return;
    onComplete({ name: name.trim(), slideType, businessType });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b px-8 py-4">
        <span className="text-sm font-medium text-muted-foreground">スライド生成</span>
      </div>

      {/* Main: 2 column */}
      <div className="flex-1 flex">

        {/* Left: Form */}
        <div className="w-[480px] border-r flex flex-col px-10 py-12 gap-10 shrink-0">
          <div>
            <h1 className="text-2xl font-semibold mb-1">新規作成</h1>
            <p className="text-sm text-muted-foreground">設定してスライドを生成</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">タイトル</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：2026年5月 月次総会"
              className="w-full px-4 py-3 border border-border rounded-lg bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>

          {/* Slide Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">スライドタイプ</label>
            <div className="flex flex-col gap-2">
              {SLIDE_TYPE_LABELS.map((type) => {
                const s = SLIDE_STRUCTURES[type];
                return (
                  <button
                    key={type}
                    onClick={() => setSlideType(type)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors text-left",
                      slideType === type
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    <span className="font-medium">{type}</span>
                    <span className="text-xs text-muted-foreground">
                      {s.slides.length > 0 ? `${s.slides.length}枚` : "自由構成"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Business Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">事業</label>
            <div className="flex gap-2 flex-wrap">
              {BUSINESS_TYPES.map((type) => {
                const c = BUSINESS_COLORS[type];
                return (
                  <button
                    key={type}
                    onClick={() => setBusinessType(type)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors",
                      businessType === type
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: c.primary }}
                    />
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!name.trim()}
            size="lg"
            className="mt-auto"
          >
            スライドを作成
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Right: Preview */}
        <div className="flex-1 bg-muted/30 flex flex-col px-10 py-12 gap-8">
          {/* Color bar */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">カラーテーマ</p>
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: colors.primary }} />
              <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: colors.accent }} />
              <span className="text-sm text-muted-foreground ml-1">{businessType}</span>
            </div>
          </div>

          {/* Slide structure */}
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">スライド構成</p>
            {structure.slides.length > 0 ? (
              <div className="flex flex-col gap-3">
                {structure.slides.map((slide, i) => (
                  <div
                    key={i}
                    className="bg-background border rounded-lg px-5 py-4 flex items-center gap-4"
                  >
                    <span
                      className="text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: colors.primary + "20", color: colors.primary }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{slide.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{slide.role}</p>
                    </div>
                    {slide.templateId && (
                      <div
                        className="w-1.5 h-6 rounded-full shrink-0"
                        style={{ backgroundColor: colors.accent }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-background border rounded-lg px-5 py-8 text-center">
                <p className="text-sm text-muted-foreground">自由にスライドを追加できます</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
