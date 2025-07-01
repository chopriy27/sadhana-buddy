# Sadhana Buddy - Spiritual Practice Tracker

## Overview

Sadhana Buddy is a comprehensive spiritual practice tracking application designed for devotees of Krishna consciousness and spiritual seekers. The application provides tools for tracking daily spiritual practices (sadhana), journaling spiritual insights, accessing devotional content, and monitoring personal spiritual progress.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Build Tool**: Vite for fast development and optimized production builds
- **Mobile-First Design**: Responsive design with bottom navigation for mobile experience

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for RESTful API
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Connect-pg-simple for PostgreSQL-based sessions

## Key Components

### 1. Sadhana Tracking System
- **Purpose**: Track daily spiritual practices including chanting rounds, reading, morning prayers (Mangala Arati), and evening programs
- **Features**: Goal setting, progress visualization, streak tracking
- **Database Schema**: `sadhana_entries` table with user-specific daily records

### 2. Journal System
- **Purpose**: Record spiritual insights, reflections, and experiences
- **Features**: Mood tagging, categorization, rich text entries
- **Database Schema**: `journal_entries` table with title, content, mood, and timestamps

### 3. Devotional Content Library
- **Purpose**: Provide access to spiritual songs, lectures, and daily verses
- **Content Types**: 
  - Devotional songs (bhajans, kirtans, prayers)
  - Spiritual lectures by teachers
  - Daily verses from scriptures
- **Database Schema**: Separate tables for `devotional_songs`, `lectures`, `daily_verses`, and `festivals`

### 4. Progress Analytics
- **Purpose**: Visualize spiritual progress over time
- **Features**: Completion rates, streak tracking, statistical insights
- **Database Schema**: `user_progress` and `user_challenges` tables

### 5. Challenge System
- **Purpose**: Encourage consistent practice through structured challenges
- **Features**: Time-bound spiritual challenges, progress tracking
- **Database Schema**: `challenges` and `user_challenges` tables

## Data Flow

1. **User Interaction**: Users interact with React components in the client
2. **API Requests**: TanStack Query manages API calls to Express.js backend
3. **Data Processing**: Express routes validate input using Zod schemas
4. **Database Operations**: Drizzle ORM handles type-safe database queries
5. **Response**: Data flows back through the same path with appropriate error handling

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe ORM for PostgreSQL
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon
- **wouter**: Lightweight React router
- **zod**: Runtime type validation

### UI Dependencies
- **@radix-ui/***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type safety across the application
- **drizzle-kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Frontend**: Vite development server with HMR
- **Backend**: tsx for TypeScript execution with auto-reload
- **Database**: Neon PostgreSQL with connection pooling

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Deployment**: Single Node.js process serving both API and static files

### Database Management
- **Migrations**: Drizzle-kit handles database schema changes
- **Connection**: Environment variable `DATABASE_URL` for database connection
- **Schema**: Centralized in `shared/schema.ts` for type sharing

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

- July 01, 2025: Initial setup and core application development
- July 01, 2025: Mobile app conversion with Capacitor integration
  - Added Capacitor for iOS and Android deployment
  - Implemented mobile-specific features (haptic feedback, splash screen, status bar)
  - Added PWA manifest and mobile-optimized CSS
  - Created app icons and mobile UI improvements
  - Ready for App Store deployment
- July 01, 2025: Integrated authentic Vaishnava calendar for event reminders
  - Built calendar parser to extract 235+ festivals and observances from uploaded calendar
  - Integrated Ekadasi fasting days, appearance/disappearance days, and sacred festivals
  - Fixed text visibility issues in festival banner and daily verse components
  - Festival reminders now show authentic ISKCON calendar events with proper dates

## Mobile App Deployment

The application has been configured as a native mobile app using Capacitor:

### iOS Deployment
1. The `ios/` platform has been added
2. App configured with proper iOS metadata and icons
3. Ready for Xcode compilation and App Store submission

### Android Deployment  
1. The `android/` platform has been added
2. App configured with proper Android metadata
3. Ready for Android Studio compilation and Google Play Store submission

### Build Commands
- `npm run build` - Builds the web assets
- `npx cap sync` - Syncs web assets to native platforms
- `npx cap open ios` - Opens in Xcode for iOS development
- `npx cap open android` - Opens in Android Studio for Android development