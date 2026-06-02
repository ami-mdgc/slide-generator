import { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { FileText, Plus, Trash2, ChevronUp, ChevronDown, Edit3, Sparkles, Upload } from "lucide-react";
import { AIAssistant } from "./AIAssistant";
import { cn } from "./ui/utils";

interface MarkdownInputProps {
  onMarkdownSubmit: (content: string, filename: string) => void;
}

interface SlideInput {
  id: string;
  content: string;
}

type RightPanelView = "edit" | "ai";

export function MarkdownInput({ onMarkdownSubmit }: MarkdownInputProps) {
  const [slides, setSlides] = useState<SlideInput[]>([
    { id: "1", content: "" }
  ]);
  const [filename, setFilename] = useState("presentation.md");
  const [frontmatter, setFrontmatter] = useState("slideType: \ndate: ");
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>("edit");
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);

  const handleSubmit = () => {
    const slideContents = slides.filter(s => s.content.trim()).map(s => s.content);
    if (slideContents.length > 0) {
      const hasFrontmatter = frontmatter.trim().length > 0;
      const markdown = hasFrontmatter
        ? `---\n${frontmatter.trim()}\n---\n\n${slideContents.join('\n\n---\n\n')}`
        : slideContents.join('\n\n---\n\n');
      onMarkdownSubmit(markdown, filename);
    }
  };

  const addSlide = () => {
    setSlides([...slides, { id: Date.now().toString(), content: "" }]);
  };

  const removeSlide = (id: string) => {
    if (slides.length > 1) {
      const index = slides.findIndex(s => s.id === id);
      setSlides(slides.filter(s => s.id !== id));
      // Adjust selected index after removal
      if (index === selectedSlideIndex && selectedSlideIndex > 0) {
        setSelectedSlideIndex(selectedSlideIndex - 1);
      } else if (index < selectedSlideIndex) {
        setSelectedSlideIndex(selectedSlideIndex - 1);
      }
    }
  };

  const updateSlide = (id: string, content: string) => {
    setSlides(slides.map(s => s.id === id ? { ...s, content } : s));
  };

  const updateCurrentSlide = (content: string) => {
    const currentSlide = slides[selectedSlideIndex];
    if (currentSlide) {
      updateSlide(currentSlide.id, content);
    }
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const newSlides = [...slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < slides.length) {
      [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
      setSlides(newSlides);
      // Update selected index after move
      if (index === selectedSlideIndex) {
        setSelectedSlideIndex(targetIndex);
      } else if (targetIndex === selectedSlideIndex) {
        setSelectedSlideIndex(index);
      }
    }
  };

  const loadSample = () => {
    setFrontmatter("slideType: 月次総会\ndate: 2026年4月");
    setSlides([
      {
        id: "1",
        content: `# 先月の振り返り（2026年4月実績）

売上高: 前年比 **125%** 達成
新規顧客獲得: **50社**
顧客満足度: **4.8/5.0**

事業売上: ¥37,249,030
3月参考: ¥37,249,030`
      },
      {
        id: "2",
        content: `# 3→4月の変動要因

## 主要な増加要因
- 大手企業A社との新規契約締結 (+¥5,000,000)
- 既存顧客のアップセル成功 (+¥2,500,000)
- 新サービスの好調な立ち上がり (+¥1,800,000)

## 減少要因
- 季節要因による一時的な需要減 (-¥500,000)`
      },
      {
        id: "3",
        content: `# 今月のテーマと目標（2026年5月計画）

## テーマ
「顧客体験の向上とリピート率の改善」

## 目標
- 売上目標: 前年比 **130%**
- 新規顧客獲得: **60社**
- リピート率: **75%以上**
- 顧客満足度: **4.9/5.0**`
      },
      {
        id: "4",
        content: `# 5月の施策

## 重点施策
1. **カスタマーサクセスチーム強化**
   - 専任担当者を2名増員
   - 定期的なフォローアップ体制の構築

2. **新規プロモーション展開**
   - デジタルマーケティング強化
   - ウェビナー開催（月2回）

3. **製品改善**
   - ユーザーフィードバック反映
   - 新機能リリース（3件予定）`
      },
      {
        id: "5",
        content: `# 特記事項

## 注目トピックス
- **パートナー企業との協業開始**: B社とのジョイントベンチャー設立準備
- **メディア露出**: 業界誌に特集記事掲載予定（5月15日号）
- **社内表彰**: 営業MVPは田中さん（新規契約10社達成）

## 今後の予定
- 5月10日: 新サービス発表会
- 5月25日: 四半期報告会
- 6月初旬: チームビルディング研修`
      }
    ]);
    setFilename("sample-monthly-meeting.md");
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;

      // Extract frontmatter
      const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
      const body = fmMatch ? text.slice(fmMatch[0].length) : text;

      if (fmMatch) setFrontmatter(fmMatch[1].trim());

      // Split into slides by ---
      const parts = body
        .split(/\n---\n|\n---$/)
        .map(s => s.trim())
        .filter(Boolean);

      if (parts.length > 0) {
        setSlides(parts.map((content, i) => ({ id: String(Date.now() + i), content })));
        setSelectedSlideIndex(0);
      }

      setFilename(file.name);
    };
    reader.readAsText(file);
    // Reset so the same file can be re-uploaded
    e.target.value = "";
  };

  const hasContent = slides.some(s => s.content.trim());

  return (
    <div className="flex gap-6 h-full">
      {/* Left Column - Slide List */}
      <div className="w-64 flex-shrink-0">
        <Card className="h-full flex flex-col">
          <div className="p-4 border-b flex-shrink-0">
            <h3 className="font-medium mb-2">スライド一覧</h3>
            <Button onClick={addSlide} size="sm" variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              スライドを追加
            </Button>
          </div>
          <div className="p-2 space-y-2 overflow-auto flex-1">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={cn(
                  "p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors cursor-pointer",
                  selectedSlideIndex === index && "border-primary bg-primary/5"
                )}
                onClick={() => {
                  setSelectedSlideIndex(index);
                  setRightPanelView("edit");
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">スライド {index + 1}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSlide(index, "up")}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSlide(index, "down")}
                      disabled={index === slides.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSlide(slide.id)}
                      disabled={slides.length === 1}
                      className="h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {slide.content.trim() || "（空白）"}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right Column - Input Area / AI Assistant */}
      <div className="flex-1">
        <Card className="h-full flex flex-col">
          {/* Tab Buttons */}
          <div className="border-b px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex gap-2">
              <Button
                variant={rightPanelView === "edit" ? "default" : "ghost"}
                size="sm"
                onClick={() => setRightPanelView("edit")}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                入力
              </Button>
              <Button
                variant={rightPanelView === "ai" ? "default" : "ghost"}
                size="sm"
                onClick={() => setRightPanelView("ai")}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI修正
              </Button>
            </div>
            {rightPanelView === "edit" && (
              <Button variant="outline" size="sm" onClick={loadSample}>
                サンプルを読み込む
              </Button>
            )}
          </div>

          {rightPanelView === "edit" && (
            <div className="p-6 flex flex-col h-full overflow-hidden">
              <div className="mb-4 flex-shrink-0">
                <h3 className="mb-1">原稿を入力</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  各スライドの内容をマークダウン形式で入力してください
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  .mdファイルを読み込む
                </Button>
              </div>

            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex-shrink-0">
                <label className="text-sm font-medium mb-2 block">
                  ファイル名
                </label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder="presentation.md"
                />
              </div>

              <div className="flex-shrink-0">
                <label className="text-sm font-medium mb-2 block">
                  フロントマター（オプション）
                </label>
                <Textarea
                  value={frontmatter}
                  onChange={(e) => setFrontmatter(e.target.value)}
                  placeholder="slideType: 月次総会
date: 2026年4月"
                  className="min-h-[60px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  スライドタイプを指定するとテンプレートが適用されます
                </p>
              </div>

              <div className="border-t pt-4 flex-1 flex flex-col">
                <label className="text-sm font-medium mb-3 block">
                  スライド内容（{slides.length}枚）
                </label>
                <div className="space-y-4 overflow-auto flex-1">
                  {slides.map((slide, index) => (
                    <div key={slide.id} className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">スライド {index + 1}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSlide(index, "up")}
                            disabled={index === 0}
                            className="h-7 px-2"
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSlide(index, "down")}
                            disabled={index === slides.length - 1}
                            className="h-7 px-2"
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSlide(slide.id)}
                            disabled={slides.length === 1}
                            className="h-7 px-2"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={slide.content}
                        onChange={(e) => updateSlide(slide.id, e.target.value)}
                        placeholder={`# スライド${index + 1}のタイトル

内容をここに入力...

- 箇条書き1
- 箇条書き2`}
                        className="min-h-[150px] font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
                <Button onClick={addSlide} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  スライドを追加
                </Button>
                <Button onClick={handleSubmit} disabled={!hasContent}>
                  <FileText className="h-4 w-4 mr-2" />
                  スライドを生成
                </Button>
              </div>

              <div className="text-xs text-muted-foreground border-t pt-3 mt-3 flex-shrink-0">
                <p className="font-medium mb-2">使い方:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>各スライドごとに内容を入力します</li>
                  <li>スライドの順番は上下矢印で変更できます</li>
                  <li>**太字**、*イタリック*、# 見出し、- リストなどが使えます</li>
                </ul>
              </div>
            </div>
          </div>
          )}

          {rightPanelView === "ai" && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3>AI修正アシスタント</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  スライド {selectedSlideIndex + 1} を編集中
                </p>
              </div>
              <div className="flex-1 overflow-hidden">
                <AIAssistant
                  currentSlideContent={slides[selectedSlideIndex]?.content || ""}
                  onSlideUpdate={updateCurrentSlide}
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
