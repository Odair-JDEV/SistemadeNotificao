# Sistema de Gestão de Irregularidades em Postes

## Overview

This is a web-based telecommunications pole irregularity management system built with React, TypeScript, and Vite. The application enables monitoring and management of irregularities found in telecommunications poles, with capabilities for deadline tracking, email notifications, and regularization monitoring. Users can import weekly data files, visualize irregularities grouped by municipality and form number, manage status updates, apply filters, view statistics with charts, and export filtered data to Excel.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 29, 2025)

**Enhanced Excel File Processing**
- Implemented aggressive column name normalization to handle real-world Excel files with varying header formats
- Normalization removes accents (NFD Unicode), punctuation, whitespace, and converts to lowercase
- System now correctly processes headers like "Núm. Formulário", "Num Formulario", "Numero Formulario" as equivalent
- Successfully tested with real IMICRO/WiNET Excel files containing 6,253-11,597 irregularity records

**New Analytics Dashboard**
- Created AnalysisDashboard component with 4 comprehensive charts:
  - Pie chart showing top 10 irregularity types by frequency
  - Bar chart displaying top 10 neighborhoods (bairros) by irregularity count
  - Bar chart analyzing irregularities by telecommunications operator
  - Timeline distribution chart showing overdue periods (vencidas)
- Integrated as new "Análises" tab in the main interface

**Enhanced Filtering System**
- Added logradouro (street name) search filter
- Added irregularity type (tipo de irregularidade) search filter
- Filters work seamlessly with existing municipality and status filters

**Performance Optimization**
- Installed @tanstack/react-virtual (v3.13.12) for future virtualization of large datasets
- System ready to handle 10,000+ records efficiently

## System Architecture

### Frontend Stack

**Framework & Build Tool**
- React 18.3.1 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR and optimized builds
- React Router (wouter) for lightweight client-side routing

**UI Component Library**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui design system built on top of Radix UI
- Tailwind CSS for utility-first styling with custom design tokens
- Custom CSS variables for theme management (dark mode support)

**State Management & Data Fetching**
- TanStack React Query (v5.83.0) for server state management and caching
- Local React state (useState, useMemo) for UI state
- No global state management library (Redux/Zustand) - component-level state only

**Data Visualization**
- Recharts library for rendering charts (bar charts, pie charts)
- Custom AnalysisDashboard and FluxoChart components for data visualization

**Key Architectural Decisions**

1. **Component-Based Architecture**: The application follows a modular component structure with clear separation of concerns:
   - UI components in `src/components/ui/` (design system primitives)
   - Feature components in `src/components/` (FileUpload, IrregularityTable, Filters, etc.)
   - Page components in `src/pages/`

2. **Type Safety**: TypeScript interfaces define the data model (Irregularity, IrregularityStats) in `src/types/irregularity.ts`, ensuring type safety across the application.

3. **Client-Side Data Processing**: All data processing happens in the browser:
   - Excel/JSON file parsing using xlsx library
   - Data transformation and filtering in React components
   - No backend API calls - fully static frontend application

4. **Grouping & Virtualization**: 
   - IrregularityTable groups data by form number (numFormulario) with expandable rows
   - TanStack Virtual (v3.13.12) included for potential virtualization of large datasets

5. **File Import Strategy**: 
   - Dual upload components (FileUpload for initial import, UpdateFileUpload for incremental updates)
   - Column name normalization to handle variations in Excel headers
   - Preservation of already regularized items during updates

### Data Model

**Core Entity: Irregularity**
```typescript
interface Irregularity {
  municipio: string           // Municipality
  numFormulario: string       // Form number (grouping key)
  numeroPoste: string         // Pole number (unique identifier)
  operadora: string           // Telecommunications operator
  irregularidade: string      // Type of irregularity
  vencidas: number           // Days overdue (negative if expired)
  noPrazo: string            // Whether within deadline
  emailEnviado: string       // Email sent status
  dataEnvioEmail: string     // Email send date
  regularizado: string       // Regularization status ("Sim"/"Não")
  statusVerificacao: "normal" | "aguardando_verificacao_jvm"
  bairro: string             // Neighborhood
  logradouro: string         // Street name
  numLogradouro: string      // Street number
}
```

**Status Verification System**: Items marked as regularized that reappear in new imports are flagged with `statusVerificacao: "aguardando_verificacao_jvm"` for manual verification.

### File Processing

**Supported Formats**
- Excel (.xlsx) files via SheetJS (xlsx library)
- JSON files for direct data import

**Import Strategy**
- Initial import: Complete data replacement
- Update import: Merges new data while preserving regularized items
- Chart data import: Separate handling for weekly flow statistics

**Column Mapping**: Flexible column name matching using normalization (removing accents, special characters, whitespace) to handle variations in Excel header names.

### Filtering & Search

Multi-dimensional filtering system:
- Text search across all fields
- Municipality dropdown filter
- Status filter (overdue, on time, regularized, pending)
- Street name (logradouro) search
- Irregularity type filter

Filters are applied using memoized computed values to optimize performance.

### Export Functionality

Excel export using xlsx library:
- Exports filtered data to spreadsheet
- Multiple sheets for different data views
- Formatted columns with proper headers

### Styling Architecture

**Design System**
- HSL-based color system defined in CSS variables
- Dark mode support via CSS class toggling (next-themes)
- Responsive design with Tailwind breakpoints
- Custom color palette: primary (blue), success (green), warning (yellow), destructive (red)

**Component Variants**
- class-variance-authority (CVA) for type-safe variant management
- Consistent component APIs across the design system

### Development Configuration

**TypeScript Configuration**
- Strict mode disabled for faster development
- Path aliases (@/* pointing to src/*)
- React JSX transformation

**Vite Configuration**
- Replit-specific HMR configuration (WebSocket on port 443)
- SWC-based React plugin for fast refresh
- Development server on port 5000

**Code Quality**
- ESLint with TypeScript support
- React hooks linting rules
- Unused variables warnings disabled for development flexibility

## External Dependencies

### UI Framework Dependencies
- **@radix-ui/***: Collection of accessible, unstyled UI primitives (accordion, dialog, dropdown, select, tabs, etc.)
- **lucide-react**: Icon library for consistent iconography
- **next-themes**: Theme management for dark/light mode switching
- **class-variance-authority**: Type-safe component variant management
- **tailwindcss**: Utility-first CSS framework
- **cmdk**: Command palette component

### Data Management
- **@tanstack/react-query**: Server state management and caching
- **@tanstack/react-virtual**: Virtual scrolling for large lists
- **react-hook-form** + **@hookform/resolvers**: Form state management with validation
- **zod**: Schema validation (via hookform resolvers)

### Data Processing & Visualization
- **xlsx**: Excel file parsing and generation
- **recharts**: Chart rendering library
- **date-fns**: Date manipulation and formatting

### Routing & UI Components
- **wouter**: Lightweight routing library
- **react-day-picker**: Date picker component
- **embla-carousel-react**: Carousel/slider component
- **input-otp**: OTP input component
- **vaul**: Drawer component

### Build Tools
- **vite**: Build tool and dev server
- **@vitejs/plugin-react-swc**: React plugin with SWC compiler
- **typescript**: Type checking
- **eslint**: Code linting
- **postcss** + **autoprefixer**: CSS processing

### Development Environment
- Configured for Replit hosting with custom HMR settings
- No backend services - purely static frontend application
- No database integration - all data stored in browser memory during session