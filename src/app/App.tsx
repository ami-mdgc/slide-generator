import { useState, useEffect, useCallback } from "react";
import { SlideViewer } from "./components/SlideViewer";
import { SlideThumbnails } from "./components/SlideThumbnails";
import { SlideEditPanel } from "./components/SlideEditPanel";
import { DesignSystemSettings } from "./components/DesignSystemSettings";
import { HomeScreen } from "./components/HomeScreen";
import { Slide } from "./utils/markdown-parser";
import { DesignSystem, DEFAULT_DESIGN_SYSTEMS } from "./types/design-system";
import { Project, loadProjects, saveProject, deleteProject } from "./types/project";
import { SLIDE_STRUCTURES, BUSINESS_COLORS } from "./data/slide-structures";
import { Button } from "./components/ui/button";
import { Download, ChevronLeft, Presentation } from "lucide-react";

type AppPhase = "home" | "editor";

const SLIDE_TYPES = Object.keys(SLIDE_STRUCTURES);
const BUSINESS_TYPES = Object.keys(BUSINESS_COLORS);

function buildDesignSystem(base: DesignSystem, businessType: string): DesignSystem {
  const colors = BUSINESS_COLORS[businessType];
  if (!colors) return base;
  return { ...base, colors: { ...base.colors, primary: colors.primary, accent: colors.accent } };
}

function createNewProject(slideType: string, businessType: string): Project {
  const structure = SLIDE_STRUCTURES[slideType];
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月`;

  const makeCover = (i: number): Slide => ({
    id: `slide-${i}`,
    content: `# 無題のプレゼンテーション\n\n${slideType}\n\n${dateStr}`,
    title: "表紙",
    templateId: "templateCover",
    slideType,
  });

  const slides: Slide[] =
    structure && structure.slides.length > 0
      ? structure.slides.map((def, i) => ({
          id: `slide-${i}`,
          content:
            def.templateId === "templateCover"
              ? `# 無題のプレゼンテーション\n\n${slideType}\n\n${dateStr}`
              : `# ${def.name}\n\n内容を入力してください`,
          title: def.name,
          templateId: def.templateId,
          slideType,
        }))
      : [makeCover(0), { id: "slide-1", content: "# 新しいスライド\n\n内容を入力してください", title: "新しいスライド" }];

  const now = new Date().toISOString();
  return {
    id: `project-${Date.now()}`,
    name: "無題のプレゼンテーション",
    slideType,
    businessType,
    slides,
    createdAt: now,
    updatedAt: now,
  };
}

export default function App() {
  const [phase, setPhase] = useState<AppPhase>("home");
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
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
    const project = createNewProject("月次総会", "デフォルト");
    setCurrentProject(project);
    setDesignSystem(buildDesignSystem(DEFAULT_DESIGN_SYSTEMS[0], project.businessType));
    setCurrentSlideIndex(0);
    setPhase("editor");
  };

  const handleOpen = (project: Project) => {
    setCurrentProject(project);
    setDesignSystem(buildDesignSystem(DEFAULT_DESIGN_SYSTEMS[0], project.businessType));
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

  const handleNameChange = (name: string) => {
    // 表紙スライドのタイトルも連動して更新
    const slides = currentProject?.slides.map((slide) => {
      if (slide.templateId === "templateCover") {
        const updated = slide.content.replace(/^#\s+.+$/m, `# ${name}`);
        return { ...slide, content: updated };
      }
      return slide;
    });
    updateProject({ name, ...(slides ? { slides } : {}) });
  };

  const handleSlideTypeChange = (slideType: string) => {
    updateProject({ slideType });
  };

  const handleBusinessTypeChange = (businessType: string) => {
    updateProject({ businessType });
    setDesignSystem(buildDesignSystem(designSystem, businessType));
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

  const handleExport = () => {
    if (!currentProject) return;
    const markdown = currentProject.slides.map((s) => s.content).join("\n\n---\n\n");
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentProject.name}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <div className="w-7 h-7 rounded-md bg-[#FFDE35] flex items-center justify-center shrink-0">
          <Presentation className="h-4 w-4 text-[#1A1A1A]" />
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

        {/* Slide type dropdown */}
        <select
          value={currentProject.slideType}
          onChange={(e) => handleSlideTypeChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          {SLIDE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Business type dropdown */}
        <select
          value={currentProject.businessType}
          onChange={(e) => handleBusinessTypeChange(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <span className="text-xs text-muted-foreground ml-1">{currentProject.slides.length}枚</span>

        <div className="ml-auto flex items-center gap-2">
          <DesignSystemSettings
            currentDesignSystem={designSystem}
            onDesignSystemChange={setDesignSystem}
          />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* Main 3-column */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-52 border-r p-3 shrink-0">
          <SlideThumbnails
            slides={currentProject.slides}
            currentSlideIndex={currentSlideIndex}
            onSlideSelect={setCurrentSlideIndex}
          />
        </div>

        <div className="flex-1 p-6 min-w-0">
          <SlideViewer
            slides={currentProject.slides}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={setCurrentSlideIndex}
            designSystem={designSystem}
          />
        </div>

        <div className="w-88 border-l p-4 shrink-0" style={{ width: "22rem" }}>
          <SlideEditPanel
            currentSlide={currentProject.slides[currentSlideIndex]}
            onSlideUpdate={handleSlideUpdate}
            slideIndex={currentSlideIndex}
            totalSlides={currentProject.slides.length}
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
          />
        </div>
      </div>
    </div>
  );
}
