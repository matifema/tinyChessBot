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
      title: "Splendido Appartamento Vista Mare",
      description:
        "Appartamento luminoso con vista mozzafiato sul mare. Completamente ristrutturato con finiture di lusso. Dispone di un ampio terrazzo dove godersi il panorama. A pochi passi dalla spiaggia e dai principali servizi.",
      price: 450000.0,
      address: "Lungomare Colombo, 12",
      city: "Genova",
      zipCode: "16146",
      bedrooms: 3,
      bathrooms: 2,
      squareMeters: 120,
      propertyType: PropertyType.APPARTAMENTO,
      status: ListingStatus.DISPONIBILE,
      imageUrls: [
        "/listings/appartamento-genova-1.jpg",
        "/listings/appartamento-genova-2.jpg",
        "/listings/appartamento-genova-3.jpg",
      ],
    },
    {
      title: "Villa Storica nel Cuore della Toscana",
      description:
        "Affascinante villa storica immersa nel verde delle colline toscane. Ampio giardino con piscina e uliveto. Interni spaziosi e finemente arredati, perfetti per chi cerca tranquillità e privacy.",
      price: 1200000.0,
      address: "Strada del Chianti, 25",
      city: "Firenze",
      zipCode: "50125",
      bedrooms: 5,
      bathrooms: 4,
      squareMeters: 400,
      propertyType: PropertyType.VILLA,
      status: ListingStatus.DISPONIBILE,
      imageUrls: [
        "/listings/villa-firenze-1.jpg",
        "/listings/villa-firenze-2.jpg",
        "/listings/villa-firenze-3.jpg",
      ],
    },
    {
      title: "Moderno Loft in Zona Navigli",
      description:
        "Spettacolare loft di design in una delle zone più vivaci di Milano. Spazi aperti, soffitti alti e grandi vetrate. Ideale per single o coppie che amano la vita notturna e la cultura.",
      price: 650000.0,
      address: "Ripa di Porta Ticinese, 55",
      city: "Milano",
      zipCode: "20143",
      bedrooms: 1,
      bathrooms: 2,
      squareMeters: 150,
      propertyType: PropertyType.LOFT,
      status: ListingStatus.VENDUTO,
      imageUrls: [
        "/listings/loft-milano-1.jpg",
        "/listings/loft-milano-2.jpg",
      ],
    },
    {
      title: "Casa Indipendente con Terreno",
      description:
        "Casa indipendente da ristrutturare con ampio terreno edificabile. Ottima opportunità di investimento in una zona tranquilla e ben servita. Progetto di ristrutturazione già approvato.",
      price: 180000.0,
      address: "Via Verdi, 8",
      city: "Bologna",
      zipCode: "40126",
      bedrooms: 4,
      bathrooms: 1,
      squareMeters: 200,
      propertyType: PropertyType.CASA_INDIPENDENTE,
      status: ListingStatus.DISPONIBILE,
      imageUrls: ["/listings/casa-bologna-1.jpg"],
    },
    {
      title: "Attico Panoramico con Terrazzo",
      description:
        "Esclusivo attico con terrazzo di 100 mq e vista panoramica sulla città. Finiture di pregio, domotica e comfort di ultima generazione. Include un box auto doppio. Posizione centrale e prestigiosa.",
      price: 980000.0,
      address: "Via della Moscova, 30",
      city: "Milano",
      zipCode: "20121",
      bedrooms: 3,
      bathrooms: 3,
      squareMeters: 220,
      propertyType: PropertyType.ATTICO,
      status: ListingStatus.DISPONIBILE,
      imageUrls: [
        "/listings/attico-milano-1.jpg",
        "/listings/attico-milano-2.jpg",
        "/listings/attico-milano-3.jpg",
      ],
    },
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
