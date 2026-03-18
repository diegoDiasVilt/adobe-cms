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
                <div class="divider" style="left: 50%;"></div>
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

  const slide = (x) => {
    const rect = slider.getBoundingClientRect();
    let posX = x - rect.left;
    
    // Bounds check
    if (posX < 0) posX = 0;
    if (posX > rect.width) posX = rect.width;

    const percentage = (posX / rect.width) * 100;

    resizeDiv.style.width = `${percentage}%`;
    divider.style.left = `${percentage}%`;
  };

  const startDrag = () => {
    isDragging = true;
    divider.classList.add('draggable');
  };

  const stopDrag = () => {
    isDragging = false;
    divider.classList.remove('draggable');
  };

  const moveDrag = (e) => {
    if (!isDragging) return;
    
    // Support Touch or Mouse
    let pageX = e.pageX;
    if (e.touches && e.touches.length > 0) {
      pageX = e.touches[0].pageX;
    }
    
    slide(pageX);
  };

  // Event Listeners
  divider.addEventListener('mousedown', startDrag);
  divider.addEventListener('touchstart', startDrag);

  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchend', stopDrag);

  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('touchmove', moveDrag);
}
