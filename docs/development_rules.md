# Development Rules and Guidelines

## Git Workflow Rules

### Commit Standards

1. **Commit Message Format:**

   ```
   type(scope): description

   [optional body]
   [optional footer]
   ```

2. **Commit Types:**
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes (formatting, etc.)
   - `refactor`: Code refactoring
   - `test`: Adding tests
   - `chore`: Maintenance tasks

3. **Examples:**
   ```
   feat(navigation): add responsive mobile menu
   fix(contact): resolve form validation issue
   docs(readme): update installation instructions
   style(components): format button component
   ```

### Branch Management

1. **Main Branch Protection:**
   - All changes must go through pull requests
   - No direct commits to main branch
   - Require at least one review for PRs

2. **Feature Branches:**
   - Create feature branches from main: `feature/navigation-system`
   - Use descriptive names: `feature/contact-form`, `fix/mobile-responsive`
   - Delete branches after merging

3. **Daily Development Flow:**
   - Start each day: `git pull origin main`
   - Create feature branch: `git checkout -b feature/hero-section`
   - Work on feature with regular commits
   - End of day: Push branch and create PR if ready

## File Organization Rules

### Directory Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── layout/       # Layout components (Header, Footer)
│   ├── sections/     # Page sections (Hero, About, Projects)
│   └── forms/        # Form components
├── app/
│   ├── (pages)/      # Route groups
│   ├── globals.css   # Global styles
│   └── layout.tsx    # Root layout
├── lib/
│   ├── utils.ts      # Utility functions
│   ├── constants.ts  # App constants
│   └── types.ts      # TypeScript types
├── data/
│   ├── projects.ts   # Project data
│   ├── skills.ts     # Skills data
│   └── content.ts    # Static content
└── styles/
    ├── components.css # Component styles
    └── utilities.css  # Utility classes
```

### Naming Conventions

1. **Files and Folders:**
   - Use kebab-case for folders: `project-showcase`
   - Use PascalCase for React components: `ContactForm.tsx`
   - Use camelCase for utilities: `formatDate.ts`

2. **Components:**
   - Component files: `ContactForm.tsx`
   - Component names: `ContactForm`
   - Props interfaces: `ContactFormProps`

3. **CSS Classes:**
   - Use Tailwind utility classes primarily
   - Custom classes in kebab-case: `.hero-gradient`
   - Component-specific classes: `.contact-form__input`

## Code Quality Rules

### TypeScript Standards

1. **Type Safety:**
   - Always define interfaces for props
   - Use strict TypeScript configuration
   - No `any` types unless absolutely necessary
   - Define return types for functions

2. **Interface Naming:**

   ```typescript
   interface ProjectProps {
     title: string;
     description: string;
     technologies: string[];
   }

   interface ApiResponse<T> {
     data: T;
     status: number;
     message: string;
   }
   ```

### Component Standards

1. **Component Structure:**

   ```typescript
   interface ComponentProps {
     // Props definition
   }

   export default function Component({ prop1, prop2 }: ComponentProps) {
     // Hooks
     // Event handlers
     // Render logic

     return (
       <div className="component-wrapper">
         {/* JSX content */}
       </div>
     );
   }
   ```

2. **Component Guidelines:**
   - Keep components under 200 lines
   - Extract complex logic into custom hooks
   - Use descriptive prop names
   - Include JSDoc comments for complex components

### Performance Rules

1. **Image Optimization:**
   - Use Next.js Image component for all images
   - Provide alt text for accessibility
   - Use appropriate image formats (WebP when possible)
   - Implement lazy loading for below-fold images

2. **Code Splitting:**
   - Use dynamic imports for large components
   - Implement route-based code splitting
   - Lazy load non-critical features

3. **Bundle Optimization:**
   - Import only needed functions from libraries
   - Use tree-shaking friendly imports
   - Monitor bundle size with webpack-bundle-analyzer

## Testing Rules

### Unit Testing

1. **Test Files:**
   - Place tests next to components: `ContactForm.test.tsx`
   - Use `.test.tsx` or `.spec.tsx` extensions
   - Test both happy paths and error cases

2. **Testing Standards:**
   - Test user interactions, not implementation details
   - Use React Testing Library for component tests
   - Maintain minimum 80% code coverage
   - Write descriptive test names

### Integration Testing

1. **Page Testing:**
   - Test complete user flows
   - Test form submissions end-to-end
   - Test responsive behavior
   - Test accessibility features

## Documentation Rules

### Code Documentation

1. **Component Documentation:**

   ```typescript
   /**
    * ContactForm component for handling user inquiries
    * @param onSubmit - Callback function called when form is submitted
    * @param loading - Whether the form is in loading state
    */
   export default function ContactForm({
     onSubmit,
     loading,
   }: ContactFormProps) {
     // Component implementation
   }
   ```

2. **Function Documentation:**
   - Document complex business logic
   - Include parameter descriptions
   - Document return values and side effects

### README Updates

1. **Keep README Current:**
   - Update setup instructions
   - Document new features
   - Include troubleshooting guides
   - Update deployment instructions

## Security Rules

### Input Validation

1. **Form Validation:**
   - Validate all user inputs
   - Sanitize data before processing
   - Use schema validation (Zod)
   - Implement rate limiting for forms

2. **Environment Variables:**
   - Use `.env.local` for local development
   - Never commit sensitive data
   - Use environment variables for API keys
   - Validate environment variables on startup

### Content Security

1. **XSS Prevention:**
   - Sanitize user-generated content
   - Use dangerouslySetInnerHTML sparingly
   - Validate and escape user inputs
   - Implement Content Security Policy

## Daily Development Checklist

### Before Starting Work

- [ ] Pull latest changes from main
- [ ] Create feature branch for today's work
- [ ] Review project board and priorities
- [ ] Check for any urgent issues or feedback

### During Development

- [ ] Commit changes frequently with descriptive messages
- [ ] Test features on multiple screen sizes
- [ ] Check console for errors and warnings
- [ ] Validate accessibility features
- [ ] Monitor performance impact

### End of Day

- [ ] Push feature branch to remote
- [ ] Create pull request if feature is complete
- [ ] Update project documentation if needed
- [ ] Plan next day's priorities
- [ ] Tag team members for review if needed

## Emergency Procedures

### Production Issues

1. **Immediate Response:**
   - Create hotfix branch from main
   - Implement minimal fix
   - Test thoroughly
   - Deploy via fast-track process

2. **Communication:**
   - Notify stakeholders immediately
   - Document the issue and resolution
   - Schedule post-mortem if significant
   - Update monitoring to prevent recurrence

### Data Loss Prevention

1. **Backup Strategy:**
   - Daily automated backups
   - Test restore procedures monthly
   - Keep multiple backup versions
   - Document recovery procedures

This document should be reviewed and updated as the project evolves. All team members are responsible for following these guidelines and suggesting improvements.
