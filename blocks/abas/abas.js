import { decodeBase64, htmlToElement } from '../../scripts/scripts.js';

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
    const titleText = title.textContent;
    title.remove();

    const contentElements = element.querySelectorAll('p');
    contentElements.forEach((paragraph) => {
      if (paragraph.textContent && paragraph.textContent.trim()) {
        const richtextDiv = paragraph.closest('div[data-aue-type="richtext"]');
        if (!richtextDiv) {
          const decodedContent = decodeBase64(paragraph.textContent.trim());
          paragraph.outerHTML = decodedContent;
        }
      }
    });

    tabs.push({ title: titleText, body: element });

    // 2. Logic Split: PDF vs Interactive
    if (isPdf) {
      // PDF MODE: Do NOT hide the content.
      // Instead, create a header so the user knows what this section is.
      const pdfTitle = document.createElement('h3');
      pdfTitle.classList.add('pdf-tab-title');
      pdfTitle.textContent = titleText;
      element.insertBefore(pdfTitle, element.firstChild);
      
      // Ensure specific PDF class for styling
      element.classList.add('pdf-tab-content');
    } else {
      // STANDARD MODE: Hide all except the first one
      if (index !== 0) { element.classList.add('hidden'); }
    }
  });

  // 3. Only generate the Tab Navigation Buttons if NOT in PDF mode
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