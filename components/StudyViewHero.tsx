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
            className="ui-btn ui-ring-accent border border-[var(--border)] bg-white text-sm hover:bg-[var(--accent-soft)] transition"
          >
            Watch demo video!
          </a>

          <p className="text-sm ui-muted mt-2 max-w-[280px] text-right hidden md:block">
            This is a quick video going over the features of this website.
          </p>
          <p className="text-sm ui-muted mt-2 max-w-[280px] text-right hidden md:block">
            Runtime is approximately 5 minutes. Please contact us with any questions.
          </p>
        </div>
      </div>
    </div>
  );
}