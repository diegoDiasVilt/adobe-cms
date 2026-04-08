import { decodeBase64, htmlToElement } from '../../scripts/scripts.js';

function decodeTextContent(text = '') {
  const trimmedText = text?.trim?.() || '';
  if (!trimmedText) return '';

  try {
    return decodeBase64(trimmedText);
  } catch (e) {
    return trimmedText;
  }
}

function processRichTextContent(element) {
  if (!element) return;

  const paragraphs = element.querySelectorAll('p');
  paragraphs.forEach((paragraph) => {
    if (paragraph.textContent && paragraph.textContent.trim()
      && !paragraph.closest('div[data-aue-type="richtext"]')) {
      paragraph.outerHTML = decodeTextContent(paragraph.textContent.trim());
    }
  });
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

  const tabs = [];

  Array.from(block?.children).forEach((element, index) => {
    const title = element.children[0];
    const text = element.children[1];
    const image = element.children[2];
    const imgTitle = element.children[4];
    const description = element.children[5];
    const secondText = element.children[6];
    const secondImage = element.children[7];
    const secondImgTitle = element.children[9];
    const secondDescription = element.children[10];

    const titleText = decodeTextContent(title?.textContent);
    title?.remove();

    processRichTextContent(text);
    processRichTextContent(secondText);

    if (imgTitle) {
      imgTitle.innerHTML = decodeTextContent(imgTitle.textContent);
    }

    if (description) {
      description.innerHTML = decodeTextContent(description.textContent);
    }

    if (secondImgTitle) {
      secondImgTitle.innerHTML = decodeTextContent(secondImgTitle.textContent);
    }

    if (secondDescription) {
      secondDescription.innerHTML = decodeTextContent(secondDescription.textContent);
    }

    element.replaceChildren();

    [
      text,
      image,
      imgTitle,
      description,
      secondText,
      secondImage,
      secondImgTitle,
      secondDescription,
    ].forEach((child) => {
      if (!child) return;
      const hasText = child.textContent?.trim();
      const hasImage = child.querySelector?.('img');
      const hasRichtext = child.querySelector?.('div[data-aue-type="richtext"]');
      if (hasText || hasImage || hasRichtext) {
        element.appendChild(child);
      }
    });

    tabs.push({ title: titleText, body: element });
    if (isPdf) {
      // PDF MODE: Do NOT hide the content.
      const pdfTitle = document.createElement('h3');
      pdfTitle.classList.add('pdf-tab-title');
      pdfTitle.textContent = titleText;
      element.insertBefore(pdfTitle, element.firstChild);
      
      element.classList.add('pdf-tab-content');
    } else {
      if (index !== 0) { element.classList.add('hidden'); }
    }
  });

  if (!isPdf) {
    const outputHtml = htmlToElement(`
    <div class="abas-header">
        <ul>
            ${tabs?.map((tab, index) => `<li>
                            <a role="tab" index="${index}" class="${index === 0 ? 'active' : ''}">${tab?.title}</a>
                        </li>`)?.join('')}
        </ul>
    </div>
  `);

    outputHtml?.querySelectorAll('a')?.forEach((tabTitle) => {
      tabTitle?.addEventListener('click', (e) => {
        outputHtml?.querySelectorAll('a')?.forEach((otherTab) => {
          otherTab?.classList?.remove('active');
        });
        e?.target?.classList?.add('active');
        tabs?.forEach((element) => {
          element?.body?.classList?.add('hidden');
        });
        tabs[e?.target?.getAttribute('index')]?.body?.classList?.remove('hidden');
      });
    });

    block?.insertBefore(outputHtml, block?.children[0]);
  }
}
