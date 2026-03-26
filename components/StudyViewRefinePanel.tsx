type RefinePanelProps = {
  cardCount: number;
  searchQuery: string;
  activeCategories: string[];
  minImportance: number;
  onSearchChange: (value: string) => void;
  onCategoryToggle: (category: string) => void;
  onMinImportanceChange: (value: number) => void;
  onLaunchFlashcardMode: () => void;
  onResetFilters: () => void;
  disableLaunch: boolean;
};

export default function StudyViewRefinePanel({
  cardCount,
  searchQuery,
  activeCategories,
  minImportance,
  onSearchChange,
  onCategoryToggle,
  onMinImportanceChange,
  onLaunchFlashcardMode,
  onResetFilters,
  disableLaunch,
}: RefinePanelProps) {
  return (
    <>
      {/* Refine header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-lg font-semibold">Refine</h2>
          <p className="text-sm ui-muted">Viewing {cardCount} cards</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLaunchFlashcardMode}
            disabled={disableLaunch}
            className="ui-btn ui-btn-primary ui-ring-accent text-xs disabled:opacity-50"
          >
            Launch Flashcard mode
          </button>

          <button
            onClick={onResetFilters}
            className="text-sm ui-muted hover:text-black transition inline-flex items-center gap-2"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-white">
              ↻
            </span>
            Clear filters
          </button>
        </div>
      </div>

      {/* Refine bar */}
      <div className="ui-card p-4 sm:p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-[420px]">
          <input
            type="text"
            placeholder="Search questions or topics…"
            className="w-full rounded-xl border border-[var(--border)] bg-white pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <span className="absolute left-3 top-1 text-3xl text-[var(--muted)]">⌕</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="ui-card p-1 flex items-center gap-1">
            {['What', 'How', 'Why'].map((cat) => {
              const active = activeCategories.includes(cat);
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryToggle(cat)}
                  className={`ui-btn ui-ring-accent px-4 py-2 text-xs ${
                    active
                      ? "bg-[#111111] text-white"
                      : "bg-transparent text-[var(--muted)] hover:opacity-80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="ui-card px-4 py-3 flex items-center gap-3">
            <span className="text-xs ui-muted font-medium">Min importance</span>
            <input
              type="range"
              min="1"
              max="5"
              value={minImportance}
              onChange={(e) => onMinImportanceChange(parseInt(e.target.value))}
              className="w-24 accent-[var(--accent)]"
            />
            <span className="text-sm font-semibold">{minImportance}</span>
          </div>
        </div>
      </div>
    </>
  );
}