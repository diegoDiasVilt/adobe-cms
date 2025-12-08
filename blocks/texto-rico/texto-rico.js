import { decodeBase64 } from "../../scripts/scripts.js";

// function removerStylesInlineDeTabelas() {
//   const seletores = "table, thead, tbody, tfoot, tr, th, td, p, span";
//   const elementosParaLimpar = document.querySelectorAll(seletores);
//   // Percorre e remove o atributo 'style'
//   console.log("elementos", elementosParaLimpar);
//   for (const elemento of elementosParaLimpar) {
//     elemento.removeAttribute("style");
//   }
// }

export default function decorate(block) {
  const firstChild = block.children[0];
  const id = block.children[1];

  // removerStylesInlineDeTabelas();

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
