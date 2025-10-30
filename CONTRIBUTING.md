# Contributing to Tab & Bookmark Manager

Thank you for considering contributing to the Tab & Bookmark Manager project!

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, versions)
- Screenshots if applicable

### Suggesting Features

We welcome feature suggestions! Please open an issue with:
- Clear description of the feature
- Use cases and benefits
- Possible implementation approach

### Code Contributions

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Test your changes**
   ```bash
   # Backend tests
   cd backend && npm test
   
   # ML service tests
   cd ml-service && pytest
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add awesome feature"
   ```
   
   Follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation changes
   - `style:` formatting changes
   - `refactor:` code refactoring
   - `test:` adding tests
   - `chore:` maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Ensure CI passes

## Development Setup

See the main README.md for setup instructions.

## Code Style

### JavaScript (Backend)
- Use ESLint configuration
- Prefer `const` over `let`
- Use async/await over callbacks
- Add JSDoc comments for functions

### Python (ML Service)
- Follow PEP 8
- Use type hints where appropriate
- Add docstrings for functions and classes

### Git Commits
- Keep commits atomic and focused
- Write clear commit messages
- Reference issues in commits

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## Documentation

- Update README.md for new features
- Add/update API documentation
- Include code comments for complex logic
- Update architecture docs if needed

## Code Review Process

1. All PRs require at least one review
2. Address review feedback promptly
3. Keep PRs focused and reasonably sized
4. CI must pass before merging

## Questions?

Feel free to open an issue for any questions or reach out to the maintainers.

Thank you for contributing! 🎉
