"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Layers,
  Video,
  FileQuestion,
  ChevronDown,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

interface CurriculumSidebarProps {
  courseTitle: string;
  modules: any[];
  activeView: "COURSE" | "MODULE" | "CHAPTER";
  currentModuleId: string | null;
  currentChapterId: string | null;
  onSelectCourse: () => void;
  onSelectModule: (mod: any) => void;
  onSelectChapter: (moduleId: string, chap: any) => void;
  onAddModule: () => void;
  onAddChapter: (moduleId: string, type: "VIDEO" | "ASSESSMENT") => void;
  onDeleteModule: (moduleId: string, title: string) => void;
  onDeleteChapter: (chapterId: string, title: string) => void;
  onMoveModule: (index: number, direction: "UP" | "DOWN", e: React.MouseEvent) => void;
  onMoveChapter: (mod: any, index: number, direction: "UP" | "DOWN", e: React.MouseEvent) => void;
}

export default function CurriculumSidebar({
  courseTitle,
  modules,
  activeView,
  currentModuleId,
  currentChapterId,
  onSelectCourse,
  onSelectModule,
  onSelectChapter,
  onAddModule,
  onAddChapter,
  onDeleteModule,
  onDeleteChapter,
  onMoveModule,
  onMoveChapter,
}: CurriculumSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "VIDEO" | "ASSESSMENT">("ALL");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const toggleModule = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedModules((prev) => ({ ...prev, [id]: prev[id] === false ? true : false }));
  };

  // Filter modules/chapters based on search and filter type
  const filteredModules = modules
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((mod) => {
      const filteredChapters = (mod.chapters || [])
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
        .filter((chap: any) => {
          const matchesSearch =
            searchQuery.trim() === "" ||
            chap.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            mod.title?.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesType = filterType === "ALL" || chap.type === filterType;
          return matchesSearch && matchesType;
        });

      return {
        ...mod,
        filteredChapters,
      };
    })
    .filter((mod) => {
      if (searchQuery.trim() === "") return true;
      return (
        mod.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.filteredChapters.length > 0
      );
    });

  const totalVideos = modules.reduce(
    (acc, m) => acc + (m.chapters?.filter((c: any) => c.type === "VIDEO")?.length || 0),
    0
  );
  const totalQuizzes = modules.reduce(
    (acc, m) => acc + (m.chapters?.filter((c: any) => c.type === "ASSESSMENT")?.length || 0),
    0
  );

  return (
    <div className="w-full flex flex-col bg-card rounded-2xl border border-border/70 shadow-xs overflow-hidden h-[calc(100vh-140px)] min-h-[640px] sticky top-20">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border/60 bg-muted/20 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-primary" />
            <span className="text-xs font-black uppercase tracking-wider text-foreground">
              Curriculum Tree
            </span>
          </div>
          <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
            {modules.length} {modules.length === 1 ? "Mod" : "Mods"} • {totalVideos + totalQuizzes} Lessons
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons or topics..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-background border border-border outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-2 py-1 rounded-lg transition-colors ${
              filterType === "ALL"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            All ({totalVideos + totalQuizzes})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("VIDEO")}
            className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              filterType === "VIDEO"
                ? "bg-blue-600 text-white"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            <Video size={10} /> Videos ({totalVideos})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("ASSESSMENT")}
            className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              filterType === "ASSESSMENT"
                ? "bg-amber-600 text-white"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            <FileQuestion size={10} /> Quizzes ({totalQuizzes})
          </button>
        </div>
      </div>

      {/* Course Overview Selector Button */}
      <div className="p-2 border-b border-border/60 shrink-0">
        <button
          type="button"
          onClick={onSelectCourse}
          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
            activeView === "COURSE"
              ? "bg-primary/10 border-primary text-primary font-bold shadow-2xs"
              : "border-transparent hover:bg-muted/40 text-foreground"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
              activeView === "COURSE"
                ? "bg-primary text-primary-foreground font-black"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <BookOpen size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold truncate">Course Settings & Landing</p>
            <p className="text-[10px] text-muted-foreground truncate">Metadata, pricing, banner</p>
          </div>
        </button>
      </div>

      {/* Modules & Chapters Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40 p-2 space-y-1 custom-scrollbar">
        {filteredModules.map((mod: any, mIdx: number) => {
          const isExpanded = expandedModules[mod.id] !== false; // default expanded
          const isModActive = activeView === "MODULE" && currentModuleId === mod.id;
          const chapters = mod.filteredChapters || [];

          return (
            <div key={mod.id} className="rounded-xl overflow-hidden border border-border/40 bg-card">
              {/* Module Row */}
              <div
                onClick={() => onSelectModule(mod)}
                className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors group/mod ${
                  isModActive
                    ? "bg-primary/15 border-l-4 border-primary text-primary"
                    : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => toggleModule(mod.id, e)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded transition-transform"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        isExpanded ? "" : "-rotate-90"
                      }`}
                    />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                        M{mod.order || mIdx + 1}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ({chapters.length})
                      </span>
                    </div>
                    <p
                      className={`text-xs font-bold truncate mt-0.5 ${
                        isModActive ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {mod.title || `Module ${mIdx + 1}`}
                    </p>
                  </div>
                </div>

                {/* Module Quick Controls */}
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/mod:opacity-100 transition-opacity">
                  <button
                    type="button"
                    disabled={mIdx === 0}
                    onClick={(e) => onMoveModule(mIdx, "UP", e)}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                    title="Move Module Up"
                  >
                    <ArrowUp size={11} />
                  </button>
                  <button
                    type="button"
                    disabled={mIdx === modules.length - 1}
                    onClick={(e) => onMoveModule(mIdx, "DOWN", e)}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-20"
                    title="Move Module Down"
                  >
                    <ArrowDown size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteModule(mod.id, mod.title);
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete Module"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Chapters inside Module */}
              {isExpanded && (
                <div className="bg-muted/10 border-t border-border/30 divide-y divide-border/20">
                  {chapters.map((chap: any, cIdx: number) => {
                    const isChapActive =
                      activeView === "CHAPTER" && currentChapterId === chap.id;

                    return (
                      <div
                        key={chap.id}
                        onClick={() => onSelectChapter(mod.id, chap)}
                        className={`px-3 py-2 flex items-center justify-between cursor-pointer text-xs transition-colors group/chap ${
                          isChapActive
                            ? "bg-primary/20 border-l-4 border-primary text-primary font-bold"
                            : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 pl-3">
                          {chap.type === "VIDEO" ? (
                            <Video
                              size={13}
                              className={isChapActive ? "text-primary shrink-0" : "text-blue-500 shrink-0"}
                            />
                          ) : (
                            <FileQuestion
                              size={13}
                              className={isChapActive ? "text-primary shrink-0" : "text-amber-500 shrink-0"}
                            />
                          )}
                          <span className="truncate">{chap.title || `Lesson ${cIdx + 1}`}</span>
                        </div>

                        {/* Chapter Quick Actions */}
                        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover/chap:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={cIdx === 0}
                            onClick={(e) => onMoveChapter(mod, cIdx, "UP", e)}
                            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                          >
                            <ArrowUp size={10} />
                          </button>
                          <button
                            type="button"
                            disabled={cIdx === chapters.length - 1}
                            onClick={(e) => onMoveChapter(mod, cIdx, "DOWN", e)}
                            className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-20"
                          >
                            <ArrowDown size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChapter(chap.id, chap.title);
                            }}
                            className="p-0.5 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Lesson / Quiz to this module buttons */}
                  <div className="p-2 pl-6 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onAddChapter(mod.id, "VIDEO")}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-md transition-colors"
                    >
                      <Plus size={11} /> Video Lesson
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddChapter(mod.id, "ASSESSMENT")}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-md transition-colors"
                    >
                      <Plus size={11} /> Quiz Assessment
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredModules.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No lessons match your search criteria.
          </div>
        )}
      </div>

      {/* Sticky Bottom Add Module Button */}
      <div className="p-3 border-t border-border/60 bg-muted/20 shrink-0">
        <button
          type="button"
          onClick={onAddModule}
          className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs"
        >
          <Plus size={14} /> Add New Module
        </button>
      </div>
    </div>
  );
}
