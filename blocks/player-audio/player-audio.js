import { isInEditor } from '../../scripts/scripts.js';

const AEM_STAGE = 'publish-p136102-e1403942.adobeaemcloud.com';
const AEM_PROD = 'content.cogna.com.br';

const PUBLISH_HOST_BY_DOMAIN = {
  'main--adobe-cms--diegodiasvilt.aem.page': AEM_STAGE,
  'main--adobe-cms--diegodiasvilt.aem.live': AEM_STAGE,
  'cms.cogna.com.br': AEM_PROD,
};

function resolveDamUrl(anchor) {
  if (isInEditor()) return anchor.href;
  const publishHost = PUBLISH_HOST_BY_DOMAIN[window.location.hostname];
  return `https://${publishHost}${anchor.getAttribute('href')}`;
}

export default function decorate(block) {
  const title = block.children[0];
  const position = block.children[1];
  const audio = block.children[2];
  const audioLink = block.children[3];
  const ariaLabel = block.children[4];

  const titleText = title?.textContent?.trim();
  const positionText = position?.textContent?.trim();
  const audioAnchor = audio?.querySelector('a');
  const audioSrc = audioAnchor ? resolveDamUrl(audioAnchor) : audioLink?.textContent?.trim();
  const ariaLabelText = ariaLabel?.textContent?.trim();

  block.textContent = '';

  if (positionText) {
    block.classList.add(positionText);
  }

  if (titleText) {
    const titleEl = document.createElement('p');
    titleEl.className = 'player-audio-title';
    titleEl.textContent = titleText;
    block.append(titleEl);
  }

  const audioEl = document.createElement('audio');
  audioEl.setAttribute('controls', '');
  audioEl.setAttribute('controlsList', 'nodownload noremoteplayback');
  audioEl.setAttribute('preload', 'metadata');
  audioEl.setAttribute('loading', 'lazy');
  if (ariaLabelText) audioEl.setAttribute('aria-label', ariaLabelText);
  audioEl.addEventListener('contextmenu', (e) => e.preventDefault());

  const source = document.createElement('source');
  if (audioSrc) source.src = audioSrc;
  source.type = 'audio/mpeg';
  audioEl.append(source);

  block.append(audioEl);
}
