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
const fileName = `shares/${id}.html`;

const blob = await put(fileName, fileContent, {
  access: "public",
  contentType: "text/html",
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

console.log(`Success! File available at: https://aadishv.dev/s/${id}`);
