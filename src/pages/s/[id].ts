export const prerender = false;

export async function GET({ params }: { params: { id: string } }) {
  console.log(params)
  const { id } = params;
  const blobUrl = `https://${import.meta.env.BLOB_STORE_ID}.public.blob.vercel-storage.com/shares/${id}.html`;

  const response = await fetch(blobUrl);
  console.log(blobUrl)
  if (!response.ok) {
    return new Response('Not Found', { status: 404 });
  }

  const html = await response.text();

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
