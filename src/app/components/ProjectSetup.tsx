import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
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
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="bg-background border rounded-xl shadow-lg w-full max-w-xl p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">新規プレゼンテーション</h1>
          <p className="text-sm text-muted-foreground mt-1">3つの設定で始められます</p>
        </div>

        {/* Step 1: Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs mr-2">1</span>
            スライド名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例：2026年5月 月次総会"
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>

        {/* Step 2: Slide Type */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs mr-2">2</span>
            スライドタイプ
          </label>
          <div className="flex flex-wrap gap-2">
            {SLIDE_TYPE_LABELS.map((type) => (
              <button
                key={type}
                onClick={() => setSlideType(type)}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                  slideType === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-muted"
                )}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Structure preview */}
          {structure.slides.length > 0 ? (
            <div className="bg-muted/50 rounded-lg px-4 py-3 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                スライド構成（{structure.slides.length}枚）
              </p>
              {structure.slides.map((slide, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground text-xs w-4">{i + 1}.</span>
                  <span>{slide.name}</span>
                  {slide.templateId && (
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      デザイン適用
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg px-4 py-3">
              <p className="text-xs text-muted-foreground">
                AIが原稿の内容に合わせてスライド構成を自動決定します
              </p>
            </div>
          )}
        </div>

        {/* Step 3: Business Type */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs mr-2">3</span>
            事業・カラーテーマ
          </label>
          <div className="flex gap-2">
            {BUSINESS_TYPES.map((type) => {
              const c = BUSINESS_COLORS[type];
              return (
                <button
                  key={type}
                  onClick={() => setBusinessType(type)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors",
                    businessType === type
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: c.primary }}
                  />
                  {type}
                </button>
              );
            })}
          </div>
          {/* Color preview */}
          <div
            className="h-1.5 rounded-full"
            style={{
              background: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
            }}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full"
          size="lg"
        >
          設定完了
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
