const SECTION_BG_PADDINGS = ['p', 'm', 'g', 'gg'];

function getSectionBackgroundColor(value) {
  const raw = (value || '').trim();
  if (!raw) return null;
  const candidates = [raw];
  const hashIndex = raw.lastIndexOf('#');
  if (hashIndex > 0) candidates.push(raw.slice(hashIndex));
  return candidates.find((candidate) => CSS.supports('color', candidate)) || null;
}

export default function decorateSectionBackgrounds(main) {
  main.querySelectorAll(':scope > .section[data-backgroundtype]').forEach((section) => {
    const {
      backgroundtype,
      backgroundcolor,
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
    }

    if (applied && SECTION_BG_PADDINGS.includes(backgroundpadding)) {
      section.classList.add(`section-padding-${backgroundpadding}`);
    }
  });
}
