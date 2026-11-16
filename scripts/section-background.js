const SECTION_BG_SIZES = ['cover', 'contain'];
const SECTION_BG_POSITIONS = ['center', 'top', 'bottom'];
const SECTION_BG_PADDINGS = ['p', 'm', 'g', 'gg'];
const SECTION_BG_IMAGE_WIDTH = '2000';

function getSectionBackgroundColor(value) {
  const raw = (value || '').trim();
  if (!raw) return null;
  const candidates = [raw];
  const hashIndex = raw.lastIndexOf('#');
  if (hashIndex > 0) candidates.push(raw.slice(hashIndex));
  return candidates.find((candidate) => CSS.supports('color', candidate)) || null;
}

function getSectionBackgroundImageUrl(value) {
  const raw = (value || '').trim();
  if (!raw) return null;
  try {
    const url = new URL(raw, window.location.href);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.searchParams.has('optimize')) {
      url.searchParams.set('width', SECTION_BG_IMAGE_WIDTH);
      url.searchParams.set('format', 'webply');
    }
    return url.href;
  } catch (error) {
    return null;
  }
}

export default function decorateSectionBackgrounds(main) {
  main.querySelectorAll(':scope > .section[data-backgroundtype]').forEach((section) => {
    const {
      backgroundtype,
      backgroundcolor,
      backgroundimage,
      backgroundsize,
      backgroundposition,
      backgroundpadding,
    } = section.dataset;
    let applied = false;

    if (backgroundtype === 'color') {
      const color = getSectionBackgroundColor(backgroundcolor);
      if (color) {
        section.style.setProperty('--section-bg-color', color);
        section.classList.add('section-bg-color');
        applied = true;
      }
    } else if (backgroundtype === 'image') {
      const url = getSectionBackgroundImageUrl(backgroundimage);
      if (url) {
        const size = SECTION_BG_SIZES.includes(backgroundsize) ? backgroundsize : 'cover';
        const position = SECTION_BG_POSITIONS.includes(backgroundposition) ? backgroundposition : 'center';
        section.style.setProperty('--section-bg-image', `url("${url}")`);
        section.classList.add('section-bg-image', `section-bg-size-${size}`, `section-bg-position-${position}`);
        applied = true;
      }
    }

    if (applied && SECTION_BG_PADDINGS.includes(backgroundpadding)) {
      section.classList.add(`section-padding-${backgroundpadding}`);
    }
  });
}
