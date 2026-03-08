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
    name: "FastenerPro Industrial Solutions",
    contactNumbers: ["+639171111111"],
    emails: ["sales@fastenerpro.local"],
    contactPersons: [
      {
        name: "Roberto Santos",
        contactNumber: "+639181111111",
        email: "roberto@fastenerpro.local",
        position: "Sales Representative",
      },
    ],
    address: "45 Industrial Park, Cavite",
    primaryTag: "Fasteners",
    tags: ["Fasteners", "Bolts", "Screws", "Nuts", "Hardware"],
    documentation: [],
  },
  {
    supplierID: "SUP-9002",
    name: "Structural Steel Mart",
    contactNumbers: ["+639172222222"],
    emails: ["orders@steelmart.local"],
    contactPersons: [
      {
        name: "Maria Gonzales",
        contactNumber: "+639182222222",
        email: "maria@steelmart.local",
        position: "Project Manager",
      },
    ],
    address: "120 Steel Boulevard, Las Piñas",
    primaryTag: "Structural Steel",
    tags: ["Structural Steel", "Pipes", "Angle Bars", "Steel Plates", "Tubes"],
    documentation: [],
  },
  {
    supplierID: "SUP-9003",
    name: "MegaAbrasives & Consumables",
    contactNumbers: ["+639173333333"],
    emails: ["support@megaabrasives.local"],
    contactPersons: [
      {
        name: "Carlos Villareal",
        contactNumber: "+639183333333",
        email: "carlos@megaabrasives.local",
        position: "Technical Support",
      },
    ],
    address: "78 Abrasives Ave, Muntinlupa",
    primaryTag: "Consumables",
    tags: ["Grinding Discs", "Abrasives", "Cutting Wheels", "Consumables"],
    documentation: [],
  },
  {
    supplierID: "SUP-9004",
    name: "Guardian Safety & PPE",
    contactNumbers: ["+639174444444"],
    emails: ["hello@guardiansafety.local"],
    contactPersons: [
      {
        name: "Elena Reyes",
        contactNumber: "+639184444444",
        email: "elena@guardiansafety.local",
        position: "Operations Manager",
      },
    ],
    address: "310 Safety Park, Valenzuela",
    primaryTag: "Safety Equipment",
    tags: ["Gloves", "Safety Gear", "PPE", "Protective Equipment"],
    documentation: [],
  },
  {
    supplierID: "SUP-9005",
    name: "Industrial Coatings & Paint",
    contactNumbers: ["+639175555555"],
    emails: ["sales@inductrialcoatings.local"],
    contactPersons: [
      {
        name: "Alfonso Martinez",
        contactNumber: "+639185555555",
        email: "alfonso@inductrialcoatings.local",
        position: "District Manager",
      },
    ],
    address: "55 Paint Way, Navotas",
    primaryTag: "Coatings",
    tags: ["Paint", "Coatings", "Primers", "Protective Finishes"],
    documentation: [],
  },
];

const supplyTemplates = [
  {
    supplyID: "SPL-9001",
    name: "High Tensile Bolts M16x80mm Grade 8.8",
    description:
      "Heavy-duty hex head bolts for structural assembly and power plant applications.",
    categories: ["Fasteners", "Bolts"],
    unitMeasure: "box",
    pricing: { unitQuantity: 50, unitPrice: 3500 },
    specs: [
      { specProperty: "Diameter", specValue: "M16" },
      { specProperty: "Length", specValue: "80mm" },
      { specProperty: "Grade", specValue: "8.8" },
      { specProperty: "QuantityPerBox", specValue: 50 },
    ],
    supplierID: "SUP-9001",
  },
  {
    supplyID: "SPL-9002",
    name: "Stainless Steel Screws #8x50mm",
    description:
      "Corrosion-resistant machine screws for electrical panels and enclosures.",
    categories: ["Fasteners", "Screws"],
    unitMeasure: "piece",
    pricing: { unitQuantity: 100, unitPrice: 2200 },
    specs: [
      { specProperty: "Size", specValue: "#8x50mm" },
      { specProperty: "Material", specValue: "Stainless Steel 304" },
      { specProperty: "TypeHead", specValue: "Pan Head" },
      { specProperty: "QuantityPerBox", specValue: 100 },
    ],
    supplierID: "SUP-9001",
  },
  {
    supplyID: "SPL-9003",
    name: "Hexagon Nuts M16 Zinc Plated",
    description: "Standard metric nuts for general bolting applications.",
    categories: ["Fasteners", "Nuts"],
    unitMeasure: "box",
    pricing: { unitQuantity: 100, unitPrice: 1850 },
    specs: [
      { specProperty: "Size", specValue: "M16" },
      { specProperty: "Coating", specValue: "Zinc Plated" },
      { specProperty: "Grade", specValue: "Class 8" },
      { specProperty: "QuantityPerBox", specValue: 100 },
    ],
    supplierID: "SUP-9001",
  },
  {
    supplyID: "SPL-9004",
    name: "Structural Angle Bar 50x50x5mm",
    description:
      "Carbon steel angle iron for fabrication and structural assembly.",
    categories: ["Structural Steel", "Angle Bars"],
    unitMeasure: "meter",
    pricing: { unitQuantity: 6, unitPrice: 4200 },
    specs: [
      { specProperty: "Dimensions", specValue: "50x50x5mm" },
      { specProperty: "Material", specValue: "Carbon Steel" },
      { specProperty: "LengthPerBundle", specValue: "6 meters" },
      { specProperty: "Weight", specValue: "~60kg/unit" },
    ],
    supplierID: "SUP-9002",
  },
  {
    supplyID: "SPL-9005",
    name: "Steel Pipe Schedule 40 2 inch",
    description: "Galvanized steel pipes for pneumatic and fluid systems.",
    categories: ["Structural Steel", "Pipes"],
    unitMeasure: "meter",
    pricing: { unitQuantity: 6, unitPrice: 5800 },
    specs: [
      { specProperty: "Size", specValue: "2 inch" },
      { specProperty: "Schedule", specValue: "40" },
      { specProperty: "Material", specValue: "Galvanized Steel" },
      { specProperty: "LengthPerBundle", specValue: "6 meters" },
    ],
    supplierID: "SUP-9002",
  },
  {
    supplyID: "SPL-9006",
    name: "Grinding Disc 4.5 inch x 1.0mm",
    description: "Ultra-thin cutting disc for metal fabrication and grinding.",
    categories: ["Consumables", "Grinding Discs"],
    unitMeasure: "box",
    pricing: { unitQuantity: 25, unitPrice: 3200 },
    specs: [
      { specProperty: "Diameter", specValue: "4.5 inch (115mm)" },
      { specProperty: "Thickness", specValue: "1.0mm" },
      { specProperty: "Type", specValue: "Cutting Disc" },
      { specProperty: "QuantityPerBox", specValue: 25 },
    ],
    supplierID: "SUP-9003",
  },
  {
    supplyID: "SPL-9007",
    name: "Steel Plate Hot Rolled 1/2 inch",
    description:
      "Heavy-duty steel plate for structural support and fabrication.",
    categories: ["Structural Steel", "Steel Plates"],
    unitMeasure: "square meter",
    pricing: { unitQuantity: 1, unitPrice: 8500 },
    specs: [
      { specProperty: "Thickness", specValue: "1/2 inch (12.7mm)" },
      { specProperty: "Material", specValue: "Hot Rolled Carbon Steel" },
      { specProperty: "Grade", specValue: "A36" },
      { specProperty: "AreaPerSheet", specValue: "1 square meter" },
    ],
    supplierID: "SUP-9002",
  },
  {
    supplyID: "SPL-9008",
    name: "Nitrile Safety Gloves Medium",
    description:
      "Durable nitrile gloves for handling sharp materials and equipment.",
    categories: ["Safety Equipment", "Gloves"],
    unitMeasure: "box",
    pricing: { unitQuantity: 10, unitPrice: 1200 },
    specs: [
      { specProperty: "Size", specValue: "Medium" },
      { specProperty: "Material", specValue: "Nitrile" },
      { specProperty: "PairsPerBox", specValue: 100 },
      { specProperty: "BoxesPerCase", specValue: 10 },
    ],
    supplierID: "SUP-9004",
  },
  {
    supplyID: "SPL-9009",
    name: "Industrial Epoxy Paint 20L",
    description: "Two-part epoxy coating for corrosion and wear protection.",
    categories: ["Coatings", "Paint"],
    unitMeasure: "bucket",
    pricing: { unitQuantity: 1, unitPrice: 4800 },
    specs: [
      { specProperty: "Type", specValue: "Two-Part Epoxy" },
      { specProperty: "VolumePerBucket", specValue: "20L" },
      { specProperty: "CoverageSqM", specValue: "400-500" },
      { specProperty: "DryingTime", specValue: "24 hours" },
    ],
    supplierID: "SUP-9005",
  },
  {
    supplyID: "SPL-9010",
    name: "Safety Hard Hat Yellow",
    description:
      "ANSI Z89.1 compliant protective hard hat for construction sites.",
    categories: ["Safety Equipment", "Protective Gear"],
    unitMeasure: "piece",
    pricing: { unitQuantity: 1, unitPrice: 850 },
    specs: [
      { specProperty: "Color", specValue: "Yellow" },
      { specProperty: "Material", specValue: "ABS Plastic" },
      { specProperty: "Standard", specValue: "ANSI Z89.1" },
      { specProperty: "VentedDesign", specValue: "Yes" },
    ],
    supplierID: "SUP-9004",
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
