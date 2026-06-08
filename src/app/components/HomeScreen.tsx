import { useState } from "react";
import { Plus, Trash2, Calendar, Presentation, Loader2 } from "lucide-react";
import { Project } from "../types/project";
import { BUSINESS_COLORS } from "../data/slide-structures";
import { cn } from "./ui/utils";

interface HomeScreenProps {
  projects: Project[];
  loading?: boolean;
  onNew: () => void;
  onOpen: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function HomeScreen({ projects, loading, onNew, onOpen, onDelete }: HomeScreenProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b px-8 h-14 flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 rounded-md bg-[#1A1A1A] flex items-center justify-center shrink-0">
          <Presentation className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Slide Generator</span>
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
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white text-sm font-medium rounded-lg hover:bg-[#333333] transition-colors"
          >
            <Plus className="h-4 w-4" />
            新規作成
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {/* New card */}
          <button onClick={onNew} className="flex flex-col gap-2.5 group">
            <div className="aspect-[4/3] border-2 border-dashed border-border rounded-xl flex items-center justify-center transition-all group-hover:border-[#1A1A1A] group-hover:bg-[#1A1A1A]/8">
              <Plus className="h-7 w-7 text-muted-foreground/50 group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors text-center">新規作成</span>
          </button>

          {/* Project cards */}
          {projects.map((project) => {
            const colors = BUSINESS_COLORS[project.businessType] ?? Object.values(BUSINESS_COLORS)[0];
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
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(project.id);
                    }}
                    className={cn(
                      "absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shadow-sm",
                      hoveredId === project.id ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
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
                  </div>
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
