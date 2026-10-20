import { decodeBase64 } from '../../scripts/scripts.js';

const BLOCK_CONFIG_FIELDS = ['numcolumns', 'id', 'gap', 'boxalign'];
const SPACING_SCALE = {
  none: '0px',
  pp: '8px',
  p: '12px',
  m: '20px',
  g: '32px',
  gg: '48px',
};
const VERTICAL_ALIGN = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
};
const HORIZONTAL_ALIGN = {
  left: 'left',
  center: 'center',
  right: 'right',
};
const BLOCK_OPTIONS = {
  gap: ['--quadro-box-dinamico-gap', SPACING_SCALE],
  boxalign: ['--quadro-box-dinamico-box-align', VERTICAL_ALIGN],
};
const DEFAULT_COLUMNS = 3;
const DEFAULT_IMAGE_POSITION = 'bottom';
const SIDE_POSITIONS = ['left', 'right'];
const IMAGE_POSITIONS = ['top', 'middle', 'bottom', ...SIDE_POSITIONS];
const MOBILE_QUERY = '(max-width: 600px)';
const TABLET_QUERY = '(max-width: 900px)';

function isEmptyValue(value) {
  return !value || ['null', 'undefined'].includes(value.trim().toLowerCase());
}

function readRichText(cell) {
  if (!cell) return '';
  const encoded = cell.querySelector('p')?.textContent.trim() || cell.textContent.trim();
  if (isEmptyValue(encoded)) return '';

  const decoded = decodeBase64(encoded);
  if (isEmptyValue(decoded)) return '';
  if (/<[a-z][\s\S]*>/i.test(decoded)) return decoded.trim();
  return cell.innerHTML.trim();
}

function createRichTextElement(className, html) {
  if (!html) return null;
  const element = document.createElement('div');
  element.className = className;
  element.innerHTML = html;
  const hasContent = element.textContent.trim() || element.querySelector('img, picture, video, iframe');
  return hasContent ? element : null;
}

function applyBackground(element, value) {
  const color = value?.trim();
  if (color && CSS.supports('color', color)) {
    element.style.setProperty('--quadro-box-dinamico-bg', color);
  }
}

function buildImage(cell, altText) {
  if (!cell) return null;
  const source = cell.querySelector('picture') || cell.querySelector('img');
  const src = cell.textContent.trim();

  let image = null;
  if (source) {
    image = source.cloneNode(true);
  } else if (src) {
    image = document.createElement('img');
    image.src = src;
  }
  if (!image) return null;

  const img = image.tagName === 'IMG' ? image : image.querySelector('img');
  if (altText && img) img.alt = altText;
  return image;
}

function getColumnCount(maxColumns, itemCount) {
  let count = maxColumns;
  if (window.matchMedia(MOBILE_QUERY).matches) {
    count = 1;
  } else if (window.matchMedia(TABLET_QUERY).matches) {
    count = Math.min(maxColumns, 2);
  }
  return Math.max(1, Math.min(count, itemCount));
}

function shortestColumn(columns) {
  return columns.reduce((shortest, column) => {
    const height = column.offsetHeight;
    const shortestHeight = shortest.offsetHeight;
    if (height !== shortestHeight) return height < shortestHeight ? column : shortest;
    return column.children.length < shortest.children.length ? column : shortest;
  });
}

function setupMasonry(container, items, maxColumns) {
  container.classList.add('is-masonry');

  let lastWidth = -1;
  let frame = null;

  const layout = () => {
    frame = null;
    const columns = Array.from({ length: getColumnCount(maxColumns, items.length) }, () => {
      const column = document.createElement('div');
      column.className = 'quadro-box-dinamico-column';
      return column;
    });
    container.replaceChildren(...columns);
    items.forEach((item) => shortestColumn(columns).append(item));
  };

  const scheduleLayout = () => {
    if (!frame) frame = requestAnimationFrame(layout);
  };

  new ResizeObserver(([entry]) => {
    const { width } = entry.contentRect;
    if (width !== lastWidth) {
      lastWidth = width;
      scheduleLayout();
    }
  }).observe(container);

  items.forEach((item) => {
    item.querySelectorAll('img').forEach((img) => {
      if (!img.complete) img.addEventListener('load', scheduleLayout, { once: true });
    });
  });

  layout();
}

function readBlockConfig(block) {
  const configRows = [];
  while (block.firstElementChild?.children.length === 1) {
    configRows.push(block.firstElementChild);
    block.firstElementChild.remove();
  }
  return Object.fromEntries(
    BLOCK_CONFIG_FIELDS.map((name, index) => [name, configRows[index]?.textContent.trim() || '']),
  );
}

function applyOption(element, variable, options, key) {
  if (Object.hasOwn(options, key)) {
    element.style.setProperty(variable, options[key]);
  }
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  if (config.id) block.id = config.id;
  Object.entries(BLOCK_OPTIONS).forEach(([field, [variable, options]]) => {
    applyOption(block, variable, options, config[field]);
  });
  const numCols = Math.min(parseInt(config.numcolumns, 10) || DEFAULT_COLUMNS, 3);

  const itemRows = Array.from(block.children);
  const itemsContainer = document.createElement('div');
  const items = [];

  itemRows.forEach((itemRow) => {
    const [
      titleCell,
      contentCell,
      imageCell,
      imageDescriptionCell,
      imagePositionCell,
      imageAltCell,
      backgroundCell,
      itemGapCell,
      paddingCell,
      marginCell,
      contentVerticalAlignCell,
      contentHorizontalAlignCell,
    ] = Array.from(itemRow.children);

    const itemDiv = document.createElement('div');
    itemDiv.className = 'quadro-box-dinamico-item';

    Array.from(itemRow.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-')) {
        itemDiv.setAttribute(attr.name, attr.value);
      }
    });

    applyBackground(itemDiv, backgroundCell?.textContent);
    [
      ['--quadro-box-dinamico-item-gap', SPACING_SCALE, itemGapCell],
      ['--quadro-box-dinamico-item-padding', SPACING_SCALE, paddingCell],
      ['--quadro-box-dinamico-item-margin', SPACING_SCALE, marginCell],
      ['--quadro-box-dinamico-content-valign', VERTICAL_ALIGN, contentVerticalAlignCell],
      ['--quadro-box-dinamico-content-align', HORIZONTAL_ALIGN, contentHorizontalAlignCell],
    ].forEach(([variable, options, cell]) => {
      applyOption(itemDiv, variable, options, cell?.textContent.trim());
    });

    const title = createRichTextElement('quadro-box-dinamico-item-title', readRichText(titleCell));
    const content = createRichTextElement('quadro-box-dinamico-item-content', readRichText(contentCell));

    let imageWrapper = null;
    const image = buildImage(imageCell, imageAltCell?.textContent.trim());
    if (image) {
      imageWrapper = document.createElement('div');
      imageWrapper.className = 'quadro-box-dinamico-item-image';
      imageWrapper.append(image);

      const description = createRichTextElement(
        'quadro-box-dinamico-item-image-description',
        readRichText(imageDescriptionCell),
      );
      if (description) imageWrapper.append(description);
    }

    const requested = imagePositionCell?.textContent.trim();
    const position = IMAGE_POSITIONS.includes(requested) ? requested : DEFAULT_IMAGE_POSITION;
    if (SIDE_POSITIONS.includes(position) && imageWrapper && (title || content)) {
      const textWrapper = document.createElement('div');
      textWrapper.className = 'quadro-box-dinamico-item-text';
      [title, content].filter(Boolean).forEach((element) => textWrapper.append(element));
      itemDiv.append(textWrapper, imageWrapper);
      itemDiv.classList.add(`image-${position}`);
    } else {
      const stacked = {
        top: [imageWrapper, title, content],
        middle: [title, imageWrapper, content],
        bottom: [title, content, imageWrapper],
      };
      (stacked[position] || stacked[DEFAULT_IMAGE_POSITION])
        .filter(Boolean)
        .forEach((element) => itemDiv.append(element));
    }

    if (itemDiv.hasChildNodes()) {
      items.push(itemDiv);
      itemsContainer.append(itemDiv);
    }
  });

  block.innerHTML = '';
  if (items.length) {
    itemsContainer.className = `quadro-box-dinamico-items columns-${Math.min(items.length, numCols)}`;
    block.append(itemsContainer);
    if (block.classList.contains('masonry')) {
      setupMasonry(itemsContainer, items, numCols);
    }
  }
}
