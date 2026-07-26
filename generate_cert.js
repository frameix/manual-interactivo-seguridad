const forge = require('node-forge');
const fs = require('fs');

const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

const attrs = [
  { name: 'commonName', value: 'Laboratorio Firma Electronica UNSM' },
  { name: 'localityName', value: 'Tarapoto' },
  { name: 'stateOrProvinceName', value: 'San Martin' },
  { name: 'countryName', value: 'PE' }
];

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.sign(keys.privateKey);

const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, cert, 'firma_segura');
const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
const b64 = Buffer.from(p12Der, 'binary').toString('base64');

fs.writeFileSync('src/utils/dummyCertificate.ts', 'export const DUMMY_CERT_PASSWORD = "firma_segura";\nexport const DUMMY_CERT_P12_BASE64 = "' + b64 + '";\n');
console.log('Certificate generated successfully');
