import { decodeBase64, htmlToElement } from '../../scripts/scripts.js';

function getRichtextContent(richtextDiv) {
  const content = richtextDiv?.textContent?.trim();
  const decodedContent = decodeBase64(content);
  return decodedContent !== content ? decodedContent : richtextDiv.innerHTML;
}

export default function decorate(block) {
  const openAll = block?.children[0];
  const iconOpen = block?.children[1];
  const iconClosed = block?.children[2];
  const id = block?.children[3];

  const isPdf = document.body.classList.contains('pdf-mode');

  if (id?.querySelectorAll('div')?.length < 3) {
    id.remove();
    block.setAttribute('id', id?.textContent?.trim());
  }
  const openAllText = openAll?.textContent?.trim() ? openAll?.textContent?.trim() : 'false';
  const iconOpenText = iconOpen?.textContent?.trim();
  const iconClosedText = iconClosed?.textContent?.trim();

  openAll?.remove();
  iconOpen?.remove();
  iconClosed?.remove();

  const accordionItems = Array.from(block?.children)?.map((element) => {
    const headerTextElement = element?.children[0];
    const imgTitleElement = element?.children[3];
    const descriptionElement = element?.children[4];
    const secondImgTitleElement = element?.children[7];
    const secondDescriptionElement = element?.children[8];
    const zoomImages = element?.children[9];

    const headerText = headerTextElement?.textContent?.trim();
    const text = element?.children[1];
    const image = element?.children[2];
    const imgTitle = imgTitleElement?.textContent?.trim();
    const imgTitleDecoded = decodeBase64(imgTitle);
    const description = descriptionElement?.textContent?.trim();
    const descriptionDecoded = decodeBase64(description);
    const secondText = element?.children[5];
    const secondImage = element?.children[6];
    const secondImgTitle = secondImgTitleElement?.textContent?.trim();
    const secondImgTitleDecoded = decodeBase64(secondImgTitle);
    const secondDescription = secondDescriptionElement?.textContent?.trim();
    const secondDescriptionDecoded = decodeBase64(secondDescription);
    const zoomImagesVal = zoomImages?.textContent?.trim();

    headerTextElement.remove();
    imgTitleElement.remove();
    descriptionElement.remove();
    secondImgTitleElement.remove();
    secondDescriptionElement.remove();
    zoomImages?.remove();
    text.remove();
    image.remove();
    secondText.remove();
    secondImage.remove();

    let textContent = '';
    let secondTextContent = '';

    const textParagraph = text?.querySelector('p');
    if (textParagraph) {
      const richtextDiv = text?.querySelector('div[data-aue-type="richtext"]');
      if (richtextDiv) {
        textContent = getRichtextContent(richtextDiv);
      } else if (textParagraph.textContent && textParagraph.textContent.trim()) {
        try {
          textContent = decodeBase64(textParagraph.textContent.trim());
        } catch (e) {
          textContent = text.innerHTML;
        }
      }
    }

    const secondTextParagraph = secondText?.querySelector('p');
    if (secondTextParagraph) {
      const secondRichtextDiv = secondText?.querySelector('div[data-aue-type="richtext"]');
      if (secondRichtextDiv) {
        secondTextContent = getRichtextContent(secondRichtextDiv);
      } else if (secondTextParagraph.textContent && secondTextParagraph.textContent.trim()) {
        try {
          secondTextContent = decodeBase64(secondTextParagraph.textContent.trim());
        } catch (e) {
          secondTextContent = secondText.innerHTML;
        }
      }
    }
    
    const accordionItemElement = htmlToElement(`
        <div class="accordion-item ${isPdf ? 'active' : ''}">
            <div class="accordion-item-header">
                <h5><a><span>${headerText}</span><i class="fa fa-${iconClosedText || 'plus-circle'}"></i></a></h5>
            </div>
            <div class="accordion-item-body">
                <div class="accordion-item-body-text">
                    ${textContent}
                </div>
                <div class="accordion-item-body-image">
                    <p>${imgTitleDecoded}</p>
                    ${image?.innerHTML}
                    <p>${descriptionDecoded}</p>
                </div>

                <div class="accordion-item-body-text">
                    ${secondTextContent}
                </div>
                <div class="accordion-item-body-image">
                    <p>${secondImgTitleDecoded}</p>
                    ${secondImage?.innerHTML}
                    <p>${secondDescriptionDecoded}</p>
                </div>
            </div>
        </div>
        `);

    if (zoomImagesVal === 'true') {
      accordionItemElement.querySelectorAll('.accordion-item-body-image picture').forEach((pictureElement) => {
        const imgElement = pictureElement.querySelector('img');
        if (!imgElement) return;

        pictureElement.classList.add('zoom-in');

        pictureElement.addEventListener('mousemove', (e) => {
          const rect = pictureElement.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const moveX = (x / pictureElement.offsetWidth) * 100;
          const moveY = (y / pictureElement.offsetHeight) * 100;

          imgElement.style.transformOrigin = `${moveX}% ${moveY}%`;
        });

        pictureElement.addEventListener('mouseenter', () => {
          imgElement.style.transform = 'scale(1.5)';
        });

        pictureElement.addEventListener('mouseleave', () => {
          imgElement.style.transform = 'scale(1)';
        });
      });
    }

    return accordionItemElement;
  });

  // block.textContent = "";
  accordionItems?.forEach((accordionItem) => {
    block.append(accordionItem);

    if (!isPdf) {
      accordionItem.querySelector('a').addEventListener('click', () => {
        if (accordionItem.className.includes('active')) {
          accordionItem.classList.remove('active');
          accordionItem.querySelector('i')?.classList?.add(`fa-${iconClosedText || 'plus-circle'}`);
          accordionItem.querySelector('i')?.classList?.remove(`fa-${iconOpenText || 'circle-minus'}`);
          return;
        }
        if (openAllText === 'false') {
          Array.from(block.querySelectorAll('.accordion-item')).forEach((item) => {
            item.classList.remove('active');
            item.querySelector('i')?.classList?.add(`fa-${iconClosedText || 'plus-circle'}`);
            item.querySelector('i')?.classList?.remove(`fa-${iconOpenText || 'circle-minus'}`);
          });
        }

        accordionItem.classList.add('active');
        accordionItem.querySelector('i')?.classList?.add(`fa-${iconOpenText || 'circle-minus'}`);
        accordionItem.querySelector('i')?.classList?.remove(`fa-${iconClosedText || 'plus-circle'}`);
      });
    }
  });
}
