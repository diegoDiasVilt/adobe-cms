export default function decorate(block) {
  const audio = block.children[0];
  const ariaLabel = block.children[1];
  const id = block.children[2];

  const audioSrc = audio?.querySelector('a')?.href || audio?.textContent?.trim();
  const ariaLabelText = ariaLabel?.textContent?.trim();
  const idText = id?.textContent?.trim();

  block.textContent = '';

  if (idText) {
    block.setAttribute('id', idText);
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
