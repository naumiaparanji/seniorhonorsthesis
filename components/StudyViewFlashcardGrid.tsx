import FlashcardItem from "@/components/FlashcardItem";

type Flashcard = {
  id: string;
  course: string;
  lecture: string;
  topics: string[];
  question: string;
  answer: string;
  category: "What" | "How" | "Why";
  importance: number;
};

type FlashcardGridProps = {
  loading: boolean;
  cards: Flashcard[];
  flippedId: string | null;
  onFlip: (id: string) => void;
};

export default function FlashcardGrid({
  loading,
  cards,
  flippedId,
  onFlip,
}: FlashcardGridProps) {
  if (loading) {
    return (
      <div className="ui-card p-10 text-center ui-muted animate-pulse">
        Fetching cards…
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="ui-card p-10 text-center">
        <p className="text-sm ui-muted">No matching cards found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <FlashcardItem
          key={card.id}
          card={card}
          isFlipped={flippedId === card.id}
          onFlip={() => onFlip(card.id)}
        />
      ))}
    </div>
  );
}