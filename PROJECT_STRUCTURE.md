# Project Structure

## Overview

The Idurar ERP CRM project follows a monorepo structure with clear separation between frontend and backend components. This document provides a detailed overview of the project organization.

## Root Structure

```
idurar-merged/
├── backend/                 # Node.js/Express API
├── frontend/                # Next.js application
├── docs/                    # Documentation
├── package.json            # Root package.json (monorepo)
├── .gitignore             # Git ignore rules
├── README.md              # Main project documentation
├── setup.bat              # Windows setup script
├── PROJECT_STRUCTURE.md   # This file
└── MERGE_SUMMARY.md       # Merge summary
```

## Backend Structure

```
backend/
├── src/
│   ├── controllers/        # API controllers
│   │   ├── appControllers/ # Business logic controllers
│   │   │   ├── clientController/
│   │   │   ├── invoiceController/
│   │   │   ├── paymentController/
│   │   │   ├── quoteController/
│   │   │   ├── paymentModeController/
│   │   │   └── taxesController/
│   │   └── coreControllers/ # Core system controllers
│   ├── models/             # Database models
│   │   ├── appModels/      # Business models
│   │   │   ├── Client.js
│   │   │   ├── Invoice.js
│   │   │   ├── Payment.js
│   │   │   ├── Quote.js
│   │   │   ├── PaymentMode.js
│   │   │   └── Taxes.js
│   │   └── utils/          # Model utilities
│   ├── routes/             # API routes
│   │   ├── appRoutes/      # Business routes
│   │   └── coreRoutes/     # Core system routes
│   ├── middlewares/        # Express middlewares
│   ├── handlers/           # Error handlers
│   ├── utils/              # Utility functions
│   ├── settings/           # Configuration settings
│   ├── setup/              # Setup scripts
│   ├── emailTemplate/      # Email templates
│   ├── pdf/                # PDF generation
│   ├── public/             # Static files
│   ├── locale/             # Internationalization
│   ├── app.js             # Express app setup
│   ├── server.js          # Server entry point
│   └── helpers.js         # Helper functions
├── package.json           # Backend dependencies
├── .env                   # Environment variables
├── .eslintrc.js          # ESLint configuration
├── .prettierrc           # Prettier configuration
├── jsconfig.json         # JavaScript configuration
└── .gitignore            # Backend git ignore
```

## Frontend Structure

```
frontend/
├── app/                   # Next.js app directory
│   ├── layout.tsx        # Root layout component
│   ├── page.tsx          # Main dashboard page
│   ├── providers.tsx     # React providers (Query, Theme)
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── Overview.tsx      # Dashboard overview
│   ├── Customers.tsx     # Client management
│   └── Invoices.tsx      # Invoice management
├── lib/                  # Utility libraries
│   ├── idurar-api.ts     # API client
│   └── query-client.ts   # React Query configuration
├── public/               # Static assets
│   ├── images/           # Image assets
│   ├── fonts/            # Font files
│   └── favicon.ico       # Favicon
├── package.json          # Frontend dependencies
├── next.config.mjs       # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── eslint.config.mjs     # ESLint configuration
├── postcss.config.mjs    # PostCSS configuration
├── components.json       # UI components configuration
└── .gitignore            # Frontend git ignore
```

## Documentation Structure

```
docs/
├── API.md               # API documentation
├── DEPLOYMENT.md        # Deployment guide
└── CONTRIBUTING.md      # Contributing guidelines
```

## Key Files and Their Purposes

### Root Level

- **package.json**: Monorepo configuration with workspaces and scripts
- **.gitignore**: Comprehensive git ignore rules for the entire project
- **README.md**: Main project documentation and quick start guide
- **setup.bat**: Windows setup script for easy project initialization
- **PROJECT_STRUCTURE.md**: This file - detailed structure documentation
- **MERGE_SUMMARY.md**: Summary of the merge process and changes

### Backend

- **src/app.js**: Express application setup and middleware configuration
- **src/server.js**: Server entry point and startup logic
- **src/helpers.js**: Utility functions used throughout the backend
- **package.json**: Backend dependencies and scripts
- **.env**: Environment variables (not committed to git)
- **env.example**: Example environment configuration

### Frontend

- **app/layout.tsx**: Root layout with providers and global configuration
- **app/page.tsx**: Main dashboard page with navigation and routing
- **app/providers.tsx**: React Query and theme providers
- **lib/idurar-api.ts**: API client for backend communication
- **lib/query-client.ts**: React Query configuration
- **package.json**: Frontend dependencies and scripts
- **next.config.mjs**: Next.js configuration
- **tailwind.config.js**: Tailwind CSS configuration
- **env.example**: Example environment configuration

## Architecture Patterns

### Backend Architecture

1. **MVC Pattern**: Models, Views (API responses), Controllers
2. **Repository Pattern**: Database operations abstracted in models
3. **Middleware Pattern**: Express middlewares for cross-cutting concerns
4. **Service Layer**: Business logic in controllers
5. **Error Handling**: Centralized error handling with custom handlers

### Frontend Architecture

1. **Component-Based**: Reusable React components
2. **Custom Hooks**: Shared logic in custom hooks
3. **State Management**: React Query for server state
4. **Type Safety**: Full TypeScript implementation
5. **Responsive Design**: Mobile-first approach with Tailwind CSS

## Data Flow

### API Requests

1. **Frontend**: React Query hooks call API client
2. **API Client**: Axios requests to backend endpoints
3. **Backend**: Express routes → Controllers → Models → Database
4. **Response**: Database → Models → Controllers → Routes → Frontend

### State Management

1. **Server State**: Managed by React Query
2. **Client State**: Managed by React useState/useReducer
3. **Caching**: Automatic caching and invalidation by React Query
4. **Optimistic Updates**: Immediate UI updates with rollback on error

## Development Workflow

### Local Development

1. **Setup**: Run `setup.bat` or follow manual setup
2. **Start**: `npm run dev` starts both frontend and backend
3. **Build**: `npm run build` builds both applications
4. **Test**: `npm run test` runs tests for both applications
5. **Lint**: `npm run lint` checks code quality

### Code Organization

1. **Feature-Based**: Components and logic organized by feature
2. **Separation of Concerns**: Clear separation between UI and business logic
3. **Reusability**: Shared components and utilities
4. **Maintainability**: Consistent patterns and conventions

## Best Practices

### Code Organization

- Keep components small and focused
- Use meaningful file and folder names
- Group related functionality together
- Follow consistent naming conventions

### Performance

- Implement proper caching strategies
- Use React Query for server state
- Optimize bundle size with code splitting
- Implement lazy loading for components

### Security

- Validate all inputs
- Use environment variables for sensitive data
- Implement proper authentication and authorization
- Follow security best practices

### Testing

- Write unit tests for business logic
- Write integration tests for API endpoints
- Write component tests for UI components
- Maintain good test coverage

## Future Enhancements

### Planned Structure Improvements

1. **Microservices**: Split backend into microservices
2. **Shared Types**: Create shared TypeScript types package
3. **Storybook**: Add Storybook for component documentation
4. **E2E Testing**: Add end-to-end testing with Playwright
5. **Monitoring**: Add application monitoring and logging

### Scalability Considerations

1. **Database**: Implement database sharding and replication
2. **Caching**: Add Redis for session and data caching
3. **CDN**: Use CDN for static assets
4. **Load Balancing**: Implement load balancing for high traffic
5. **Microservices**: Split into smaller, focused services 