import { htmlToElement, isInEditor } from '../../scripts/scripts.js';

export default function decorate(block) {
  // 1. Detect PDF Mode
  const urlParams = new URLSearchParams(window.location.search);
  const isPdfParam = urlParams.get('mode') === 'pdf';
  if (isPdfParam) {
    document.body.classList.add('pdf-mode');
  }
  const isPdf = document.body.classList.contains('pdf-mode') || isPdfParam;

  const code = block.children[0]?.textContent?.replace(/(\s|&nbsp;)+/g, ' ').trim();
  const id = block.children[1];
  if (id) {
    id.remove();
    block.setAttribute('id', id?.textContent?.trim());
  }

  const allowedHostsForIframe = ['youtube', 'google', 'canva', 'genially', 'mdstrm', 'vimeo', 'twitter', 'instagram', 'facebook', 'giphy'];

  if (isPdf) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = code;
    const iframe = tempDiv.querySelector('iframe');
    let isVideo = false;

    if (iframe) {
      const src = iframe.src || '';
      if (allowedHostsForIframe.some((host) => src.includes(host))) {
        isVideo = true;
      }
    }

    if (isVideo) {
      block.textContent = '';
      const placeholder = document.createElement('div');
      placeholder.classList.add('embed-placeholder');
      block.append(placeholder);
      return;
    } 
  }

  let securityCheckPassed = true;
  const forbiddenTags = ['SCRIPT', 'STYLE'];

  const element = htmlToElement(code);

  if (element) {
    if (forbiddenTags.includes(element.tagName)) {
      securityCheckPassed = false;
    } else {
      // Verifica tags proibidas nos filhos
      if (element.children) {
        Array.from(element.children).forEach((child) => {
          if (forbiddenTags.includes(child.tagName)) {
            securityCheckPassed = false;
          }
        });
      }
    }

    if (element && element.tagName === 'IFRAME') {
      const iframeSrc = element.src;
      const correspondingItems = allowedHostsForIframe.filter((host) => iframeSrc.includes(host));
      if (correspondingItems.length === 0) {
        securityCheckPassed = false;
      }
    } else {
      if (element.children) {
        Array.from(element.children).forEach((child) => {
          if (child.tagName === 'IFRAME') {
            const iframeSrc = child.src;
            const correspondingItems = allowedHostsForIframe.filter((host) => iframeSrc.includes(host));
            if (correspondingItems.length === 0) {
              securityCheckPassed = false;
            }
          }
        });
      }
    }
  }

  if (securityCheckPassed) {
    block.innerHTML = code;
  } else {
    const embeddedCodeNotSecure = `
                <div class="oaerror warning">
                    <strong>Atenção</strong> - O código inserido viola as definições de segurança.
                </div>
            `;

    const msgElement = document.createElement('div');
    msgElement.classList.add('error-notice');
    msgElement.innerHTML += embeddedCodeNotSecure;

    if (block.children[0]) block.children[0].remove();
    if (isInEditor()) {
      block.append(msgElement);
    }
  }
}