import { decodeBase64 } from '../../scripts/scripts.js';

export default function decorate(block) {
  const quoteType = block.children[0]?.textContent?.trim();
  const quoteImage = block.children[1].querySelector('img');
  let quoteText = '';
  const quoteAuthor = block.children[3]?.textContent?.trim();
  const quoteIcon = block.children[4]?.textContent?.trim();
  const id = block.children[5];
  if (id) {
    id.remove();
    block.setAttribute('id', id?.textContent?.trim());
  }

  const content = block.children[2];
  if (content) {
    const contentParagraph = content.querySelector('p');
    if (contentParagraph) {
      const richtextDiv = content.querySelector('div[data-aue-type="richtext"]');
      if (richtextDiv) {
        quoteText = richtextDiv.innerHTML;
      } else if (contentParagraph.textContent && contentParagraph.textContent.trim()) {
        try {
          quoteText = decodeBase64(contentParagraph.textContent.trim());
        } catch (e) {
          quoteText = content.innerHTML;
        }
      }
    } else {
      quoteText = content?.textContent?.trim() || '';
    }
  }

  const image = quoteImage?.src ? `<img src="${quoteImage?.src}"/>` : '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcwAAAFtCAYAAACKm1rNAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3NpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ4IDc5LjE2NDAzNiwgMjAxOS8wOC8xMy0wMTowNjo1NyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpjOGNlOTc3ZC1iMGMwLTZiNDItYTllNS0yMTA1NzNkY2ZlM2MiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6REE0NDk4QzJGRjk5MTFFQkJENUM5QTg3QTFEMjdBMDYiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6REE0NDk4QzFGRjk5MTFFQkJENUM5QTg3QTFEMjdBMDYiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6YzhjZTk3N2QtYjBjMC02YjQyLWE5ZTUtMjEwNTczZGNmZTNjIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOmM4Y2U5NzdkLWIwYzAtNmI0Mi1hOWU1LTIxMDU3M2RjZmUzYyIvPiA8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"/>';
  const author = quoteAuthor ? `<footer><cite>${quoteAuthor}</cite></footer>` : '';

  const quote = () => {
    if (quoteType === 'quote') {
      return (`
                <section class="quote-author">
                    ${image}
                    <blockquote>
                        ${quoteText}
                        ${author}
                    </blockquote>
                </section>
            `);
    }
    return (`
                <section class="quote-phrase">
                    <i class="fa ${quoteIcon}"></i>
                    <blockquote>
                        ${quoteText}
                    </blockquote>
                </section>
            `);
  };

  block.innerHTML = quote();
}
