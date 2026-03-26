type Flashcard = {
  id: string;
  course: string;
  lecture: string;
  topics: string[];
  question: string;
  answer: string;
  category: 'What' | 'How' | 'Why';
  importance: number;
};

type FlashcardItemProps = {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
};

export default function FlashcardItem({
  card,
  isFlipped,
  onFlip,
}: FlashcardItemProps) {
  return (
    <div onClick={onFlip} className="h-72 cursor-pointer perspective-1000 group">
      <div
        className={`relative w-full h-full transition-transform duration-700 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT */}
        <div className="absolute inset-0 backface-hidden ui-card !bg-white p-6 flex flex-col justify-between overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium ui-muted truncate">{card.lecture}</span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-1 rounded-full border border-[var(--border)] bg-white ui-muted">
                  {card.category}
                </span>
                <span className="text-[11px] px-2 py-1 rounded-full border border-[var(--border)] bg-white ui-muted">
                  Imp {card.importance}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-14 overflow-y-auto">
              {card.topics.map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-2 py-1 rounded-full bg-[var(--accent-soft)] text-black/80"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center text-center px-2">
            <p className="text-lg font-semibold leading-snug">{card.question}</p>
          </div>

          <div className="text-center">
            <p className="text-xs ui-muted">Click to reveal answer</p>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 ui-card !bg-gray-200 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium ui-muted truncate">{card.lecture}</span>
          </div>

          <div className="flex-1 flex items-center justify-center text-center px-2">
            <p className="text-base leading-relaxed">{card.answer}</p>
          </div>

          <div className="text-center">
            <p className="text-xs ui-muted">Click to see question</p>
          </div>
        </div>
      </div>
    </div>
  );
}