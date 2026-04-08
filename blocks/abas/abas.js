import { decodeBase64, htmlToElement } from '../../scripts/scripts.js';

function getRichtextContent(field) {
  const richtextDiv = field?.querySelector('div[data-aue-type="richtext"]');
  if (richtextDiv) {
    return richtextDiv.innerHTML;
  }

  const paragraph = field?.querySelector('p');
  if (!paragraph?.textContent?.trim()) {
    return '';
  }

  try {
    return decodeBase64(paragraph.textContent.trim());
  } catch (e) {
    return field.innerHTML;
  }
}

function decodeTextContent(text) {
  if (!text) {
    return '';
  }

  try {
    return decodeBase64(text);
  } catch (e) {
    return text;
  }
}

function buildImageSection(field, titleText, descriptionText, className) {
  if (!field?.innerHTML?.trim() && !titleText && !descriptionText) {
    return '';
  }

  return `
    <div class="${className}">
      ${titleText ? `<p>${titleText}</p>` : ''}
      ${field?.innerHTML || ''}
      ${descriptionText ? `<p>${descriptionText}</p>` : ''}
    </div>
  `;
}

export default function decorate(block) {
  const urlParams = new URLSearchParams(window.location.search);
  const isPdfParam = urlParams.get('mode') === 'pdf';
  if (isPdfParam) {
    document.body.classList.add('pdf-mode');
  }

  const isPdf = document.body.classList.contains('pdf-mode') || isPdfParam;

  const id = block?.children[0];
  if (id && id?.querySelectorAll('div')?.length < 3) {
    id.remove();
    block.setAttribute('id', id?.textContent?.trim());
  }

  const tabs = Array.from(block?.children).map((element, index) => {
    const headerTextElement = element?.children[0];
    const textElement = element?.children[1];
    const imageElement = element?.children[2];
    const imgTitleElement = element?.children[4];
    const descriptionElement = element?.children[5];
    const secondTextElement = element?.children[6];
    const secondImageElement = element?.children[7];
    const secondImgTitleElement = element?.children[9];
    const secondDescriptionElement = element?.children[10];

    const titleText = headerTextElement?.textContent?.trim() || '';
    const textContent = getRichtextContent(textElement);
    const imgTitle = decodeTextContent(imgTitleElement?.textContent?.trim() || '');
    const description = decodeTextContent(descriptionElement?.textContent?.trim() || '');
    const secondTextContent = getRichtextContent(secondTextElement);
    const secondImgTitle = decodeTextContent(secondImgTitleElement?.textContent?.trim() || '');
    const secondDescription = decodeTextContent(secondDescriptionElement?.textContent?.trim() || '');

    [
      headerTextElement,
      textElement,
      imageElement,
      element?.children[3],
      imgTitleElement,
      descriptionElement,
      secondTextElement,
      secondImageElement,
      element?.children[8],
      secondImgTitleElement,
      secondDescriptionElement,
    ].forEach((field) => field?.remove());

    const content = htmlToElement(`
      <div class="abas-item-body">
        ${textContent ? `<div class="abas-item-body-text">${textContent}</div>` : ''}
        ${buildImageSection(imageElement, imgTitle, description, 'abas-item-body-image')}
        ${secondTextContent ? `<div class="abas-item-body-text">${secondTextContent}</div>` : ''}
        ${buildImageSection(secondImageElement, secondImgTitle, secondDescription, 'abas-item-body-image')}
      </div>
    `);

    if (content) {
      element.append(content);
    }

    if (isPdf) {
      const pdfTitle = document.createElement('h3');
      pdfTitle.classList.add('pdf-tab-title');
      pdfTitle.textContent = titleText;
      element.insertBefore(pdfTitle, element.firstChild);
      element.classList.add('pdf-tab-content');
    } else if (index !== 0) {
      element.classList.add('hidden');
    }

    return { title: titleText, body: element };
  });

  if (!isPdf) {
    const outputHtml = htmlToElement(`
      <div class="abas-header">
        <ul>
          ${tabs.map((tab, index) => `<li><a role="tab" index="${index}" class="${index === 0 ? 'active' : ''}">${tab.title}</a></li>`).join('')}
        </ul>
      </div>
    `);

    outputHtml?.querySelectorAll('a')?.forEach((tabTitle) => {
      tabTitle?.addEventListener('click', (e) => {
        outputHtml?.querySelectorAll('a')?.forEach((otherTab) => {
          otherTab?.classList?.remove('active');
        });
        e?.target?.classList?.add('active');
        tabs.forEach((tab) => {
          tab?.body?.classList?.add('hidden');
        });
        tabs[e?.target?.getAttribute('index')]?.body?.classList?.remove('hidden');
      });
    });

    block?.insertBefore(outputHtml, block?.children[0]);
  }
}
