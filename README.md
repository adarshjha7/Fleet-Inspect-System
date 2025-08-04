# FleetInspect - Fleet Management & Inspection System

A comprehensive fleet inspection dashboard built for bus companies to manage vehicle inspections, track maintenance alerts, and ensure fleet safety compliance.

## 🚌 Project Overview

FleetInspect is a modern web application that enables bus companies to digitize their vehicle inspection process. The system supports role-based access for drivers and administrators, real-time data synchronization, and comprehensive reporting capabilities.

### Key Features

- **Digital Inspection Forms** - Paperless vehicle inspection with photo/video documentation
- **Role-Based Access Control** - Separate interfaces for drivers and administrators
- **Real-Time Dashboard** - Live fleet status monitoring with maintenance alerts
- **File Management** - Photo and video upload for defect documentation
- **Status Management** - Admin controls for inspection status changes
- **Persistent Storage** - Browser-based data persistence with cross-session sharing
- **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile devices

## 🏗️ Architecture & Technology Stack

### Frontend

- **React 18** - Modern UI library with hooks and functional components
- **TypeScript** - Type-safe development with full IDE support
- **Vite** - Fast development server and build tool
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **React Router 6** - Client-side routing with protected routes
- **Radix UI** - Accessible, unstyled UI primitives

### Backend Integration

- **Express.js** - Node.js web framework for API endpoints
- **localStorage** - Browser-based persistent storage
- **File Serialization** - Base64 encoding for image/video persistence

### Development Tools

- **Vitest** - Unit testing framework
- **ESLint** - Code linting and quality enforcement
- **Prettier** - Code formatting
- **Zod** - Runtime type validation

## 📱 Application Flow

### User Authentication

1. **Login Screen** - Users authenticate with role-based credentials
2. **Role Assignment** - System determines user permissions (Driver/Admin)
3. **Protected Routes** - Automatic redirection based on authentication status

### Driver Workflow

1. **Dashboard Access** - View assigned vehicles and inspection history
2. **Inspection Creation** - Select vehicle and fill out digital inspection form
3. **Safety Checklist** - Complete mandatory safety checks (tires, brakes, lights, fluids)
4. **Defect Reporting** - Document issues with text descriptions
5. **Media Upload** - Attach photos/videos of defects or issues
6. **Form Submission** - Submit inspection with automatic status calculation

### Admin Workflow

1. **Fleet Overview** - Monitor all vehicles and inspection statuses
2. **Maintenance Alerts** - View critical alerts for failed inspections
3. **Report Management** - Access all inspection reports across the fleet
4. **Status Control** - Change inspection statuses (Pass/Fail/Pending)
5. **Alert Management** - Resolve maintenance alerts as issues are addressed

## 🔄 Data Flow Architecture

### Data Storage Layer

```
localStorage (Browser)
├── fleet_vehicles (Vehicle data with current status)
├── fleet_reports (Inspection reports with serialized files)
└── fleet_alerts (Maintenance alerts and notifications)
```

### Context Management

```
React Context Providers
├── AuthProvider (User authentication and role management)
├── InspectionProvider (Fleet data and inspection management)
└── Component Tree (Protected routes and data access)
```

### File Handling

```
File Upload → Base64 Encoding → localStorage → Base64 Decoding → File Preview
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Modern web browser with localStorage support

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd fleetinspect
```

2. **Install dependencies**

```bash
npm install
```

3. **Start development server**

```bash
npm run dev
```

4. **Access the application**

- Open browser to `http://localhost:8080`
- Use demo credentials to login

### Demo Credentials

**Administrator Access:**

- Username: `admin`
- Password: `admin123`
- Permissions: Full access to all features

**Driver Access:**

- Username: `driver1` or `driver2`
- Password: `driver123`
- Permissions: Limited to own inspections

## 📋 API Endpoints

### Authentication

- `POST /login` - User authentication with role verification
- `POST /logout` - Session termination

### Vehicle Management

- `GET /vehicles` - Retrieve fleet vehicle list
- `PUT /vehicles/:id` - Update vehicle status and information

### Inspection Management

- `GET /inspections` - Retrieve inspection reports (filtered by role)
- `POST /inspections` - Submit new inspection report
- `PUT /inspections/:id/status` - Update inspection status (admin only)

### File Management

- `POST /inspections/:id/files` - Upload inspection media files
- `GET /inspections/:id/files` - Retrieve inspection media files

## 🎯 Key Components

### Core Pages

- **Login** (`/login`) - Authentication interface
- **Dashboard** (`/`) - Main fleet overview with statistics
- **Inspection Form** (`/inspection`) - Digital inspection form
- **Reports** (`/reports`) - Inspection history and management

### Shared Components

- **FilePreview** - Image/video preview with modal viewing
- **ProtectedRoute** - Route protection based on authentication
- **Vehicle Cards** - Fleet vehicle status display
- **Maintenance Alerts** - Critical issue notifications

### Context Providers

- **AuthContext** - User authentication and role management
- **InspectionContext** - Fleet data and inspection state management

## 🔒 Security Features

- **Role-Based Access Control** - Drivers see only their data, admins see all
- **Protected Routes** - Automatic redirection for unauthorized access
- **Data Isolation** - User-specific data filtering
- **Session Management** - Persistent login with secure logout

## ���� Data Models

### Vehicle Interface

```typescript
interface Vehicle {
  id: string;
  busNumber: string;
  status: "pass" | "fail" | "pending";
  lastInspectionDate: string;
  odometerReading: number;
  model: string;
  year: number;
  hasDefects: boolean;
}
```

### Inspection Report Interface

```typescript
interface InspectionReport {
  id: string;
  vehicleId: string;
  inspectorName: string;
  date: string;
  odometerReading: number;
  checks: {
    tires: boolean;
    brakes: boolean;
    lights: boolean;
    fluids: boolean;
  };
  defectDescription?: string;
  photos: SerializedFile[];
  videos: SerializedFile[];
  status: "pass" | "fail";
}
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run type checking:

```bash
npm run typecheck
```

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

- **Netlify** - Connect via MCP integration for automatic deployments
- **Vercel** - Connect via MCP integration for serverless deployment
- **Traditional Hosting** - Deploy built files to any static hosting service

## 🔧 Development Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm test` - Run test suite
- `npm run typecheck` - TypeScript validation
- `npm run format.fix` - Format code with Prettier

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:

- Check the troubleshooting section in the docs
- Review the issue tracker for known problems
- Contact the development team

---

**FleetInspect** - Modernizing fleet management through digital innovation.
