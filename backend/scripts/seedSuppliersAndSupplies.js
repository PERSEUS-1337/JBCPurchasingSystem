const path = require("path");
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");

const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: path.resolve(__dirname, "..", envFile) });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error(
    "Missing MONGO_URI. Set it in your backend env file (e.g. .env.development).",
  );
}

const suppliers = [
  {
    supplierID: "SUP-9001",
    name: "Northwind Industrial Supply",
    contactNumbers: ["+639171111111"],
    emails: ["sales@northwind.local"],
    contactPersons: [
      {
        name: "Nina Alvarez",
        contactNumber: "+639181111111",
        email: "nina@northwind.local",
        position: "Account Executive",
      },
    ],
    address: "123 Northwind Ave, Makati City",
    primaryTag: "Office",
    tags: ["Office", "Paper", "Consumables"],
    documentation: [],
  },
  {
    supplierID: "SUP-9002",
    name: "Summit Tech Distributors",
    contactNumbers: ["+639172222222"],
    emails: ["orders@summittech.local"],
    contactPersons: [
      {
        name: "Marco Reyes",
        contactNumber: "+639182222222",
        email: "marco@summittech.local",
        position: "Sales Manager",
      },
    ],
    address: "88 Summit Road, Taguig City",
    primaryTag: "IT",
    tags: ["IT", "Peripherals", "Hardware"],
    documentation: [],
  },
  {
    supplierID: "SUP-9003",
    name: "Prime Safety Equipment Co",
    contactNumbers: ["+639173333333"],
    emails: ["support@primesafety.local"],
    contactPersons: [
      {
        name: "Lea Santos",
        contactNumber: "+639183333333",
        email: "lea@primesafety.local",
        position: "Client Partner",
      },
    ],
    address: "45 Safety Blvd, Pasig City",
    primaryTag: "PPE",
    tags: ["PPE", "Safety", "Industrial"],
    documentation: [],
  },
  {
    supplierID: "SUP-9004",
    name: "Metro Facilities Traders",
    contactNumbers: ["+639174444444"],
    emails: ["hello@metrofac.local"],
    contactPersons: [
      {
        name: "Jon Dela Cruz",
        contactNumber: "+639184444444",
        email: "jon@metrofac.local",
        position: "Operations Lead",
      },
    ],
    address: "200 Metro St, Quezon City",
    primaryTag: "Facilities",
    tags: ["Facilities", "Maintenance", "Cleaning"],
    documentation: [],
  },
];

const supplyTemplates = [
  {
    supplyID: "SPL-9001",
    name: "A4 Bond Paper 80gsm",
    description: "Multipurpose A4 paper, 500 sheets per ream.",
    categories: ["Office Supplies", "Paper"],
    unitMeasure: "ream",
    pricing: { unitQuantity: 1, unitPrice: 240 },
    specs: [
      { specProperty: "PaperSize", specValue: "A4" },
      { specProperty: "GSM", specValue: 80 },
    ],
    supplierID: "SUP-9001",
  },
  {
    supplyID: "SPL-9002",
    name: "Laser Toner Cartridge",
    description: "Black toner cartridge compatible with office printers.",
    categories: ["Office Supplies", "Printer"],
    unitMeasure: "piece",
    pricing: { unitQuantity: 1, unitPrice: 1850 },
    specs: [
      { specProperty: "Color", specValue: "Black" },
      { specProperty: "Yield", specValue: "3000 pages" },
    ],
    supplierID: "SUP-9002",
  },
  {
    supplyID: "SPL-9003",
    name: "Nitrile Gloves Box",
    description: "Disposable nitrile gloves, 100 pcs per box.",
    categories: ["Safety", "PPE"],
    unitMeasure: "box",
    pricing: { unitQuantity: 1, unitPrice: 520 },
    specs: [
      { specProperty: "Material", specValue: "Nitrile" },
      { specProperty: "PiecesPerBox", specValue: 100 },
    ],
    supplierID: "SUP-9003",
  },
  {
    supplyID: "SPL-9004",
    name: "Safety Helmet",
    description: "Industrial-grade hard hat with adjustable strap.",
    categories: ["Safety", "Industrial"],
    unitMeasure: "piece",
    pricing: { unitQuantity: 1, unitPrice: 780 },
    specs: [
      { specProperty: "Material", specValue: "ABS" },
      { specProperty: "Color", specValue: "Yellow" },
    ],
    supplierID: "SUP-9003",
  },
  {
    supplyID: "SPL-9005",
    name: "All-Purpose Cleaner 1L",
    description: "Multi-surface cleaner for facility maintenance.",
    categories: ["Facilities", "Cleaning"],
    unitMeasure: "bottle",
    pricing: { unitQuantity: 1, unitPrice: 180 },
    specs: [
      { specProperty: "Volume", specValue: "1L" },
      { specProperty: "Type", specValue: "Multi-surface" },
    ],
    supplierID: "SUP-9004",
  },
  {
    supplyID: "SPL-9006",
    name: "Microfiber Mop Set",
    description: "Complete mop set with reusable microfiber head.",
    categories: ["Facilities", "Cleaning"],
    unitMeasure: "set",
    pricing: { unitQuantity: 1, unitPrice: 650 },
    specs: [
      { specProperty: "HeadType", specValue: "Microfiber" },
      { specProperty: "HandleLength", specValue: "120cm" },
    ],
    supplierID: "SUP-9004",
  },
  {
    supplyID: "SPL-9007",
    name: "Wireless Keyboard",
    description: "2.4GHz compact wireless keyboard.",
    categories: ["IT", "Peripherals"],
    unitMeasure: "piece",
    pricing: { unitQuantity: 1, unitPrice: 1250 },
    specs: [
      { specProperty: "Connectivity", specValue: "2.4GHz" },
      { specProperty: "Layout", specValue: "Full-size" },
    ],
    supplierID: "SUP-9002",
  },
  {
    supplyID: "SPL-9008",
    name: "USB-C Docking Station",
    description: "Dock with HDMI, LAN, and USB 3.0 ports.",
    categories: ["IT", "Accessories"],
    unitMeasure: "piece",
    pricing: { unitQuantity: 1, unitPrice: 3450 },
    specs: [
      { specProperty: "Ports", specValue: "HDMI/LAN/USB" },
      { specProperty: "PowerDelivery", specValue: "85W" },
    ],
    supplierID: "SUP-9002",
  },
];

function buildSupplyPayload(template, supplierObjectId) {
  const { unitQuantity, unitPrice } = template.pricing;
  const price = unitQuantity * unitPrice;

  return {
    supplyID: template.supplyID,
    name: template.name,
    description: template.description,
    categories: template.categories,
    unitMeasure: template.unitMeasure,
    supplierPricing: [
      {
        supplier: supplierObjectId,
        unitQuantity,
        unitPrice,
        price,
        priceValidity: "2030-12-31T00:00:00.000Z",
      },
    ],
    specifications: template.specs,
    attachments: [],
    status: "Active",
  };
}

async function main() {
  console.log(`Seeding suppliers + supplies directly via MongoDB`);

  const client = new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db();
  const supplierCollection = db.collection("suppliers");
  const supplyCollection = db.collection("supplies");

  let createdSuppliers = 0;
  let skippedSuppliers = 0;
  let failedSuppliers = 0;

  try {
    for (const supplier of suppliers) {
      try {
        const existing = await supplierCollection.findOne(
          { supplierID: supplier.supplierID },
          { projection: { _id: 1 } },
        );

        const updateResult = await supplierCollection.updateOne(
          { supplierID: supplier.supplierID },
          {
            $set: {
              name: supplier.name,
              contactNumbers: supplier.contactNumbers,
              emails: supplier.emails,
              contactPersons: supplier.contactPersons,
              address: supplier.address,
              primaryTag: supplier.primaryTag,
              tags: supplier.tags,
              documentation: supplier.documentation,
              status: "Active",
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
              supplies: [],
            },
          },
          { upsert: true },
        );

        if (updateResult.upsertedCount > 0 || !existing) {
          createdSuppliers += 1;
          console.log(`✅ Supplier created: ${supplier.supplierID}`);
        } else {
          skippedSuppliers += 1;
          console.log(`ℹ️  Supplier exists/updated: ${supplier.supplierID}`);
        }
      } catch (error) {
        failedSuppliers += 1;
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.log(`❌ Supplier failed: ${supplier.supplierID} | ${message}`);
      }
    }

    const supplierDocs = await supplierCollection
      .find(
        {
          supplierID: { $in: suppliers.map((supplier) => supplier.supplierID) },
        },
        { projection: { _id: 1, supplierID: 1 } },
      )
      .toArray();

    const supplierIdMap = new Map(
      supplierDocs.map((doc) => [doc.supplierID, doc._id]),
    );

    let createdSupplies = 0;
    let skippedSupplies = 0;
    let failedSupplies = 0;

    for (const template of supplyTemplates) {
      try {
        const supplierObjectId = supplierIdMap.get(template.supplierID);
        if (!supplierObjectId) {
          failedSupplies += 1;
          console.log(
            `❌ Supply failed: ${template.supplyID} | missing supplier ${template.supplierID}`,
          );
          continue;
        }

        const existing = await supplyCollection.findOne(
          { supplyID: template.supplyID },
          { projection: { _id: 1 } },
        );

        const payload = buildSupplyPayload(template, supplierObjectId);

        const updateResult = await supplyCollection.updateOne(
          { supplyID: template.supplyID },
          {
            $set: {
              name: payload.name,
              description: payload.description,
              categories: payload.categories,
              unitMeasure: payload.unitMeasure,
              supplierPricing: payload.supplierPricing,
              specifications: payload.specifications,
              attachments: payload.attachments,
              status: "Active",
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          { upsert: true },
        );

        await supplierCollection.updateOne(
          { supplierID: template.supplierID },
          {
            $addToSet: {
              supplies: template.supplyID,
            },
            $set: {
              updatedAt: new Date(),
            },
          },
        );

        if (updateResult.upsertedCount > 0 || !existing) {
          createdSupplies += 1;
          console.log(
            `✅ Supply created and linked: ${template.supplyID} -> ${template.supplierID}`,
          );
        } else {
          skippedSupplies += 1;
          console.log(
            `ℹ️  Supply exists/updated and linked: ${template.supplyID} -> ${template.supplierID}`,
          );
        }
      } catch (error) {
        failedSupplies += 1;
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.log(`❌ Supply failed: ${template.supplyID} | ${message}`);
      }
    }

    console.log("\nSeed summary");
    console.log(
      `Suppliers => created: ${createdSuppliers}, skipped: ${skippedSuppliers}, failed: ${failedSuppliers}`,
    );
    console.log(
      `Supplies  => created: ${createdSupplies}, skipped: ${skippedSupplies}, failed: ${failedSupplies}`,
    );

    if (failedSuppliers > 0 || failedSupplies > 0) {
      process.exitCode = 1;
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`❌ Seed failed: ${message}`);
  process.exit(1);
});
