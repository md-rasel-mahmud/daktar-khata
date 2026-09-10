/* eslint-disable no-console */
const mongoose = require("mongoose");

async function run() {
  const mongoUrl = process.env.MONGODB_URL;

  if (!mongoUrl) {
    throw new Error("MONGODB_URL is required");
  }

  await mongoose.connect(mongoUrl);

  const db = mongoose.connection.db;
  const employeeCollection = db.collection("Employee");
  const staffCollection = db.collection("Staff");

  const employees = await employeeCollection.find({}).toArray();

  if (employees.length === 0) {
    console.log("No Employee records found. Nothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  const now = new Date();
  const operations = employees.map((employeeDoc) => {
    const mappedDoc = {
      ...employeeDoc,
      customRoleName: employeeDoc.customRoleName || undefined,
      permissions: Array.isArray(employeeDoc.permissions)
        ? employeeDoc.permissions
        : [],
      migratedFrom: "Employee",
      migratedAt: now,
    };

    return {
      updateOne: {
        filter: { _id: employeeDoc._id },
        update: { $set: mappedDoc },
        upsert: true,
      },
    };
  });

  const result = await staffCollection.bulkWrite(operations, {
    ordered: false,
  });

  console.log("Migration completed:");
  console.log(`- Source employee count: ${employees.length}`);
  console.log(`- Upserted: ${result.upsertedCount || 0}`);
  console.log(`- Modified: ${result.modifiedCount || 0}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Migration failed:", error?.message || error);
  try {
    await mongoose.disconnect();
  } catch (_e) {
    // ignore disconnect errors
  }
  process.exit(1);
});
