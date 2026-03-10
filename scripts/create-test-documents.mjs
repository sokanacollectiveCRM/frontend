#!/usr/bin/env node
/**
 * Creates test documents for the 5 required doula document types.
 * Run: node scripts/create-test-documents.mjs
 * Output: test-documents/ folder with PDF files
 */

import { PDFDocument, StandardFonts } from 'pdf-lib';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'test-documents');

const DOCUMENTS = [
  { filename: 'background-check.pdf', title: 'Background Check', subtitle: 'Test document for upload verification' },
  { filename: 'liability-insurance-certificate.pdf', title: 'Liability Insurance Certificate', subtitle: 'Test document for upload verification' },
  { filename: 'training-certificate.pdf', title: 'Training Certificate', subtitle: 'Test document for upload verification' },
  { filename: 'w9.pdf', title: 'W9 Form', subtitle: 'Test document for upload verification' },
  { filename: 'direct-deposit-form.pdf', title: 'Direct Deposit Form', subtitle: 'Test document for upload verification' },
];

async function createPdf(title, subtitle) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 18;
  const { width, height } = page.getSize();

  page.drawText(title, {
    x: 50,
    y: height - 80,
    size: fontSize,
    font,
  });
  page.drawText(subtitle, {
    x: 50,
    y: height - 110,
    size: 12,
    font,
  });
  page.drawText('SOKANA COLLECTIVE - TEST DOCUMENT', {
    x: 50,
    y: height - 150,
    size: 10,
    font,
  });
  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: height - 170,
    size: 9,
    font,
  });

  return pdfDoc.save();
}

async function main() {
  if (!existsSync(OUT_DIR)) {
    mkdirSync(OUT_DIR, { recursive: true });
  }

  console.log('Creating test documents in', OUT_DIR, '\n');

  for (const doc of DOCUMENTS) {
    const pdfBytes = await createPdf(doc.title, doc.subtitle);
    const path = join(OUT_DIR, doc.filename);
    writeFileSync(path, pdfBytes);
    console.log('  ✓', doc.filename);
  }

  console.log('\nDone! Use these files to test uploads:');
  console.log('  - test-documents/background-check.pdf');
  console.log('  - test-documents/liability-insurance-certificate.pdf');
  console.log('  - test-documents/training-certificate.pdf');
  console.log('  - test-documents/w9.pdf');
  console.log('  - test-documents/direct-deposit-form.pdf');
}

main().catch(console.error);
