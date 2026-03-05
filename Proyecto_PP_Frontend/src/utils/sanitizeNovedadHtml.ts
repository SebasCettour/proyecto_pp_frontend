const ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "i",
  "em",
  "u",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "br",
  "p",
]);

export const sanitizeNovedadHtml = (rawHtml: string): string => {
  if (!rawHtml) {
    return "";
  }

  if (typeof window === "undefined") {
    return rawHtml;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, "text/html");

  const sanitizeNode = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tag = element.tagName.toLowerCase();

      if (!ALLOWED_TAGS.has(tag)) {
        const parent = element.parentNode;
        if (parent) {
          while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
          }
          parent.removeChild(element);
          return;
        }
      } else {
        // Remove all attributes from allowed tags to prevent inline scripts/styles.
        Array.from(element.attributes).forEach((attr) => {
          element.removeAttribute(attr.name);
        });
      }
    }

    Array.from(node.childNodes).forEach(sanitizeNode);
  };

  Array.from(doc.body.childNodes).forEach(sanitizeNode);
  return doc.body.innerHTML;
};

export const stripHtml = (html: string): string => {
  if (!html) {
    return "";
  }

  if (typeof window === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};
