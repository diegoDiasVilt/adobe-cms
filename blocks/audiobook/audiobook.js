export default function decorate(block) {
  const businessKey = block.children[0];
  const audio = block.children[1];
  const title = block.children[2];

  const businessKeyText = businessKey?.textContent?.trim();
  const audioSrc = audio?.querySelector('a')?.href || audio?.textContent?.trim();
  const titleText = title?.textContent?.trim();

  block.textContent = '';

  if (businessKeyText) {
    block.setAttribute('id', businessKeyText);
  }

  if (!audioSrc) return;

  const audioEl = document.createElement('audio');
  audioEl.setAttribute('controls', '');
  audioEl.setAttribute('controlsList', 'nodownload noremoteplayback');
  audioEl.setAttribute('preload', 'metadata');
  if (titleText) audioEl.setAttribute('aria-label', titleText);
  audioEl.addEventListener('contextmenu', (e) => e.preventDefault());

  const source = document.createElement('source');
  source.src = audioSrc;
  source.type = 'audio/mpeg';
  audioEl.append(source);

  block.append(audioEl);
}
