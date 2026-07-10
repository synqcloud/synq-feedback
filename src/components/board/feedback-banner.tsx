import Image from "next/image";

export function FeedbackBanner({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div
      className="rounded-t-xl px-6 py-10 sm:px-8"
      style={{
        background: "linear-gradient(135deg, var(--color-banner-from), var(--color-banner-to))",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
          <Image src="/synq-icon.png" alt="" width={20} height={20} priority />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-banner-fg">{name}</h1>
      </div>
      {description && (
        <p className="mt-2 max-w-md text-sm text-banner-fg/80">{description}</p>
      )}
    </div>
  );
}
