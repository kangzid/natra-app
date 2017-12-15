const fs = require('fs');

// 1. Update EncryptedStorageService.php to ensure deleteFile and deleteEncrypted exist
const encServiceFile = '../backup/tracker-loc-backend/app/Services/EncryptedStorageService.php';
let encCode = fs.readFileSync(encServiceFile, 'utf8');

if (!encCode.includes('public static function deleteEncrypted')) {
  encCode = encCode.replace(
    'public static function deleteFile(?string $path): bool',
    `public static function deleteEncrypted(?string $path): bool
    {
        return self::deleteFile($path);
    }

    public static function deleteFile(?string $path): bool`
  );
  fs.writeFileSync(encServiceFile, encCode, 'utf8');
  console.log('Added deleteEncrypted alias to EncryptedStorageService.php');
}

// 2. Update HrisClaimController.php
const claimControllerFile = '../backup/tracker-loc-backend/app/Http/Controllers/Api/HrisClaimController.php';
let claimCode = fs.readFileSync(claimControllerFile, 'utf8');

claimCode = claimCode.replace(
  'EncryptedStorageService::deleteEncrypted($claim->receipt_path);',
  'EncryptedStorageService::deleteFile($claim->receipt_path);'
);

fs.writeFileSync(claimControllerFile, claimCode, 'utf8');
console.log('Updated HrisClaimController.php destroy method');
