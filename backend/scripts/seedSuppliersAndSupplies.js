const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "superadmin@test.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password123";

const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;
const SUPPLIER_ENDPOINT = `${API_BASE_URL}/api/supplier`;
const SUPPLY_ENDPOINT = `${API_BASE_URL}/api/supply`;

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

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { status: response.status, body };
}

async function login() {
  const { status, body } = await requestJson(LOGIN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (status !== 200 || !body?.data?.bearer) {
    throw new Error(
      `Login failed (status=${status}). Ensure ${ADMIN_EMAIL} exists and password is correct.`,
    );
  }

  return body.data.bearer;
}

function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function createOrSkipSupplier(token, supplier) {
  const { status, body } = await requestJson(SUPPLIER_ENDPOINT, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(supplier),
  });

  if (status === 201) {
    return { result: "created", supplier: body?.data || null };
  }
  if (status === 400 && body?.message === "Supplier ID already exists") {
    return { result: "skipped", supplier: null };
  }
  return {
    result: "failed",
    error: `${body?.message || "Unknown error"} (status=${status})`,
  };
}

async function fetchSupplierById(token, supplierID) {
  const { status, body } = await requestJson(
    `${SUPPLIER_ENDPOINT}/${encodeURIComponent(supplierID)}`,
    {
      method: "GET",
      headers: authHeaders(token),
    },
  );

  if (status !== 200 || !body?.data?._id) {
    throw new Error(
      `Unable to fetch supplier ${supplierID} (_id missing or request failed)`,
    );
  }

  return body.data;
}

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
  };
}

async function createOrSkipSupply(token, supplyPayload) {
  const { status, body } = await requestJson(SUPPLY_ENDPOINT, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(supplyPayload),
  });

  if (status === 201) {
    return { result: "created" };
  }
  if (status === 400 && body?.message === "Supply ID already exists") {
    return { result: "skipped" };
  }
  return {
    result: "failed",
    error: `${body?.message || "Unknown error"} (status=${status})`,
  };
}

async function main() {
  console.log(`Seeding suppliers + supplies via ${API_BASE_URL}`);

  const token = await login();

  let createdSuppliers = 0;
  let skippedSuppliers = 0;
  let failedSuppliers = 0;

  for (const supplier of suppliers) {
    try {
      const result = await createOrSkipSupplier(token, supplier);
      if (result.result === "created") {
        createdSuppliers += 1;
        console.log(`✅ Supplier created: ${supplier.supplierID}`);
      } else if (result.result === "skipped") {
        skippedSuppliers += 1;
        console.log(`ℹ️  Supplier exists: ${supplier.supplierID}`);
      } else {
        failedSuppliers += 1;
        console.log(
          `❌ Supplier failed: ${supplier.supplierID} | ${result.error}`,
        );
      }
    } catch (error) {
      failedSuppliers += 1;
      const message = error instanceof Error ? error.message : "Unknown error";
      console.log(`❌ Supplier failed: ${supplier.supplierID} | ${message}`);
    }
  }

  const supplierIdMap = new Map();
  for (const supplier of suppliers) {
    const supplierDoc = await fetchSupplierById(token, supplier.supplierID);
    supplierIdMap.set(supplier.supplierID, supplierDoc._id);
  }

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

      const payload = buildSupplyPayload(template, supplierObjectId);
      const result = await createOrSkipSupply(token, payload);

      if (result.result === "created") {
        createdSupplies += 1;
        console.log(`✅ Supply created: ${template.supplyID}`);
      } else if (result.result === "skipped") {
        skippedSupplies += 1;
        console.log(`ℹ️  Supply exists: ${template.supplyID}`);
      } else {
        failedSupplies += 1;
        console.log(`❌ Supply failed: ${template.supplyID} | ${result.error}`);
      }
    } catch (error) {
      failedSupplies += 1;
      const message = error instanceof Error ? error.message : "Unknown error";
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
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`❌ Seed failed: ${message}`);
  process.exit(1);
});
