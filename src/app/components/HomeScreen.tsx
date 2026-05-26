import { useState } from "react";
import { Plus, Trash2, FileText } from "lucide-react";
import { Project, deleteProject } from "../types/project";
import { BUSINESS_COLORS } from "../data/slide-structures";
import { cn } from "./ui/utils";

interface HomeScreenProps {
  projects: Project[];
  onNew: () => void;
  onOpen: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function HomeScreen({ projects, onNew, onOpen, onDelete }: HomeScreenProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b px-8 py-4 flex items-center justify-between">
        <span className="font-semibold text-base">スライド生成</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-10 max-w-6xl mx-auto w-full">
        <h2 className="text-lg font-semibold mb-6">プレゼンテーション</h2>

        <div className="grid grid-cols-4 gap-5">
          {/* New button */}
          <button
            onClick={onNew}
            className="flex flex-col gap-3 group"
          >
            <div className="aspect-video border-2 border-dashed border-border rounded-lg flex items-center justify-center transition-colors group-hover:border-primary group-hover:bg-primary/5">
              <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">新規作成</span>
          </button>

          {/* Project cards */}
          {projects.map((project) => {
            const colors = BUSINESS_COLORS[project.businessType] ?? BUSINESS_COLORS["デフォルト"];
            return (
              <div
                key={project.id}
                className="flex flex-col gap-3 group"
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button
                  onClick={() => onOpen(project)}
                  className="aspect-video rounded-lg overflow-hidden border border-border relative shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Slide thumbnail preview */}
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: colors.primary + "12" }}
                  />
                  {/* Simulated slide content */}
                  <div className="absolute inset-0 p-4 flex flex-col gap-2">
                    <div
                      className="h-2 rounded w-3/5"
                      style={{ backgroundColor: colors.primary }}
                    />
                    <div className="h-1.5 rounded w-4/5 bg-current opacity-10" />
                    <div className="h-1.5 rounded w-3/5 bg-current opacity-10" />
                    <div className="h-1.5 rounded w-4/5 bg-current opacity-10" />
                    <div className="mt-auto flex gap-1">
                      {project.slides.slice(0, 5).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 h-8 rounded"
                          style={{ backgroundColor: colors.accent + "30" }}
                        />
                      ))}
                    </div>
                  </div>
                </button>

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {project.slideType} · {formatDate(project.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(project.id);
                    }}
                    className={cn(
                      "p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all shrink-0",
                      hoveredId === project.id ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground mt-2 col-span-4">
            まだプレゼンテーションがありません
          </p>
        )}
      </div>
    </div>
  );
}
