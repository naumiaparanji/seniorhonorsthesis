"use client";
import BaseCreator from './BaseCreator';

export default function CreatorViewStudent() {
  const downloadCSV = (cards: any[]) => {
    const header = "Question,Answer,Topics\n";
    const rows = cards.map(c => `"${c.question.replace(/"/g, '""')}","${c.answer.replace(/"/g, '""')}","${c.topics.join(';')}"`).join("\n");
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashcards_export.csv`;
    a.click();
  };

  return (
    <BaseCreator
      userRole="student"
      actionButton={(cards) => (
        <button
          onClick={() => downloadCSV(cards)}
          className="ui-btn ui-btn-primary ui-ring-accent w-full py-4 text-sm"
        >
          Download {cards.length} Cards (.csv)
        </button>
      )}
    />
  );
}