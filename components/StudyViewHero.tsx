export default function StudyViewHero() {
  return (
    <div className="ui-card p-6 sm:p-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Flashcards for VideoPoints
          </h1>

          <p className="ui-muted text-sm leading-relaxed">
            Welcome to the Flashcards website for VideoPoints.
          </p>

          <p className="ui-muted text-sm leading-relaxed">
            Here, you can explore and study flashcards generated from lecture transcripts of your favorite courses.
            Use the filters to find cards relevant to specific courses, lectures, or topics. Click on a card to flip it
            and reveal the answer. Happy studying!
          </p>
        </div>

        <div className="flex md:flex-col items-start md:items-end">
        <a
            href="https://youtu.be/l2PbtwJFdFA"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block w-full md:w-[280px]"
        >
            <img
            src="/ThumbnailDemoVideo.png"
            alt="Demo video thumbnail"
            className="w-full h-auto rounded-xl border border-[var(--border)] shadow-sm group-hover:opacity-90 transition"
            />

            {/* Optional overlay button */}
            <div className="absolute inset-0 flex items-end justify-center pb-3">
            <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-medium shadow group-hover:scale-105 transition">
                ▶ Watch Demo
            </span>
            </div>
        </a>
        </div>
      </div>
    </div>
  );
}