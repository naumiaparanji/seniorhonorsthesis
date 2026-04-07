import { MousePointerClick } from "lucide-react";

export default function StudyViewHero() {
  return (
    <div className="ui-card p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Flashcards for VideoPoints
          </h1>

          <p className="ui-muted text-sm leading-relaxed">
            Welcome! Explore and study flashcards generated from lectures of your favorite courses.
            Use the filters to find cards relevant to specific courses, lectures, or topics. Happy studying:)
          </p>

          <p className="ui-muted text-sm leading-relaxed flex items-start gap-2">
            <MousePointerClick className="w-8 h-8 mt-1" />
            <span> After every session, please consider{" "} <strong>leaving feedback at the bottom of the page</strong>{" "}
            to help us improve the flashcards and your studying experience! </span>
          </p>

          <p className="ui-muted text-sm leading-relaxed bg-gray-300 p-3 rounded-md border-l-4 border-gray-700">
          Please consider taking{' '}
          <a 
            href="https://docs.google.com/forms/d/e/1FAIpQLSdI8OU_1fhDBZsmxIWz0VIbRyHB-wrRkMMPVZfWfakOH02WqA/viewform?usp=header" 
            target="_blank"  rel="noopener noreferrer"  className="underline font-medium text-black-1000" >
            this research survey </a> 
          {' '}as well; it helps us understand how students use the flashcards and how we can improve them!
          </p>
            </div>

        <div className="flex flex-col items-center md:items-end w-full md:w-[280px] gap-3">
        <a 
            href="https://youtu.be/l2PbtwJFdFA" target="_blank" rel="noopener noreferrer" className="group block w-full"  >
            <img src="/ThumbnailDemoVideo.png" alt="Demo video thumbnail" className="w-full h-auto rounded-xl border border-[var(--border)] shadow-sm group-hover:opacity-90 transition"/> 
        </a>
        <a
            href="https://youtu.be/l2PbtwJFdFA" target="_blank" rel="noopener noreferrer" className="w-full flex justify-center bg-white border border-[var(--border)] px-4 py-2 
            rounded-full text-sm font-medium shadow hover:bg-gray-50 hover:scale-105 transition">
            ▶ Watch Demo
        </a>
        </div>
      </div>
    </div>
  );
}