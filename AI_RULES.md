# AI Development Rules for PropertyHub

## Project Overview
PropertyHub is a comprehensive Vietnamese real estate investment platform that provides legal analysis, ROI calculations, market insights, and project comparisons for property investors.

## Tech Stack

- **Framework**: React 18 with TypeScript and Vite for fast development
- **Routing**: React Router v6 for client-side navigation (routes defined in `src/App.tsx`)
- **UI Components**: shadcn/ui library with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with custom design system (defined in `src/index.css`)
- **Backend**: Supabase for authentication, database, and real-time features
- **State Management**: React Query (@tanstack/react-query) for server state and data fetching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Charts**: Recharts for data visualization and analytics
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date formatting and manipulation

## Component Architecture Rules

### File Organization
- **Pages**: All page components go in `src/pages/` (e.g., `Home.tsx`, `ProjectDetail.tsx`)
- **Reusable Components**: Place in `src/components/` with logical subdirectories:
  - `src/components/project/` - Project-related components
  - `src/components/admin/` - Admin dashboard components
  - `src/components/layout/` - Layout components (sidebar, navigation)
  - `src/components/ui/` - shadcn/ui components (DO NOT EDIT)
- **Hooks**: Custom hooks in `src/hooks/` (e.g., `useAuth.tsx`, `useFavorites.tsx`)
- **Utils**: Utility functions in `src/utils/` (e.g., `roiCalculations.ts`)
- **Types**: TypeScript types in `src/types/` (e.g., `project.ts`, `developer.ts`)
- **Data**: Static data in `src/data/` (e.g., `projectsData.ts`, `developersData.ts`)

### Component Guidelines
- Keep components under 200 lines - split into smaller components if needed
- Use TypeScript interfaces for all props
- Export components as default exports
- Use named exports for utility functions and types
- Always use "use client" directive at the top of client components

## UI Library Rules

### shadcn/ui Components
- **NEVER edit files in `src/components/ui/`** - these are pre-built shadcn components
- Import and use existing shadcn components: Button, Card, Input, Select, Dialog, Tabs, etc.
- If you need custom behavior, create a NEW component that wraps the shadcn component
- All shadcn components and their Radix UI dependencies are already installed

### Custom Components
- Create new components in appropriate subdirectories under `src/components/`
- Use Tailwind CSS classes extensively for styling
- Follow the design system defined in `src/index.css` (CSS variables and utility classes)
- Use custom utility classes like `card-elevated`, `btn-modern`, `text-headline-1`, etc.

## Styling Rules

### Tailwind CSS
- **Primary approach**: Use Tailwind utility classes for all styling
- Use design system CSS variables: `bg-primary`, `text-foreground`, `border-border`, etc.
- Leverage custom utility classes defined in `src/index.css`:
  - Cards: `card-modern`, `card-elevated`, `card-glass`, `card-floating`, `card-hero`
  - Buttons: `btn-modern`, `btn-gradient`
  - Typography: `text-headline-1`, `text-headline-2`, `text-body`, `text-caption`
  - Interactions: `interactive-hover`, `hover-scale`
- Use gradient utilities: `bg-gradient-primary`, `bg-gradient-hero`, `bg-gradient-subtle`
- Use shadow utilities: `shadow-subtle`, `shadow-medium`, `shadow-strong`, `shadow-glow`

### Responsive Design
- **Mobile-first approach**: Always design for mobile first, then enhance for desktop
- Use responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Check `useIsMobile()` hook to conditionally render mobile vs desktop layouts
- Mobile uses `BottomNavigation`, desktop uses `DesktopLayout` with sidebar

## Data Management Rules

### Supabase Integration
- Use `supabase` client from `@/integrations/supabase/client`
- Authentication via `useAuth()` hook - provides `user`, `signIn`, `signUp`, `signOut`
- Database tables:
  - `projects` - Real estate projects
  - `favorites` - User favorite projects
  - `consultation_requests` - Consultation form submissions
  - `user_roles` - User role management (admin, moderator, user)
  - `admin_logs` - Admin activity logging
  - `content_items` - CMS content (pages, news, banners)
  - `project_views` - Analytics tracking

### Custom Hooks
- `useAuth()` - Authentication state and methods
- `useAdmin()` - Admin role checking and admin data management
- `useFavorites()` - Favorite projects management
- `useContent()` - CMS content management
- `useProjectViews()` - Track project views for analytics
- `useAnalytics()` - Google Analytics event tracking
- `useIsMobile()` - Responsive design helper

## Feature-Specific Rules

### Project Cards
- Use `ProjectCard` for list views
- Use `EnhancedProjectCard` for mobile-optimized views
- Use `CompactProjectCard` for compact displays
- Use `ProjectGridCard` for grid layouts
- Always include `FavoriteButton` component
- Display ROI data using utilities from `src/utils/roiCalculations.ts`

### Admin Features
- Check `isAdmin` from `useAdmin()` hook before showing admin UI
- Log all admin actions using the admin logging system
- Admin components in `src/components/admin/`
- Admin route at `/admin` with role-based access control

### Analytics & SEO
- Use `SEOHead` component for meta tags on all pages
- Include `BreadcrumbSchema` for breadcrumb navigation
- Use `SchemaMarkup` for structured data (Organization, RealEstate, FAQ)
- Track events with `useAnalytics()` hook
- AdSense integration via `BannerAd` and `SidebarAd` components
- Configure analytics in `src/config/analytics.ts`

### Forms
- Use React Hook Form with Zod validation
- Consultation forms use `ConsultationForm` or `ImprovedConsultationForm`
- Always validate user input
- Show loading states during submission
- Use toast notifications for feedback

## Vietnamese Language
- All UI text MUST be in Vietnamese
- Use proper Vietnamese formatting for dates, currency, and numbers
- Currency format: `new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`
- Date format: Use `date-fns` with `vi` locale

## Performance Rules
- Use lazy loading for heavy components (already implemented in `App.tsx`)
- Optimize images with proper `loading="lazy"` attributes
- Use `useMemo` and `useCallback` for expensive calculations
- Implement pagination for large lists
- Use React Query for data caching and background updates

## Security Rules
- Never expose sensitive data in client-side code
- Use Supabase RLS (Row Level Security) for data access control
- Validate all user inputs
- Use environment variables for API keys (configure in Supabase dashboard)
- Admin actions must be logged in `admin_logs` table

## Code Quality Rules
- Use TypeScript strictly - no `any` types unless absolutely necessary
- Follow existing naming conventions (camelCase for variables, PascalCase for components)
- Add proper error handling with try-catch blocks
- Use toast notifications for user feedback
- Comment complex logic and calculations
- Keep functions focused and single-purpose

## DO NOT
- ❌ Edit files in `src/components/ui/` (shadcn components)
- ❌ Remove or modify the authentication system
- ❌ Change the routing structure in `App.tsx` without good reason
- ❌ Hardcode data that should come from Supabase
- ❌ Use inline styles - always use Tailwind classes
- ❌ Create duplicate components - reuse existing ones
- ❌ Ignore mobile responsiveness
- ❌ Skip TypeScript type definitions

## DO
- ✅ Use existing shadcn/ui components by importing them
- ✅ Create new components in appropriate subdirectories
- ✅ Follow the established design system and color scheme
- ✅ Use custom hooks for shared logic
- ✅ Implement proper loading and error states
- ✅ Add SEO meta tags and structured data
- ✅ Test on both mobile and desktop viewports
- ✅ Use the existing utility functions (ROI calculations, price formatting, etc.)
- ✅ Follow the Vietnamese language requirement
- ✅ Maintain the professional blue color scheme

## Design System
- **Primary Color**: Professional dark blue (`hsl(220 60% 45%)`)
- **Accent Color**: Bright blue (`hsl(210 80% 45%)`)
- **Success**: Green (`hsl(142 71% 45%)`)
- **Warning**: Orange (`hsl(38 92% 50%)`)
- **Destructive**: Red (`hsl(0 84% 60%)`)
- **Gradients**: Use predefined gradients like `bg-gradient-hero`, `bg-gradient-primary`
- **Shadows**: Use shadow utilities like `shadow-subtle`, `shadow-glow`, `shadow-blue`

## Common Patterns

### Creating a new page
1. Create file in `src/pages/PageName.tsx`
2. Add route in `src/App.tsx`
3. Use `DesktopLayout` wrapper for desktop or conditional rendering for mobile
4. Add `SEOHead` component with proper meta tags
5. Include `BottomNavigation` for mobile views

### Adding a new feature
1. Check if similar functionality exists
2. Create necessary types in `src/types/`
3. Create custom hook if needed in `src/hooks/`
4. Build UI components in `src/components/`
5. Integrate with Supabase if data persistence needed
6. Add proper error handling and loading states

### Working with Supabase
1. Import client: `import { supabase } from '@/integrations/supabase/client'`
2. Use async/await with try-catch
3. Check for errors: `if (error) throw error`
4. Update local state after successful operations
5. Show toast notifications for user feedback

## Testing Checklist
- [ ] Works on mobile (< 768px width)
- [ ] Works on desktop (>= 768px width)
- [ ] All text is in Vietnamese
- [ ] Proper loading states shown
- [ ] Error handling implemented
- [ ] Toast notifications for user actions
- [ ] SEO meta tags included
- [ ] Follows design system colors and spacing
- [ ] TypeScript types are correct
- [ ] No console errors