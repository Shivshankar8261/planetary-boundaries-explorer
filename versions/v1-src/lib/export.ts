/** Serialise an SVG element to a standalone SVG string. */
export function serializeSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  // Strip interactive-only attributes that are meaningless in a static file.
  clone.querySelectorAll('[tabindex]').forEach((el) => el.removeAttribute('tabindex'));
  const vb = svg.viewBox.baseVal;
  clone.setAttribute('width', String(vb.width));
  clone.setAttribute('height', String(vb.height));
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportSvg(svg: SVGSVGElement, filename = 'planetary-boundaries.svg') {
  download(new Blob([serializeSvg(svg)], { type: 'image/svg+xml;charset=utf-8' }), filename);
}

export async function exportPng(svg: SVGSVGElement, filename = 'planetary-boundaries.png', scale = 2) {
  const vb = svg.viewBox.baseVal;
  const url = URL.createObjectURL(new Blob([serializeSvg(svg)], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not rasterise SVG'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = vb.width * scale;
    canvas.height = vb.height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
    if (blob) download(blob, filename);
  } finally {
    URL.revokeObjectURL(url);
  }
}
