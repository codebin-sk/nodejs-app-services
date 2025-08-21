export function encryptData(data: string, secret: string): string {
    // Implement encryption logic here
    return Buffer.from(data).toString('base64'); // Placeholder implementation
}

export function decryptData(encryptedData: string, secret: string): string {
    // Implement decryption logic here
    return Buffer.from(encryptedData, 'base64').toString('utf-8'); // Placeholder implementation
}