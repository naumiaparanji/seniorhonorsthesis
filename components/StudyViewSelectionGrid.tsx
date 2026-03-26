type SelectionGridProps = {
  availableCourses: string[];
  availableLectures: string[];
  availableTopics: string[];
  selectedCourses: string[];
  selectedLectures: string[];
  selectedTopics: string[];
  onCourseSelect: (course: string) => void;
  onLectureToggle: (lecture: string) => void;
  onTopicToggle: (topic: string) => void;
};

export default function StudyViewSelectionGrid({
  availableCourses,
  availableLectures,
  availableTopics,
  selectedCourses,
  selectedLectures,
  selectedTopics,
  onCourseSelect,
  onLectureToggle,
  onTopicToggle,
}: SelectionGridProps) {
  return (
    <div className="ui-card p-6 sm:p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Course */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold tracking-widest uppercase ui-muted">
            1. Course
          </div>
          <div className="flex flex-wrap gap-2 max-h-50 overflow-y-auto pr-1 topic-scroll">
            {availableCourses.map((c) => (
              <button
                key={c}
                onClick={() => onCourseSelect(c)}
                className={`ui-btn ui-ring-accent px-3 py-2 text-xs border border-[var(--border)] ${
                  selectedCourses.includes(c)
                    ? "bg-[var(--accent-soft)] text-black"
                    : "bg-white text-[var(--muted)] hover:opacity-80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Lectures */}
        <div
          className={`space-y-3 md:border-l md:border-[var(--border)] md:pl-8 transition-all ${
            selectedCourses.length > 0 ? "opacity-100" : "opacity-30 pointer-events-none"
          }`}
        >
          <div className="text-[11px] font-semibold tracking-widest uppercase ui-muted">
            2. Lectures
          </div>
          <div className="flex flex-wrap gap-2 max-h-50 overflow-y-auto pr-1 topic-scroll">
            {availableLectures.map((l) => (
              <button
                key={l}
                onClick={() => onLectureToggle(l)}
                className={`ui-btn ui-ring-accent px-3 py-2 text-xs border border-[var(--border)] ${
                  selectedLectures.includes(l)
                    ? "bg-[var(--accent-soft)] text-black"
                    : "bg-white text-[var(--muted)] hover:opacity-80"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-3 md:border-l md:border-[var(--border)] md:pl-8">
          <div className="text-[11px] font-semibold tracking-widest uppercase ui-muted">
            3. Topics
          </div>

          <div className="flex flex-wrap gap-2 max-h-50 overflow-y-auto pr-1 topic-scroll">
            {selectedLectures.length > 0 ? (
              availableTopics.length > 0 ? (
                availableTopics.map((t) => (
                  <button
                    key={t}
                    onClick={() => onTopicToggle(t)}
                    className={`ui-btn ui-ring-accent px-3 py-2 text-xs border border-[var(--border)] ${
                      selectedTopics.includes(t)
                        ? "bg-[var(--accent-soft)] text-black"
                        : "bg-white text-[var(--muted)] hover:opacity-80"
                    }`}
                  >
                    {t}
                  </button>
                ))
              ) : (
                <p className="text-sm ui-muted italic">
                  No specific topics found for these lectures.
                </p>
              )
            ) : (
              <p className="text-sm ui-muted italic">
                Select a lecture to see specific topics…
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}