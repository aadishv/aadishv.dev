import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";

const filePath = process.argv[2];
if (!filePath) {
  console.error("Specify a file path");
  process.exit(1);
}

const fileContent = fs.readFileSync(filePath);
const id = Math.random().toString(36).substring(2, 10);
const ext = path.extname(filePath);
const fileName = `shares/${id}${ext}`;

// Map extensions to content types
const contentTypes: Record<string, string> = {
  ".html": "text/html",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const contentType = contentTypes[ext] || "application/octet-stream";

const blob = await put(fileName, fileContent, {
  access: "public",
  contentType: contentType,
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

console.log(`Success! File available at: ${blob.url}`);
