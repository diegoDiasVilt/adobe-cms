import { decodeBase64 } from "../../scripts/scripts.js";

function normalizeNonBreakingSpaces(html) {
  const template = document.createElement("template");
  template.innerHTML = html;

  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode();

  while (textNode) {
    textNode.nodeValue = textNode.nodeValue.replace(/\u00a0/g, " ");
    textNode = walker.nextNode();
  }

  return template.innerHTML;
}

export default function decorate(block) {
  const firstChild = block.children[0];
  const id = block.children[1];

  if (id) {
    block.setAttribute("id", id?.textContent?.trim());
  }

  if (firstChild) {
    const paragraph = firstChild.querySelector("p");
    if (paragraph && paragraph.textContent) {
      const decodedHtml = decodeBase64(paragraph.textContent.trim());
      block.innerHTML = normalizeNonBreakingSpaces(decodedHtml);
    } else {
      block.innerHTML = "";
      firstChild.remove();
    }
  } else {
    block.innerHTML = "";
  }
}
