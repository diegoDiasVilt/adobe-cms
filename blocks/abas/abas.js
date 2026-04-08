import { decodeBase64, enhancedIsInEditor, htmlToElement } from '../../scripts/scripts.js';

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

  const paragraphs = element.matches('p') ? [element] : element.querySelectorAll('p');
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
  const isEditor = enhancedIsInEditor();
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
    const imgTitle = element.children[3];
    const description = element.children[4];
    const secondText = element.children[5];
    const secondImage = element.children[6];
    const secondImgTitle = element.children[7];
    const secondDescription = element.children[8];

    console.log('[abas] abaItem children', {
      index,
      childCount: element.children.length,
      children: Array.from(element.children).map((child, childIndex) => ({
        index: childIndex,
        text: child.textContent?.trim(),
        html: child.innerHTML,
      })),
    });

    console.log('[abas] abaItem mapped fields', {
      index,
      title: title?.textContent?.trim(),
      text: text?.innerHTML,
      image: image?.innerHTML,
      imgTitle: imgTitle?.textContent?.trim(),
      description: description?.textContent?.trim(),
      secondText: secondText?.innerHTML,
      secondImage: secondImage?.innerHTML,
      secondImgTitle: secondImgTitle?.textContent?.trim(),
      secondDescription: secondDescription?.textContent?.trim(),
    });

    const titleText = decodeTextContent(title?.textContent);
    let tabBody = element;

    if (isEditor) {
      title?.classList?.add('hidden');
    } else {
      tabBody = element.cloneNode(true);

      const renderedTitle = tabBody.children[0];
      const renderedText = tabBody.children[1];
      const renderedImgTitle = tabBody.children[3];
      const renderedDescription = tabBody.children[4];
      const renderedSecondText = tabBody.children[5];
      const renderedSecondImgTitle = tabBody.children[7];
      const renderedSecondDescription = tabBody.children[8];

      renderedTitle?.remove();

      processRichTextContent(renderedText);
      processRichTextContent(renderedSecondText);

      if (renderedImgTitle) {
        renderedImgTitle.innerHTML = decodeTextContent(renderedImgTitle.textContent);
      }

      if (renderedDescription) {
        renderedDescription.innerHTML = decodeTextContent(renderedDescription.textContent);
      }

      if (renderedSecondImgTitle) {
        renderedSecondImgTitle.innerHTML = decodeTextContent(renderedSecondImgTitle.textContent);
      }

      if (renderedSecondDescription) {
        renderedSecondDescription.innerHTML = decodeTextContent(renderedSecondDescription.textContent);
      }

      element.replaceWith(tabBody);
    }

    tabs.push({ title: titleText, body: tabBody });
    if (isPdf) {
      // PDF MODE: Do NOT hide the content.
      const pdfTitle = document.createElement('h3');
      pdfTitle.classList.add('pdf-tab-title');
      pdfTitle.textContent = titleText;
      tabBody.insertBefore(pdfTitle, tabBody.firstChild);
      
      tabBody.classList.add('pdf-tab-content');
    } else {
      if (index !== 0) { tabBody.classList.add('hidden'); }
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
