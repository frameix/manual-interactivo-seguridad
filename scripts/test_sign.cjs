const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
let signpdfMod = require('@signpdf/signpdf');
const signpdf = signpdfMod.default || signpdfMod;
const { pdflibAddPlaceholder } = require('@signpdf/placeholder-pdf-lib');
const { P12Signer } = require('@signpdf/signer-p12');

const p12Base64 = fs.readFileSync('src/utils/dummyCertificate.ts', 'utf-8').split('DUMMY_CERT_P12_BASE64 = "')[1].split('"')[0];
const password = "firma_segura";

async function main() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    page.drawText("Hello World", { x: 50, y: 750, size: 24 });
    
    pdflibAddPlaceholder({
        pdfDoc,
        reason: 'test',
        contactInfo: 'test@test.com',
        name: 'test',
        location: 'test',
        signatureLength: 8192,
    });
    
    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });

    const p12Buffer = Buffer.from(p12Base64, 'base64');
    
    let pdfSigner = signpdf.sign ? signpdf : new (signpdf.SignPdf || signpdf)();
    let p12Signer = new P12Signer(p12Buffer, { passphrase: password });

    const pdfBuffer = Buffer.from(pdfBytes);
    try {
        const signedPdfBuffer = await pdfSigner.sign(pdfBuffer, p12Signer);
        fs.writeFileSync('test_signed.pdf', signedPdfBuffer);
        console.log('Success, size:', signedPdfBuffer.length);
    } catch (e) {
        console.error('Error signing:', e);
    }
}
main();
