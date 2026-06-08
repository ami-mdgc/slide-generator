import { useState, useEffect, useCallback, useRef } from "react";
import { SlideViewer } from "./components/SlideViewer";
import { SlideThumbnails } from "./components/SlideThumbnails";
import { SlideEditPanel } from "./components/SlideEditPanel";
import { DesignSystemSettings } from "./components/DesignSystemSettings";
import { HomeScreen } from "./components/HomeScreen";
import { Slide, parseMarkdownToSlides } from "./utils/markdown-parser";
import { DesignSystem, DEFAULT_DESIGN_SYSTEMS } from "./types/design-system";
import { Project, loadProjects, saveProject, deleteProject } from "./types/project";
import { SLIDE_STRUCTURES, BUSINESS_COLORS, SUMMARY_SLIDE_DEFS } from "./data/slide-structures";
import { Button } from "./components/ui/button";
import { Download, ChevronLeft, Presentation, Loader2, FileDown, Copy, Settings, Palette } from "lucide-react";
import { PDFExportLayer } from "./components/PDFExportLayer";

type AppPhase = "home" | "editor";

const BUSINESS_TYPES = Object.keys(BUSINESS_COLORS);

function generateMarkdownTemplate(slideType: string): string {
  const structure = SLIDE_STRUCTURES[slideType];
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月`;
  const slideDefs = structure?.slides ?? [];

  const sections: string[] = [];

  // 各事業
  BUSINESS_TYPES.forEach((biz) => {
    slideDefs.forEach((def) => {
      if (def.templateId === "templateCover") {
        sections.push(`# ${biz}\n\n${slideType}\n\n${dateStr}`);
      } else {
        sections.push(def.markdownFormat);
      }
    });
  });

  // サマリー
  sections.push(`# サマリー\n\n${slideType}\n\n${dateStr}`);
  SUMMARY_SLIDE_DEFS.forEach(def => sections.push(def.markdownFormat));

  return sections.join("\n\n---\n\n");
}

function createNewProject(slideType: string): Project {
  const structure = SLIDE_STRUCTURES[slideType];
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月`;

  const makeMonth = (offset: number) => {
    const d = new Date(today);
    d.setMonth(d.getMonth() + offset);
    return `${d.getMonth() + 1}月`;
  };

  const allSlides: Slide[] = [];

  BUSINESS_TYPES.forEach((businessType, bizIdx) => {
    const colors = BUSINESS_COLORS[businessType];
    const slideDefs = structure?.slides ?? [];

    slideDefs.forEach((def, slideIdx) => {
      const id = `slide-${bizIdx * slideDefs.length + slideIdx}`;
      let content: string;

      if (def.templateId === "templateCover") {
        content = `# ${businessType}\n\n${slideType}\n\n${dateStr}`;
      } else if (def.templateId === "template07") {
        content = `# 事業数字の推移\n\n## ${makeMonth(-2)}\n事業売上: ¥0\n事業粗利: ¥0\n獲得金額: ¥0\n\n## ${makeMonth(-1)}\n事業売上: ¥0\n事業粗利: ¥0\n獲得金額: ¥0\n\n## ${makeMonth(0)}（目標）\n事業売上: ¥0\n事業粗利: ¥0\n獲得金額: ¥0`;
      } else {
        content = `# ${def.name}\n\n内容を入力してください`;
      }

      allSlides.push({
        id,
        content,
        title: def.templateId === "templateCover" ? businessType : def.name,
        templateId: def.templateId,
        slideType,
        colors,
      });
    });
  });

  // ── サマリーセクション ──
  const summaryColors = { primary: "#1A1A1A", accent: "#1A1A1A" };
  const summaryBase = allSlides.length;
  const summarySlides: Slide[] = [
    {
      id: `slide-${summaryBase}`,
      content: `# サマリー\n\n${slideType}\n\n${dateStr}`,
      title: "サマリー",
      templateId: "templateCover",
      slideType,
      colors: summaryColors,
    },
    ...SUMMARY_SLIDE_DEFS.map((def, i) => {
      let content: string;
      if (def.templateId === "template10") {
        const m3 = makeMonth(0);
        content = `# 各事業サマリー（${m3}）\n\nみんなの買取: 一言コメントを入力\n不用品回収の窓口: 一言コメントを入力\nおそうじ合衆国: 一言コメントを入力\ngaiheki+: 一言コメントを入力\n解体相談所: 一言コメントを入力\nSENBATSU: 一言コメントを入力\nGEKITAI: 一言コメントを入力`;
      } else if (def.templateId === "template09") {
        const m1 = makeMonth(-2);
        const m2 = makeMonth(-1);
        const m3 = makeMonth(0);
        const revLine = `みんなの買取: 4000000, 4000000, 4000000\n不用品回収の窓口: 5000000, 5000000, 5000000\nおそうじ合衆国: 3000000, 3000000, 3000000\ngaiheki+: 2000000, 2000000, 2000000\n解体相談所: 1000000, 1000000, 1000000\nSENBATSU: 1000000, 1000000, 1000000\nGEKITAI: 1000000, 1000000, 1000000`;
        const prfLine = `みんなの買取: 1200000, 1200000, 1200000\n不用品回収の窓口: 1500000, 1500000, 1500000\nおそうじ合衆国: 900000, 900000, 900000\ngaiheki+: 600000, 600000, 600000\n解体相談所: 300000, 300000, 300000\nSENBATSU: 300000, 300000, 300000\nGEKITAI: 300000, 300000, 300000`;
        content = `# 月次サマリー（${m1}→${m2}→${m3}目標）\n\n## 売上\n${revLine}\n\n## 粗利\n${prfLine}`;
      } else {
        content = `# ${def.name}\n\n内容を入力してください`;
      }
      return {
        id: `slide-${summaryBase + 1 + i}`,
        content,
        title: def.name,
        templateId: def.templateId,
        slideType,
        colors: summaryColors,
      };
    }),
  ];

  const now = new Date().toISOString();
  return {
    id: `project-${Date.now()}`,
    name: "無題のプレゼンテーション",
    slideType,
    businessType: "",
    slides: [...allSlides, ...summarySlides],
    createdAt: now,
    updatedAt: now,
  };
}

export default function App() {
  const [phase, setPhase] = useState<AppPhase>("home");
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [designDialogOpen, setDesignDialogOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(208);
  const [rightWidth, setRightWidth] = useState(352);
  const [bulkText, setBulkText] = useState("");
  const draggingRef = useRef<{ side: "left" | "right"; startX: number; startWidth: number } | null>(null);

  const startDrag = (side: "left" | "right", e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = {
      side,
      startX: e.clientX,
      startWidth: side === "left" ? leftWidth : rightWidth,
    };
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const delta = e.clientX - draggingRef.current.startX;
      if (draggingRef.current.side === "left") {
        setLeftWidth(Math.max(160, Math.min(480, draggingRef.current.startWidth + delta)));
      } else {
        setRightWidth(Math.max(240, Math.min(600, draggingRef.current.startWidth - delta)));
      }
    };
    const onUp = () => {
      draggingRef.current = null;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };
  const [designSystem, setDesignSystem] = useState<DesignSystem>(() => {
    const saved = localStorage.getItem("designSystem");
    return saved ? JSON.parse(saved) : DEFAULT_DESIGN_SYSTEMS[0];
  });

  useEffect(() => {
    localStorage.setItem("designSystem", JSON.stringify(designSystem));
  }, [designSystem]);

  // Auto-save project when it changes
  useEffect(() => {
    if (currentProject) {
      saveProject(currentProject);
      setProjects(loadProjects());
    }
  }, [currentProject]);

  const handleNew = () => {
    const project = createNewProject("月次総会");
    setCurrentProject(project);
    setBulkText("");
    setDesignSystem(DEFAULT_DESIGN_SYSTEMS[0]);
    setCurrentSlideIndex(0);
    setPhase("editor");
  };

  const handleOpen = (project: Project) => {
    setCurrentProject(project);
    setBulkText(project.bulkText ?? "");
    setDesignSystem(DEFAULT_DESIGN_SYSTEMS[0]);
    setCurrentSlideIndex(0);
    setPhase("editor");
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setProjects(loadProjects());
  };

  const handleBack = () => {
    setProjects(loadProjects());
    setPhase("home");
  };

  const updateProject = useCallback((patch: Partial<Project>) => {
    setCurrentProject((prev) => {
      if (!prev) return prev;
      return { ...prev, ...patch, updatedAt: new Date().toISOString() };
    });
  }, []);

  const handleBulkTextChange = useCallback((text: string) => {
    setBulkText(text);
    updateProject({ bulkText: text });
  }, [updateProject]);

  const handleNameChange = (name: string) => {
    updateProject({ name });
  };

  const handleSlideUpdate = (newContent: string) => {
    if (!currentProject) return;
    const slides = [...currentProject.slides];
    const titleMatch = newContent.match(/^#\s+(.+)$/m);
    slides[currentSlideIndex] = {
      ...slides[currentSlideIndex],
      content: newContent,
      title: titleMatch ? titleMatch[1] : slides[currentSlideIndex].title,
    };
    updateProject({ slides });
  };

  const handleAddSlide = () => {
    if (!currentProject) return;
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      content: "# 新しいスライド\n\n内容を入力してください",
      title: "新しいスライド",
    };
    const slides = [...currentProject.slides];
    slides.splice(currentSlideIndex + 1, 0, newSlide);
    updateProject({ slides });
    setCurrentSlideIndex(currentSlideIndex + 1);
  };

  const handleDeleteSlide = () => {
    if (!currentProject || currentProject.slides.length <= 1) return;
    const slides = currentProject.slides.filter((_, i) => i !== currentSlideIndex);
    updateProject({ slides });
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
  };

  const handleBulkUpdate = useCallback((markdown: string) => {
    if (!currentProject) return;
    const parsed = parseMarkdownToSlides(markdown);
    if (parsed.length === 0) return;

    const SUMMARY_COLORS = { primary: "#1A1A1A", accent: "#1A1A1A" };
    const businessNames = Object.keys(BUSINESS_COLORS);
    const slideDefs = SLIDE_STRUCTURES[currentProject.slideType || "月次総会"]?.slides ?? [];

    let currentColors = SUMMARY_COLORS as { primary: string; accent: string };
    let bizSlideCount = 0;
    let isSummary = false;

    const mapped: Slide[] = parsed.map((slide, i) => {
      const title = slide.title || "";
      if (businessNames.includes(title)) {
        currentColors = BUSINESS_COLORS[title];
        bizSlideCount = 0;
        isSummary = false;
        return { ...slide, id: `slide-${i}`, templateId: "templateCover", colors: currentColors };
      } else if (title === "サマリー") {
        currentColors = SUMMARY_COLORS;
        bizSlideCount = 0;
        isSummary = true;
        return { ...slide, id: `slide-${i}`, templateId: "templateCover", colors: currentColors };
      } else {
        // サマリー: SUMMARY_SLIDE_DEFS[0]から、通常事業: slideDefs[1]から（[0]は表紙）
        const def = isSummary ? SUMMARY_SLIDE_DEFS[bizSlideCount] : slideDefs[bizSlideCount + 1];
        bizSlideCount++;
        return { ...slide, id: `slide-${i}`, templateId: def?.templateId || slide.templateId, colors: currentColors };
      }
    });

    // 特記事項スライドでコンテンツが「なし」のみなら削除
    const slides = mapped.filter((slide) => {
      const isSpecialNotes =
        slide.templateId === "template05" ||
        /^#\s*特記事項/.test(slide.content);
      if (!isSpecialNotes) return true;
      const body = slide.content.replace(/^#.+$/m, "").trim();
      return body !== "なし";
    });

    updateProject({ slides });
    setCurrentSlideIndex(0);
  }, [currentProject, updateProject]);

  const handleExport = () => {
    if (!currentProject || isExporting) return;
    setIsExporting(true);
  };

  // Home
  if (phase === "home") {
    return (
      <HomeScreen
        projects={projects}
        onNew={handleNew}
        onOpen={handleOpen}
        onDelete={handleDelete}
      />
    );
  }

  // Editor
  if (!currentProject) return null;

  return (
    <div className="size-full flex flex-col">
      {/* Header */}
      <div className="border-b px-4 py-2 flex items-center gap-3 bg-card shrink-0">
        {/* Logo mark */}
        <div className="w-7 h-7 rounded-md bg-[#1A1A1A] flex items-center justify-center shrink-0">
          <Presentation className="h-4 w-4 text-white" />
        </div>
        <div className="w-px h-5 bg-border shrink-0" />
        {/* Back */}
        <button
          onClick={handleBack}
          className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Title input - Google Slides style */}
        <input
          type="text"
          value={currentProject.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="text-base font-semibold bg-transparent border-none outline-none focus:bg-muted/50 rounded px-2 py-1 min-w-0 w-56 transition-colors"
          placeholder="無題のプレゼンテーション"
        />

        <span className="text-xs text-muted-foreground ml-1">{currentProject.slides.length}枚</span>

        <div className="ml-auto flex items-center gap-2">
          {/* 設定ドロップダウン */}
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(v => !v)}>
              <Settings className="h-4 w-4 mr-2" />
              設定
            </Button>
            {settingsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSettingsOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-52 bg-card border rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                    onClick={() => {
                      const md = generateMarkdownTemplate(currentProject.slideType || "月次総会");
                      navigator.clipboard.writeText(md);
                      setSettingsOpen(false);
                    }}
                  >
                    <Copy className="h-4 w-4 text-muted-foreground" />
                    MDテンプレートをコピー
                  </button>
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                    onClick={() => { setDesignDialogOpen(true); setSettingsOpen(false); }}
                  >
                    <Palette className="h-4 w-4 text-muted-foreground" />
                    デザイン設定
                  </button>
                </div>
              </>
            )}
          </div>
          <DesignSystemSettings
            currentDesignSystem={designSystem}
            onDesignSystemChange={setDesignSystem}
            open={designDialogOpen}
            onOpenChange={setDesignDialogOpen}
          />
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? "書き出し中..." : "PDFエクスポート"}
          </Button>
        </div>
      </div>

      {/* Main 3-column */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: slide thumbnails */}
        <div className="shrink-0 p-3 overflow-hidden" style={{ width: leftWidth }}>
          <SlideThumbnails
            slides={currentProject.slides}
            currentSlideIndex={currentSlideIndex}
            onSlideSelect={setCurrentSlideIndex}
          />
        </div>

        {/* Drag handle: left */}
        <div
          className="w-1 shrink-0 hover:bg-primary/30 cursor-col-resize transition-colors border-x border-border"
          onMouseDown={(e) => startDrag("left", e)}
        />

        {/* Center: slide viewer */}
        <div className="flex-1 p-6 min-w-0">
          <SlideViewer
            slides={currentProject.slides}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={setCurrentSlideIndex}
            designSystem={designSystem}
          />
        </div>

        {/* Drag handle: right */}
        <div
          className="w-1 shrink-0 hover:bg-primary/30 cursor-col-resize transition-colors border-x border-border"
          onMouseDown={(e) => startDrag("right", e)}
        />

        {/* Right: edit panel */}
        <div className="shrink-0 p-4 overflow-hidden" style={{ width: rightWidth }}>
          <SlideEditPanel
            currentSlide={currentProject.slides[currentSlideIndex]}
            allSlides={currentProject.slides}
            onSlideUpdate={handleSlideUpdate}
            onBulkUpdate={handleBulkUpdate}
            slideIndex={currentSlideIndex}
            totalSlides={currentProject.slides.length}
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
            bulkText={bulkText}
            onBulkTextChange={handleBulkTextChange}
          />
        </div>
      </div>

      {/* PDF export layer */}
      {isExporting && (
        <>
          {/* Loading overlay — covers the slide being captured (z-index: 10) */}
          <div
            style={{ zIndex: 50 }}
            className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center gap-4"
          >
            <div className="bg-card rounded-xl px-8 py-6 flex flex-col items-center gap-3 shadow-2xl">
              <FileDown className="h-8 w-8 text-primary animate-bounce" />
              <p className="text-base font-semibold">PDFを生成中...</p>
              <p className="text-sm text-muted-foreground">
                {currentProject.slides.length}枚のスライドを書き出しています
              </p>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </div>
          <PDFExportLayer
            slides={currentProject.slides}
            projectName={currentProject.name}
            designSystem={designSystem}
            onDone={() => setIsExporting(false)}
            onError={(err) => {
              console.error("PDF export error:", err);
              setIsExporting(false);
            }}
          />
        </>
      )}
    </div>
  );
}
