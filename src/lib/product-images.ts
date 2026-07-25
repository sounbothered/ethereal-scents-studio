import heroImg from "@/assets/perfume-hero.jpg";
import p1 from "@/assets/perfume-1.jpg";
import p2 from "@/assets/perfume-2.jpg";
import p3 from "@/assets/perfume-3.jpg";
import p4 from "@/assets/perfume-4.jpg";

const bySlug: Record<string, string> = {
  "nocturne-01": p1,
  "velvet-hour": p2,
  "golden-veil": p3,
  "midnight-tide": p4,
};

export function imageForSlug(slug: string, fallback = heroImg): string {
  return bySlug[slug] ?? fallback;
}

export { heroImg };
