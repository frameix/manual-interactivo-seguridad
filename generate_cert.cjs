const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Generate a key pair
console.log('Generating 2048-bit key-pair...');
const keys = forge.pki.rsa.generateKeyPair(2048);

// Create a certificate
console.log('Creating self-signed certificate...');
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

const attrs = [
  { name: 'commonName', value: 'Laboratorio Firma Electronica UNSM' },
  { name: 'countryName', value: 'PE' },
  { shortName: 'ST', value: 'San Martin' },
  { name: 'localityName', value: 'Tarapoto' },
  { name: 'organizationName', value: 'UNSM - FISI' },
  { shortName: 'OU', value: 'Seguridad de la Informacion' }
];
cert.setSubject(attrs);
cert.setIssuer(attrs); // self-signed

// Sign the certificate
cert.sign(keys.privateKey);

// Convert to PKCS#12
console.log('Converting to PKCS#12...');
// We need an empty password or "1234"
const password = 'firma_segura';

const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
  keys.privateKey, [cert], password,
  {generateLocalKeyId: true, friendlyName: 'UNSM Signer'}
);
const p12Der = forge.asn1.toDer(p12Asn1).getBytes();

const b64 = forge.util.encode64(p12Der);

const tsContent = `// Auto-generated self-signed PKCS#12 certificate for demonstrations
export const DUMMY_CERT_P12_BASE64 = "${b64}";
export const DUMMY_CERT_PASSWORD = "${password}";
`;

fs.writeFileSync(path.join(__dirname, 'src', 'utils', 'dummyCertificate.ts'), tsContent);
console.log('Certificate generated and saved to src/utils/dummyCertificate.ts');
