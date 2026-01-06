interface ChapterBadgeProps {
  chapter: string;
}

export default function ChapterBadge({ chapter }: ChapterBadgeProps) {
  return (
    <span class="text-aadish text-sm tracking-normal align-baseline">
      [{chapter}]
    </span>
  );
}