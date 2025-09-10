# KMRL Document Management System

## Overview

The KMRL Document Management System is a Next.js web application designed for Kochi Metro Rail Limited (KMRL) employees to manage and access documents efficiently. The system provides a dashboard-based interface where employees can upload, search, view, and manage documents with role-based access control. The application supports file uploads with metadata tracking, real-time document updates, and department-based filtering capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with TypeScript and App Router
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent UI components
- **State Management**: React hooks (useState, useEffect) with custom hooks for data fetching
- **Authentication Flow**: Client-side authentication with middleware-based route protection
- **Component Structure**: Modular components with separation of concerns (UI components, business logic components, layout components)

### Backend Architecture
- **API Routes**: Next.js API routes for handling authentication, file operations, and filesystem interactions
- **Storage Layer**: File-based storage system using JSON files for user data and filesystem for document storage
- **File Storage**: Local file system storage in `sampleDB` directory with unique timestamp-based naming
- **Authentication**: JWT-based authentication with bcrypt password hashing using file-based user storage
- **Middleware**: Route protection middleware for authenticated vs public routes

### Data Storage Solutions
- **File System Storage**: User authentication data stored as JSON files in `sampleDB/users/` directory
- **File System Storage**: Document metadata and files stored in `sampleDB/` directory with organized structure
- **Physical File Storage**: Documents and their associated metadata (summary.txt, images, etc.) stored in filesystem
- **Real-time Updates**: Polling-based system for document updates using file modification times

### Authentication and Authorization
- **JWT Tokens**: Stored in HTTP-only cookies for session management
- **Role-based Access**: Department-based filtering and access control
- **Route Protection**: Middleware-based authentication checks for protected routes
- **Password Security**: bcrypt hashing with salt rounds for secure password storage

### Key Features and Design Patterns
- **Document Management**: Upload, search, filter, and view documents with metadata tracking
- **Real-time Updates**: Live document update tracking with notification system
- **Department Filtering**: Role-based document filtering by department
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Search Interface**: Advanced search with filters for department, file type, date range, and sender
- **Modal System**: Document preview and detailed view modals
- **Notification System**: User feedback system for actions and updates

## External Dependencies

### Core Framework Dependencies
- **Next.js**: React framework for full-stack web applications
- **React**: UI library with hooks for state management
- **TypeScript**: Type safety and development experience

### Database and Storage
- **File System**: JSON-based user storage for authentication and file metadata tracking
- **bcryptjs**: Password hashing and authentication security
- **fs/path**: Node.js filesystem modules for file operations

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: React component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives for complex UI components
- **Lucide React**: Icon library for consistent iconography

### Utility Libraries
- **JWT (jsonwebtoken)**: Token-based authentication
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class management
- **class-variance-authority**: Component variant management

### Development Tools
- **ESLint**: Code linting and formatting
- **Autoprefixer**: CSS vendor prefixing
- **dotenv**: Environment variable management

### Cloud Services
- **Vercel Analytics**: Application performance monitoring and analytics
- **AWS SDK**: Cloud services integration (credential providers)

The application follows a modern full-stack architecture with clear separation between client and server concerns, implements secure authentication practices, and provides a scalable foundation for document management operations.