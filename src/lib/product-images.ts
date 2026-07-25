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
  "ludex-oud-noir": p2,
  "xtacy-amber-rouge": p3,
  "skywalk-signature": p1,
  "ace-intense": p4,
  "essenza-lagos-nights": p3,
  "regal-oud": p2,
  "xtacy-rose-absolue": p3,
  "ludex-amber-kingdom": p2,
  "club-de-nuit-intense-man": p1,
  "club-de-nuit-sillage": p4,
  "club-de-nuit-untold": p2,
  "club-de-nuit-milestone": p3,
  "club-de-nuit-woman": p1,
};

export function imageForSlug(slug: string, fallback = heroImg): string {
  return bySlug[slug] ?? fallback;
}

export { heroImg };
