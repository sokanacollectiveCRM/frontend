# Client Management System Documentation

## Overview

The Client Management System is a comprehensive CRM solution for Sokana Collective that manages client relationships, service requests, and contract workflows. The system provides a modern, responsive interface for viewing, editing, and managing client information with role-based access control.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Core Features](#core-features)
3. [Data Structure](#data-structure)
4. [User Interface](#user-interface)
5. [API Integration](#api-integration)
6. [Contract Management](#contract-management)
7. [Status Management](#status-management)
8. [Technical Implementation](#technical-implementation)
9. [Known Issues](#known-issues)
10. [Future Enhancements](#future-enhancements)

## System Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components
- **State Management**: React Context + React Hook Form
- **Validation**: Zod schema validation
- **Styling**: Tailwind CSS with CSS Modules
- **Build Tool**: Vite

### Backend Integration
- **API Base URL**: `http://localhost:5050` (configurable via `VITE_APP_BACKEND_URL`)
- **Authentication**: JWT token-based
- **Data Format**: JSON with nested user objects

## Core Features

### ✅ Functional Features

#### 1. Client Data Display
- **Client List**: Displays 30+ clients in a paginated table
- **Search & Filter**: Real-time search functionality
- **Sorting**: Sortable columns for Requested Date and Status
- **Pagination**: 10 items per page with navigation controls

#### 2. Client Information Management
- **View Client Details**: Complete client profiles with contact information
- **Edit Client Data**: Update names, email, phone numbers
- **Status Tracking**: Monitor client progression through service pipeline
- **Service History**: Track requested services and timelines

#### 3. Status Management
- **Available Statuses**: lead, contacted, matching, interviewing, follow up, contract, active, complete, customer
- **Real-time Updates**: Status changes via dropdown in table
- **Visual Indicators**: Clear status labels with proper styling
- **API Integration**: Backend updates with automatic refresh

#### 4. User Interface
- **Responsive Design**: Mobile-friendly layout
- **Modern UI**: Clean, professional interface
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error feedback

#### 5. Data Processing
- **API Integration**: Fetches from `/clients` endpoint
- **Data Transformation**: Handles nested user object structure
- **Validation**: Zod schema validation for type safety
- **Error Recovery**: Fallback mechanisms for parsing failures

### ❌ Partially Functional Features

#### Contract Management
- **Current State**: Template-based document generation (not e-signature)
- **Workflow**: Drag-and-drop template → client row → generate PDF
- **Limitations**: 
  - No digital signatures
  - No client signing interface
  - No contract status tracking
  - Poor UX (drag-and-drop not intuitive)

## Data Structure

### Client Object Schema
```typescript
interface Client {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  role: string;
  serviceNeeded: string;
  requestedAt: Date;
  updatedAt: Date;
  status: UserStatus;
  // Additional fields from nested user object
  uuid?: string;
  text?: string;
  zip_code?: string;
  health_history?: string;
  allergies?: string;
}
```

### API Response Structure
```javascript
{
  "id": "client-id",
  "user": {
    "id": "user-id",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "role": "client",
    // ... other user fields
  },
  "serviceNeeded": "Labor Support",
  "requestedAt": "2025-06-02T00:00:00.000Z",
  "updatedAt": "2025-06-02T00:00:00.000Z",
  "status": "lead",
  "phoneNumber": "555-123-4567"
}
```

## User Interface

### Main Components

#### 1. Clients Table (`src/features/clients/components/ClientsTable.tsx`)
- **Data Display**: Client names, services, dates, status
- **Interactive Elements**: Sortable columns, status dropdowns
- **Row Actions**: Edit, delete options via dropdown menu
- **Drag-and-Drop**: Template dropping for contract creation

#### 2. Edit User Modal (`src/features/clients/components/users-action-dialog.tsx`)
- **Form Fields**: First Name, Last Name, Email, Phone Number
- **Validation**: Real-time form validation
- **Optimized Spacing**: Compact layout with minimal whitespace
- **API Integration**: Updates client data via backend

#### 3. Primary Action Buttons (`src/features/clients/components/users-primary-buttons.tsx`)
- **Export Functionality**: CSV export for demographic data
- **Create Contract**: Template selection popover
- **Search Templates**: Filter templates by name

### UI Features
- **Responsive Grid**: Adapts to different screen sizes
- **Floating Labels**: Animated form labels
- **Loading States**: Skeleton loaders and spinners
- **Error Boundaries**: Graceful error handling
- **Accessibility**: ARIA labels and keyboard navigation

## API Integration

### Endpoints Used

#### 1. Client Management
```typescript
// Fetch all clients
GET /clients
Headers: Authorization: Bearer {token}

// Update client status
PUT /clients/status
Body: { clientId: string, status: string }

// Update client information
PUT /clients/{id}
Body: { firstname, lastname, email, phone_number, etc. }
```

#### 2. Contract Management
```typescript
// Create contract
POST /contracts
Body: {
  templateId: string,
  clientId: string,
  fields: { clientname, fee, deposit },
  note: string,
  fee: string,
  deposit: string
}

// Get templates
GET /contracts/templates
```

### Error Handling
- **Network Errors**: User-friendly error messages
- **Validation Errors**: Field-specific error display
- **Authentication Errors**: Automatic logout on token expiry
- **API Errors**: Backend error message display

## Contract Management

### Current Implementation
- **Template System**: Upload `.docx` templates with fees/deposits
- **PDF Generation**: Backend generates PDFs with client data
- **Drag-and-Drop**: Templates can be dragged onto client rows
- **Form Integration**: Contract creation dialog with custom fields

### Limitations
- **No E-Signatures**: No digital signature capabilities
- **No Client Signing**: No client-facing signing interface
- **No Status Tracking**: No contract lifecycle management
- **Poor UX**: Drag-and-drop workflow is not intuitive

### Workflow
1. Upload template via Contracts page
2. Click "Create Contract" → Opens template popover
3. Drag template → Drop on client row
4. Fill contract form → Generate PDF
5. Download/Save contract

## Status Management

### Available Statuses
```typescript
type UserStatus = 
  | 'lead'           // New client inquiry
  | 'contacted'      // Initial contact made
  | 'matching'       // Finding appropriate doula
  | 'interviewing'   // Client-doula interview
  | 'follow up'      // Post-interview follow-up
  | 'contract'       // Contract in progress
  | 'active'         // Service in progress
  | 'complete'       // Service completed
  | 'customer'       // Retained client
```

### Status Labels
```typescript
const STATUS_LABELS: Record<UserStatus, string> = {
  lead: 'Lead',
  contacted: 'Contacted',
  matching: 'Matching',
  interviewing: 'Interviewing',
  'follow up': 'Follow Up',
  contract: 'Contract',
  active: 'Active',
  complete: 'Complete',
  customer: 'Customer',
};
```

## Technical Implementation

### Key Files Structure
```
src/features/clients/
├── Clients.tsx                    # Main client page
├── components/
│   ├── ClientsTable.tsx          # Data table component
│   ├── users-action-dialog.tsx   # Edit user modal
│   ├── users-primary-buttons.tsx # Action buttons
│   ├── DraggableTemplate.tsx     # Template drag component
│   └── DroppableTableRow.tsx     # Drop target for templates
├── contexts/
│   ├── ClientsContext.tsx        # Client data context
│   └── TableContext.tsx          # Table state management
├── data/
│   └── schema.ts                 # Zod validation schemas
└── create-customer/              # Client creation flow
```

### State Management
- **ClientsContext**: Manages client data fetching and caching
- **TableContext**: Handles table state, dialogs, and row selection
- **TemplatesContext**: Manages contract templates
- **UserContext**: Handles authentication and user data

### Data Flow
1. **Initial Load**: `useClients` hook fetches client data
2. **Data Processing**: API response transformed to frontend schema
3. **Validation**: Zod validates data structure
4. **State Update**: Context providers update component state
5. **UI Render**: Components display validated data

## Known Issues

### 1. Contract Creation UX
- **Issue**: Drag-and-drop workflow is not intuitive
- **Impact**: Users expect click-to-create functionality
- **Status**: Partially functional but poor UX

### 2. Permission System
- **Issue**: Admin-only access temporarily disabled
- **Impact**: All users can access client management
- **Status**: Ready for role-based permissions

### 3. Data Parsing
- **Issue**: Complex nested user object structure
- **Impact**: Potential validation errors
- **Status**: Working with fallback mechanisms

### 4. Template Management
- **Issue**: No e-signature integration
- **Impact**: Limited contract functionality
- **Status**: Document generation only

## Future Enhancements

### High Priority
1. **Direct Contract Creation**: Add click-to-create workflow
2. **E-Signature Integration**: Implement DocuSign/HelloSign
3. **Role-Based Permissions**: Restore admin-only features
4. **Contract Status Tracking**: Add lifecycle management

### Medium Priority
1. **Client Communication**: Email/SMS integration
2. **Document Management**: File upload and storage
3. **Reporting**: Analytics and insights
4. **Mobile App**: Native mobile application

### Low Priority
1. **Advanced Search**: Multi-field search and filters
2. **Bulk Operations**: Mass status updates
3. **Import/Export**: Enhanced data portability
4. **Audit Trail**: Complete activity logging

## Performance Considerations

### Current Optimizations
- **Lazy Loading**: Components load on demand
- **Caching**: Client data cached in context
- **Debounced Search**: Real-time search with delays
- **Pagination**: Large datasets handled efficiently

### Recommended Improvements
- **Virtual Scrolling**: For large client lists
- **Data Prefetching**: Anticipate user actions
- **Image Optimization**: Profile picture compression
- **Bundle Splitting**: Reduce initial load size

## Security Considerations

### Current Security
- **JWT Authentication**: Token-based auth
- **HTTPS**: Secure API communication
- **Input Validation**: Client-side and server-side validation
- **XSS Protection**: React's built-in protection

### Recommended Enhancements
- **Rate Limiting**: API request throttling
- **Data Encryption**: Sensitive data encryption
- **Audit Logging**: Security event tracking
- **Multi-Factor Auth**: Enhanced authentication

## Conclusion

The Client Management System provides a solid foundation for managing client relationships with modern UI/UX patterns and robust data handling. While the core functionality is complete and functional, the contract management feature requires UX improvements and e-signature integration to be fully production-ready.

The system demonstrates good architectural patterns with proper separation of concerns, type safety, and responsive design. With the recommended enhancements, it can become a comprehensive CRM solution for doula service management.

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintainer**: Development Team 