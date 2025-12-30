import { decodeBase64, htmlToElement } from '../../scripts/scripts.js';

export default function decorate(block) {
  const urlParams = new URLSearchParams(window.location.search);
  const isPdfParam = urlParams.get('mode') === 'pdf';
  if (isPdfParam) {
    document.body.classList.add('pdf-mode');
  }
  const isPdf = document.body.classList.contains('pdf-mode') || isPdfParam;

  const cta = block.children[0];
  const title = block.children[1];
  const text = block.children[2];
  const image = block.children[3];
  const imgTitle = block.children[4];
  const description = block.children[5];

  const text2 = block.children[6];
  const image2 = block.children[7];
  const imgTitle2 = block.children[8];
  const description2 = block.children[9];
  const id = block.children[10];
  if (id) {
    id.remove();
    block.setAttribute('id', id?.textContent?.trim());
  }

  const ctaText = cta?.textContent?.trim();
  const titleText = title?.textContent?.trim();
  const imgTitleText = imgTitle?.textContent?.trim();
  const descriptionText = description?.textContent?.trim();
  const imgTitleText2 = imgTitle2?.textContent?.trim();
  const descriptionText2 = description2?.textContent?.trim();

  let textContent = '';
  if (text) {
    const textParagraph = text.querySelector('p');
    if (textParagraph) {
      const richtextDiv = text.querySelector('div[data-aue-type="richtext"]');
      if (richtextDiv) {
        textContent = richtextDiv.innerHTML;
      } else if (textParagraph.textContent && textParagraph.textContent.trim()) {
        try {
          textContent = decodeBase64(textParagraph.textContent.trim());
        } catch (e) {
          textContent = text.innerHTML;
        }
      }
    } else {
      textContent = text.innerHTML;
    }
  }

  let text2Content = '';
  if (text2) {
    const text2Paragraph = text2.querySelector('p');
    if (text2Paragraph) {
      const richtext2Div = text2.querySelector('div[data-aue-type="richtext"]');
      if (richtext2Div) {
        text2Content = richtext2Div.innerHTML;
      } else if (text2Paragraph.textContent && text2Paragraph.textContent.trim()) {
        try {
          text2Content = decodeBase64(text2Paragraph.textContent.trim());
        } catch (e) {
          text2Content = text2.innerHTML;
        }
      }
    } else {
      text2Content = text2?.innerHTML || '';
    }
  }

  block.textContent = '';

  if (isPdf) {
    // 2. PDF MODE: Render content directly
    const pdfContainer = htmlToElement(`
      <div class="pdf-expanded-content">
          <h4 class="pdf-content-title">${titleText}</h4>
          <div class="pdf-content-body">
              ${textContent}
              ${image?.querySelector('img')
        ? `
                  <div class="pdf-img-wrapper">
                      <p class="img-caption">${imgTitleText}</p>
                      ${image.innerHTML}
                      <p class="img-desc">${descriptionText}</p>
                  </div>
                  `
        : ''}
              ${text2Content}
              ${image2?.querySelector('img')
        ? `
                  <div class="pdf-img-wrapper">
                      <p class="img-caption">${imgTitleText2}</p>
                      ${image2.innerHTML}
                      <p class="img-desc">${descriptionText2}</p>
                  </div>
                  `
        : ''}
          </div>
      </div>
    `);
    block.append(pdfContainer);

  } else {
    const button = htmlToElement(`<a class="btn-modal">${ctaText}</a>`);
    block.append(button);

    const modalElement = htmlToElement(`
          <div class="modal">
              <div class="modal-content">
                  <div class="modal-content-header">
                      <h4 class="modal-content-header-title">${titleText}</h4>
                      <i class="fa-solid fa-xmark"></i>
                  </div>
                  <div class="modal-content-body">
                      ${textContent}
                      ${image?.querySelector('img')
      ? `
                          <div class="modal-content-body-img-wrapper">
                              <p>${imgTitleText}</p>
                              ${image.innerHTML}
                              <p>${descriptionText}</p>
                          </div>
                          `
      : ''}
                      ${text2Content}
                      ${image2?.querySelector('img')
      ? `
                          <div class="modal-content-body-img-wrapper">
                              <p>${imgTitleText2}</p>
                              ${image2.innerHTML}
                              <p>${descriptionText2}</p>
                          </div>
                          `
      : ''}
                  </div>
                  <div class="modal-content-footer">
                  
                  </div>
              </div>
          </div>
      `);

    block.append(modalElement);

    const contentSectionElement = modalElement.querySelector('.modal-content');
    button.addEventListener('click', () => {
      const modalContent = document.querySelectorAll(".modal-content")[0];
      modalContent.style.top = `${button.getBoundingClientRect().top}px`;
      modalElement.style.display = 'block';
      modalElement.style.visibility = 'visible';

      setTimeout(() => {
        modalElement.style.opacity = 1;
        // const rect = modalContent.getBoundingClientRect(); // Unused
        modalContent.scrollIntoView();
        window.parent.postMessage(['scrollTo', modalContent.getBoundingClientRect().top], '*');
        contentSectionElement.classList.add('active');
      }, 100);
    });

    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement || e.target?.className.includes('fa-xmark')) {
        modalElement.style.opacity = 0;
        contentSectionElement.classList.remove('active');
        setTimeout(() => {
          modalElement.style.display = 'none';
          modalElement.style.visibility = 'hidden';
        }, 500);
      }
    });
  }
}