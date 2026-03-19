import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function postSummary(post: { data: { type: string; linkTitle?: string; url?: string; author?: string }; body?: string }): string {
  if (post.data.type === 'link') {
    const title = post.data.linkTitle || post.data.url || '';
    const body = post.body?.trim() || '';
    return body ? `${title}\n\n${body}` : title;
  }
  return post.body?.trim() || '';
}

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = (site?.toString() || 'https://davidegallesi.github.io/astro').replace(/\/$/, '');

  const posts = await getCollection('stream', ({ data }) => data.published !== false);
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const recent = posts.slice(0, 20);

  const entries = recent.map((post) => {
    const url = `${baseUrl}/${post.id}`;
    const updated = post.data.date.toISOString();
    const content = escapeXml(postSummary(post));
    return `  <entry>
    <id>${url}</id>
    <link href="${url}"/>
    <updated>${updated}</updated>
    <category term="${post.data.type}"/>
    <content type="text">${content}</content>
  </entry>`;
  }).join('\n');

  const updated = recent[0]?.data.date.toISOString() || new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>marginalia</title>
  <subtitle>uno stream personale</subtitle>
  <link href="${baseUrl}/feed.xml" rel="self"/>
  <link href="${baseUrl}"/>
  <id>${baseUrl}</id>
  <updated>${updated}</updated>
${entries}
</feed>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
};
