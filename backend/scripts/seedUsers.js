const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000";
const REGISTER_ENDPOINT = `${API_BASE_URL}/api/auth/register`;

const users = [
  {
    userID: "U9001",
    fullname: "System Super Admin",
    email: "superadmin@test.local",
    password: "password123",
    role: "Super Administrator",
    position: "System Administrator",
    department: "IT",
  },
  {
    userID: "U9002",
    fullname: "Department Manager",
    email: "manager@test.local",
    password: "password123",
    role: "Manager",
    position: "Manager",
    department: "Procurement",
  },
  {
    userID: "U9003",
    fullname: "Chief Officer",
    email: "chiefofficer@test.local",
    password: "password123",
    role: "Chief Officer",
    position: "Chief Officer",
    department: "Administration",
  },
  {
    userID: "U9004",
    fullname: "Operations Staff",
    email: "staff@test.local",
    password: "password123",
    role: "Staff",
    position: "Staff",
    department: "Operations",
  },
  {
    userID: "U9005",
    fullname: "Purchase Requester",
    email: "requester@test.local",
    password: "password123",
    role: "Requester",
    position: "Requester",
    department: "Engineering",
  },
  {
    userID: "U9006",
    fullname: "Assigned Purchaser",
    email: "purchaser@test.local",
    password: "password123",
    role: "Purchaser",
    position: "Purchaser",
    department: "Purchasing",
  },
];

async function registerUser(user) {
  const response = await fetch(REGISTER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { status: response.status, body };
}

async function main() {
  console.log(`Seeding users via ${REGISTER_ENDPOINT}`);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  for (const user of users) {
    try {
      const { status, body } = await registerUser(user);

      if (status === 201) {
        created += 1;
        console.log(`✅ Created: ${user.email} (${user.role})`);
        continue;
      }

      if (status === 409) {
        skipped += 1;
        console.log(`ℹ️  Skipped (already exists): ${user.email}`);
        continue;
      }

      failed += 1;
      console.log(
        `❌ Failed: ${user.email} | status=${status} | message=${body?.message || "Unknown error"}`,
      );
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : "Unknown error";
      console.log(`❌ Failed: ${user.email} | error=${message}`);
    }
  }

  console.log("\nSeed summary");
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed : ${failed}`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main();
