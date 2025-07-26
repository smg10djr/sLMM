# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Sakai Vue**, a Vue 3 application template based on PrimeVue components and the Aura theme. It's built with Vite and uses a modern tech stack including Vue Router, Tailwind CSS (with PrimeUI plugin), and Sass. The application serves as a comprehensive admin dashboard template with multiple UI components and documentation pages.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter with auto-fix
npm run lint
```

## Architecture Overview

### Core Framework Stack
- **Vue 3** with Composition API
- **PrimeVue 4.3.1** with Aura theme preset
- **Vue Router 4** for client-side routing
- **Vite 5** for build tooling
- **Tailwind CSS** with PrimeUI plugin for styling
- **Sass** for advanced stylesheet features

### Application Structure

**Layout System**: The app uses a sophisticated layout system centered around `AppLayout.vue` that manages sidebar states, responsive behavior, and theme switching:
- `useLayout()` composable in `src/layout/composables/layout.js` provides centralized layout state management
- Layout supports both static and overlay menu modes with responsive mobile handling
- Dark mode toggle with CSS custom properties and view transitions API

**Routing Architecture**: Nested route structure with the main `AppLayout` as the parent container:
- Dashboard and UI kit pages are children of the main layout
- Standalone pages for landing, authentication (login, access, error)
- All routes use lazy loading with dynamic imports

**Component Organization**:
- `src/components/dashboard/` - Dashboard-specific widgets (stats, sales, revenue)
- `src/components/landing/` - Landing page sections (hero, features, pricing)
- `src/views/uikit/` - Documentation/demo pages for UI components
- `src/views/pages/` - Application pages (CRUD, empty states, auth)
- `src/layout/` - Layout components and composables

**Service Layer**: Mock data services for development/demo purposes:
- `ProductService`, `CustomerService`, `CountryService`, etc.
- Services provide static JSON data for component examples
- Data files located in `public/demo/data/`

### Styling System

**Multi-layered Approach**:
- PrimeVue Aura theme with CSS custom properties
- Tailwind CSS with PrimeUI plugin integration
- Custom Sass modules in `src/assets/layout/` for layout-specific styles
- Theme variables split into `_light.scss`, `_dark.scss`, and `_common.scss`

**Theme Configuration**:
- Dark mode selector: `.app-dark` class toggle
- Primary color system with emerald default
- Responsive breakpoints: sm(576px), md(768px), lg(992px), xl(1200px), 2xl(1920px)

### State Management

**Layout State**: Centralized in `useLayout()` composable with reactive properties:
- Menu states (desktop/mobile, overlay/static)
- Theme preferences (dark mode, primary colors)
- Active menu item tracking
- Sidebar visibility controls

**Global Services**: 
- `ToastService` for notifications
- `ConfirmationService` for dialogs

### Build Configuration

**Vite Setup**:
- Auto-import resolver for PrimeVue components
- Path alias `@` points to `src/`
- Optimized dependencies with `noDiscovery: true`

**Development Tools**:
- Stagewise plugins for development toolbar (dev only)
- ESLint with Vue and Prettier integration
- PostCSS with Autoprefixer

## Key Patterns

**Composition API Usage**: All components use `<script setup>` syntax with reactive state management through the `useLayout()` composable.

**Component Auto-Import**: PrimeVue components are auto-imported via the resolver, no manual imports needed.

**Responsive Layout**: The layout system automatically adapts between desktop static menu and mobile overlay menu based on screen width (991px breakpoint).

**Theme System**: Dynamic theme switching with CSS custom properties and view transitions for smooth dark/light mode changes.

When working with this codebase, follow the existing patterns for new components, utilize the centralized layout state management, and maintain the separation between layout, page, and component concerns.