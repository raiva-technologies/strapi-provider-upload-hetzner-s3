# strapi-provider-upload-hetzner-s3

Ein Strapi Upload Provider für Hetzner Object Storage (S3-kompatibel).

## 🚀 Features

- ✅ Vollständige Integration mit Hetzner Object Storage
- ✅ Unterstützung aller drei Hetzner-Regionen (FSN1, NBG1, HEL1)
- ✅ TypeScript Support
- ✅ Bucket-Präfixe für organisierte Dateistruktur
- ✅ Custom Base URL Support (z.B. für CDN)
- ✅ ACL-Konfiguration
- ✅ Unit Tests
- ✅ Buffer und Stream Upload Support

## 📋 Voraussetzungen

- Node.js >= 14.19.1
- Strapi >= 4.0.0
- Ein Hetzner Object Storage Bucket

## 📦 Installation

```bash
npm install strapi-provider-upload-hetzner-s3
# oder
yarn add strapi-provider-upload-hetzner-s3
```

## 🔧 Hetzner Object Storage Setup

### 1. Bucket erstellen

1. Gehe zum [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Navigiere zu "Object Storage"
3. Erstelle einen neuen Bucket
4. Wähle eine Region:
   - **FSN1**: Falkenstein, Deutschland
   - **NBG1**: Nürnberg, Deutschland  
   - **HEL1**: Helsinki, Finnland

### 2. Access Keys generieren

1. Klicke auf deinen Bucket
2. Gehe zu "S3 Keys"
3. Erstelle einen neuen S3 Key
4. Speichere den **Access Key** und **Secret Key** sicher

### 3. Bucket-Einstellungen

- **Public Access**: Aktiviere dies, wenn deine Dateien öffentlich zugänglich sein sollen
- **CORS**: Konfiguriere CORS-Einstellungen falls nötig

## ⚙️ Konfiguration

### Basis-Konfiguration

Erstelle oder bearbeite `./config/plugins.js` (oder `.ts`):

```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "strapi-provider-upload-hetzner-s3",
      providerOptions: {
        accessKeyId: env("HETZNER_ACCESS_KEY_ID"),
        secretAccessKey: env("HETZNER_SECRET_ACCESS_KEY"),
        region: env("HETZNER_REGION"), // fsn1, nbg1, oder hel1
        params: {
          Bucket: env("HETZNER_BUCKET_NAME"),
        },
      },
    },
  },
});
```

### Erweiterte Konfiguration

```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "strapi-provider-upload-hetzner-s3",
      providerOptions: {
        accessKeyId: env("HETZNER_ACCESS_KEY_ID"),
        secretAccessKey: env("HETZNER_SECRET_ACCESS_KEY"),
        region: env("HETZNER_REGION"), // fsn1, nbg1, oder hel1
        params: {
          Bucket: env("HETZNER_BUCKET_NAME"),
          ACL: "public-read", // Optional: macht Dateien öffentlich lesbar
        },
        // Optional: Präfix für alle Uploads
        prefix: env("HETZNER_BUCKET_PREFIX", "uploads"), // z.B. "strapi-assets"
        // Optional: Custom Base URL (z.B. für CDN)
        baseUrl: env("CDN_BASE_URL"), // z.B. "https://cdn.example.com"
      },
    },
  },
});
```

### Environment Variables

Erstelle eine `.env` Datei im Root deines Projekts:

```env
# Hetzner Object Storage Credentials
HETZNER_ACCESS_KEY_ID=dein_access_key
HETZNER_SECRET_ACCESS_KEY=dein_secret_key

# Region (fsn1, nbg1, oder hel1)
HETZNER_REGION=fsn1

# Bucket Name
HETZNER_BUCKET_NAME=mein-strapi-bucket

# Optional: Bucket Präfix
HETZNER_BUCKET_PREFIX=uploads

# Optional: CDN Base URL
CDN_BASE_URL=https://cdn.example.com
```

## 🌍 Verfügbare Regionen

| Region Code | Standort | Endpoint |
|-------------|----------|----------|
| `fsn1` | Falkenstein, Deutschland | `fsn1.your-objectstorage.com` |
| `nbg1` | Nürnberg, Deutschland | `nbg1.your-objectstorage.com` |
| `hel1` | Helsinki, Finnland | `hel1.your-objectstorage.com` |

## 🖼️ Bild-Vorschauen im Strapi Admin

Um Thumbnails im Strapi Admin Panel korrekt anzuzeigen, konfiguriere die Content Security Policy:

Bearbeite `./config/middlewares.js`:

```javascript
module.exports = ({ env }) => [
  // ... andere Middlewares
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            `${env("HETZNER_BUCKET_NAME")}.${env("HETZNER_REGION")}.your-objectstorage.com`,
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            `${env("HETZNER_BUCKET_NAME")}.${env("HETZNER_REGION")}.your-objectstorage.com`,
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  // ... andere Middlewares
];
```

Falls du eine CDN Base URL verwendest:

```javascript
"img-src": [
  "'self'",
  "data:",
  "blob:",
  env("CDN_BASE_URL"),
],
"media-src": [
  "'self'",
  "data:",
  "blob:",
  env("CDN_BASE_URL"),
],
```

## 🔐 Sicherheit & Best Practices

### ACL-Einstellungen

Hetzner Object Storage unterstützt folgende ACL-Werte:

- `private` (Standard): Nur der Bucket-Besitzer hat Zugriff
- `public-read`: Jeder kann Objekte lesen
- `public-read-write`: Jeder kann lesen und schreiben (⚠️ nicht empfohlen)
- `authenticated-read`: Nur authentifizierte Benutzer können lesen

**Empfehlung**: Verwende `public-read` für öffentliche Websites oder lass ACL weg und konfiguriere die Bucket-Einstellungen über die Hetzner Console.

### Bucket-Organisation mit Präfixen

Verwende Präfixe, um deine Dateien zu organisieren:

```javascript
prefix: "production/uploads"  // Alle Dateien unter production/uploads/
prefix: "strapi/media"         // Alle Dateien unter strapi/media/
```

### CORS-Konfiguration

Falls dein Frontend direkt auf die Dateien zugreift, konfiguriere CORS in der Hetzner Console:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://deine-website.de"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

## 🚨 Troubleshooting

### Fehler: "Access Denied"

**Lösung**: 
- Überprüfe deine Access Key und Secret Key
- Stelle sicher, dass der Key die richtigen Berechtigungen hat
- Wenn du ACL verwendest, stelle sicher, dass der Key `s3:PutObjectACL` Berechtigung hat

### Fehler: "Bucket not found"

**Lösung**:
- Überprüfe den Bucket-Namen (Case-sensitive!)
- Stelle sicher, dass der Bucket in der richtigen Region existiert
- Überprüfe die Region-Konfiguration (fsn1, nbg1, oder hel1)

### Bilder werden nicht angezeigt

**Lösung**:
- Überprüfe die Content Security Policy in `middlewares.js`
- Stelle sicher, dass der Bucket öffentlich lesbar ist oder ACL richtig gesetzt ist
- Prüfe die Browser-Konsole auf CORS-Fehler

### Uploads schlagen fehl

**Lösung**:
- Überprüfe die Bucket-Größe und Limits
- Stelle sicher, dass der Upload nicht zu groß ist
- Prüfe die Netzwerkverbindung
- Aktiviere Debug-Logging in Strapi

## 🧪 Testing

```bash
# Tests ausführen
npm test

# Tests mit Coverage
npm test -- --coverage

# Build
npm run build
```

## 📊 Vergleich zu anderen Providern

| Feature | Hetzner S3 | AWS S3 | DigitalOcean Spaces |
|---------|-----------|--------|---------------------|
| Preis (Storage) | ~€0.005/GB | ~€0.023/GB | ~€0.020/GB |
| Preis (Transfer) | Kostenlos | ~€0.09/GB | ~€0.01/GB |
| Regionen in EU | ✅ 3 | ✅ 8+ | ❌ |
| S3-Kompatibel | ✅ | ✅ | ✅ |
| DSGVO-Konform | ✅ | ⚠️ | ⚠️ |

## 🤝 Contributing

Contributions sind willkommen! Bitte erstelle einen Pull Request oder öffne ein Issue.

### Development Setup

```bash
# Clone repository
git clone https://github.com/raiva-technologies/strapi-provider-upload-hetzner-s3.git

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## 📝 License

MIT License - siehe [LICENSE](LICENSE) Datei

## 🔗 Links

- [Hetzner Object Storage Dokumentation](https://docs.hetzner.com/storage/object-storage/)
- [Strapi Upload Providers](https://docs.strapi.io/dev-docs/providers)
- [AWS SDK für JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

## 💬 Support

If you have any questions or issues:
- Open a [GitHub Issue](https://github.com/raiva-technologies/strapi-provider-upload-hetzner-s3/issues)
- Contact: hermann.delcampo@raiva.io

## 📈 Changelog

### v1.0.0
- Initial Release
- Support for 3 Regions
- TypeScript Support
- Full Test-Coverage
- Prefix und Base URL Support

---

**Made with ❤️ for the Strapi Community**
