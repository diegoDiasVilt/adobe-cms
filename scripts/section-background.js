const SECTION_BG_SIZES = ['cover', 'contain'];
const SECTION_BG_POSITIONS = ['center', 'top', 'bottom'];
const SECTION_BG_PADDINGS = ['p', 'm', 'g', 'gg'];

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
      url.searchParams.set('width', '2000');
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
        section.style.backgroundImage = `url("${url.replace(/"/g, '%22')}")`;
        section.style.backgroundSize = SECTION_BG_SIZES.includes(backgroundsize) ? backgroundsize : 'cover';
        section.style.backgroundPosition = SECTION_BG_POSITIONS.includes(backgroundposition) ? backgroundposition : 'center';
        section.classList.add('section-bg-image');
        applied = true;
      }
    }

    if (applied && SECTION_BG_PADDINGS.includes(backgroundpadding)) {
      section.classList.add(`section-padding-${backgroundpadding}`);
    }
  });
}
