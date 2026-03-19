/**
 * Remark plugin that transforms [[./slug]] and [[./slug|label]] syntax
 * into internal links. Works with Astro's Content Layer API.
 */
export default function remarkWikilinks(options = {}) {
  const { base = '' } = options;

  return function (tree) {
    transformNode(tree, base);
  };
}

function transformNode(node, base) {
  if (node.children) {
    const newChildren = [];
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child.type === 'text' && /\[\[/.test(child.value)) {
        newChildren.push(...parseWikilinks(child.value, base));
      } else {
        transformNode(child, base);
        newChildren.push(child);
      }
    }
    node.children = newChildren;
  }
}

function parseWikilinks(text, base) {
  const regex = /\[\[\.\/([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;
  const nodes = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const [, slug, label] = match;
    nodes.push({
      type: 'link',
      url: `${base}/${slug}`,
      title: null,
      children: [{ type: 'text', value: label || slug }],
      data: { hProperties: { className: ['wikilink'] } },
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return nodes;
}
