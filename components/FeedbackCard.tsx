"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabase";

export default function FeedbackCard({
  courseId,
  lectures,
  cardCount,
}: {
  courseId: string;
  lectures: string[];
  cardCount: number;
}) {
  const [helpfulnessRating, setHelpfulnessRating] = useState<number | null>(null);
  const [qualityRating, setQualityRating] = useState<number | null>(null);
  const [studentComments, setStudentComments] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!helpfulnessRating || !qualityRating) {
      alert("Please rate both helpfulness and quality.");
      return;
    }

    setFeedbackSubmitting(true);

    const { error } = await supabase.from("session_feedback").insert([
      {
        course_id: courseId || "Unknown",
        lectures,
        helpfulness_rating: helpfulnessRating,
        quality_rating: qualityRating,
        student_comments: studentComments.trim() || null,
        card_count: cardCount,
      },
    ]);

    setFeedbackSubmitting(false);

    if (error) {
      alert("Error submitting feedback: " + error.message);
      return;
    }

    setFeedbackSubmitted(true);
    setHelpfulnessRating(null);
    setQualityRating(null);
    setStudentComments("");
  };

  if (feedbackSubmitted) {
    return (
      <div className="ui-card p-6 text-center">
        <h3 className="text-lg font-semibold">Thank you!</h3>
        <p className="text-sm ui-muted mt-1">
          Your feedback has been recorded and will help improve the flashcards.
        </p>
      </div>
    );
  }

  return (
    <div className="ui-card p-6 space-y-5">
      <div>
        <h3 className="text-lg font-semibold">Quick Feedback</h3>
        <p className="text-sm ui-muted">
          Help us improve these flashcards by sharing a quick rating.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">How helpful were these flashcards?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button key={num} type="button" onClick={() => setHelpfulnessRating(num)}
              className={`ui-btn ui-ring-accent h-10 w-10 p-0 border border-[var(--border)] ${
                helpfulnessRating === num
                  ? "bg-[#111111] text-white"
                  : "bg-white text-[var(--muted)]"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">How would you rate the quality and/or accuracy?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button key={num} type="button" onClick={() => setQualityRating(num)}
              className={`ui-btn ui-ring-accent h-10 w-10 p-0 border border-[var(--border)] ${
                qualityRating === num
                  ? "bg-[#111111] text-white"
                  : "bg-white text-[var(--muted)]"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Comments (optional)</p>
        <textarea
          value={studentComments} onChange={(e) => setStudentComments(e.target.value)}
          placeholder="Share anything that stood out, felt unclear, or could be improved..."
          className="w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm 
          outline-none focus:ring-2 focus:ring-[var(--accent)] min-h-[70px]"
        />
      </div>

      <button type="button" onClick={handleFeedbackSubmit} disabled={feedbackSubmitting}
        className="ui-btn ui-btn-primary ui-ring-accent disabled:opacity-50" >
        {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
      </button>
    </div>
  );
}