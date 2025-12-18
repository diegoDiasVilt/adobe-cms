import { decodeBase64 } from '../../scripts/scripts.js';

export default function decorate(block) {
  const [ title, subtitle, id, icon, iconType] = block?.children;

  const idText = id?.textContent?.trim();
  const iconText = icon?.textContent?.trim();
  const iconTypeText = iconType?.textContent?.trim();
  const subtitleText = subtitle?.textContent?.trim();
  
  if (subtitleText) { 
    subtitle.classList.add('titulo-subtitle');
  }

  id.remove();
  icon.remove();
  iconType.remove();

  const headerElement = title?.querySelector('div:last-child');

  if (id) {
    headerElement?.setAttribute('id', idText);
  }

  headerElement.innerHTML = `${decodeBase64(headerElement?.textContent?.trim())}`;

  const sanitizedHeader = headerElement.querySelector('h1,h2,h3,h4,h5,h6');
  headerElement.textContent = '';
  headerElement.append(sanitizedHeader);
  headerElement.append(subtitle);

  if (iconText) {
    const iconElement = document.createElement('i');
    iconElement.classList.add(`fa-${iconText}`);
    if (iconTypeText) iconElement.classList.add(`fa-${iconTypeText}`);

    sanitizedHeader.insertBefore(iconElement, sanitizedHeader.firstChild);
  }
}
