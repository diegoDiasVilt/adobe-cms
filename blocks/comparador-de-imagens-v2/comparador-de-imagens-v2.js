import { decodeBase64 } from "../../scripts/scripts.js";

export default function decorate(block) {
  const getCellText = (index) => {
    const cell = block.children[index];
    const content = cell?.querySelector("p") || cell?.querySelector("div") || cell;
    return content?.textContent?.trim() || "";
  };

  const imageBefore = block.children[0]?.querySelector("img");
  const altImageBefore = getCellText(1);
  const titleBefore = getCellText(2);
  const textBefore = getCellText(3);
  const fontTextBefore = getCellText(4);
  const imageAfter = block.children[5]?.querySelector("img");
  const altImageAfter = getCellText(6);
  const titleAfter = getCellText(7);
  const textAfter = getCellText(8);
  const fontTextAfter = getCellText(9);
  const id = block?.children[10];
  
  const titleBeforeDecoded = decodeBase64(titleBefore || '');
  const textBeforeDecoded = decodeBase64(textBefore || '');
  const fontTextBeforeDecoded = decodeBase64(fontTextBefore || '');
  const titleAfterDecoded = decodeBase64(titleAfter || '');
  const textAfterDecoded = decodeBase64(textAfter || '');
  const fontTextAfterDecoded = decodeBase64(fontTextAfter || '');

  if (id) {
    id.remove();
    block.setAttribute('id', id?.textContent?.trim());
  }

  const isPdf = document.body.classList.contains('pdf-mode');

  const htmlOutput = `
        <div class="comparison-slider-wrapper loadable">
          <div class="title-container">
            <div class="title-before">
              ${titleBeforeDecoded ? titleBeforeDecoded : ''}
            </div>
            <div class="title-after">
              ${titleAfterDecoded ? titleAfterDecoded : ''}
            </div>
          </div>
            <div class="comparison-slider">
                <div class="overlay right" ${textAfterDecoded ? '' : "style='display:none;'"}>
                  <div class="overlay-wrapper">
                    ${textAfterDecoded}
                  </div>
                </div>
                ${imageAfter?.src ? `<img src="${imageAfter?.src}" alt="${altImageAfter ? altImageAfter : ''}" class="img-back"/>` : ''}
                <div class="resize" style="width: 50%;">
                  <div class="overlay left" ${textBeforeDecoded ? '' : "style='display:none;'"}>
                    <div class="overlay-wrapper" >
                    ${textBeforeDecoded}
                    </div>
                  </div>
                  ${imageBefore?.src ? `<img src="${imageBefore?.src}" alt="${altImageBefore ? altImageBefore : ''}" class="img-front"/>` : ''}
                </div>
                <div class="divider" style="left: 50%;" role="slider" tabindex="0" aria-label="Controle de comparação das imagens" aria-orientation="horizontal" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-valuetext="50%"></div>
            </div>
            <div class="font-text-container">
              <div class="font-text-before"><p class="font-text">${fontTextBeforeDecoded ? fontTextBeforeDecoded : ''}</p></div>
              <div class="font-text-after"><p class="font-text">${fontTextAfterDecoded ? fontTextAfterDecoded : ''}</p></div>
            </div>
        </div>
        <div class="loader-15 loading"></div>
    `;
  block.innerHTML = htmlOutput;

  const wrapper = block.querySelector('.comparison-slider-wrapper');
  const slider = block.querySelector('.comparison-slider');
  const resizeDiv = block.querySelector('.resize');
  const divider = block.querySelector('.divider');
  const loader = block.querySelector('.loader-15');
  const imgs = block.querySelectorAll('img');

  let loadedCount = 0;
  const totalImgs = imgs.length;

  const checkLoad = () => {
    loadedCount += 1;
    if (loadedCount >= totalImgs) {
      loader.classList.remove('loading');
      wrapper.classList.remove('loadable');
    }
  };

  if (totalImgs === 0) {
    checkLoad(); // No images? just show.
  } else {
    imgs.forEach((img) => {
      if (img.complete) {
        checkLoad();
      } else {
        img.addEventListener('load', checkLoad);
        img.addEventListener('error', checkLoad); // proceed even on error
      }
    });
  }

  if (isPdf) {
    resizeDiv.style.width = '50%';
    divider.style.display = 'none'; 
    return; 
  }

  let isDragging = false;
  let position = 50;

  const setPosition = (value) => {
    position = Math.min(100, Math.max(0, value));
    resizeDiv.style.width = `${position}%`;
    divider.style.left = `${position}%`;
    const rounded = Math.round(position);
    divider.setAttribute('aria-valuenow', rounded);
    divider.setAttribute('aria-valuetext', `${rounded}%`);
  };

  const slide = (clientX) => {
    const rect = slider.getBoundingClientRect();
    if (!rect.width) return;
    setPosition(((clientX - rect.left) / rect.width) * 100);
  };

  const stopDrag = () => {
    isDragging = false;
    divider.classList.remove('draggable');
  };

  divider.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    isDragging = true;
    divider.classList.add('draggable');
    divider.setPointerCapture(e.pointerId);
  });

  divider.addEventListener('pointermove', (e) => {
    if (isDragging) slide(e.clientX);
  });

  divider.addEventListener('pointerup', stopDrag);
  divider.addEventListener('pointercancel', stopDrag);
  divider.addEventListener('lostpointercapture', stopDrag);
  slider.addEventListener('dragstart', (e) => e.preventDefault());

  const keySteps = {
    ArrowLeft: -5,
    ArrowDown: -5,
    ArrowRight: 5,
    ArrowUp: 5,
    PageDown: -10,
    PageUp: 10,
  };

  divider.addEventListener('keydown', (e) => {
    let next;
    if (keySteps[e.key] !== undefined) next = position + keySteps[e.key];
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = 100;
    else return;
    e.preventDefault();
    setPosition(next);
  });
}
