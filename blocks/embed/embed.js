import { htmlToElement, isInEditor } from '../../scripts/scripts.js';

export default function decorate(block) {
  const code = block.children[0]?.textContent?.replace(/(\s|&nbsp;)+/g, ' ').trim();
  const id = block.children[1];
  if (id) {
    id.remove();
    block.setAttribute('id', id?.textContent?.trim());
  }
  let securityCheckPassed = true;
  const forbiddenTags = ['SCRIPT', 'STYLE'];
  const allowedHostsForIframe = ['youtube', 'google', 'canva', 'genially', 'mdstrm', 'vimeo', 'twitter', 'instagram', 'facebook', 'giphy'];

  const element = htmlToElement(code);

  if (element) {
    if (forbiddenTags.includes(element.tagName)) {
      securityCheckPassed = false;
    } else {
      Array.from(element.children).forEach((child) => {
        if (forbiddenTags.includes(child.tagName)) {
          securityCheckPassed = false;
        }
      });
    }

    if (element && element.tagName === 'IFRAME') {
      const iframeSrc = element.src;
      const correspondingItems = allowedHostsForIframe.filter((host) => iframeSrc.includes(host));
      if (correspondingItems.length === 0) {
        securityCheckPassed = false;
      }
    } else {
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

    block.children[0].remove();
    if (isInEditor()) {
      block.append(msgElement);
    }
  }
}
