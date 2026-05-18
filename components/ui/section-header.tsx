import { cn } from "@/lib/utils/cn";

type SectionHeaderProps = {
  label: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function SectionHeader({ label, title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div>
        <p className="section-label">{label}</p>
        <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.02em] text-foreground">{title}</h2>
        {description ? <p className="mt-1.5 max-w-xl body-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
