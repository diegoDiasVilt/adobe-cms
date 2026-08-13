import { randomString, htmlToElement, createOptimizedPicture } from '../../scripts/scripts.js';

// A copy of the picture carries a second copy of the authoring instrumentation, which makes the
// editor treat the copy as another instance of the same component.
function stripInstrumentation(element) {
  [element, ...element.querySelectorAll('*')].forEach((el) => {
    [...el.attributes]
      .filter(({ name }) => name.startsWith('data-aue') || name.startsWith('data-richtext'))
      .forEach(({ name }) => el.removeAttribute(name));
  });
  return element;
}

export default function decorate(block) {
  // Authoring only persists fields that hold a value, so an empty field produces no row and
  // shifts every later index. Anchor on the image row instead of trusting children[0].
  const rows = [...block.children];
  const image = rows.find((row) => row.querySelector('picture')) || null;
  const rest = rows.filter((row) => row !== image);
  const [title, description, zoomIn, openModal, uniquecss, id] = rest;

  if (id) {
    block.setAttribute('id', id?.textContent?.trim());
  }

  const titleText = title?.textContent.trim();
  const descriptionText = description?.textContent.trim();
  const zoomInVal = zoomIn?.textContent.trim();
  const openModalVal = openModal?.textContent.trim();
  const uniquecssText = uniquecss?.textContent?.trim();

  // remove every row we just read, so none is left behind still carrying instrumentation
  rest.forEach((row) => row.remove());

  const pictureElement = image?.querySelector('picture');

  if (!pictureElement) return;

  const pic = createOptimizedPicture(pictureElement);
  pictureElement.replaceWith(pic);

  if (titleText) {
    const imageTitleElement = document.createElement('p');
    imageTitleElement.textContent = titleText;
    block.insertBefore(imageTitleElement, image);
  }

  if (descriptionText) {
    const imageDescriptionElement = document.createElement('p');
    imageDescriptionElement.textContent = descriptionText;
    block.append(imageDescriptionElement);
  }

  // handleZoomIn
  if (zoomInVal === 'true') {
    pictureElement?.classList?.add('zoom-in');

    const imgElement = image?.querySelector('img');

    pictureElement.addEventListener('mousemove', (e) => {
      const rect = pictureElement.getBoundingClientRect();
      const x = e.clientX - rect.left; // Posição X do mouse dentro do contêiner
      const y = e.clientY - rect.top; // Posição Y do mouse dentro do contêiner

      const moveX = (x / pictureElement.offsetWidth) * 100;
      const moveY = (y / pictureElement.offsetHeight) * 100;

      imgElement.style.transformOrigin = `${moveX}% ${moveY}%`; // Define a origem do zoom
    });

    pictureElement.addEventListener('mouseenter', () => {
      imgElement.style.transform = 'scale(1.5)'; // Aplica o zoom de 50% quando o mouse entra
    });

    pictureElement.addEventListener('mouseleave', () => {
      imgElement.style.transform = 'scale(1)'; // Retorna ao tamanho original quando o mouse sai
    });
  }

  if (openModalVal === 'true') {
    pictureElement?.classList?.add('open-modal');

    const zoomIconElement = document.createElement('i');
    pictureElement.append(zoomIconElement);

    const modalPicture = stripInstrumentation(pictureElement.cloneNode(true));

    const modalElement = htmlToElement(`
            <div class="img-modal">
                <div class="img-modal-content">
                    ${modalPicture.outerHTML}
                    <div class="img-modal-content-footer">
                        <div class="img-modal-content-footer-wrapper">
                            <span>${titleText}</span>
                            <i class="fa-solid fa-xmark"></i>
                        </div>
                    </div>
                </div>
            </div>
        `);
    block.append(modalElement);

    pictureElement.addEventListener('click', () => {
      modalElement.style.display = 'block';
      setTimeout(() => {
        modalElement.style.opacity = 1;
        const img = modalElement.querySelector("img");
        img.scrollIntoView();

        window.parent.postMessage(['scrollTo', img.getBoundingClientRect().top], '*');
      }, 100);
    });

    // click fora do modal
    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement || e.target?.className.includes('fa-xmark')) {
        modalElement.style.opacity = 0;
        block.scrollIntoView();
        window.parent.postMessage(['scrollTo', block.getBoundingClientRect().top], '*');
        setTimeout(() => {
          modalElement.style.display = 'none';
        }, 500);
      }
    });
  }

  if (uniquecssText) {
    const randomId = randomString(6);
    block.setAttribute('id', randomId);
    const styleTag = document.createElement('style');
    styleTag.textContent = `
        #${randomId}{
            ${uniquecssText}
        }`;
    block.append(styleTag);
  }
}
