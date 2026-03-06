# GitHub Issues for JBC Purchasing System Backend

This document contains a comprehensive list of GitHub issues that need to be addressed for the JBC Purchasing System Backend. Issues are categorized by priority and type.

## 🔴 Critical Priority Issues

### Backend Architecture & Configuration

**Issue #1: Missing Purchase Request Controller Implementation**
- **Type**: Bug/Feature
- **Description**: `prRouter.ts` references undefined controller functions (`getAllPurchaseRequests`, `getPurchaseRequestByID`, `createPurchaseRequest`)
- **Acceptance Criteria**: 
  - Create `prController.ts` with all referenced functions
  - Implement CRUD operations for Purchase Requests
  - Add proper error handling and validation
- **Estimated Effort**: Medium

**Issue #2: Purchase Request Router Not Mounted in App**
- **Type**: Bug
- **Description**: `prRouter.ts` exists but is not imported or mounted in `app.ts`
- **Acceptance Criteria**:
  - Import prRouter in `app.ts`
  - Mount the router with appropriate base path (e.g., `/api/pr`)
- **Estimated Effort**: Small

**Issue #3: Missing Environment Configuration Files**
- **Type**: Configuration
- **Description**: No `.env.example` or environment configuration files found
- **Acceptance Criteria**:
  - Create `.env.example` with all required variables
  - Document environment setup in README
  - Add validation for required environment variables
- **Estimated Effort**: Small

**Issue #4: Missing Database Configuration Module**
- **Type**: Architecture
- **Description**: Database connection logic is embedded in `server.ts` instead of a dedicated config module
- **Acceptance Criteria**:
  - Create `src/config/database.ts` module
  - Move database connection logic from server.ts
  - Add connection pooling and error handling
- **Estimated Effort**: Medium

## 🟡 High Priority Issues

### API & Business Logic

**Issue #5: Implement Purchase Request Item Association Logic**
- **Type**: Feature
- **Description**: Missing logic to handle relationship between Purchase Requests and PR Items
- **Acceptance Criteria**:
  - Add methods to associate/disassociate PR Items with Purchase Requests
  - Implement cascade operations (delete PR when all items removed)
  - Add validation for totalCost calculation
- **Estimated Effort**: Large

**Issue #6: Add Comprehensive Input Validation Middleware**
- **Type**: Security/Feature
- **Description**: Missing request validation middleware for all routes
- **Acceptance Criteria**:
  - Apply validation middleware to all routes using existing validators
  - Add sanitization for user inputs
  - Implement proper error responses for validation failures
- **Estimated Effort**: Medium

**Issue #7: Implement Proper Error Handling Middleware**
- **Type**: Architecture
- **Description**: No global error handling middleware implemented
- **Acceptance Criteria**:
  - Create global error handler middleware
  - Implement custom error classes
  - Add proper error logging
  - Return consistent error response format
- **Estimated Effort**: Medium

**Issue #8: Add Authentication & Authorization Middleware to All Protected Routes**
- **Type**: Security
- **Description**: Not all routes have proper authentication/authorization middleware
- **Acceptance Criteria**:
  - Audit all routes for auth requirements
  - Apply appropriate middleware consistently
  - Add role-based access control where needed
- **Estimated Effort**: Medium

### Testing & Quality

**Issue #9: Incomplete Route Test Coverage**
- **Type**: Testing
- **Description**: `prRouter.test.ts` is minimal (39 lines) compared to other route tests
- **Acceptance Criteria**:
  - Complete comprehensive route tests for PR endpoints
  - Test authentication/authorization scenarios
  - Test error cases and edge cases
- **Estimated Effort**: Medium

**Issue #10: Add Integration Tests**
- **Type**: Testing
- **Description**: Missing integration tests that test complete workflows
- **Acceptance Criteria**:
  - Create integration tests for complete PR creation workflow
  - Test inter-model relationships and dependencies
  - Add database transaction tests
- **Estimated Effort**: Large

## 🟢 Medium Priority Issues

### Development Experience

**Issue #11: Setup ESLint and Prettier Configuration**
- **Type**: Developer Experience
- **Description**: While scripts exist in package.json, no configuration files are present
- **Acceptance Criteria**:
  - Add `.eslintrc.js` with TypeScript rules
  - Add `.prettierrc` configuration
  - Configure pre-commit hooks
- **Estimated Effort**: Small

**Issue #12: Add Request Logging Middleware**
- **Type**: Monitoring
- **Description**: Morgan logging is commented out and no comprehensive logging strategy
- **Acceptance Criteria**:
  - Implement structured logging with Winston
  - Add request/response logging
  - Log errors and performance metrics
- **Estimated Effort**: Medium

**Issue #13: Implement API Rate Limiting**
- **Type**: Security
- **Description**: No rate limiting implemented for API endpoints
- **Acceptance Criteria**:
  - Add express-rate-limit middleware
  - Configure different limits for different endpoint types
  - Add rate limit headers to responses
- **Estimated Effort**: Small

**Issue #14: Add CORS Configuration**
- **Type**: Security/Configuration
- **Description**: No CORS middleware configured
- **Acceptance Criteria**:
  - Add CORS middleware with proper configuration
  - Configure allowed origins for different environments
  - Add preflight request handling
- **Estimated Effort**: Small

### Documentation & Schema

**Issue #15: Complete Database Schema Documentation**
- **Type**: Documentation
- **Description**: `SCHEMA.md` file exists but is empty
- **Acceptance Criteria**:
  - Document all model schemas with relationships
  - Add ER diagrams
  - Document indexes and constraints
- **Estimated Effort**: Medium

**Issue #16: Add API Documentation with Swagger/OpenAPI**
- **Type**: Documentation
- **Description**: No API documentation exists
- **Acceptance Criteria**:
  - Implement Swagger/OpenAPI documentation
  - Document all endpoints with examples
  - Add authentication documentation
- **Estimated Effort**: Large

## 🔵 Low Priority Issues

### Performance & Optimization

**Issue #17: Add Database Indexes for Performance**
- **Type**: Performance
- **Description**: No custom indexes defined for frequent queries
- **Acceptance Criteria**:
  - Analyze query patterns and add appropriate indexes
  - Add compound indexes for complex queries
  - Monitor query performance
- **Estimated Effort**: Medium

**Issue #18: Implement Caching Strategy**
- **Type**: Performance
- **Description**: No caching mechanism implemented
- **Acceptance Criteria**:
  - Add Redis for session storage
  - Implement caching for frequently accessed data
  - Add cache invalidation strategies
- **Estimated Effort**: Large

**Issue #19: Add Health Check Endpoints**
- **Type**: Monitoring
- **Description**: Basic health check exists but no comprehensive health monitoring
- **Acceptance Criteria**:
  - Add database connectivity check
  - Add memory and CPU usage monitoring
  - Implement readiness and liveness probes
- **Estimated Effort**: Small

### Security Enhancements

**Issue #20: Add Security Headers Middleware**
- **Type**: Security
- **Description**: No security headers middleware implemented
- **Acceptance Criteria**:
  - Add helmet.js for security headers
  - Configure CSP, HSTS, and other security policies
  - Add security audit script
- **Estimated Effort**: Small

**Issue #21: Implement Input Sanitization**
- **Type**: Security
- **Description**: No input sanitization beyond validation
- **Acceptance Criteria**:
  - Add sanitization for HTML, SQL injection prevention
  - Implement XSS protection
  - Add file upload validation (if applicable)
- **Estimated Effort**: Medium

### DevOps & Deployment

**Issue #22: Enhance Docker Configuration**
- **Type**: DevOps
- **Description**: Basic Dockerfile exists but could be optimized
- **Acceptance Criteria**:
  - Multi-stage Docker build for optimization
  - Add Docker compose for development environment
  - Add health checks in Docker container
- **Estimated Effort**: Medium

**Issue #23: Add CI/CD Pipeline Configuration**
- **Type**: DevOps
- **Description**: No CI/CD pipeline configured
- **Acceptance Criteria**:
  - Add GitHub Actions workflow
  - Include testing, linting, and building steps
  - Add automated deployment stages
- **Estimated Effort**: Large

**Issue #24: Add Database Migration System**
- **Type**: DevOps
- **Description**: No database migration system implemented
- **Acceptance Criteria**:
  - Implement migration scripts for schema changes
  - Add rollback capabilities
  - Document migration procedures
- **Estimated Effort**: Large

---

## Issue Templates

### Bug Report Template
```
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
A clear and concise description of what you expected to happen.

**Environment**
- Node.js version:
- npm version:
- Database version:
```

### Feature Request Template
```
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Acceptance Criteria**
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3
```

---

## Labels to Use

- `critical` - Issues that block core functionality
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `security` - Security-related issues
- `performance` - Performance improvements
- `documentation` - Improvements or additions to documentation
- `testing` - Testing-related issues
- `devops` - DevOps and deployment issues
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed 