export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['encrypt', 'decrypt']
  );
  return keyPair;
}

export async function getOrGenerateKeyPair() {
  const storedKeyPair = sessionStorage.getItem('keyPair');
  if (storedKeyPair) {
    return storedKeyPair;
  }

  const keyPair = await generateKeyPair();
  sessionStorage.setItem('keyPair', JSON.stringify(keyPair));
  return keyPair;
}
