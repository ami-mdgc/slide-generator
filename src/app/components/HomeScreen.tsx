import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Calendar, Presentation, Loader2, LogOut, MoreHorizontal, Copy } from "lucide-react";
import { Project } from "../types/project";
import { PresenceData } from "../lib/presence";
import { BUSINESS_COLORS } from "../data/slide-structures";
import { cn } from "./ui/utils";

interface HomeScreenProps {
  projects: Project[];
  loading?: boolean;
  presence: PresenceData[];
  currentSessionId: string;
  userName?: string;
  userPhoto?: string;
  onNew: (slideType: string) => void;
  onOpen: (project: Project) => void;
  onDelete: (id: string) => void;
  onDuplicate: (project: Project) => void;
  onSignOut: () => void;
}

export function HomeScreen({ projects, loading, presence, currentSessionId, userName, userPhoto, onNew, onOpen, onDelete, onDuplicate, onSignOut }: HomeScreenProps) {
  const [selectedSlideType, setSelectedSlideType] = useState("月次総会");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  const viewersOf = (projectId: string) =>
    presence.filter(p => p.projectId === projectId && p.sessionId !== currentSessionId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b px-8 h-14 flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 rounded-md bg-[#1A1A1A] flex items-center justify-center shrink-0">
          <Presentation className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Slide Generator</span>
        <div className="ml-auto relative">
          <button
            onClick={() => setUserMenuOpen(v => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm"
          >
            {userPhoto
              ? <img src={userPhoto} className="w-6 h-6 rounded-full" />
              : <div className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium">{userName?.slice(0, 1)}</div>
            }
            <span className="text-sm">{userName}</span>
          </button>
          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-40 bg-card border rounded-lg shadow-lg z-20 py-1 overflow-hidden">
                <button
                  onClick={() => { onSignOut(); setUserMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  ログアウト
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-8 py-10 max-w-screen-xl mx-auto w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold">プレゼンテーション</h1>
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
              {loading ? (
                <><Loader2 className="h-3 w-3 animate-spin" />読み込み中...</>
              ) : projects.length > 0 ? `${projects.length}件` : "まだ作成されていません"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedSlideType}
              onChange={(e) => setSelectedSlideType(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm cursor-pointer"
            >
              <option value="月次総会">通常</option>
              <option value="四半期報告">四半期</option>
            </select>
            <button
              onClick={() => onNew(selectedSlideType)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white text-sm font-medium rounded-lg hover:bg-[#333333] transition-colors"
            >
              <Plus className="h-4 w-4" />
              新規作成
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {/* New card */}
          <button onClick={() => onNew(selectedSlideType)} className="flex flex-col gap-2.5 group">
            <div className="aspect-[4/3] border-2 border-dashed border-border rounded-xl flex items-center justify-center transition-all group-hover:border-[#1A1A1A] group-hover:bg-[#1A1A1A]/8">
              <Plus className="h-7 w-7 text-muted-foreground/50 group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors text-center">新規作成</span>
          </button>

          {/* Project cards */}
          {projects.map((project) => {
            const colors = BUSINESS_COLORS[project.businessType] ?? Object.values(BUSINESS_COLORS)[0];
            const viewers = viewersOf(project.id);
            return (
              <div
                key={project.id}
                className="flex flex-col gap-2.5 group"
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative">
                  <button
                    onClick={() => onOpen(project)}
                    className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-border relative bg-white shadow-sm transition-all hover:shadow-md hover:border-[#1A1A1A]/60"
                  >
                    {/* Tinted background */}
                    <div className="absolute inset-0" style={{ backgroundColor: colors.primary + "10" }} />
                    {/* Left accent bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: colors.primary }} />
                    {/* Slide preview */}
                    <div className="absolute inset-0 pl-4 pr-3 py-3 flex flex-col gap-1.5">
                      <div className="h-2 rounded-full w-2/3" style={{ backgroundColor: colors.primary }} />
                      <div className="h-1.5 rounded-full w-4/5 bg-black/8" />
                      <div className="h-1.5 rounded-full w-3/5 bg-black/8" />
                      <div className="mt-auto flex gap-1">
                        {Array.from({ length: Math.min(project.slides.length, 6) }).map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 h-5 rounded"
                            style={{ backgroundColor: colors.accent + "35" }}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Active viewers badge */}
                    {viewers.length > 0 && (
                      <div className="absolute top-2 left-2 flex -space-x-1.5">
                        {viewers.slice(0, 3).map(v => (
                          <div
                            key={v.sessionId}
                            title={`${v.name}が閲覧中`}
                            className="w-5 h-5 rounded-full bg-[#5969a7] border border-white flex items-center justify-center text-[9px] font-bold text-white"
                          >
                            {v.name.slice(0, 1)}
                          </div>
                        ))}
                      </div>
                    )}
                  </button>

                  {/* Three-dot menu button */}
                  <div
                    ref={openMenuId === project.id ? menuRef : null}
                    className={cn(
                      "absolute top-2 right-2 transition-all",
                      hoveredId === project.id || openMenuId === project.id ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === project.id ? null : project.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/90 text-muted-foreground hover:text-foreground hover:bg-white transition-all shadow-sm"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                    {openMenuId === project.id && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white border rounded-lg shadow-lg z-30 py-1 overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(project);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          複製
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(project.id);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 hover:text-destructive transition-colors text-left text-muted-foreground"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-0.5">
                  <p className="text-sm font-medium truncate leading-snug">{project.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-muted-foreground">{project.slideType}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground inline-flex items-center gap-0.5">
                      <Calendar className="h-3 w-3" />
                      {formatDate(project.updatedAt)}
                    </span>
                    {project.lastEditedBy && (
                      <>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{project.lastEditedBy}</span>
                      </>
                    )}
                  </div>
                  {viewers.length > 0 && (
                    <p className="text-[11px] text-[#5969a7] mt-0.5">
                      {viewers.map(v => v.name).join('、')}が閲覧中
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {projects.length === 0 && (
          <div className="mt-4 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#1A1A1A]/20 flex items-center justify-center mb-4">
              <Presentation className="h-7 w-7 text-white/40" />
            </div>
            <p className="text-sm font-medium text-foreground">プレゼンテーションがありません</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">「新規作成」からはじめましょう</p>
            <button
              onClick={onNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white text-sm font-medium rounded-lg hover:bg-[#333333] transition-colors"
            >
              <Plus className="h-4 w-4" />
              新規作成
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
