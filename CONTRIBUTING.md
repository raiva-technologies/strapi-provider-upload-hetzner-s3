# Contributing to strapi-provider-upload-hetzner-s3

Thank you for your interest in contributing to this project! 🎉

## 🚀 Quick Start

1. **Fork the Repository**
   ```bash
   # Fork via GitHub UI, then:
   git clone https://github.com/your-username/strapi-provider-upload-hetzner-s3.git
   cd strapi-provider-upload-hetzner-s3
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-new-feature
   ```

4. **Make Changes**
   - Write clean, well-documented code
   - Follow the existing code style
   - Add tests for new features

5. **Run Tests**
   ```bash
   npm test
   npm run build
   ```

6. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: description of your change"
   git push origin feature/your-new-feature
   ```

7. **Create Pull Request**
   - Open a PR on GitHub
   - Describe your changes in detail
   - Link relevant issues

## 📝 Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code formatting (no functional changes)
- `refactor:` - Code refactoring
- `test:` - Adding or modifying tests
- `chore:` - Build process or tooling

Examples:
```
feat: add support for custom retry logic
fix: resolve upload timeout issue
docs: update README with new configuration options
```

## 🧪 Testing

### Writing Tests

Place tests in `src/*.spec.ts`. Example:

```typescript
describe("new feature", () => {
  it("should do something", async () => {
    // Arrange
    const input = "test";
    
    // Act
    const result = await someFunction(input);
    
    // Assert
    expect(result).toBe("expected");
  });
});
```

### Running Tests

```bash
# All tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Specific test
npm test -- provider.spec.ts
```

## 📋 Code Style

- Use TypeScript strict mode
- Format code with Prettier (automatic on commits)
- Use descriptive variable names
- Comment complex code
- Keep functions small and focused

### TypeScript Guidelines

```typescript
// ✅ Good
interface Config {
  accessKeyId: string;
  secretAccessKey: string;
}

function uploadFile(file: File, config: Config): Promise<void> {
  // Implementation
}

// ❌ Bad
function upload(f: any, c: any) {
  // Implementation
}
```

## 🐛 Bug Reports

When reporting bugs, please provide the following information:

```markdown
### Description
Brief description of the problem

### Steps to Reproduce
1. Step 1
2. Step 2
3. ...

### Expected Behavior
What should happen

### Current Behavior
What actually happens

### Environment
- Node Version: 
- Strapi Version:
- Provider Version:
- OS:

### Additional Context
Logs, screenshots, etc.
```

## 💡 Feature Requests

Feature requests are welcome! Please:

1. Check if the feature has already been requested
2. Describe the feature in detail
3. Explain the use case
4. Discuss possible implementations

## 🔍 Code Review Process

1. At least one maintainer must approve the PR
2. All tests must pass
3. Code coverage must not decrease
4. Documentation must be updated

## 📚 Documentation

- Update README.md for new features
- Document complex functions in code
- Add JSDoc comments for public APIs

## 🤝 Community

- Be respectful and inclusive
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md)
- Help other contributors

## 📦 Release Process

Releases are performed by maintainers:

1. Bump version in package.json (Semantic Versioning)
2. Update changelog
3. Create tag: `git tag v1.0.0`
4. Publish to npm: `npm publish`

## ❓ Questions?

If you have questions:
- Open an issue
- Contact the Hermann del Campo
- Send an email to: github@raiva.io

Thank you for your contribution! 🙏
