import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const allRows: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Group text items by Y coordinate to reconstruct rows
    // This handles columnar PDFs (like Bangkok R.I.A Lab) where
    // test names and values are in separate columns but same row
    const rowMap = new Map<number, { x: number; str: string }[]>();

    for (const item of content.items as any[]) {
      if (!item.str?.trim()) continue;
      const y = Math.round(item.transform[5]);
      if (!rowMap.has(y)) rowMap.set(y, []);
      rowMap.get(y)!.push({ x: item.transform[4], str: item.str });
    }

    // Sort rows top-to-bottom (higher Y = higher on page in PDF coords)
    const sortedYs = [...rowMap.keys()].sort((a, b) => b - a);

    for (const y of sortedYs) {
      const items = rowMap.get(y)!;
      // Sort items left-to-right within the row
      items.sort((a, b) => a.x - b.x);
      allRows.push(items.map(i => i.str).join(' '));
    }
  }

  return allRows.join('\n');
}
