import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).send("Bad Request");
  }

  const blobUrl = `https://${process.env.BLOB_STORE_ID}.public.blob.vercel-storage.com/shares/${id}.html`;

  const response = await fetch(blobUrl);
  if (!response.ok) {
    return res.status(404).send("Not Found");
  }

  const html = await response.text();
  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(html);
}
