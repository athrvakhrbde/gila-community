/**
 * Promote a user to moderator/admin.
 * Usage (from repo root): npm run make-admin --prefix server -- <username>
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const username = process.argv[2];
if (!username) {
  console.error("Usage: npm run make-admin --prefix server -- <username>");
  process.exit(1);
}

const mongoUri = process.env.MONGO_URI?.trim();
if (!mongoUri || mongoUri === "memory") {
  console.error("MONGO_URI must be a real MongoDB connection string");
  process.exit(1);
}

await mongoose.connect(mongoUri);
const result = await mongoose.connection.db!
  .collection("users")
  .updateOne({ username }, { $set: { isAdmin: true } });

if (result.matchedCount === 0) {
  console.error(`No user found with username "${username}"`);
  await mongoose.disconnect();
  process.exit(1);
}

console.log(`Promoted "${username}" to admin (isAdmin: true)`);
await mongoose.disconnect();
