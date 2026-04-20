# DigitalErp - Project Documentation

**Version:** 1.0  
**Date:** April 2026  
**Platform:** Web-based ERP System (Printing Industry)

---

## App ka Kaam — Quick Summary (Module by Module)

> **DigitalErp** ek Printing Business ka ERP system hai. Isme total **12 modules** hain:

| # | Module | Kaam (1 line mein) |
|---|---|---|
| 1 | **Dashboard** | Poore business ka ek nazar mein overview — jobs, revenue, alerts |
| 2 | **Masters** | Baaki modules ki neenv — machines, paper, suppliers, users, roles sab define karo |
| 3 | **Production** | Job orders banao, schedule karo, daily machine readings daalo |
| 4 | **Logistics** | Completed jobs ki delivery track karo |
| 5 | **CRM & Sales** | Customers, quotations, invoices — billing sab yahan |
| 6 | **Inventory** | Stock management — kya aaya, kya gaya, kya bacha |
| 7 | **Outsource** | Bahar se karwaye kaam ke vendors aur jobs track karo |
| 8 | **Maintenance** | Machine maintenance schedule karo aur tasks track karo |
| 9 | **Finance** | Job-wise profit/loss, expenses, GST — paisa manage karo |
| 10 | **Reports** | GST, Sales, Production, Financial — sabhi reports |
| 11 | **Management & Settings** | Company settings, users, roles, system config |
| 12 | **Client Portal** | Customer khud apne orders/invoices dekhe — self-service |

### Business Flow (Simple)
```
Masters Setup → Job Banao → Production Karo → Dispatch Karo
                    ↓
           Quotation → Invoice → Payment Record
                    ↓
           Stock In (GRN) → Job mein Use → Stock Reports
```

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Module Documentation](#4-module-documentation)
   - 4.1 [Dashboard](#41-dashboard)
   - 4.2 [Masters](#42-masters)
   - 4.3 [Production](#43-production)
   - 4.4 [Logistics](#44-logistics)
   - 4.5 [CRM & Sales](#45-crm--sales)
   - 4.6 [Inventory](#46-inventory)
   - 4.7 [Outsource](#47-outsource)
   - 4.8 [Maintenance](#48-maintenance)
   - 4.9 [Finance](#49-finance)
   - 4.10 [Reports](#410-reports)
   - 4.11 [Management & Settings](#411-management--settings)
   - 4.12 [Client Portal](#412-client-portal)
5. [User Roles & Permissions](#5-user-roles--permissions)
6. [Database Overview](#6-database-overview)
7. [API Overview](#7-api-overview)

---

## 1. Project Overview

**DigitalErp** ek complete **Enterprise Resource Planning (ERP) system** hai jo printing industry ke liye design kiya gaya hai. Iska purpose hai printing business ke sabhi operations ko ek jagah manage karna — production se lekar billing tak, inventory se lekar maintenance tak.

### Business Use Case
- Printing press ya digital printing company ke liye
- Multi-user, role-based access control ke saath
- Job orders track karna, machines manage karna, customers handle karna
- GST compliance aur financial reporting
- Client self-service portal

---

## 2. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.1.6 | React framework (App Router) |
| React | 19.2.3 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| shadcn/ui | Latest | UI component library |
| React Hook Form | 7.71.2 | Form management |
| Zod | Latest | Form validation |
| Recharts | 3.7.0 | Charts & graphs |
| Lucide React | 0.575.0 | Icons |
| date-fns | 4.1.0 | Date utilities |
| Sonner | 2.0.7 | Toast notifications |
| next-themes | 0.4.6 | Dark/Light mode |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| ASP.NET Core | 10.0 | Web API framework (C#) |
| SQL Server | SQLEXPRESS | Database |
| Dapper | 2.1.66 | Micro-ORM (SQL queries) |
| JWT | 8.16.0 | Authentication tokens |
| Swagger / Swashbuckle | 10.1.4 | API documentation |

### Architecture Pattern
- **Frontend:** Next.js App Router with React Server/Client components
- **Backend:** Clean Architecture — Controllers → Interfaces → Repositories → Database
- **API:** RESTful JSON API
- **Auth:** JWT-based token authentication
- **CORS:** Configured for `localhost:3000` and `localhost:3001`

---

## 3. System Architecture

```
┌─────────────────────────────────────────────┐
│              FRONTEND (Next.js)              │
│  Pages → Components → API Calls (fetch)      │
└─────────────────┬───────────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────────┐
│           BACKEND (ASP.NET Core)             │
│  Controllers → Interfaces → Repositories     │
└─────────────────┬───────────────────────────┘
                  │ Dapper (SQL)
┌─────────────────▼───────────────────────────┐
│           DATABASE (SQL Server)              │
│  Tables, Views, Stored Procedures           │
└─────────────────────────────────────────────┘
```

---

## 4. Module Documentation

---

### 4.1 Dashboard

**Route:** `/dashboard`  
**Purpose:** Business ka high-level overview ek jagah dikhana

#### Features
- **KPI Cards** — Active jobs, pending invoices, total revenue, open maintenance tasks
- **Revenue Trend Chart** — Monthly revenue bar/area chart (Recharts)
- **Recent Jobs** — Latest production jobs with status
- **Maintenance Alerts** — Overdue or upcoming machine maintenance
- **Recent Transactions** — Latest invoices and payments

#### Key Data Shown
- Jobs in progress vs completed
- Revenue this month vs last month
- Low stock alerts
- Pending dispatch items

---

### 4.2 Masters

Masters module mein sab reference/configuration data store hota hai. Ye data baaki modules use karte hain.

---

#### 4.2.1 Master Hub
**Route:** `/masters`  
**Purpose:** Sabhi masters ka centralized access point — ek jagah se kisi bhi master data ko navigate karo.

---

#### 4.2.2 Machine Master
**Route:** `/machines`  
**Purpose:** Company ki machines/equipment ka registry manage karna

**Fields:**
- Machine Name, Type, Model
- Pricing Type: Hourly Rate / Click-based / Slab Pricing
- Active/Inactive Status

**Use:** Job cards aur daily readings mein machine select karte waqt yahi data use hota hai.

---

#### 4.2.3 Paper Stocks Master
**Route:** `/inventory/paper-stocks`  
**Purpose:** Paper inventory ke types define karna

**Fields:**
- Paper Name, Size (e.g., A4, A3, custom)
- GSM (paper weight/thickness)
- Grade/Type

---

#### 4.2.4 Media Stocks Master
**Route:** `/inventory/media-stocks`  
**Purpose:** Media roll types define karna (vinyl, flex, canvas, etc.)

**Fields:**
- Media Name, Type
- Width, Length specifications

---

#### 4.2.5 Suppliers Master
**Route:** `/inventory/suppliers`  
**Purpose:** Vendors/suppliers ka master record

**Fields:**
- Supplier Name, Contact Person
- Phone, Email, Address
- GST Number, PAN

---

#### 4.2.6 Process Masters
**Route:** `/management/processes`  
**Purpose:** Production processes/operations define karna

**Fields:**
- Process Name (e.g., Printing, Lamination, Cutting)
- Product Name (variation link — e.g., Single Side / Both Side)
- Sequence/Order

---

#### 4.2.7 User Master
**Route:** `/management/users`  
**Purpose:** Employee/user accounts manage karna

**Fields:**
- Name, Email, Phone
- Role Assignment
- Active/Inactive Status
- Department

---

#### 4.2.8 Role Master
**Route:** `/management/roles`  
**Purpose:** Permission-based roles define karna

**Features:**
- Module-level permissions (View, Create, Edit, Delete)
- Role assign karo users ko
- Example roles: Admin, Manager, Operator, Accounts, Client

---

#### 4.2.9 Dropdown Master
**Route:** `/settings/dropdowns`  
**Purpose:** System-wide dropdown/lookup values manage karna

**Examples:**
- Job Status values (Pending, In Progress, Completed, etc.)
- Expense categories
- Paper grades
- Dispatch modes

---

### 4.3 Production

---

#### 4.3.1 Production Jobs
**Route:** `/jobs`, `/jobs/new`, `/jobs/[id]`, `/jobs/[id]/edit`  
**Purpose:** Job cards create karna aur production orders track karna

**Job Card Fields:**
- Job Number (auto-generated)
- Customer Name, Contact
- Job Type, Description
- Quantity, Size, Paper/Media used
- Processes (list of operations)
- Assigned Machine & Operator
- Due Date, Priority
- Status (Pending → In Progress → Completed → Dispatched)

**Features:**
- New job creation with line items
- Job detail view with process steps
- Edit job
- Status update
- Link to daily readings & dispatch

---

#### 4.3.2 Scheduler
**Route:** `/scheduler`  
**Purpose:** Jobs ko calendar view mein schedule karna

**Features:**
- Calendar-based visual timeline
- Drag & drop job scheduling
- Machine-wise view
- Conflict detection

---

#### 4.3.3 Daily Readings
**Route:** `/daily-readings`  
**Purpose:** Machines ke daily meter readings record karna

**Fields:**
- Machine selection
- Opening Counter, Closing Counter
- Total Impressions (auto-calculated)
- Date, Operator
- Photo Evidence (optional image upload)
- Remarks

**Use:** Machine usage track karna, billing calculate karna (click-based machines ke liye).

---

### 4.4 Logistics

#### 4.4.1 Dispatch Board
**Route:** `/dispatch`, `/dispatch/history`  
**Purpose:** Completed jobs ko customers tak dispatch track karna

**Fields:**
- Job Number, Customer Name
- Dispatch Date, Mode (Self-pickup / Courier / Delivery)
- Courier Name, Tracking Number
- Delivery Proof
- Status (Pending Dispatch / Dispatched / Delivered)

**Features:**
- Dispatch history with filters
- Print delivery challan
- Mark as delivered

---

### 4.5 CRM & Sales

---

#### 4.5.1 Customers
**Route:** `/customers`, `/customers/[id]`  
**Purpose:** Client/customer profiles manage karna

**Fields:**
- Customer Name, Company Name
- Contact: Phone, Email, Address
- GST Number, PAN
- Payment Terms, Credit Limit
- Customer Type (Regular / Walk-in / Corporate)

**Customer Detail View:**
- All jobs for this customer
- Invoice history
- Payment history
- Outstanding balance

---

#### 4.5.2 Customer Analysis
**Route:** `/customers/analysis`  
**Purpose:** Customer trends aur purchase patterns analyze karna

**Features:**
- Top customers by revenue
- Job count per customer
- Payment behavior analysis
- Customer growth trends (charts)

---

#### 4.5.3 Quotations / Estimator
**Route:** `/estimator`, `/estimator/new`  
**Purpose:** Cost estimation aur quotations create karna

**Fields:**
- Customer Name
- Job Description, Size, Quantity
- Line Items: Material cost, Process cost, Labor
- Tax (GST)
- Total Amount
- Validity Date, Terms & Conditions

**Features:**
- Auto-calculate totals
- Convert quotation to job order
- Print/download quotation PDF
- Track quotation status (Sent / Accepted / Rejected)

---

#### 4.5.4 Invoices
**Route:** `/invoices`  
**Purpose:** Invoice generation aur payment tracking

**Fields:**
- Invoice Number (auto)
- Customer, Job Reference
- Line items with GST
- Total Amount, Tax Breakdown
- Payment Status (Unpaid / Partial / Paid)
- Due Date

**Features:**
- Create invoice from job
- Record partial payments
- Print/export invoice PDF
- GST-compliant format

---

### 4.6 Inventory

---

#### 4.6.1 Purchase Orders
**Route:** `/inventory/purchases`  
**Purpose:** Supplier se purchase orders create karna

**Fields:**
- PO Number (auto)
- Supplier Name
- Items: Paper/Media type, Quantity, Rate, Amount
- GST details
- Expected Delivery Date

---

#### 4.6.2 GRN (Goods Receipt Note / Stock In)
**Route:** `/inventory`  
**Purpose:** Received goods ko stock mein add karna

**Fields:**
- PO Reference (optional)
- Supplier, Date
- Items received: type, quantity, batch
- Quality check status
- Storage location

---

#### 4.6.3 Return to Supplier
**Route:** `/inventory/returns`  
**Purpose:** Damaged/rejected goods supplier ko return karna

**Fields:**
- Original GRN reference
- Return reason
- Items & quantity
- Credit note details

---

#### 4.6.4 Stock Overview
**Route:** `/inventory/stock`, `/inventory/stock/history`  
**Purpose:** Current stock levels aur transaction history

**Features:**
- Current quantity per item
- Low stock alerts
- Stock in/out history with dates
- Filter by paper type, media type
- Export to Excel

---

### 4.7 Outsource

---

#### 4.7.1 Outsource Vendors
**Route:** `/outsource/vendors`  
**Purpose:** Third-party vendors manage karna jinhe kaam outsource kiya jaata hai

**Fields:**
- Vendor Name, Contact
- Specialization (Binding, Lamination, etc.)
- Rate Card
- GST Number

---

#### 4.7.2 Outsource Jobs
**Route:** `/outsource/jobs`  
**Purpose:** Outsourced work orders track karna

**Fields:**
- Job Reference
- Vendor assigned
- Work description, Quantity
- Rate, Total cost
- Due date, Status
- Delivery received: Yes/No

---

### 4.8 Maintenance

---

#### 4.8.1 Maintenance Center
**Route:** `/maintenance`  
**Purpose:** Machine maintenance schedule karna aur track karna

**Types of Maintenance:**
- **Daily Tasks** — Regular checks (lubrication, cleaning)
- **Monthly Tasks** — Periodic service tasks

**Fields:**
- Machine Name
- Task Description
- Frequency (Daily / Weekly / Monthly)
- Assigned To
- Last Done Date, Next Due Date
- Status (Pending / Done / Overdue)

---

#### 4.8.2 My Tasks
**Route:** `/tasks`  
**Purpose:** Operator/technician ke personal assigned tasks

**Features:**
- Tasks assigned specifically to logged-in user
- Mark task as complete
- Add completion notes
- Due date visibility

---

### 4.9 Finance

---

#### 4.9.1 Job Finance
**Route:** `/finance/job-finance`  
**Purpose:** Per-job cost breakdown track karna

**Fields:**
- Job Number reference
- Material cost (paper/media used)
- Labor cost
- Machine cost (based on readings)
- Outsource cost
- Total Cost vs Invoice Amount
- Profit / Loss per job

---

#### 4.9.2 Expenses
**Route:** `/finance/expenses`  
**Purpose:** Business expenses record karna

**Fields:**
- Expense Date
- Category (Rent, Utilities, Salary, Repairs, etc.)
- Amount, GST amount
- Payment mode (Cash / Bank)
- Description, Vendor
- Receipt upload

---

#### 4.9.3 Expense Categories
**Route:** `/finance/categories`  
**Purpose:** Expense categorization define karna

**Fields:**
- Category Name
- Parent Category (for sub-categories)
- Active/Inactive

---

### 4.10 Reports

---

#### 4.10.1 Reports Hub
**Route:** `/reports`  
**Purpose:** Sabhi reports ka entry point

Available reports:
- Paper Usage Ledger
- GST Reports
- Financial Reports
- Production Reports
- Purchase Reports
- Sales Reports

---

#### 4.10.2 Paper Usage Ledger
**Route:** `/reports/ledger`  
**Purpose:** Job-wise paper/media consumption track karna

**Features:**
- Stock consumed per job
- Date range filter
- Paper type filter
- Opening stock → Consumed → Closing stock format

---

#### 4.10.3 GST Reports
**Route:** `/reports/gst`  
**Purpose:** GST compliance reporting

**Reports Available:**
- **GSTR-1** — Outward supplies (Sales)
- **GSTR-3B** — Monthly summary return
- Tax collected vs paid summary

---

#### 4.10.4 Production Reports
**Route:** `/reports/production`  
**Purpose:** Machine efficiency aur production performance

**Metrics:**
- Impressions per machine per day
- Downtime logs
- Operator-wise output
- Job completion rate

---

#### 4.10.5 Sales Reports
**Route:** `/reports/sales`  
**Purpose:** Revenue tracking

**Metrics:**
- Revenue per job type
- Monthly/quarterly sales trend
- Customer-wise revenue
- Top products/services

---

#### 4.10.6 Purchase Reports
**Route:** `/reports/purchases`  
**Purpose:** Vendor-wise spending analysis

**Metrics:**
- Total purchases per supplier
- Date-wise purchase history
- Item-wise consumption

---

#### 4.10.7 Financial Reports
**Route:** `/reports/finance`  
**Purpose:** Overall financial health

**Reports:**
- Profit & Loss Statement
- Expense Summary
- Outstanding receivables
- Cash flow summary

---

### 4.11 Management & Settings

---

#### 4.11.1 Support Intelligence
**Route:** `/management/support`  
**Purpose:** Admin-level support tools — system health, logs, debugging info

---

#### 4.11.2 Settings
**Route:** `/settings`  
**Purpose:** Organization-level configuration

**Sections:**
- Company name, logo, address
- GST Number, PAN, MSME details
- Invoice prefix/numbering format
- Email/SMTP settings
- Tax rates (default GST %)
- Theme preferences

---

#### 4.11.3 Google Tasks Integration
**Route:** `/google-tasks`  
**Purpose:** Google Tasks ke saath sync karna

**Features:**
- Google account connect karna
- Tasks import/export
- Sync maintenance tasks to Google Tasks

---

### 4.12 Client Portal

Customers ke liye ek alag self-service portal — wo apna data khud dekh sakein bina company staff se pooche.

**Login:** `/login?tab=client`

---

#### Portal Pages

| Page | Route | Description |
|---|---|---|
| Portal Dashboard | `/portal/dashboard` | Customer ka overview — active orders, invoices, balance |
| Portal Orders | `/portal/orders` | Apne job orders track karna |
| Portal Quotations | `/portal/quotations` | Quotations dekhna, accept/reject karna |
| Portal Invoices | `/portal/invoices` | Invoice history aur payment status |
| Portal Ledger | `/portal/ledger` | Stock/usage tracking (for customers with dedicated stock) |
| Portal Support | `/portal/support` | Support request submit karna |

---

## 5. User Roles & Permissions

System mein role-based access control (RBAC) hai. Har role ko specific module permissions assign hote hain:

| Permission Type | Description |
|---|---|
| View | Module ka data dekh sakta hai |
| Create | Naye records add kar sakta hai |
| Edit | Existing records modify kar sakta hai |
| Delete | Records delete kar sakta hai |

### Typical Role Examples
| Role | Access Level |
|---|---|
| **Admin** | Full access to everything |
| **Manager** | All modules, no system settings |
| **Operator** | Jobs, Daily Readings, My Tasks only |
| **Accounts** | Finance, Invoices, Reports |
| **Sales** | CRM, Quotations, Customers |
| **Client** | Portal only (own data) |

---

## 6. Database Overview

Database SQL Server (SQLEXPRESS) hai. Dapper micro-ORM use hota hai raw SQL queries ke liye.

### Key Tables

| Table | Purpose |
|---|---|
| `Jobs` / `JobCards` | Production job orders |
| `Customers` | Client profiles |
| `Machines` | Equipment registry |
| `DailyReadings` | Machine meter readings |
| `Inventory` | Stock items |
| `PaperStocks` / `MediaStocks` | Paper/media types |
| `Purchases` | Purchase orders |
| `GRN` | Goods receipts |
| `Quotations` | Estimates |
| `Invoices` | Bills |
| `Payments` | Payment records |
| `Expenses` | Business expenses |
| `Maintenance` | Maintenance tasks |
| `ProcessMasters` | Production processes |
| `Suppliers` | Vendor records |
| `Users` | System users |
| `Roles` | Permission roles |
| `AuditLogs` | System activity logs |

### Database Migration Files
Located at `backend/DatabaseScripts/` — versioned migration files (V1, V2, ... V102+) for schema changes.

---

## 7. API Overview

Backend API `ASP.NET Core` pe build hai. Swagger documentation available hai at `/swagger`.

### Key API Controllers

| Controller | Base Route | Module |
|---|---|---|
| `AuthController` | `/api/auth` | Login, token management |
| `DashboardController` | `/api/dashboard` | KPIs and dashboard data |
| `JobCardsController` | `/api/jobcards` | Production jobs CRUD |
| `CustomersController` | `/api/customers` | Customer management |
| `InventoryController` | `/api/inventory` | Stock and GRN |
| `PurchasesController` | `/api/purchases` | Purchase orders |
| `QuotationsController` | `/api/quotations` | Estimates |
| `MachinesController` | `/api/machines` | Machine master |
| `DailyReadingsController` | `/api/dailyreadings` | Machine readings |
| `MaintenanceController` | `/api/maintenance` | Maintenance tasks |
| `ExpensesController` | `/api/expenses` | Expense management |
| `DashboardController` | `/api/dashboard` | Analytics data |
| `AuditController` | `/api/audit` | Audit logs |
| `ManagementControllers` | `/api/management` | Users, roles, processes |
| `PortalAndAnalyticsControllers` | `/api/portal` | Client portal APIs |

### Authentication Flow
1. User `/api/auth/login` pe POST karta hai (email + password)
2. Server JWT token return karta hai
3. Frontend har API call ke saath `Authorization: Bearer <token>` header bhejta hai
4. Backend token validate karta hai aur user ka role check karta hai

---

*Document prepared for internal use — DigitalErp v1.0*
