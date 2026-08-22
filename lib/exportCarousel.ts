import { toBlob } from 'html-to-image';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { SLIDE_H, SLIDE_W } from '@/components/SlideCard';

export async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
      });
    }),
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function renderSlidesToBlobs(
  nodes: HTMLElement[],
  onProgress?: (done: number, total: number) => void,
): Promise<Blob[]> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const blobs: Blob[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    await waitForImages(node);

    const blob = await toBlob(node, {
      pixelRatio: 1,
      canvasWidth: SLIDE_W,
      canvasHeight: SLIDE_H,
      width: SLIDE_W,
      height: SLIDE_H,
      cacheBust: true,
      backgroundColor: '#07080b',
      style: {
        transform: 'none',
        transformOrigin: 'top left',
      },
    });

    if (!blob) {
      throw new Error(`Failed to render slide ${i + 1}`);
    }

    blobs.push(blob);
    onProgress?.(i + 1, nodes.length);
  }

  return blobs;
}

export async function exportCarouselZip(options: {
  nodes: HTMLElement[];
  fileNames: string[];
  zipName: string;
  onProgress?: (done: number, total: number) => void;
}): Promise<void> {
  const blobs = await renderSlidesToBlobs(options.nodes, options.onProgress);
  const zip = new JSZip();
  blobs.forEach((blob, i) => zip.file(options.fileNames[i], blob));
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, options.zipName);
}

export async function exportCarouselPdf(options: {
  nodes: HTMLElement[];
  pdfName: string;
  onProgress?: (done: number, total: number) => void;
}): Promise<void> {
  const blobs = await renderSlidesToBlobs(options.nodes, options.onProgress);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [SLIDE_W, SLIDE_H],
    hotfixes: ['px_scaling'],
  });

  for (let i = 0; i < blobs.length; i++) {
    if (i > 0) pdf.addPage([SLIDE_W, SLIDE_H], 'portrait');
    const dataUrl = await blobToDataUrl(blobs[i]);
    pdf.addImage(dataUrl, 'PNG', 0, 0, SLIDE_W, SLIDE_H, undefined, 'FAST');
  }

  pdf.save(options.pdfName);
}

export function slugifyName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'pitch';
}
