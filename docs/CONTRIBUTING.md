# Contributing to Idurar ERP CRM

Thank you for your interest in contributing to the Idurar ERP CRM project! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/idurar-erp-crm.git
   cd idurar-erp-crm
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set up the development environment**
   ```bash
   npm run install:all
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

## Development Setup

### Prerequisites

- Node.js 20.9.0 or higher
- npm 10.2.4 or higher
- MongoDB (local or cloud)
- Git

### Environment Configuration

1. **Backend Environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Frontend Environment**
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

### Available Scripts

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Run linting
npm run lint

# Clean build artifacts
npm run clean
```

## Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow the existing code style and patterns
- Add comments for complex logic
- Use meaningful variable and function names
- Keep functions small and focused

### JavaScript/TypeScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Prefer const over let, avoid var
- Use async/await over Promises
- Handle errors appropriately

### React/Next.js

- Use functional components with hooks
- Follow React best practices
- Use TypeScript interfaces for props
- Implement proper error boundaries
- Optimize for performance

### Backend/Express

- Use async/await for database operations
- Implement proper error handling
- Validate input data
- Use middleware for common functionality
- Follow RESTful API conventions

### Database/MongoDB

- Use Mongoose schemas and models
- Implement proper indexing
- Use transactions when necessary
- Handle database errors gracefully
- Follow naming conventions

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

### Examples

```bash
feat(auth): add JWT authentication system
fix(api): resolve client creation validation error
docs(readme): update installation instructions
style(ui): improve button component styling
refactor(backend): restructure database models
perf(frontend): optimize image loading
test(api): add unit tests for invoice controller
chore(deps): update dependencies to latest versions
```

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation if necessary

3. **Test your changes**
   ```bash
   npm run test
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Use the provided PR template
   - Describe your changes clearly
   - Link any related issues
   - Request reviews from maintainers

### PR Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## Reporting Bugs

### Before Submitting a Bug Report

1. Check if the bug has already been reported
2. Try to reproduce the bug with the latest version
3. Check if the bug is related to your environment

### Bug Report Template

```markdown
## Bug Description
Clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., Windows 10, macOS 12.0]
- Browser: [e.g., Chrome 96, Firefox 95]
- Node.js Version: [e.g., 20.9.0]
- npm Version: [e.g., 10.2.4]

## Additional Context
Add any other context about the problem here.
```

## Feature Requests

### Before Submitting a Feature Request

1. Check if the feature has already been requested
2. Consider if the feature aligns with the project's goals
3. Think about the implementation complexity

### Feature Request Template

```markdown
## Feature Description
Clear and concise description of the feature.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How would you like to see this feature implemented?

## Alternative Solutions
Any alternative solutions you've considered.

## Additional Context
Add any other context or screenshots about the feature request.
```

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for all new functionality
- Maintain good test coverage
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

### Test Structure

```javascript
describe('Component/Function Name', () => {
  describe('when condition', () => {
    it('should expected behavior', () => {
      // Test implementation
    });
  });
});
```

## Documentation

### Documentation Standards

- Write clear and concise documentation
- Use proper markdown formatting
- Include code examples
- Keep documentation up to date
- Use consistent terminology

### Documentation Types

1. **API Documentation**: Document all API endpoints
2. **Component Documentation**: Document React components
3. **Setup Documentation**: Installation and configuration guides
4. **User Documentation**: User guides and tutorials

### Updating Documentation

- Update documentation when adding new features
- Fix documentation when fixing bugs
- Review documentation for accuracy
- Add examples for complex features

## Code Review Process

### Review Guidelines

- Be respectful and constructive
- Focus on the code, not the person
- Provide specific feedback
- Suggest improvements
- Ask questions when unclear

### Review Checklist

- [ ] Code follows project standards
- [ ] Tests are included and pass
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling is appropriate

## Getting Help

### Resources

- [Project Documentation](README.md)
- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Issues](https://github.com/idurar/idurar-erp-crm/issues)
- [Discussions](https://github.com/idurar/idurar-erp-crm/discussions)

### Contact

- Create an issue for bugs or feature requests
- Use discussions for questions and ideas
- Join our community channels

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Idurar ERP CRM! 🎉 