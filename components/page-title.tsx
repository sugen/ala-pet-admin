export function PageTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 border-b border-line pb-5">
      <h1 className="text-3xl font-semibold tracking-normal text-ink">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-ink/65">{description}</p>
    </div>
  );
}