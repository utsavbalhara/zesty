# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup` - Initialize project setup

### Database Commands
- `npm run db:migrate` - Migrate from JSON to SQLite database
- `npm run db:sqlite-reset` - Reset SQLite database completely
- `npm run db:zesty-reset` - Reset Zesty database (current primary database)
- `npm run db:init` - Initialize JSON database (legacy)
- `npm run db:backup` - Backup current database
- `npm run db:view` - View JSON database contents (requires jq)
- `npm run db:test` - Test database operations

## Database Architecture

The project uses **SQLite** as the primary database with `better-sqlite3`. The database system has two key components:

### Database Files
- **Primary**: `src/lib/sqlite.ts` - Main database operations with prepared statements
- **Interface**: `src/lib/db.ts` - High-level database interface used by API routes
- **Schema**: `src/lib/schema.sql` - Complete database schema with indexes
- **Migration**: `scripts/migrate-to-sqlite.js` - JSON to SQLite migration tool

### Key Database Features
- **Prepared Statements**: All database operations use prepared statements for performance
- **WAL Mode**: Database configured with Write-Ahead Logging for better concurrency
- **Foreign Keys**: Enforced with cascading deletes
- **Comprehensive Indexes**: Optimized for common query patterns
- **Automatic Notifications**: System creates notifications for user interactions

### Database Schema
Core entities: `users`, `posts`, `likes`, `reposts`, `comments`, `follows`, `messages`, `notifications`, `marketplace`

**Note**: The codebase is transitioning from Twitter-like terminology to a college-focused platform called "Zesty":
- Database uses `posts`/`reposts` but components still use `Tweet*` naming
- Marketplace functionality added for college community e-commerce
- User schema includes college-specific fields: `degree`, `branch`, `section`, `hostel`

## API Routes Architecture

### Authentication Patterns
All protected routes use:
```typescript
const session = await getServerSession(authOptions)
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Route Structure
- **RESTful design**: GET for fetching, POST for creating/toggling
- **Consistent error handling**: All routes return structured error responses
- **Parameter validation**: Input validation with appropriate error messages
- **Database integration**: Direct use of `db` object from `@/lib/db`

### Key API Patterns
- **Toggle operations**: Likes, reposts, and follows use toggle endpoints
- **Nested resources**: `/api/posts/[id]/like`, `/api/users/[id]/follow`
- **Marketplace endpoints**: `/api/marketplace/*` for e-commerce functionality
- **User filtering**: `/api/users/filter/*` for college-specific user searches
- **Automatic notifications**: Created for user interactions (likes, follows, etc.)

## Authentication System

### NextAuth.js Configuration
- **Providers**: Credentials (primary), Google, GitHub (conditional)
- **Session Strategy**: JWT-based sessions
- **Custom Callbacks**: Includes username in session
- **Custom Pages**: `/auth/signin` for sign-in UI

### Security Notes
- **Demo Mode**: Passwords are NOT hashed (development only)
- **Production TODO**: Implement proper password hashing with bcrypt
- **OAuth**: Google/GitHub providers only active with environment variables

## Component Architecture

### Layout System
- **MainLayout**: Wrapper with sidebar navigation for authenticated users
- **Conditional Layout**: Shows different layouts based on authentication state
- **Three-column Layout**: Sidebar, main content, right sidebar

### Component Patterns
- **Client Components**: All interactive components use `'use client'`
- **Session Integration**: Components use `useSession()` for user state
- **Optimistic Updates**: UI updates immediately, then syncs with server
- **Error Boundaries**: Loading states and error handling built-in

### Key Components
- **TweetCard**: Complete post display with interactions (naming inconsistency - handles posts despite name)
- **TweetComposer**: Post creation component (naming inconsistency)
- **TweetFeed**: Post feed display (naming inconsistency)
- **AuthProvider**: NextAuth session provider wrapper
- **UI Components**: Reusable Avatar, Button, Input, Textarea components

**Naming Note**: Components use `Tweet*` naming but actually handle `posts` data from the database.

## TypeScript Integration

### Type Definitions
- **Database Types**: Defined in `src/lib/sqlite.ts`
- **NextAuth Types**: Extended in `src/types/next-auth.d.ts`
- **Consistent Interfaces**: All components use properly typed props

## Development Workflow

### Making Database Changes
1. Update schema in `src/lib/schema.sql`
2. Run `npm run db:zesty-reset` to recreate database (current primary)
3. Update TypeScript interfaces in `src/lib/sqlite.ts`
4. Update database operations in `src/lib/db.ts`

### Working with Marketplace Features
- Marketplace items have categories, conditions, pricing
- User filtering supports college-specific attributes (degree, branch, section, hostel)
- All marketplace operations follow the same authentication patterns as social features

### Adding New Features
1. Create API route following existing patterns
2. Add database operations to `src/lib/db.ts`
3. Create/update React components
4. Test with development server

### Code Style
- **Tailwind CSS**: All styling uses Tailwind classes
- **TypeScript**: Strict typing throughout
- **ESLint**: Follow Next.js ESLint configuration
- **Component Structure**: Separate UI components from business logic