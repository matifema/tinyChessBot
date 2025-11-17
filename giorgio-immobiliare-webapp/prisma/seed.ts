import { Listing } from "@prisma/client";
import {
  PrismaClient,
  PropertyType,
  ListingStatus,
} from "../lib/generated/prisma-client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  // Clean up existing data
  await prisma.listing.deleteMany();

  // Create listings
  const listingsData = [
    {
      id: "1",
      title: "Splendido Appartamento Vista Mare",
      description: "Appartamento luminoso con vista mozzafiato sul mare. Completamente ristrutturato con finiture di lusso. Dispone di un ampio terrazzo dove godersi il panorama. A pochi passi dalla spiaggia e dai principali servizi.",
      price: 450000.0,
      location: "Lungomare Colombo, 12",
      bedrooms: 3,
      bathrooms: 2,
      squareMeters: 120,
      propertyType: PropertyType.appartamento,
      status: ListingStatus.for_sale,
      imageUrls: [],
    } as unknown as Listing
  ];

  await prisma.listing.createMany({
    data: listingsData,
  });

  console.log(`Seeding finished. Created ${listingsData.length} listings.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
