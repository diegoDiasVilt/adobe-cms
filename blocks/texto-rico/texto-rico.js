import { decodeBase64 } from "../../scripts/scripts.js";

function removerStylesInlineDeTabelas() {
  const seletores = "table, thead, tbody, tfoot, tr, th, td";
  const elementosParaLimpar = document.querySelectorAll(seletores);
  // Percorre e remove o atributo 'style'
  for (const elemento of elementosParaLimpar) {
    elemento.removeAttribute("style");
    console.log("elemento", elemento);
  }
}

export default function decorate(block) {
  const firstChild = block.children[0];
  const id = block.children[1];

  document.addEventListener("DOMContentLoaded", removerStylesInlineDeTabelas);

  if (id) {
    block.setAttribute("id", id?.textContent?.trim());
  }

  if (firstChild) {
    const paragraph = firstChild.querySelector("p");
    if (paragraph && paragraph.textContent) {
      const decodedHtml = decodeBase64(paragraph.textContent.trim());
      block.innerHTML = decodedHtml;
    } else {
      block.innerHTML = "";
      firstChild.remove();
    }
  } else {
    block.innerHTML = "";
  }
}
