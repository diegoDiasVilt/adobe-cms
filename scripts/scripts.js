import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './aem.js';

const IS_PDF = new URLSearchParams(window.location.search).get('mode') === 'pdf';

if (IS_PDF) {
  document.body.classList.add('pdf-mode');
  window.isPdfMode = true;
}

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Helper to load MathJax
 * Refactored to allow immediate loading for PDF mode
 */
function loadMathJax() {
  if (window.mathJaxLoaded) return; // Prevent double loading
  window.mathJaxLoaded = true;

  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
  // If PDF mode, we might want to wait for onload
  if (IS_PDF) {
     script.async = false; // Force synchronous-like behavior if possible
  }
  document.head.appendChild(script);
  
  window.MathJax = {
    loader: { load: ['input/mml', 'output/chtml'] },
    startup: {
      typeset: true 
    }
  };
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * creates an element from html string
 * @param {string} html
 * @returns {HTMLElement}
 */
export function htmlToElement(html) {
  const template = document.createElement('template');
  const trimmedHtml = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = trimmedHtml;
  return template.content.firstElementChild;
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks() {
  try {
    // TODO: add auto block, if needed
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'pt-BR';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  if (IS_PDF) {
    const images = main.querySelectorAll('img');
    images.forEach(img => {
      img.setAttribute('loading', 'eager');
      // If you use data-src patterns, swap them here
      if (img.dataset.src) img.src = img.dataset.src;
    });
  }

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  if (IS_PDF) return;

  window.setTimeout(() => import('./delayed.js'), 1500);
  
  window.setTimeout(() => loadMathJax(), 1500);

  import('./sidekick.js').then(({ initSidekick }) => initSidekick());
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  if (IS_PDF) {
    loadMathJax();
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('PDF_GENERATION_READY');
    console.log(document.documentElement.outerHTML);
  } else {
    loadDelayed();
  }
}

/**
 * Extract author information from the author page.
 * @param {HTMLElement} block
 */
export function extractAuthorInfo(block) {
  const authorInfo = [...block.children].map((row) => row.firstElementChild);
  return {
    authorImage: authorInfo[0]?.querySelector('img')?.getAttribute('src'),
    authorName: authorInfo[1]?.textContent.trim(),
    authorTitle: authorInfo[2]?.textContent.trim(),
    authorCompany: authorInfo[3]?.textContent.trim(),
    authorDescription: authorInfo[4],
    authorSocialLinkText: authorInfo[5]?.textContent.trim(),
    authorSocialLinkURL: authorInfo[6]?.textContent.trim(),
  };
}

/**
 * Fetch the author information from the author page.
 * @param {HTMLAnchorElement} anchor || {string} link
 */
export async function fetchAuthorBio(anchor) {
  const link = anchor.href ? anchor.href : anchor;
  return fetch(link)
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(html, 'text/html');
      const authorInfoEl = htmlDoc.querySelector('.author-bio');
      if (!authorInfoEl) {
        return null;
      }
      const authorInfo = extractAuthorInfo(authorInfoEl);
      return authorInfo;
    })
    .catch((error) => {
      console.error(error);
    });
}

loadPage();

export function isInEditor() {
  return window?.location?.hostname?.startsWith('author');
}

// a diferença é que este ignora tbm a tela de preview do AEM
export function enhancedIsInEditor() {
  return document.querySelectorAll('.adobe-ue-edit')?.length > 0;
}

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function randomString(len) {
  const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let randomString = '';
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}

let lastHeight = 0;
function resize() {
  const { height } = document.getElementsByTagName('html')[0].getBoundingClientRect();
  if (lastHeight !== height) {
    lastHeight = height;
    window.parent.postMessage(['setHeight', height + 10], '*');
  }
}

if (!IS_PDF) {
  document.addEventListener('DOMContentLoaded', (event) => {
    setInterval(resize, 1000);
  });
}

export function decodeBase64(base64) {
  let text = null;
  try {
    text = atob(base64);
  } catch (error) {
    // string is not base64
    return base64;
  }
  const length = text.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = text.charCodeAt(i);
  }
  const decoder = new TextDecoder(); // default is utf-8
  return decoder.decode(bytes);
}

export function handleRichTextElement(textElement) {
  const elementToInjectHTML = textElement?.querySelector("div:last-child");
  elementToInjectHTML.innerHTML = decodeBase64(textElement?.textContent)
  return textElement?.outerHTML;
}

export function inIFrame() {
  return window.location !== window.parent.location
}

export function createOptimizedPicture(pic, baseUrl = '') {
  const domain = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  pic.querySelectorAll('source, img').forEach((el) => {
    const attr = el.tagName === 'SOURCE' ? 'srcset' : 'src';
    let val = el.getAttribute(attr);

    if (val) {
      if (/\bformat=webply\b/.test(val)) {
        val = val.replace(/\bformat=webply\b/g, 'format=webp');
      }

      if (!val.startsWith('http') && !val.startsWith('//')) {
          if (val.startsWith('./')) {
             // Remove o ponto (.) e junta com dominio. Ex: ./media -> /media
             val = `${domain}${val.substring(1)}`;
          } else if (val.startsWith('/')) {
             // Apenas junta o domínio. Ex: /media -> https://site.com/media
             val = `${domain}${val}`;
          }
        }

      el.setAttribute(attr, val);
    }
  });

  return pic;
}

function makeConceitosInteractive() {
  const conceitosChave = document.querySelectorAll('conceito-chave:not([data-processed])');

  if (conceitosChave.length > 0) {

    conceitosChave.forEach((conceito) => {

      if (conceito.parentElement.tagName === 'SPAN') {
        const span = conceito.parentElement;

        span.replaceWith(...span.childNodes);
      }

      conceito.setAttribute('data-processed', 'true');

      const tooltipTextValue = conceito.getAttribute('interacao');
      if (tooltipTextValue) {
        const tooltip = document.createElement('span');
        tooltip.classList.add('conceito-tooltip-text');
        tooltip.textContent = tooltipTextValue;
        conceito.appendChild(tooltip);
      }
      
      if (!conceito.hasAttribute('data-click-listener')) {
          conceito.setAttribute('data-click-listener', 'true');
          conceito.addEventListener('click', () => {
            const keyConceptText = conceito.childNodes[0].nodeType === Node.TEXT_NODE
              ? conceito.childNodes[0].nodeValue.trim()
              : '';
            
            const payload = {
              keyConcept: keyConceptText,
              bloomTaxonomy: conceito.getAttribute('taxonomia'),
              interactionMessage: conceito.getAttribute('interacao')
            };

            window.parent.postMessage({
              event: 'key_concept_request',
              payload: payload
            }, '*');
          });
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  makeConceitosInteractive(); 
  
  const observer = new MutationObserver(() => {
    makeConceitosInteractive();
  });

  observer.observe(document.body, {
    childList: true, 
    subtree: true   
  });
});

let readingRuler = null;
const RULER_HEIGHT_PX = 42; 
let rulerEnabled = false;
let lastMouseY = 0;
let isMouseOverImage = false;
let isMouseOverMain = false;

function createReadingRuler() {
  if (!readingRuler) {
    readingRuler = document.createElement('div');
    readingRuler.id = 'reading-ruler';
    readingRuler.style.position = 'fixed';
    readingRuler.style.top = '0';
    readingRuler.style.left = '0';
    readingRuler.style.width = '100%';
    readingRuler.style.height = `${RULER_HEIGHT_PX}px`;
    readingRuler.style.backgroundColor = 'rgba(187, 187, 187, 0.2)';
    readingRuler.style.pointerEvents = 'none';
    readingRuler.style.zIndex = '9998';
    readingRuler.style.display = 'none';
    readingRuler.style.willChange = 'transform, display';
    document.body.appendChild(readingRuler);
  }
}

function updateRulerPosition() {
  if (!rulerEnabled) return;

  if (readingRuler) {
    if (isMouseOverImage || !isMouseOverMain) {
      readingRuler.style.display = 'none';
    } else {
      readingRuler.style.display = 'block';
      const yPos = lastMouseY - (RULER_HEIGHT_PX / 2);
      readingRuler.style.transform = `translateY(${yPos}px)`;
    }
  }

  requestAnimationFrame(updateRulerPosition);
}

function isMouseVerticallyOverMedia(mouseY) {
  const mediaElements = document.querySelectorAll('img, picture, table, video, .img-modal, figure');
  
  for (const el of mediaElements) {
    const rect = el.getBoundingClientRect();
  
    if (rect.height === 0) continue;
    if (mouseY >= rect.top && mouseY <= rect.bottom) {
      return true;
    }
  }
  return false;
}

function storeMousePosition(e) {  
  lastMouseY = e.clientY;
  isMouseOverImage = isMouseVerticallyOverMedia(e.clientY);

  isMouseOverMain = !!e.target.closest('main');
}

function enableRuler() {
  createReadingRuler();

  if (!rulerEnabled) {
    rulerEnabled = true;
    
    document.addEventListener('mousemove', storeMousePosition);

    if (readingRuler) readingRuler.style.display = 'block';

    requestAnimationFrame(updateRulerPosition);
  }
}

function disableRuler() {
  if (rulerEnabled) {
    rulerEnabled = false;
    
    document.removeEventListener('mousemove', storeMousePosition);
  }

  if (readingRuler) {
    readingRuler.style.display = 'none';
  }
}

let originalFontSizes = new WeakMap();
let isFontSizesStored = false;
const FONT_SCALE_TARGETS = 'p, h1, h2, h3, h4, h5, h6, li, a, span, td, th, div';

function storeOriginalFontSizes() {
  if (isFontSizesStored) return;

  document.querySelectorAll(FONT_SCALE_TARGETS).forEach((el) => {
    if (!originalFontSizes.has(el)) {
      const size = window.getComputedStyle(el).fontSize;
      originalFontSizes.set(el, parseFloat(size));
    }
  });
  isFontSizesStored = true;
}

function applyFontSizeDelta(delta) {
  storeOriginalFontSizes();
  
  document.querySelectorAll(FONT_SCALE_TARGETS).forEach((el) => {
    if (originalFontSizes.has(el)) {
      const originalSize = originalFontSizes.get(el);
      el.style.fontSize = `${originalSize + delta}px`;
    }
  });
}

function forceRichTextTheme(payload) {
  const richTextBlocks = document.querySelectorAll('.texto-rico');
  if (richTextBlocks.length === 0) return;

  let newColor = '';
  let isReset = false;
  switch (payload) {
    case 'sepia':
      newColor = '#3D3025';
      break;
    case 'neutral':
      newColor = '#F2F2F2';
      break;
    case 'dark':
      newColor = '#E6E6E6';
      break;
    case 'white':
      newColor = '#212529';
      break;
    case 'default':
    default:
      isReset = true;
      break;
  }

  richTextBlocks.forEach(block => {
    const allElements = block.querySelectorAll('p, span, li, a, h1, h2, h3, h4, h5, h6, strong, em, div, td, th');
    
    allElements.forEach(el => {
      if (isReset) {
        if (el.dataset.originalColor) {
          el.style.setProperty('color', el.dataset.originalColor);
          el.removeAttribute('data-original-Color');
        } else {
          if (el.style.getPropertyPriority('color') === 'important') {
            el.style.removeProperty('color');
          }
        }
      } else {
        const currentInlineColor = el.style.color;
        
        if (currentInlineColor && !el.dataset.originalColor && el.style.getPropertyPriority('color') !== 'important') {
          el.dataset.originalColor = currentInlineColor;
        }
        
        el.style.setProperty('color', newColor, 'important');
      }
    });
  });
}

function resetFontSizes() {
  document.querySelectorAll(FONT_SCALE_TARGETS).forEach((el) => {
    if (el.style.fontSize) {
      el.style.fontSize = '';
    }
  });
}

function resetCustomizations() {
  
  // Reseta a Régua de Leitura
  disableRuler(); //

  // Reseta o Alinhamento
  const alignmentStyleElement = document.getElementById('kindle-alignment-style'); //
  if (alignmentStyleElement) {
    alignmentStyleElement.innerHTML = `
        * {
          text-align: left !important;
        }
      `;;
  }

  // Reseta o Tipo da Fonte
  const fontStyleElement = document.getElementById('kindle-font-type-style'); //
  if (fontStyleElement) {
    fontStyleElement.innerHTML = ''; //
  }

  // Reseta o Tamanho da Fonte
  resetFontSizes(); //

  // Reseta o Tema
  const body = document.body;
  const themeClasses = ['theme-white', 'theme-sepia', 'theme-gray', 'theme-dark']; //
  body.classList.remove(...themeClasses);
  forceRichTextTheme('default');

  // Reseta o Espaçamento entre Linhas
  document.documentElement.style.setProperty('--kindle-line-height', '140%'); //

  // Reseta o Espaçamento entre Palavras
  document.documentElement.style.setProperty('--kindle-word-space', 'normal'); //

  // Reseta o Espaçamento entre Letras
  document.documentElement.style.setProperty('--kindle-letter-space', 'normal'); //
}

if (!IS_PDF) {
  document.addEventListener('keydown', (event) => {
    const tagName = document.activeElement.tagName;
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || document.activeElement.isContentEditable) {
      return;
    }

    if (event.key.toLowerCase() === 'r') {
      
      if (rulerEnabled) { 
        disableRuler(); 
      } else {
        enableRuler();  
      }

      window.parent.postMessage({
        event: 'enableRuler',
        payload: rulerEnabled
      }, '*');
    }
  });

  window.addEventListener('message', function (e) {
    console.log(e.data)
    var eventName = e?.data?.event;
    var data = e?.data?.payload;
    if (eventName === "set_navbar_height") {
      let counter = 0
      const intervalId = setInterval(() => {
        if (counter >= 3) {
          clearInterval(intervalId);
        }
        this.document.querySelectorAll('.block')?.forEach(element => {
          element.setAttribute('style', `scroll-margin-top: ${data}px`);
        });

        this.document.querySelector(".img-modal img")?.setAttribute('style', `scroll-margin-top: ${data}px`);
        this.document.querySelector(".modal-content")?.setAttribute('style', `scroll-margin-top: ${data}px`);
        counter++;
        console.log(counter)

      }, 1000);
    }

    if (eventName === "set_ruler_visibility") {
      if (data === true) {
        enableRuler();
      } else if (data === false) {
        disableRuler();
      }
    }
    if (eventName === "set_kindle_alignment") {
      const styleId = 'kindle-alignment-style';
      let alignmentStyleElement = document.getElementById(styleId);

      if (!alignmentStyleElement) {
        alignmentStyleElement = document.createElement('style');
        alignmentStyleElement.id = styleId;
        document.head.appendChild(alignmentStyleElement);
      }

      if (data === 'left' || data === 'justify') {
        alignmentStyleElement.innerHTML = `
          * {
            text-align: ${data} !important;
          }
        `;
      } else {
        alignmentStyleElement.innerHTML = '';
      }
    }

    if (eventName === "set_kindle_font_type") {
      const styleId = 'kindle-font-type-style';
      let fontStyleElement = document.getElementById(styleId);

      if (!fontStyleElement) {
        fontStyleElement = document.createElement('style');
        fontStyleElement.id = styleId;
        document.head.appendChild(fontStyleElement);
      }

      let fontFamily = '';

      switch (data) {
        case 'helvetica':
          fontFamily = 'Helvetica, Arial, sans-serif';
          break;
        case 'verdana':
          fontFamily = 'Verdana, Geneva, sans-serif';
          break;
        case 'georgia':
          fontFamily = 'Georgia, serif';
          break;
        case 'times new roman':
          fontFamily = '"Times New Roman", Times, serif';
          break;
        case 'dyslexic':
          fontFamily = 'OpenDyslexic, sans-serif';
          break;
        case 'default':
        default:
          fontStyleElement.innerHTML = '';
          return;
      }
      
      fontStyleElement.innerHTML = `
        /* 1. Aplica a fonte do usuário em TUDO */
        * {
          font-family: ${fontFamily} !important;
        }

        i[class*="fa-"], .fa, .fas, .far, .fab, .fa-solid, .fa-regular, .fa-brands {
          font-family: "Font Awesome 6 Free", "Font Awesome 6 Brands", "Font Awesome 5 Free", "FontAwesome" !important;
        }
      `;
    }

    if (eventName === "set_kindle_font_size") {
      let delta = data-20;

      if (delta === 0) {
        resetFontSizes();
      }

      applyFontSizeDelta(delta);
    }
    if (eventName === "set_kindle_theme") {
      const body = document.body;
      const themeClasses = ['theme-white', 'theme-sepia', 'theme-gray', 'theme-dark'];
      
      body.classList.remove(...themeClasses);

      switch (data) {
        case 'white':
          body.classList.add('theme-white');
          break;
        case 'sepia':
          body.classList.add('theme-sepia');
          break;
        case 'neutral':
          body.classList.add('theme-gray');
          break;
        case 'dark':
          body.classList.add('theme-dark');
          break;
        case 'default':
          body.classList.remove(...themeClasses);
          break;
        default:
          break;
      }

      forceRichTextTheme(data);
    }

    if (eventName === "set_kindle_line_space") {
      let lineHeight = '140%';
      switch (data) {
        case '168%':
        case '196%':
        case '224%':
        case '252%':
          lineHeight = data;
          break;
        case '140%':
        case 'default':
        default:
          lineHeight = '140%';
          break;
      }
      document.documentElement.style.setProperty('--kindle-line-height', lineHeight);
    }

    if (eventName === "set_kindle_word_space") {
      let wordSpace = 'normal';
      switch (data) {
        case '5%':
          wordSpace = '0.05em';
          break;
        case '10%':
          wordSpace = '0.10em';
          break;
        case '15%':
          wordSpace = '0.15em';
          break;
        case '20%':
          wordSpace = '0.20em';
          break;
        case '0%':
        case 'default':
        default:
          wordSpace = 'normal';
          break;
      }
      document.documentElement.style.setProperty('--kindle-word-space', wordSpace);
    }

    if (eventName === "set_kindle_letters_space") {
      let letterSpace = 'normal';
      switch (data) {
        case '5%':
          letterSpace = '0.05em';
          break;
        case '10%':
          letterSpace = '0.10em';
          break;
        case '15%':
          letterSpace = '0.15em';
          break;
        case '20%':
          letterSpace = '0.20em';
          break;
        case '0%':
        case 'default':
        default:
          letterSpace = 'normal';
          break;
      }
      document.documentElement.style.setProperty('--kindle-letter-space', letterSpace);
    }
    if (eventName === 'set_kindle_reset') {
      resetCustomizations();
    }
  }, false);
}