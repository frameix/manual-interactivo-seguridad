import { Buffer } from 'buffer';

if (typeof window !== 'undefined') {
  (window as any).Buffer = (window as any).Buffer || Buffer;
}

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import signpdfModule from '@signpdf/signpdf';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { DUMMY_CERT_P12_BASE64, DUMMY_CERT_PASSWORD } from './dummyCertificate';
import { P12Signer } from '@signpdf/signer-p12';

export async function createDemoAndSign(
  title: string,
  content: string,
  signerName: string,
  location: string,
  reason: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const page = pdfDoc.addPage([600, 800]);

  const { height, width } = page.getSize();

  // Draw the nice stamp (FRAME style) at the TOP RIGHT
  const stampY = height - 100;
  const stampX = width - 200;
  
  // Draw a checkmark badge SVG
  const badgeSvg = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
  page.drawSvgPath(badgeSvg, { x: stampX, y: stampY + 14, scale: 0.9, color: rgb(0.6, 0.7, 0.8) }); 
  
  page.drawText("FRAME", { x: stampX + 26, y: stampY, size: 18, font: helveticaBold, color: rgb(0.3, 0.4, 0.5) });
  
  page.drawText(`Firmado por:`, { x: stampX, y: stampY - 18, size: 8, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(signerName, { x: stampX + 55, y: stampY - 18, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
  
  page.drawText(`Locación:`, { x: stampX, y: stampY - 30, size: 8, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(location, { x: stampX + 45, y: stampY - 30, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
  
  page.drawText(`Razón:`, { x: stampX, y: stampY - 42, size: 8, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) });
  page.drawText(reason, { x: stampX + 35, y: stampY - 42, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });

  // Document Content below the stamp
  page.drawText(title, { x: 50, y: height - 220, size: 24, font: helveticaBold, color: rgb(0.1, 0.2, 0.4) });
  
  page.drawText(content, {
    x: 50,
    y: height - 260,
    size: 12,
    font: helvetica,
    color: rgb(0.2, 0.2, 0.2),
    maxWidth: width - 100,
    lineHeight: 18,
  });

  // Add the digital signature placeholder NATIVELY to the PDF Document
  pdflibAddPlaceholder({
    pdfDoc,
    reason,
    contactInfo: 'laboratorio@unsm.edu.pe',
    name: signerName,
    location,
    signatureLength: 8192,
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  const pdfBuffer = Buffer.from(pdfBytes.buffer, pdfBytes.byteOffset, pdfBytes.byteLength);

  const p12Buffer = Buffer.from(DUMMY_CERT_P12_BASE64, 'base64');
  
  const signerObj: any = signpdfModule;
  const pdfSigner = signerObj.sign ? signerObj : (signerObj.default || new (signerObj.SignPdf || signerObj)());
  const p12Signer = new P12Signer(p12Buffer, { passphrase: DUMMY_CERT_PASSWORD });
  
  const signedPdfBuffer = await pdfSigner.sign(pdfBuffer, p12Signer);

  return new Uint8Array(signedPdfBuffer.buffer, signedPdfBuffer.byteOffset, signedPdfBuffer.byteLength);
}

export async function signExistingPdf(
  fileBuffer: ArrayBuffer,
  signerName: string,
  location: string,
  reason: string,
  stampPosition: 'top' | 'bottom' = 'top'
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const pages = pdfDoc.getPages();
  if (pages.length > 0) {
    // If 'top', stamp on FIRST page. If 'bottom', stamp on LAST page.
    const targetPage = stampPosition === 'top' ? pages[0] : pages[pages.length - 1];
    const { height, width } = targetPage.getSize();
    
    // Calculate stamp position
    const stampY = stampPosition === 'top' ? height - 100 : 80;
    const stampX = width - 200;
    
    // Draw a checkmark badge SVG
    const badgeSvg = 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z';
    targetPage.drawSvgPath(badgeSvg, { x: stampX, y: stampY + 14, scale: 0.9, color: rgb(0.6, 0.7, 0.8) }); 
    
    targetPage.drawText("FRAME", { x: stampX + 26, y: stampY, size: 18, font: helveticaBold, color: rgb(0.3, 0.4, 0.5) });
    
    targetPage.drawText(`Firmado por:`, { x: stampX, y: stampY - 18, size: 8, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) });
    targetPage.drawText(signerName, { x: stampX + 55, y: stampY - 18, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
    
    targetPage.drawText(`Locación:`, { x: stampX, y: stampY - 30, size: 8, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) });
    targetPage.drawText(location, { x: stampX + 45, y: stampY - 30, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
    
    targetPage.drawText(`Razón:`, { x: stampX, y: stampY - 42, size: 8, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) });
    targetPage.drawText(reason, { x: stampX + 35, y: stampY - 42, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
  }

  // Add the digital signature placeholder NATIVELY to the PDF Document
  pdflibAddPlaceholder({
    pdfDoc,
    reason,
    contactInfo: 'laboratorio@unsm.edu.pe',
    name: signerName,
    location,
    signatureLength: 8192,
  });

  const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
  const pdfBuffer = Buffer.from(pdfBytes.buffer, pdfBytes.byteOffset, pdfBytes.byteLength);

  const p12Buffer = Buffer.from(DUMMY_CERT_P12_BASE64, 'base64');
  
  const signerObj: any = signpdfModule;
  const pdfSigner = signerObj.sign ? signerObj : (signerObj.default || new (signerObj.SignPdf || signerObj)());
  const p12Signer = new P12Signer(p12Buffer, { passphrase: DUMMY_CERT_PASSWORD });
  
  const signedPdfBuffer = await pdfSigner.sign(pdfBuffer, p12Signer);

  return new Uint8Array(signedPdfBuffer.buffer, signedPdfBuffer.byteOffset, signedPdfBuffer.byteLength);
}
