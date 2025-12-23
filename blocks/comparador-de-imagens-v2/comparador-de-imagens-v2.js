import { decodeBase64 } from "../../scripts/scripts.js";

export default function decorate(block) {
  const imageBefore = block.children[0]?.querySelector('img');
  const titleBefore = block.children[1]?.querySelector('p')?.textContent?.trim();
  const textBefore = block.children[2]?.querySelector('p')?.textContent?.trim();
  const fontTextBefore = block.children[3]?.querySelector('p')?.textContent?.trim();
  const imageAfter = block.children[4]?.querySelector('img');
  const titleAfter = block.children[5]?.querySelector('p')?.textContent?.trim();
  const textAfter = block.children[6]?.textContent?.trim();
  const fontTextAfter = block.children[7]?.querySelector('p')?.textContent?.trim();
  const id = block?.children[8];
  console.log("block.children[2]",block.children[2]);
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
            <div class="title-before">${titleBeforeDecoded ? titleBeforeDecoded : ''}
            </div>
            <div class="title-after"><p class="title-text">${titleAfterDecoded ? titleAfterDecoded : ''}</p>
            </div>
          </div>
          <div class="comparison-slider">
              <div class="overlay right"}><div class="overlay-wrapper">${textAfterDecoded}</div></div>
              ${imageAfter?.src ? `<img src="${imageAfter?.src}" class="img-back"/>` : ''}
              
                <div class="resize" style="width: 50%;">
                  <div class="overlay left" ${textBefore ? '' : "style='display:none;'"}><div class="overlay-wrapper" >${textBeforeDecoded}</div></div>
                  ${imageBefore?.src ? `<img src="${imageBefore?.src}" class="img-front"/>` : ''}
                </div>
                <div class="divider" style="left: 50%;"></div>
              </div>
              <div class="font-text-container">
                <div class="font-text-before">${fontTextBeforeDecoded ? fontTextBeforeDecoded : ''}</div>
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