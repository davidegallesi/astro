import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = (site?.toString() || 'https://davidegallesi.github.io/astro').replace(/\/$/, '');

  const posts = await getCollection('stream', ({ data }) =>
    data.published !== false && data.type === 'quote'
  );
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const recent = posts.slice(0, 20);

  const entries = recent.map((post) => {
    const url = `${baseUrl}/${post.id}`;
    const body = post.body?.trim() || '';
    const author = post.data.author ? `\n— ${post.data.author}` : '';
    return `  <entry>
    <id>${url}</id>
    <link href="${url}"/>
    <updated>${post.data.date.toISOString()}</updated>
    <content type="text">${escapeXml(body + author)}</content>
  </entry>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>marginalia — citazioni</title>
  <link href="${baseUrl}/feed-quote.xml" rel="self"/>
  <link href="${baseUrl}"/>
  <id>${baseUrl}/feed-quote.xml</id>
  <updated>${recent[0]?.data.date.toISOString() || new Date().toISOString()}</updated>
${entries}
</feed>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
};
