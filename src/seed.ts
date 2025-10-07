import { DatabaseService, runMigrations } from "./database";
import { Effect, pipe } from "effect";
import { ServerRuntime } from "./runtime";

const sampleSummerHouses = [
  {
    name: "Rudkøbing - Totalrenoveret byhus med spa",
    imageUrl:
      "https://picture.feline.dk/get/a9821af3-f71c-4829-86b4-e6e5bc3d72fb_1_w500h375ac1fs1kar1rb1.jpg?v2",
    bookingUrl:
      "https://www.dansk-sommerhusferie.dk/sommerhussoegning/Y2d5m-iya_rK6949Dq6Nt1aY_hJjY2Jwfu9yrkK5gAEEFJjBFJABxA5bWAA/557-LL249?sortorder=Price",
  },
  {
    name: "Haderslev 1 - Luksuriøst sommerhus nær strand",
    imageUrl:
      "https://picture.feline.dk/get/f989adaf-37d1-405e-8589-51eb57c85a16_9_w500h375ac1fs1kar1rb1.jpg?v2",
    bookingUrl:
      "https://www.dansk-sommerhusferie.dk/sommerhussoegning/Y2cpvDxPVW1pjsPK5mBpp_gZPGJsTAzO713OVSgXMIDAkVsMDArMYCaQAcQOW1gA/Map/x134.85942245573398y80.5629070301312z10/160-C2190",
  },
  {
    name: "Haderslev 2 - Tapagervej, Hejlsminde",
    imageUrl:
      "https://picture.feline.dk/get/d008a480-fb48-4079-b6c5-4ecaa88a7b3a_1_w500h375ac1fs1kar1rb1.jpg?v2",
    bookingUrl:
      "https://www.dansk-sommerhusferie.dk/sommerhussoegning/Y2cpvDxPVW1pjsPK5mBpp_gZPGJsTAzO713OVSgXMIDAkVsMDArMYCaQAcQOW1gA/Map/x134.84521132653958y80.56731331389582z9/090-53139",
  },
  {
    name: "Haderslev 3 - Moderne sommerhus nær strand",
    imageUrl:
      "https://picture.feline.dk/get/bb3827ed-0eee-4dd5-bd4d-211cc61a73ef_9_w500h375ac1fs1kar1rb1.jpg?v2",
    bookingUrl:
      "https://www.dansk-sommerhusferie.dk/sommerhussoegning/Y2cpvDxPVW1pjsPK5mBpp_gZPGJsTAzO713OVSgXMIDAkVsMDArMYCaQAcQOW1gA/Map/x134.84521132653958y80.56731331389582z9/160-C2156",
  },
  {
    name: "Bagenkop - Hyggeligt og rummeligt feriehus",
    imageUrl:
      "https://picture.feline.dk/get/9ab281d5-1b76-4dfd-9583-43bad54a4921_7_w500h375ac1fs1kar1rb1.jpg?v2",
    bookingUrl:
      "https://www.sommerhus-siden.dk/sommerhussoegning/Y2V5m-iya_rK6949Dq6Nt1aY_hJjY2Jwfu9yrkK5gIGBQYFBgRlIMQAA/130-G10937?sortorder=Price",
  },
  {
    name: "Christiansfeld - Svensk sommerhus nær natur",
    imageUrl:
      "https://picture.feline.dk/get/fd9782c9-2120-496f-bda7-80c9d447c7d6_3_w500h375ac1fs1kar1rb1.jpg?v2",
    bookingUrl:
      "https://www.dansk-sommerhusferie.dk/sommerhussoegning/Y2cpvDxPVW1pjsPK5mBpp_gZPGJsTAzO713OVSgXMIDAkVsMDArMYCaQAcQOW1gA/Map/x134.82268935388333y80.53432983201182z9/130-F04123",
  },
];

const seedDatabase = Effect.gen(function* () {
  console.log("🌱 Seeding database...");

  const db = yield* DatabaseService;
  const existingHouses = yield* db
    .getAllSummerHouses()
    .pipe(Effect.orElse(() => Effect.succeed([])));

  if (existingHouses.length > 0) {
    console.log("Database already seeded. Skipping...");
    return;
  }

  console.log("Running migrations...");
  yield* runMigrations;

  console.log("Creating summer houses...");
  for (const house of sampleSummerHouses) {
    yield* db.createSummerHouse(house.name, house.imageUrl, house.bookingUrl);
    console.log(`✓ Created: ${house.name}`);
  }

  console.log("✅ Database seeded successfully!");
});

const main = pipe(
  seedDatabase,
  Effect.andThen(() => console.log("🎉 Seeding complete!")),
  Effect.catchAll((error) => {
    console.error("💥 Seeding failed:", error);
    return Effect.fail(error);
  }),
);

ServerRuntime.runPromise(main)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
