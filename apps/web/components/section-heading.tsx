import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  description,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn('mb-6', className)}>
      {eyebrow ? <div className="text-xs font-bold uppercase tracking-[0.22em] text-orange-500">{eyebrow}</div> : null}
      <h2 className="mt-2 font-[var(--font-jakarta)] text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
      {description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p> : null}
    </div>
  );
}
