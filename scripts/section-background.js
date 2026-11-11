const SECTION_BG_PADDINGS = ['p', 'm', 'g', 'gg'];

export default function decorateSectionBackgrounds(main) {
  main.querySelectorAll(':scope > .section[data-backgroundtype]').forEach((section) => {
    const {
      backgroundtype,
      backgroundcolor,
      backgroundpadding,
    } = section.dataset;
    let applied = false;

    if (backgroundtype === 'color') {
      const color = (backgroundcolor || '').trim();
      if (color && CSS.supports('color', color)) {
        section.style.backgroundColor = color;
        applied = true;
      }
    }

    if (applied && SECTION_BG_PADDINGS.includes(backgroundpadding)) {
      section.classList.add(`section-padding-${backgroundpadding}`);
    }
  });
}
