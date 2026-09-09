import { db } from "@/lib/db";

/** Wipe all rows so the seed script can be re-run idempotently. */
async function main() {
  await db.collaboration.deleteMany();
  await db.reelEditor.deleteMany();
  await db.testimonial.deleteMany();
  await db.pageView.deleteMany();
  await db.project.deleteMany();
  console.log("✅ All tables wiped.");
}
main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
