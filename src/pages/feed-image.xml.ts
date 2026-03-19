import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = (site?.toString() || 'https://davidegallesi.github.io/astro').replace(/\/$/, '');

  const posts = await getCollection('stream', ({ data }) =>
    data.published !== false && data.type === 'image'
  );
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const recent = posts.slice(0, 20);

  const entries = recent.map((post) => {
    const url = `${baseUrl}/${post.id}`;
    const alt = escapeXml(post.data.imageAlt || '');
    const body = escapeXml(post.body?.trim() || '');
    const imgTag = post.data.image ? `&lt;img src="${escapeXml(post.data.image)}" alt="${alt}"&gt;\n` : '';
    return `  <entry>
    <id>${url}</id>
    <link href="${url}"/>
    <updated>${post.data.date.toISOString()}</updated>
    <content type="html"><![CDATA[${imgTag}${post.body?.trim() || ''}]]></content>
  </entry>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>marginalia — immagini</title>
  <link href="${baseUrl}/feed-image.xml" rel="self"/>
  <link href="${baseUrl}"/>
  <id>${baseUrl}/feed-image.xml</id>
  <updated>${recent[0]?.data.date.toISOString() || new Date().toISOString()}</updated>
${entries}
</feed>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
};
