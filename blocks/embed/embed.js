import { htmlToElement, isInEditor, decodeBase64 } from '../../scripts/scripts.js';

export default function decorate(block) {
  const urlParams = new URLSearchParams(window.location.search);
  const isPdfParam = urlParams.get('mode') === 'pdf';
  if (isPdfParam) {
    document.body.classList.add('pdf-mode');
  }
  const isPdf = document.body.classList.contains('pdf-mode') || isPdfParam;

  const titleRaw = block.children[0]?.querySelector('p')?.textContent?.trim();
  const titleDecoded = decodeBase64(titleRaw || '');
  
  const code = block.children[1]?.textContent?.replace(/(\s|&nbsp;)+/g, ' ').trim();
  
  const sourceRaw = block.children[2]?.querySelector('p')?.textContent?.trim();
  const sourceDecoded = decodeBase64(sourceRaw || '');
  
  const idElement = block.children[3];

  if (idElement) {
    block.setAttribute('id', idElement.textContent?.trim());
  }

  block.textContent = '';

  const allowedHostsForIframe = ['youtube', 'google', 'canva', 'genially', 'mdstrm', 'vimeo', 'twitter', 'instagram', 'facebook', 'giphy'];
  let securityCheckPassed = true;
  const forbiddenTags = ['SCRIPT', 'STYLE'];
  const element = htmlToElement(code);

  if (element) {
    const checkSecurity = (el) => {
      if (forbiddenTags.includes(el.tagName)) return false;
      if (el.tagName === 'IFRAME') {
        return allowedHostsForIframe.some((host) => el.src.includes(host));
      }
      return Array.from(el.children).every(checkSecurity);
    };
    securityCheckPassed = checkSecurity(element);
  }

  if (titleDecoded) {
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('embed-title');
    titleDiv.innerHTML = titleDecoded;
    block.appendChild(titleDiv);
  }

  if (isPdf) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = code;
    const iframe = tempDiv.querySelector('iframe');
    const isVideo = iframe && allowedHostsForIframe.some((host) => iframe.src.includes(host));

    if (isVideo) {
      const placeholder = document.createElement('div');
      placeholder.classList.add('embed-placeholder');
      block.append(placeholder);
    } else {
      renderMainContent(block, code, securityCheckPassed);
    }
  } else {
    renderMainContent(block, code, securityCheckPassed);
  }

  if (sourceDecoded) {
    const sourceDiv = document.createElement('div');
    sourceDiv.classList.add('embed-source');
    sourceDiv.innerHTML = sourceDecoded;
    block.appendChild(sourceDiv);
  }
}

function renderMainContent(container, code, securityPassed) {
  if (securityPassed) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('embed-content');
    wrapper.innerHTML = code;
    container.appendChild(wrapper);
  } else if (isInEditor()) {
    const errorMsg = document.createElement('div');
    errorMsg.classList.add('error-notice');
    errorMsg.innerHTML = `<div class="oaerror warning"><strong>Atenção</strong> - O código viola as definições de segurança.</div>`;
    container.appendChild(errorMsg);
  }
}