export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").at(-1);

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const blobUrl = `https://${process.env.BLOB_STORE_ID}.public.blob.vercel-storage.com/shares/${id}.html`;
  const response = await fetch(blobUrl);

  if (!response.ok) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(await response.text(), {
    headers: { "Content-Type": "text/html" },
  });
}
