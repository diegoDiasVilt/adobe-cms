import { decodeBase64 } from '../../scripts/scripts.js';

function isNullishContent(value) {
  if (!value) return true;
  const normalizedValue = value.trim().toLowerCase();
  return normalizedValue === '' || normalizedValue === 'null';
}

export default function decorate(block) {
  const title = block.children[0];
  const position = block.children[1];
  const audio = block.children[2];
  const ariaLabel = block.children[3];
  const id = block.children[4];

  const titleText = title?.textContent?.trim();
  const positionText = position?.textContent?.trim();
  const audioSrc = audio?.querySelector('a')?.href || audio?.textContent?.trim();
  const ariaLabelText = ariaLabel?.textContent?.trim();
  const idText = id?.textContent?.trim();

  block.textContent = '';

  if (idText) {
    block.setAttribute('id', idText);
  }

  if (positionText) {
    block.classList.add(positionText);
  }

  if (!isNullishContent(titleText)) {
    const decodedTitle = decodeBase64(titleText);
    if (!isNullishContent(decodedTitle.replace(/<[^>]+>/g, ' '))) {
      const titleEl = document.createElement('div');
      titleEl.className = 'audiobook-title';
      titleEl.innerHTML = decodedTitle;
      block.append(titleEl);
    }
  }

  const audioEl = document.createElement('audio');
  audioEl.setAttribute('controls', '');
  audioEl.setAttribute('controlsList', 'nodownload noremoteplayback');
  audioEl.setAttribute('preload', 'metadata');
  if (ariaLabelText) audioEl.setAttribute('aria-label', ariaLabelText);
  audioEl.addEventListener('contextmenu', (e) => e.preventDefault());

  const source = document.createElement('source');
  if (audioSrc) source.src = audioSrc;
  source.type = 'audio/mpeg';
  audioEl.append(source);

  block.append(audioEl);
}
