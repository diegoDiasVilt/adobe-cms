import { decodeBase64, htmlToElement } from '../../scripts/scripts.js';

const DEFAULT_BACKGROUND = '#b5d4ed';
const DEFAULT_IMAGE_POSITION = 'bottom';
const IMAGE_POSITIONS = ['top', 'middle', 'bottom'];

function readRichText(cell) {
  if (!cell) return '';
  const richtextDiv = cell.querySelector('div[data-aue-type="richtext"]');
  if (richtextDiv) return richtextDiv.innerHTML.trim();

  const encoded = cell.querySelector('p')?.textContent.trim();
  if (encoded) {
    const decoded = decodeBase64(encoded);
    if (/<[a-z][\s\S]*>/i.test(decoded)) return decoded.trim();
  }
  return cell.innerHTML.trim();
}

function hasVisibleContent(html) {
  if (!html) return false;
  const probe = document.createElement('div');
  probe.innerHTML = html;
  return !!(probe.textContent.trim() || probe.querySelector('img, picture, video, iframe'));
}

function resolveBackground(value) {
  const color = value?.trim();
  return color && CSS.supports('color', color) ? color : DEFAULT_BACKGROUND;
}

function buildImage(cell, altText) {
  const picture = cell?.querySelector('picture');
  const img = cell?.querySelector('img');
  const src = cell?.textContent.trim();

  if (picture) return picture.cloneNode(true);
  if (img) {
    const clone = img.cloneNode(true);
    if (altText && !clone.alt) clone.alt = altText;
    return clone;
  }
  if (src) {
    const created = document.createElement('img');
    created.src = src;
    if (altText) created.alt = altText;
    return created;
  }
  return null;
}

export default async function decorate(block) {
  const id = block.children[1];
  if (id && id?.querySelectorAll('div')?.length < 3) {
    id.remove();
    block.setAttribute('id', id?.textContent?.trim());
  }

  const numColumnsRow = block.children[0];
  const numCols = parseInt(numColumnsRow?.children[1]?.textContent.trim() || '3', 10);
  numColumnsRow.remove();

  const itemRows = Array.from(block.children);

  const itemsContainer = document.createElement('div');
  itemsContainer.className = `quadro-box-dinamico-items columns-${Math.min(itemRows.length, numCols)}`;

  itemRows.forEach((itemRow) => {
    const [
      titleCell,
      contentCell,
      imageCell,
      imageDescriptionCell,
      imagePositionCell,
      imageAltCell,
      backgroundCell,
    ] = Array.from(itemRow.children);

    const itemDiv = document.createElement('div');
    itemDiv.className = 'quadro-box-dinamico-item';

    Array.from(itemRow.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-')) {
        itemDiv.setAttribute(attr.name, attr.value);
      }
    });

    itemDiv.style.setProperty('--quadro-box-dinamico-bg', resolveBackground(backgroundCell?.textContent));

    const titleHtml = readRichText(titleCell);
    const contentHtml = readRichText(contentCell);

    let title = null;
    if (hasVisibleContent(titleHtml)) {
      title = document.createElement('div');
      title.className = 'quadro-box-dinamico-item-title';
      title.innerHTML = titleHtml;
    }

    let content = null;
    if (hasVisibleContent(contentHtml)) {
      content = document.createElement('div');
      content.className = 'quadro-box-dinamico-item-content';
      content.innerHTML = contentHtml;
    }

    let imageWrapper = null;
    const image = buildImage(imageCell, imageAltCell?.textContent.trim());
    if (image) {
      imageWrapper = document.createElement('div');
      imageWrapper.className = 'quadro-box-dinamico-item-image';
      imageWrapper.append(image);

      const descriptionHtml = readRichText(imageDescriptionCell);
      if (hasVisibleContent(descriptionHtml)) {
        imageWrapper.append(htmlToElement(`<div class="quadro-box-dinamico-item-image-description">${descriptionHtml}</div>`));
      }
    }

    const requested = imagePositionCell?.textContent.trim();
    const position = IMAGE_POSITIONS.includes(requested) ? requested : DEFAULT_IMAGE_POSITION;
    const ordered = {
      top: [imageWrapper, title, content],
      middle: [title, imageWrapper, content],
      bottom: [title, content, imageWrapper],
    }[position];

    ordered.filter(Boolean).forEach((element) => itemDiv.append(element));

    if (itemDiv.hasChildNodes()) {
      itemsContainer.append(itemDiv);
    }
  });

  block.innerHTML = '';
  if (itemsContainer.hasChildNodes()) {
    block.append(itemsContainer);
  }
}
