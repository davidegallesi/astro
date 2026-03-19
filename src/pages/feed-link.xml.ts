import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = (site?.toString() || 'https://davidegallesi.github.io/astro').replace(/\/$/, '');

  const posts = await getCollection('stream', ({ data }) =>
    data.published !== false && data.type === 'link'
  );
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const recent = posts.slice(0, 20);

  const entries = recent.map((post) => {
    const url = `${baseUrl}/${post.id}`;
    const externalUrl = post.data.url || url;
    const title = escapeXml(post.data.linkTitle || post.data.url || '');
    const body = escapeXml(post.body?.trim() || '');
    return `  <entry>
    <id>${url}</id>
    <link href="${externalUrl}"/>
    <link rel="alternate" href="${url}"/>
    <updated>${post.data.date.toISOString()}</updated>
    <title>${title}</title>
    <content type="text">${body}</content>
  </entry>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>marginalia — link</title>
  <link href="${baseUrl}/feed-link.xml" rel="self"/>
  <link href="${baseUrl}"/>
  <id>${baseUrl}/feed-link.xml</id>
  <updated>${recent[0]?.data.date.toISOString() || new Date().toISOString()}</updated>
${entries}
</feed>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
};
