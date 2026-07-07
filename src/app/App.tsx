import { useState, useEffect, useCallback, useRef } from "react";
import { SlideViewer } from "./components/SlideViewer";
import { SlideThumbnails } from "./components/SlideThumbnails";
import { SlideEditPanel } from "./components/SlideEditPanel";
import { DesignSystemSettings } from "./components/DesignSystemSettings";
import { HomeScreen } from "./components/HomeScreen";
import { Slide, parseMarkdownToSlides } from "./utils/markdown-parser";
import { DesignSystem, DEFAULT_DESIGN_SYSTEMS } from "./types/design-system";
import { Project } from "./types/project";
import { collection, doc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "./lib/firebase";
import { getSessionId, updatePresence, clearPresence, subscribeToPresence, PresenceData } from "./lib/presence";
import { LoginScreen } from "./components/LoginScreen";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { SLIDE_STRUCTURES, BUSINESS_COLORS, SUMMARY_SLIDE_DEFS, QUARTERLY_SUMMARY_SLIDE_DEFS } from "./data/slide-structures";
import { Button } from "./components/ui/button";
import { Download, ChevronLeft, ChevronDown, Presentation, Loader2, FileDown, Copy, Settings, Palette } from "lucide-react";
import { PDFExportLayer } from "./components/PDFExportLayer";

type AppPhase = "home" | "editor";

function splitSlidesByBusiness(slides: Slide[], projectName: string): { slides: Slide[]; name: string }[] {
  const groups: { slides: Slide[]; name: string }[] = [];
  let current: Slide[] = [];
  let currentName = projectName;

  for (const slide of slides) {
    if (slide.templateId === "templateCover" && current.length > 0) {
      groups.push({ slides: current, name: currentName });
      current = [];
      currentName = slide.title || projectName;
    } else if (slide.templateId === "templateCover") {
      currentName = slide.title || projectName;
    }
    current.push(slide);
  }
  if (current.length > 0) {
    groups.push({ slides: current, name: currentName });
  }
  return groups;
}

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
      } else if (def.templateId === "template11") {
        const year = today.getFullYear();
        content = `# 直近1年の売上・粗利推移\n\n## Q1（${year}年1〜3月）\n事業売上: ¥42,500,000\n事業粗利: ¥12,750,000\n\n## Q2（${year}年4〜6月）\n事業売上: ¥38,200,000\n事業粗利: ¥11,460,000\n\n## Q3（${year}年7〜9月）\n事業売上: ¥45,800,000\n事業粗利: ¥13,740,000\n\n## Q4（${year}年10〜12月）\n事業売上: ¥51,300,000\n事業粗利: ¥15,390,000`;
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

  const quarterlyExtraSlides: Slide[] = slideType === "四半期報告"
    ? QUARTERLY_SUMMARY_SLIDE_DEFS.map((def, i) => {
        let content: string;
        if (def.templateId === "template12") {
          const bizLine = (vals: string) =>
            `みんなの買取: ${vals}\n不用品回収の窓口: ${vals}\nおそうじ合衆国: ${vals}\ngaiheki+: ${vals}\n解体相談所: ${vals}\nSENBATSU: ${vals}\nGEKITAI: ${vals}`;
          content = `# 直近1年の売上・粗利推移（全事業）\n\n## 売上\n${bizLine("¥0, ¥0, ¥0, ¥0")}\n\n## 粗利\n${bizLine("¥0, ¥0, ¥0, ¥0")}`;
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
      })
    : [];

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
    ...quarterlyExtraSlides.map((s, i) => ({
      ...s,
      id: `slide-${summaryBase + 1 + SUMMARY_SLIDE_DEFS.length + i}`,
    })),
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [fsLoaded, setFsLoaded] = useState(false);
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined=確認中
  const [presence, setPresence] = useState<PresenceData[]>([]);
  const sessionId = getSessionId();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportBatch, setExportBatch] = useState<{ slides: Slide[]; name: string }[] | null>(null);
  const [exportBatchIdx, setExportBatchIdx] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pdfMenuOpen, setPdfMenuOpen] = useState(false);
  const [designDialogOpen, setDesignDialogOpen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(208);
  const [rightWidth, setRightWidth] = useState(352);
  const [bulkText, setBulkText] = useState("");
  const draggingRef = useRef<{ side: "left" | "right"; startX: number; startWidth: number } | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Auth state
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Firestore real-time listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'projects'), (snap) => {
      const data = snap.docs.map(d => d.data() as Project);
      data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setProjects(data);
      setFsLoaded(true);
    });
    return unsub;
  }, []);

  // Presence listener
  useEffect(() => {
    const unsub = subscribeToPresence(setPresence);
    return unsub;
  }, []);

  // Presence heartbeat (30秒ごとに更新)
  useEffect(() => {
    if (!user) return;
    const name = user.displayName || user.email || '名無し';
    const projectId = currentProject?.id ?? null;
    updatePresence(sessionId, name, projectId);
    const timer = setInterval(() => {
      updatePresence(sessionId, name, projectId);
    }, 30_000);
    return () => clearInterval(timer);
  }, [user, currentProject?.id, sessionId]);

  // ページを離れたらpresenceを削除
  useEffect(() => {
    const onUnload = () => clearPresence(sessionId);
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [sessionId]);

  // Auto-save to Firestore (debounced 1s)
  useEffect(() => {
    if (!currentProject) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const project = JSON.parse(JSON.stringify(currentProject));
      setDoc(doc(db, 'projects', project.id), project).catch(console.error);
    }, 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [currentProject]);

  const handleNew = (slideType: string = "月次総会") => {
    const project = createNewProject(slideType);
    setDoc(doc(db, 'projects', project.id), JSON.parse(JSON.stringify(project)));
    setCurrentProject(project);
    setBulkText("");
    setDesignSystem(DEFAULT_DESIGN_SYSTEMS[0]);
    setCurrentSlideIndex(0);
    setPhase("editor");
  };

  const handleOpen = (project: Project) => {
    setCurrentProject(project);
    const bulk = project.bulkText
      || (project.slides.length > 0
        ? project.slides.map(s => s.content).join("\n\n---\n\n")
        : "");
    setBulkText(bulk);
    setDesignSystem(DEFAULT_DESIGN_SYSTEMS[0]);
    setCurrentSlideIndex(0);
    setPhase("editor");
  };

  const handleDelete = (id: string) => {
    deleteDoc(doc(db, 'projects', id));
  };

  const handleDuplicate = (project: Project) => {
    const now = new Date().toISOString();
    const copy: Project = {
      ...JSON.parse(JSON.stringify(project)),
      id: `project-${Date.now()}`,
      name: `${project.name} のコピー`,
      createdAt: now,
      updatedAt: now,
    };
    setDoc(doc(db, 'projects', copy.id), copy).catch(console.error);
  };

  const handleBack = () => {
    if (currentProject) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      const project = JSON.parse(JSON.stringify(currentProject)); // undefined除去
      setDoc(doc(db, 'projects', project.id), project).catch(console.error);
    }
    setPhase("home");
  };

  const updateProject = useCallback((patch: Partial<Project>) => {
    setCurrentProject((prev) => {
      if (!prev) return prev;
      const name = user?.displayName || user?.email || undefined;
      return { ...prev, ...patch, updatedAt: new Date().toISOString(), lastEditedBy: name };
    });
  }, [user]);

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
        // サマリー: SUMMARY_SLIDE_DEFS + 四半期報告なら QUARTERLY_SUMMARY_SLIDE_DEFS、通常事業: slideDefs[1]から（[0]は表紙）
        const summaryDefs = [
          ...SUMMARY_SLIDE_DEFS,
          ...(currentProject.slideType === "四半期報告" ? QUARTERLY_SUMMARY_SLIDE_DEFS : []),
        ];
        const def = isSummary ? summaryDefs[bizSlideCount] : slideDefs[bizSlideCount + 1];
        bizSlideCount++;
        // 位置ベースで決まらない場合はコンテンツパターンで判定
        let templateId = def?.templateId || slide.templateId;
        if (!templateId) {
          if (/##\s+Q[1-4]/.test(slide.content) && /事業売上/.test(slide.content)) {
            templateId = "template11";
          } else if (/##\s+売上/.test(slide.content) && /##\s+粗利/.test(slide.content) && /みんなの買取/.test(slide.content)) {
            templateId = "template12";
          }
        }
        return { ...slide, id: `slide-${i}`, templateId, colors: currentColors };
      }
    });

    // 特記事項スライドでコンテンツが「なし」のみなら削除
    const slides = mapped.filter((slide) => {
      const isSpecialNotes = /^#\s*特記事項/.test(slide.content);
      if (!isSpecialNotes) return true;
      const body = slide.content.replace(/^#.+$/m, "").trim();
      return body !== "なし";
    });

    updateProject({ slides });
    setCurrentSlideIndex(i => Math.min(i, slides.length - 1));
  }, [currentProject, updateProject]);

  const handleExportAll = () => {
    if (!currentProject || isExporting) return;
    setExportBatch(null);
    setIsExporting(true);
  };

  const handleExportPerBusiness = () => {
    if (!currentProject || isExporting) return;
    const batch = splitSlidesByBusiness(currentProject.slides, currentProject.name);
    setExportBatch(batch);
    setExportBatchIdx(0);
    setIsExporting(true);
  };

  // Auth確認中
  if (user === undefined) return null;

  // 未ログイン
  if (!user) return <LoginScreen />;

  // Home
  if (phase === "home") {
    return (
      <HomeScreen
        projects={projects}
        loading={!fsLoaded}
        presence={presence}
        currentSessionId={sessionId}
        userName={user.displayName || user.email || undefined}
        userPhoto={user.photoURL || undefined}
        onNew={handleNew}
        onOpen={handleOpen}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onSignOut={() => signOut(auth)}
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

        {/* 現在の閲覧者 */}
        {(() => {
          const viewers = presence.filter(p => p.projectId === currentProject.id);
          if (viewers.length === 0) return null;
          return (
            <div className="flex items-center gap-1.5 ml-3">
              {viewers.map(v => (
                <div
                  key={v.sessionId}
                  title={v.name}
                  className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0"
                  style={{ backgroundColor: v.sessionId === sessionId ? '#1A1A1A' : '#5969a7' }}
                >
                  {v.name.slice(0, 1)}
                </div>
              ))}
              <span className="text-xs text-muted-foreground">
                {viewers.map(v => v.sessionId === sessionId ? `${v.name}（自分）` : v.name).join('、')}
              </span>
            </div>
          );
        })()}

        <div className="ml-auto flex items-center gap-2">
          {/* スライドタイプ */}
          <select
            value={currentProject.slideType || "月次総会"}
            onChange={(e) => setCurrentProject(p => p ? { ...p, slideType: e.target.value } : p)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-sm font-medium hover:bg-accent cursor-pointer"
          >
            <option value="月次総会">通常</option>
            <option value="四半期報告">四半期</option>
          </select>

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
          <div className="relative">
            <Button variant="outline" size="sm" disabled={isExporting} onClick={() => !isExporting && setPdfMenuOpen(v => !v)}>
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? "書き出し中..." : "PDFエクスポート"}
              {!isExporting && <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
            {pdfMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPdfMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-card border rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                    onClick={() => { handleExportAll(); setPdfMenuOpen(false); }}
                  >
                    <FileDown className="h-4 w-4 text-muted-foreground" />
                    一括書き出し
                  </button>
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                    onClick={() => { handleExportPerBusiness(); setPdfMenuOpen(false); }}
                  >
                    <Download className="h-4 w-4 text-muted-foreground" />
                    事業ごとに書き出し
                  </button>
                </div>
              </>
            )}
          </div>
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
          <div
            style={{ zIndex: 50 }}
            className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center gap-4"
          >
            <div className="bg-card rounded-xl px-8 py-6 flex flex-col items-center gap-3 shadow-2xl">
              <FileDown className="h-8 w-8 text-primary animate-bounce" />
              <p className="text-base font-semibold">PDFを生成中...</p>
              <p className="text-sm text-muted-foreground">
                {exportBatch
                  ? `${exportBatchIdx + 1} / ${exportBatch.length} — ${exportBatch[exportBatchIdx].name}`
                  : `${currentProject.slides.length}枚のスライドを書き出しています`}
              </p>
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          </div>
          <PDFExportLayer
            key={exportBatch ? `batch-${exportBatchIdx}` : "all"}
            slides={exportBatch ? exportBatch[exportBatchIdx].slides : currentProject.slides}
            projectName={exportBatch ? exportBatch[exportBatchIdx].name : currentProject.name}
            designSystem={designSystem}
            onDone={() => {
              if (exportBatch && exportBatchIdx < exportBatch.length - 1) {
                setExportBatchIdx((i) => i + 1);
              } else {
                setExportBatch(null);
                setExportBatchIdx(0);
                setIsExporting(false);
              }
            }}
            onError={(err) => {
              console.error("PDF export error:", err);
              setExportBatch(null);
              setExportBatchIdx(0);
              setIsExporting(false);
            }}
          />
        </>
      )}
    </div>
  );
}
