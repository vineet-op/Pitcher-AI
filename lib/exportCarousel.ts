import { toBlob } from 'html-to-image';
import JSZip from 'jszip';
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

export async function exportCarouselZip(options: {
  nodes: HTMLElement[];
  fileNames: string[];
  zipName: string;
  onProgress?: (done: number, total: number) => void;
}): Promise<void> {
  const { nodes, fileNames, zipName, onProgress } = options;

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const zip = new JSZip();

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

    zip.file(fileNames[i], blob);
    onProgress?.(i + 1, nodes.length);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, zipName);
}

export function slugifyName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'pitch';
}
