export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
        <p>
          ChurnScope is a personal data science portfolio project. Every figure shown comes from the
          dataset you load or from JSON exported by the Python pipeline - nothing is fabricated.
        </p>
        <p className="mt-1">Built with React, TypeScript, Tailwind CSS, Recharts and scikit-learn.</p>
      </div>
    </footer>
  );
}
