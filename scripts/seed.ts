import { db } from "@/lib/db";

/**
 * Seed script — populates the SQLite database with cinematic starter content
 * for the Baby Seven personal brand. Run via: `bun run scripts/seed.ts`
 */
async function main() {
  console.log("🌱 Seeding Baby Seven DB...");

  // --- Projects -----------------------------------------------------------
  const projects = [
    {
      title: "Blood Disaster",
      category: "Writing",
      description:
        "The #1 ranked dystopian thriller novel. A story of collapse, blood, and the price of survival in a city that forgot how to love.",
      coverImage:
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=1200&q=80&auto=format&fit=crop",
      videoUrl: null,
      isFeatured: true,
      rank: 1,
    },
    {
      title: "Neon Requiem",
      category: "Writing",
      description:
        "A neon-soaked noir novella about a composer who hears the future in the city's hum.",
      coverImage:
        "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?w=1200&q=80&auto=format&fit=crop",
      videoUrl: null,
      isFeatured: true,
      rank: null,
    },
    {
      title: "Echoes of Tomorrow — Director's Cut",
      category: "Video",
      description:
        "A 14-minute cinematic short exploring memory, loss, and the ghosts we carry forward. Shot on ARRI Alexa Mini.",
      coverImage:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&q=80&auto=format&fit=crop",
      videoUrl: "https://vimeo.com/babyseven/echoes-of-tomorrow",
      isFeatured: true,
      rank: null,
    },
    {
      title: "Velvet Static — Music Video",
      category: "Video",
      description:
        "Award-winning music video for artist Lumen Vex. 4M+ views. Reels cut, color grade, and directorial concept by Baby Seven.",
      coverImage:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80&auto=format&fit=crop",
      videoUrl: "https://youtube.com/watch?v=demo",
      isFeatured: false,
      rank: null,
    },
    {
      title: "The Last Broadcast — Feature Script",
      category: "Script",
      description:
        "Original screenplay. A late-night radio host begins receiving calls from a future that hasn't happened yet. 117 pages.",
      coverImage:
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80&auto=format&fit=crop",
      videoUrl: null,
      isFeatured: true,
      rank: null,
    },
    {
      title: "Glasshouse — Pilot Teleplay",
      category: "Script",
      description:
        "Pilot episode for a limited series. A botanist in a sealed greenhouse discovers the plants are keeping a record of every visitor.",
      coverImage:
        "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1200&q=80&auto=format&fit=crop",
      videoUrl: null,
      isFeatured: false,
      rank: null,
    },
    {
      title: "Ink & Embers — Essay Collection",
      category: "Writing",
      description:
        "A collection of essays on craft, creativity, and the discipline of showing up to the page every single morning.",
      coverImage:
        "https://images.unsplash.com/photo-1455390582262-43129a8e6f6b?w=1200&q=80&auto=format&fit=crop",
      videoUrl: null,
      isFeatured: false,
      rank: null,
    },
    {
      title: "Midnight Frame — Reels Series",
      category: "Video",
      description:
        "A 12-part Instagram Reels series. Each 60-second film captures one city at one exact minute past midnight.",
      coverImage:
        "https://images.unsplash.com/photo-1492691527719-9d1e27e1401a?w=1200&q=80&auto=format&fit=crop",
      videoUrl: null,
      isFeatured: false,
      rank: null,
    },
  ];

  for (const p of projects) {
    await db.project.create({ data: p });
  }

  // --- Testimonials -------------------------------------------------------
  const testimonials = [
    {
      clientName: "Marcus Linde, Producer at Halcyon Studios",
      text: "Baby Seven delivered a script that didn't just meet the brief — it redefined the brief. The 'Last Broadcast' screenplay is the best first draft I've read in a decade.",
      rating: 5,
    },
    {
      clientName: "Lumen Vex, Recording Artist",
      text: "The 'Velvet Static' video doubled my streaming numbers in a week. The visual storytelling was completely next-level.",
      rating: 5,
    },
    {
      clientName: "Aria Sato, Editor-in-Chief, Nightwave Press",
      text: "Blood Disaster is a once-in-a-generation debut. The prose cuts like glass and leaves a mark you'll feel for days.",
      rating: 5,
    },
    {
      clientName: "Dev Patel, Indie Filmmaker",
      text: "Worked with Baby Seven on three reels campaigns. Always cinematic, always on time, always surprising. Hire before the rate goes up.",
      rating: 5,
    },
  ];

  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }

  // --- PageViews (init) ---------------------------------------------------
  const routes = ["/", "/portfolio", "/collaborate", "/support"];
  for (const route of routes) {
    await db.pageView.create({ data: { route, count: Math.floor(Math.random() * 800) + 200 } });
  }

  console.log("✅ Seed complete.");
  console.log(`  - Projects: ${await db.project.count()}`);
  console.log(`  - Testimonials: ${await db.testimonial.count()}`);
  console.log(`  - PageViews: ${await db.pageView.count()}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
