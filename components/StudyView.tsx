"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import FlashcardMode from "@/components/StudyViewFlashcardMode";
import FeedbackCard from "@/components/FeedbackCard";
import StudyViewHero from "@/components/StudyViewHero";
import StudyViewSelectionGrid from "@/components/StudyViewSelectionGrid";
import StudyViewRefinePanel from "@/components/StudyViewRefinePanel";
import StudyViewFlashcardGrid from "@/components/StudyViewFlashcardGrid";

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

export default function StudyView() {
  const [loading, setLoading] = useState(false);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [allFetchedCards, setAllFetchedCards] = useState<Flashcard[]>([]);
  const [displayCards, setDisplayCards] = useState<Flashcard[]>([]);
  //const [showFeedbackReminder, setShowFeedbackReminder] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [availableLectures, setAvailableLectures] = useState<string[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>(['COSC1336']);
  const [selectedLectures, setSelectedLectures] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [minImportance, setMinImportance] = useState(1);
  const [activeCategories, setActiveCategories] = useState<string[]>(['What', 'How', 'Why']);
  const [flashcardModeOpen, setFlashcardModeOpen] = useState(false);

  const resetFilters = () => {
    setSearchQuery('');
    setMinImportance(1);
    setActiveCategories(['What', 'How', 'Why']);
    setSelectedTopics([]);
  };

  // 1. Initial Load: Fetch Available Courses
  useEffect(() => {
    const fetchCourses = async () => {
      const { data } = await supabase.from('flashcards').select('course');
      setAvailableCourses(Array.from(new Set(data?.map(i => i.course))).filter(Boolean) as string[]);
    };
    fetchCourses();
  }, []);

  // 2. Fetch Lectures based on Course
  useEffect(() => {
    const fetchLectures = async () => {
      if (selectedCourses.length === 0) {
        setAvailableLectures([]);
        return;
      }
      const { data } = await supabase.from('flashcards').select('lecture').in('course', selectedCourses);
      setAvailableLectures(Array.from(new Set(data?.map(i => i.lecture))).filter(Boolean) as string[]);
    };
    fetchLectures();
  }, [selectedCourses]);

  // 3. Fetch Topics based on Course + Selected Lectures
  useEffect(() => {
    const fetchTopics = async () => {
      if (selectedLectures.length === 0) {
        setAvailableTopics([]);
        return;
      }
      const { data } = await supabase
        .from('flashcards')
        .select('topics')
        .in('course', selectedCourses)
        .in('lecture', selectedLectures);

      const flattened = data?.flatMap(i => i.topics) || [];
      setAvailableTopics(Array.from(new Set(flattened)).filter(Boolean) as string[]);
    };
    fetchTopics();
  }, [selectedCourses, selectedLectures]);

  // 4. Fetch cards
  useEffect(() => {
    const fetchCards = async () => {
      if (selectedLectures.length === 0) {
        setAllFetchedCards([]);
        return;
      }
      setLoading(true);
      const { data } = await supabase
        .from('flashcards')
        .select('*')
        .in('course', selectedCourses)
        .in('lecture', selectedLectures);

      if (data) setAllFetchedCards(data);
      setLoading(false);
    };
    fetchCards();
  }, [selectedCourses, selectedLectures]);

  // 5. Apply Client-side Filters
  useEffect(() => {
    let results = allFetchedCards.filter(card => {
      const matchesTopic =
        selectedTopics.length === 0 || card.topics.some(t => selectedTopics.includes(t));
      const matchesCategory = activeCategories.includes(card.category);
      const matchesImportance = card.importance >= minImportance;
      const matchesSearch =
        card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTopic && matchesCategory && matchesImportance && matchesSearch;
    });

    results.sort((a, b) => {
      const catOrder: Record<string, number> = { What: 0, How: 1, Why: 2 };
      if (catOrder[a.category] !== catOrder[b.category]) {
        return catOrder[a.category] - catOrder[b.category];
      }
      return b.importance - a.importance;
    });

    setDisplayCards(results);
  }, [allFetchedCards, selectedTopics, activeCategories, minImportance, searchQuery]);

// handlers for selection grid
  const handleCourseSelect = (course: string) => {
  setSelectedCourses([course]);
  setSelectedLectures([]);
  setSelectedTopics([]);
  setFlashcardModeOpen(false);
};

const handleLectureToggle = (lecture: string) => {
  const next = selectedLectures.includes(lecture)
    ? selectedLectures.filter(x => x !== lecture)
    : [...selectedLectures, lecture];

  setSelectedLectures(next);
  setSelectedTopics([]);
  setFlashcardModeOpen(false);
};

const handleTopicToggle = (topic: string) => {
  setSelectedTopics(prev =>
    prev.includes(topic) ? prev.filter(x => x !== topic) : [...prev, topic]
  );
  setFlashcardModeOpen(false);
};

{/* Study View Return Wraper */}
  return (
    <div className="space-y-8">

      <StudyViewHero />

      <StudyViewSelectionGrid
        availableCourses={availableCourses}
        availableLectures={availableLectures}
        availableTopics={availableTopics}
        selectedCourses={selectedCourses}
        selectedLectures={selectedLectures}
        selectedTopics={selectedTopics}
        onCourseSelect={handleCourseSelect}
        onLectureToggle={handleLectureToggle}
        onTopicToggle={handleTopicToggle}
      />

      {selectedLectures.length > 0 ? (
        flashcardModeOpen ? (
          <FlashcardMode
            cards={displayCards}
            onExit={() => setFlashcardModeOpen(false)}
            courseId={selectedCourses[0] || "Unknown"}
            lectures={selectedLectures}
          />
        ) : (
          <div className="space-y-6">
          <StudyViewRefinePanel
            cardCount={displayCards.length}
            searchQuery={searchQuery}
            activeCategories={activeCategories}
            minImportance={minImportance}
            onSearchChange={setSearchQuery}
            onCategoryToggle={(category) =>
              setActiveCategories((prev) =>
                prev.includes(category)
                  ? prev.filter((c) => c !== category)
                  : [...prev, category]
              )
            }
            onMinImportanceChange={setMinImportance}
            onLaunchFlashcardMode={() => setFlashcardModeOpen(true)}
            onResetFilters={resetFilters}
            disableLaunch={displayCards.length === 0}
          />

            {/* Cards grid */}
            <StudyViewFlashcardGrid
              loading={loading}
              cards={displayCards}
              flippedId={flippedId}
              onFlip={(id) => setFlippedId(flippedId === id ? null : id)}
            />

            {displayCards.length > 0 && !loading && (
              <FeedbackCard
                courseId={selectedCourses[0] || "Unknown"}
                lectures={selectedLectures}
                cardCount={displayCards.length}
              />
            )}
          </div>
        )
      ) : (
        <div className="ui-card p-10 text-center">
          <p className="text-sm ui-muted">Select one or more lectures to begin.</p>
        </div>
      )}
    </div>
  );
}
