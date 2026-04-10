import { decodeBase64, htmlToElement } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const id = block.children[1];
  if (id && id?.querySelectorAll('div')?.length < 3) {
    id.remove();
    block.setAttribute('id', id?.textContent?.trim());
  }

  const originalBlockChildren = Array.from(block.children);

  const numColumnsRow = originalBlockChildren[0];
  const numCols = parseInt(numColumnsRow?.children[1]?.textContent.trim() || '3', 10);

  numColumnsRow.remove();

  const itemRowElements = Array.from(block.children);

  const itemsContainer = document.createElement('div');
  itemsContainer.className = `quadro-box-v2-items columns-${Math.min(itemRowElements.length, numCols)}`;

  const itemsToDisplay = itemRowElements.slice(0, numCols);

  itemsToDisplay.forEach((itemRowDOM) => {
    const itemDiv = itemRowDOM;
    itemDiv.classList.add('quadro-box-item');

    const cells = Array.from(itemRowDOM.children);

    const imageAuthoredCell = cells[0];
    const imageAltAuthoredCell = cells[1];
    const contentTextAuthoredCell = cells[2];
    const itemBackgroundColorAuthoredCell = cells[3];
    const imgTitle = cells[4]?.querySelector('p')?.textContent.trim();
    const imgTitleDecoded = imgTitle ? decodeBase64(imgTitle) : null;
    const imgDescription = cells[5]?.querySelector('p')?.textContent.trim();
    const imgDescriptionDecoded = imgDescription ? decodeBase64(imgDescription) : null;
    const imageAltText = imageAltAuthoredCell?.textContent.trim();
    const itemSpecificBgColor = itemBackgroundColorAuthoredCell?.textContent.trim() || 'rgba(0,0,0,0)';
    let textWrapper;
    let imageWrapper;

    itemDiv.style.backgroundColor = itemSpecificBgColor;

    if (contentTextAuthoredCell) {
      textWrapper = document.createElement('div');
      textWrapper.className = 'quadro-box-item-content';
      const contentParagraph = contentTextAuthoredCell.querySelector('p');
      const richtextDiv = contentTextAuthoredCell.querySelector('div[data-aue-type="richtext"]');

      if (richtextDiv) {
        textWrapper.append(...contentTextAuthoredCell.childNodes);
      } else if (contentParagraph && contentParagraph.textContent && contentParagraph.textContent.trim()) {
        try {
          const decodedContent = decodeBase64(contentParagraph.textContent.trim());
          const paragraph = document.createElement('p');
          paragraph.innerHTML = decodedContent;
          textWrapper.append(paragraph);
        } catch (e) {
          textWrapper.innerHTML = contentTextAuthoredCell.innerHTML;
        }
      } else {
        textWrapper.innerHTML = contentTextAuthoredCell.innerHTML;
      }
    }

    if (imageAuthoredCell) {
      imageWrapper = document.createElement('div');
      imageWrapper.className = 'quadro-box-item-image';
      const pictureElement = imageAuthoredCell.querySelector('picture');
      const imgElement = imageAuthoredCell.querySelector('img');

      if (imgTitleDecoded) {
        imageWrapper.append(htmlToElement(`<div class="quadro-box-item-image-title">${imgTitleDecoded}</div>`));
      }
      if (pictureElement) {
        imageWrapper.append(pictureElement);
      } else if (imgElement) {
        if (imageAltText && !imgElement.alt) {
          imgElement.alt = imageAltText;
        }
        imageWrapper.append(imgElement);
      } else if (imageAuthoredCell.textContent && imageAuthoredCell.textContent.trim()) {
        const img = document.createElement('img');
        img.src = imageAuthoredCell.textContent.trim();
        if (imageAltText) {
          img.alt = imageAltText;
        }
        imageWrapper.append(img);
      }
      if (imgDescriptionDecoded) {
        imageWrapper.append(htmlToElement(`<div class="quadro-box-item-image-description">${imgDescriptionDecoded}</div>`));
      }
    }

    itemDiv.setAttribute('data-quadro-box-item', 'true');
    itemDiv.replaceChildren();

    if (textWrapper?.hasChildNodes()) {
      itemDiv.append(textWrapper);
    }

    if (imageWrapper?.hasChildNodes()) {
      itemDiv.append(imageWrapper);
    }

    if (itemDiv.hasChildNodes()) {
      itemsContainer.append(itemDiv);
    }
  });

  block.innerHTML = '';
  if (itemsContainer.hasChildNodes()) {
    block.append(itemsContainer);
  }
}
