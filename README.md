# strapi-provider-upload-hetzner-s3

A Strapi Upload Provider for Hetzner Object Storage (S3-compatible).

## 🚀 Features

- ✅ Full integration with Hetzner Object Storage
- ✅ Support for all three Hetzner regions (FSN1, NBG1, HEL1)
- ✅ TypeScript Support
- ✅ Bucket prefixes for organized file structure
- ✅ Custom Base URL Support (e.g., for CDN)
- ✅ ACL configuration
- ✅ Unit Tests
- ✅ Buffer and Stream Upload Support

## 📋 Prerequisites

- Node.js >= 14.19.1
- Strapi >= 4.0.0
- A Hetzner Object Storage Bucket

## 📦 Installation

```bash
npm install strapi-provider-upload-hetzner-s3
# or
yarn add strapi-provider-upload-hetzner-s3
```

## 🔧 Hetzner Object Storage Setup

### 1. Create Bucket

1. Go to [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Navigate to "Object Storage"
3. Create a new bucket
4. Choose a region:
   - **FSN1**: Falkenstein, Germany
   - **NBG1**: Nuremberg, Germany  
   - **HEL1**: Helsinki, Finland

### 2. Generate Access Keys

1. Click on your bucket
2. Go to "S3 Keys"
3. Create a new S3 Key
4. Save the **Access Key** and **Secret Key** securely

### 3. Bucket Settings

- **Public Access**: Enable this if your files should be publicly accessible
- **CORS**: Configure CORS settings if needed

## ⚙️ Configuration

### Basic Configuration

Create or edit `./config/plugins.js` (or `.ts`):

```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "strapi-provider-upload-hetzner-s3",
      providerOptions: {
        accessKeyId: env("HETZNER_ACCESS_KEY_ID"),
        secretAccessKey: env("HETZNER_SECRET_ACCESS_KEY"),
        region: env("HETZNER_REGION"), // fsn1, nbg1, or hel1
        params: {
          Bucket: env("HETZNER_BUCKET_NAME"),
        },
      },
    },
  },
});
```

### Advanced Configuration

```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: "strapi-provider-upload-hetzner-s3",
      providerOptions: {
        accessKeyId: env("HETZNER_ACCESS_KEY_ID"),
        secretAccessKey: env("HETZNER_SECRET_ACCESS_KEY"),
        region: env("HETZNER_REGION"), // fsn1, nbg1, or hel1
        params: {
          Bucket: env("HETZNER_BUCKET_NAME"),
          ACL: "public-read", // Optional: makes files publicly readable
        },
        // Optional: Prefix for all uploads
        prefix: env("HETZNER_BUCKET_PREFIX", "uploads"), // e.g., "strapi-assets"
        // Optional: Custom Base URL (e.g., for CDN)
        baseUrl: env("CDN_BASE_URL"), // e.g., "https://cdn.example.com"
      },
    },
  },
});
```

### Environment Variables

Create a `.env` file in the root of your project:

```env
# Hetzner Object Storage Credentials
HETZNER_ACCESS_KEY_ID=your_access_key
HETZNER_SECRET_ACCESS_KEY=your_secret_key

# Region (fsn1, nbg1, or hel1)
HETZNER_REGION=fsn1

# Bucket Name
HETZNER_BUCKET_NAME=my-strapi-bucket

# Optional: Bucket Prefix
HETZNER_BUCKET_PREFIX=uploads

# Optional: CDN Base URL
CDN_BASE_URL=https://cdn.example.com
```

## 🌍 Available Regions

| Region Code | Location | Endpoint |
|-------------|----------|----------|
| `fsn1` | Falkenstein, Germany | `fsn1.your-objectstorage.com` |
| `nbg1` | Nuremberg, Germany | `nbg1.your-objectstorage.com` |
| `hel1` | Helsinki, Finland | `hel1.your-objectstorage.com` |

## 🖼️ Image Previews in Strapi Admin

To display thumbnails correctly in the Strapi Admin Panel, configure the Content Security Policy:

Edit `./config/middlewares.js`:

```javascript
module.exports = ({ env }) => [
  // ... other middlewares
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
  // ... other middlewares
];
```

If using a CDN Base URL:

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

## 🔐 Security & Best Practices

### ACL Settings

Hetzner Object Storage supports the following ACL values:

- `private` (Default): Only the bucket owner has access
- `public-read`: Everyone can read objects
- `public-read-write`: Everyone can read and write (⚠️ not recommended)
- `authenticated-read`: Only authenticated users can read

**Recommendation**: Use `public-read` for public websites or omit ACL and configure bucket settings via Hetzner Console.

### Bucket Organization with Prefixes

Use prefixes to organize your files:

```javascript
prefix: "production/uploads"  // All files under production/uploads/
prefix: "strapi/media"         // All files under strapi/media/
```

### CORS Configuration

If your frontend directly accesses the files, configure CORS in the Hetzner Console:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://your-website.com"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

## 🚨 Troubleshooting

### Error: "Access Denied"

**Solution**: 
- Check your Access Key and Secret Key
- Ensure the key has the correct permissions
- If using ACL, ensure the key has `s3:PutObjectACL` permission

### Error: "Bucket not found"

**Solution**:
- Check the bucket name (case-sensitive!)
- Ensure the bucket exists in the correct region
- Verify the region configuration (fsn1, nbg1, or hel1)

### Images not displaying

**Solution**:
- Check the Content Security Policy in `middlewares.js`
- Ensure the bucket is publicly readable or ACL is set correctly
- Check browser console for CORS errors

### Uploads failing

**Solution**:
- Check bucket size and limits
- Ensure the upload isn't too large
- Check network connection
- Enable debug logging in Strapi

## 🧪 Testing

```bash
# Run tests
npm test

# Tests with coverage
npm test -- --coverage

# Build
npm run build
```

## 📊 Comparison to Other Providers

| Feature | Hetzner S3 | AWS S3 | DigitalOcean Spaces |
|---------|-----------|--------|---------------------|
| Price (Storage) | ~€0.005/GB | ~€0.023/GB | ~€0.020/GB |
| Price (Transfer) | Free | ~€0.09/GB | ~€0.01/GB |
| EU Regions | ✅ 3 | ✅ 8+ | ❌ |
| S3-Compatible | ✅ | ✅ | ✅ |
| GDPR-Compliant | ✅ | ⚠️ | ⚠️ |

## 🤝 Contributing

Contributions are welcome! Please create a pull request or open an issue.

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

MIT License - see [LICENSE](LICENSE) file

## 🔗 Links

- [Hetzner Object Storage Documentation](https://docs.hetzner.com/storage/object-storage/)
- [Strapi Upload Providers](https://docs.strapi.io/dev-docs/providers)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)

## 💬 Support

If you have any questions or issues:
- Open a [GitHub Issue](https://github.com/raiva-technologies/strapi-provider-upload-hetzner-s3/issues)
- Contact: hermann.delcampo@raiva.io

## 📈 Changelog

### v1.0.0
- Initial Release
- Support for all three Hetzner regions
- TypeScript Support
- Full test coverage
- Prefix and Base URL Support

---

**Made with ❤️ for the Strapi Community**
