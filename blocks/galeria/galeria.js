import { decodeBase64, isInEditor } from '../../scripts/scripts.js';

function handleImage(imageElement) {
  const img = imageElement?.children[0];
  const title = imageElement?.children[1];
  const desc = imageElement?.children[2];
  const titleText = title?.textContent.trim();
  const descText = desc?.textContent.trim();

  title.remove();
  desc.remove();

  const pictureElement = img.querySelector('picture');
  if (!pictureElement) return imageElement?.outerHTML;

  const imgHeader = document.createElement('figcaption');
  const imgFooter = document.createElement('figcaption');

  imgHeader.textContent = titleText;
  imgHeader.classList.add('img-header');
  pictureElement.insertBefore(imgHeader, pictureElement.firstChild);

  imgFooter.textContent = descText;
  imgFooter.classList.add('img-footer');
  pictureElement.appendChild(imgFooter);

  return imageElement?.outerHTML;
}

function handleText(textElement) {
  const elementToInjectHTML = textElement?.querySelector('div:last-child');
  elementToInjectHTML.innerHTML = decodeBase64(textElement?.textContent);
  return textElement?.outerHTML;
}

export default function decorate(block) {
  // 1. Detect PDF Mode
  const urlParams = new URLSearchParams(window.location.search);
  const isPdfParam = urlParams.get('mode') === 'pdf';
  if (isPdfParam) {
    document.body.classList.add('pdf-mode');
  }
  const isPdf = document.body.classList.contains('pdf-mode') || isPdfParam;

  const variant = block?.children[0];
  const id = block?.children[1];
  if (id && id?.querySelectorAll('div')?.length < 3) {
    id.remove();
    block.setAttribute('id', id?.textContent?.trim());
  }

  const variantText = variant?.textContent?.trim();
  variant.remove();

  const texts = [];
  const images = [];

  block.classList.add(variantText);

  Array.from(block?.children).forEach((element) => {
    const type = element?.children[0];
    const typeText = type?.textContent?.trim();
    type.remove();

    if (typeText === 'txt') texts.push(element);
    if (typeText === 'img') images.push(element);
  });

  if (variantText === 'text-and-image-1-1' && texts.length !== images.length) {
    if (!isInEditor) return;
    const msgElement = document.createElement('div');
    msgElement.classList.add('error-notice');
    msgElement.innerHTML += `<div class="oaerror error"><strong>Atenção</strong> - Nesta variação da galeria a quantidade de imagens e textos deve ser a mesma.</div>`;
    block.insertBefore(msgElement, block.firstChild);
    return;
  }

  Array.from(block?.children).forEach((element) => {
    element.remove();
  });

  // 2. Define Classes based on Mode
  const containerClass = isPdf ? 'pdf-gallery-container' : 'splide';
  const trackClass = isPdf ? 'pdf-gallery-track' : 'splide__track';
  const listClass = isPdf ? 'pdf-gallery-list' : 'splide__list';
  const slideClass = isPdf ? 'pdf-gallery-item' : 'splide__slide';
  
  const arrowsHTML = isPdf ? '' : `
          <div class="splide__arrows">
            <button class="splide__arrow splide__arrow--prev">
              <i class="fa-solid fa-circle-chevron-left"></i>
            </button>
            <button class="splide__arrow splide__arrow--next">
              <i class="fa-solid fa-circle-chevron-right"></i>
            </button>
          </div>
  `;

  const wrapSplide = (content) => `
    <div class="${containerClass}" role="group">
      ${arrowsHTML}
      <div class="${trackClass}">
        <ul class="${listClass}">
          ${content}
        </ul>
      </div>
    </div>
  `;

  // 3. Render Content
  switch (variantText) {
    case 'image-only':
      block.innerHTML += wrapSplide(
        images?.map((img) => `<li class="${slideClass}">
            <div class="splide__slide__container">
                ${handleImage(img)}
            </div>
        </li>`)?.join('')
      );
      break;

    case 'text-only':
      block.innerHTML += wrapSplide(
        texts?.map((text) => `<li class="${slideClass}">
            <div class="splide__slide__container">
                ${handleText(text)}
            </div>
        </li>`)?.join('')
      );
      break;

    case 'text-and-image-1-1':
      block.innerHTML += wrapSplide(
        texts?.map((text, index) => `<li class="${slideClass}">
            <div class="splide__slide__container text-and-image-1-1">
                ${handleText(text)}
                ${handleImage(images[index])}
            </div>
        </li>`)?.join('')
      );
      break;

    case 'one-image-many-texts':
      block.innerHTML += wrapSplide(
        texts?.map((text) => `<li class="${slideClass}">
            <div class="splide__slide__container">
                ${handleText(text)}
            </div>
        </li>`)?.join('')
      );
      block.innerHTML += `
        <div class="image__container">
            ${handleImage(images[0])}
        </div>
      `;
      break;

    case 'one-text-many-images':
      block.innerHTML += `
        <div class="text__container">
            ${handleText(texts[0])}
        </div>
      `;
      block.innerHTML += wrapSplide(
        images?.map((img) => `<li class="${slideClass}">
            <div class="splide__slide__container">
                ${handleImage(img)}
            </div>
        </li>`)?.join('')
      );
      break;

    default:
      break;
  }

  // 4. Initialize Splide ONLY if NOT Pdf
  if (!isPdf) {
    const elms = block.getElementsByClassName('splide');
    for (let i = 0; i < elms.length; i++) {
      new Splide(elms[i], {
        rewind: true,
        rewindSpeed: 1000,
        pagination: true,
      }).mount();
    }
  }
}