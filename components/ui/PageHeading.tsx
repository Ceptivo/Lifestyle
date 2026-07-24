export function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-serif text-2xl text-charcoal">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-charcoal-soft">{subtitle}</p>}
    </div>
  );
}
