-- Initial Database Schema for DigitalErp
-- Run this in your SQL Server Management Studio (SSMS)

CREATE DATABASE DigitalErpDB;
GO

USE DigitalErpDB;
GO

-- 1. Customers Table
CREATE TABLE Customers (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(200) NOT NULL,
    GstNumber NVARCHAR(15) NULL,
    Phone NVARCHAR(20) NOT NULL,
    Email NVARCHAR(100) NULL,
    Address NVARCHAR(MAX) NULL,
    NetBalance DECIMAL(18, 2) DEFAULT 0.00,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NULL,
    IsActive BIT DEFAULT 1
);
GO

-- 2. Invoices Table
CREATE TABLE Invoices (
    Id INT PRIMARY KEY IDENTITY(1,1),
    InvoiceNumber NVARCHAR(50) NOT NULL UNIQUE,
    CustomerId INT NOT NULL,
    InvoiceDate DATETIME2 DEFAULT GETUTCDATE(),
    TotalAmount DECIMAL(18, 2) NOT NULL,
    TaxAmount DECIMAL(18, 2) NOT NULL,
    GrandTotal DECIMAL(18, 2) NOT NULL,
    PaymentStatus NVARCHAR(20) DEFAULT 'Unpaid', -- Unpaid, Partial, Paid
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
);
GO

-- 3. InvoiceItems Table
CREATE TABLE InvoiceItems (
    Id INT PRIMARY KEY IDENTITY(1,1),
    InvoiceId INT NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    Quantity DECIMAL(18, 2) NOT NULL,
    Rate DECIMAL(18, 2) NOT NULL,
    Amount DECIMAL(18, 2) NOT NULL,
    FOREIGN KEY (InvoiceId) REFERENCES Invoices(Id) ON DELETE CASCADE
);
GO

-- 4. InventoryItems Table
CREATE TABLE InventoryItems (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(200) NOT NULL,
    Category NVARCHAR(100) NOT NULL,
    Unit NVARCHAR(50) NOT NULL,
    CurrentStock DECIMAL(18, 2) DEFAULT 0.00,
    MinStockLevel DECIMAL(18, 2) DEFAULT 0.00,
    LastPurchasePrice DECIMAL(18, 2) DEFAULT 0.00,
    LastUpdated DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1
);
GO

-- 5. StockTransactions Table
CREATE TABLE StockTransactions (
    Id INT PRIMARY KEY IDENTITY(1,1),
    InventoryItemId INT NOT NULL,
    Quantity DECIMAL(18, 2) NOT NULL,
    Type NVARCHAR(50) NOT NULL, -- Inward, Outward, Adjustment
    ReferenceType NVARCHAR(100) NOT NULL, -- Setup via query param as 'PurchaseOrder', 'JobCard', 'Manual'
    ReferenceId INT NULL,
    TransactionDate DATETIME2 DEFAULT GETUTCDATE(),
    Remarks NVARCHAR(MAX) NULL,
    FOREIGN KEY (InventoryItemId) REFERENCES InventoryItems(Id) ON DELETE CASCADE
);
GO

-- 6. JobCards Table (Production Workflow)
CREATE TABLE JobCards (
    Id INT PRIMARY KEY IDENTITY(1,1),
    JobNumber NVARCHAR(50) NOT NULL UNIQUE,
    CustomerId INT NOT NULL,
    JobDescription NVARCHAR(500) NOT NULL,
    MachineType NVARCHAR(50) NOT NULL,
    Quantity INT NOT NULL,
    InventoryItemId INT NULL,
    InventoryQuantity DECIMAL(18, 2) NULL,
    Rate DECIMAL(18, 2) NOT NULL DEFAULT 0,
    PaperSize NVARCHAR(100) NULL,
    PaperType NVARCHAR(100) NULL,
    BookDetails NVARCHAR(500) NULL,
    JobStatus NVARCHAR(50) DEFAULT 'Pending',
    DueDate DATETIME2 NOT NULL,
    DesignFilePath NVARCHAR(500) NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CompletedAt DATETIME2 NULL,
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id) ON DELETE NO ACTION
);
GO

-- 7. Expenses Table (Finance & Accounting)
CREATE TABLE Expenses (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(500) NOT NULL,
    Category NVARCHAR(100) NOT NULL,
    Amount DECIMAL(18, 2) NOT NULL,
    ExpenseDate DATETIME2 DEFAULT GETUTCDATE(),
    PaymentMethod NVARCHAR(50) DEFAULT 'Cash',
    ReferenceNumber NVARCHAR(100) NULL,
    IsGstBill BIT DEFAULT 0,
    VendorId NVARCHAR(50) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1
);
GO

-- 8. DailyReadings Table (Machine Meter Tracking)
CREATE TABLE DailyReadings (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Machine NVARCHAR(200) NOT NULL,
    ReadingDate DATETIME2 NOT NULL,
    Opening INT NOT NULL,
    Closing INT NOT NULL,
    Impressions INT NOT NULL,
    Remarks NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- 9. Machines Table
CREATE TABLE Machines (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(200) NOT NULL,
    Type NVARCHAR(100) NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Active',
    CurrentMeterReading INT DEFAULT 0,
    LastServiceDate DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1
);
GO

-- 10. Quotations Table
CREATE TABLE Quotations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    QuotationNumber NVARCHAR(50) NOT NULL UNIQUE,
    CustomerId INT NOT NULL,
    Description NVARCHAR(MAX) NOT NULL,
    PaperSize NVARCHAR(100) NULL,
    PaperType NVARCHAR(100) NULL,
    BookDetails NVARCHAR(500) NULL,
    EstimatedCost DECIMAL(18, 2) NOT NULL,
    QuotedPrice DECIMAL(18, 2) NOT NULL,
    ProfitMargin DECIMAL(18, 2) DEFAULT 0,
    Status NVARCHAR(50) DEFAULT 'Draft',
    ValidTill DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
);
GO

-- 11. Vendors Table (Outsource)
CREATE TABLE Vendors (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(200) NOT NULL,
    GstNumber NVARCHAR(15) NULL,
    Phone NVARCHAR(20) NOT NULL,
    Email NVARCHAR(100) NULL,
    Address NVARCHAR(MAX) NULL,
    Specialization NVARCHAR(200) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1
);
GO

-- 12. OutsourceJobs Table
CREATE TABLE OutsourceJobs (
    Id INT PRIMARY KEY IDENTITY(1,1),
    VendorId INT NOT NULL,
    JobCardId INT NULL,
    Description NVARCHAR(500) NOT NULL,
    Cost DECIMAL(18, 2) NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Pending',
    DueDate DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (VendorId) REFERENCES Vendors(Id),
    FOREIGN KEY (JobCardId) REFERENCES JobCards(Id)
);
GO

-- 13. Purchases Table (GRN / Purchase Orders)
CREATE TABLE Purchases (
    Id INT PRIMARY KEY IDENTITY(1,1),
    PurchaseNumber NVARCHAR(50) NOT NULL UNIQUE,
    VendorId INT NOT NULL,
    InventoryItemId INT NOT NULL,
    Quantity DECIMAL(18, 2) NOT NULL,
    Rate DECIMAL(18, 2) NOT NULL,
    TotalAmount DECIMAL(18, 2) NOT NULL,
    Status NVARCHAR(50) DEFAULT 'Pending',
    PurchaseDate DATETIME2 DEFAULT GETUTCDATE(),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (VendorId) REFERENCES Vendors(Id),
    FOREIGN KEY (InventoryItemId) REFERENCES InventoryItems(Id)
);
GO

-- 14. ExpenseCategories Table
CREATE TABLE ExpenseCategories (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Type NVARCHAR(50) DEFAULT 'Indirect',
    IsActive BIT DEFAULT 1
);
GO

-- 15. ProcessMasters Table
CREATE TABLE ProcessMasters (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500) NULL,
    DefaultRate DECIMAL(18, 2) DEFAULT 0,
    Unit NVARCHAR(50) NOT NULL,
    IsActive BIT DEFAULT 1
);
GO

-- 16. Roles Table
CREATE TABLE Roles (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Permissions NVARCHAR(MAX) NULL,
    IsActive BIT DEFAULT 1
);
GO

-- 17. AppUsers Table
CREATE TABLE AppUsers (
    Id INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Phone NVARCHAR(20) NOT NULL,
    PasswordHash NVARCHAR(500) NOT NULL,
    RoleId INT NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);
GO

-- 18. AppSettings Table
CREATE TABLE AppSettings (
    Id INT PRIMARY KEY IDENTITY(1,1),
    [Key] NVARCHAR(100) NOT NULL UNIQUE,
    Value NVARCHAR(MAX) NOT NULL,
    Description NVARCHAR(500) NULL
);
GO

-- ══════════════ SEED DATA ══════════════

-- Default Roles
INSERT INTO Roles (Name, Permissions) VALUES ('Owner', '{"all": true}');
INSERT INTO Roles (Name, Permissions) VALUES ('Manager', '{"dashboard": true, "jobs": true, "inventory": true, "reports": true}');
INSERT INTO Roles (Name, Permissions) VALUES ('Operator', '{"jobs": true, "daily-readings": true}');
GO

-- Default Expense Categories
INSERT INTO ExpenseCategories (Name, Type) VALUES ('Electricity', 'Indirect');
INSERT INTO ExpenseCategories (Name, Type) VALUES ('Internet', 'Indirect');
INSERT INTO ExpenseCategories (Name, Type) VALUES ('Labor Wages', 'Direct');
INSERT INTO ExpenseCategories (Name, Type) VALUES ('Machine Maintenance', 'Direct');
INSERT INTO ExpenseCategories (Name, Type) VALUES ('Rent', 'Indirect');
INSERT INTO ExpenseCategories (Name, Type) VALUES ('Tea & Pantry', 'Indirect');
INSERT INTO ExpenseCategories (Name, Type) VALUES ('Transport', 'Direct');
GO

-- Default Settings
INSERT INTO AppSettings ([Key], Value, Description) VALUES ('CompanyName', 'Digital ERP Pvt. Ltd', 'Company display name');
INSERT INTO AppSettings ([Key], Value, Description) VALUES ('GstNumber', '', 'Company GST Number');
INSERT INTO AppSettings ([Key], Value, Description) VALUES ('DefaultTaxRate', '18', 'Default GST Tax Rate %');
INSERT INTO AppSettings ([Key], Value, Description) VALUES ('InvoicePrefix', 'INV', 'Invoice Number Prefix');
GO

-- 19. Scheduler Table
CREATE TABLE Scheduler (
    Id INT PRIMARY KEY IDENTITY(1,1),
    JobCardId INT NOT NULL,
    MachineId INT NOT NULL,
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NOT NULL,
    Remarks NVARCHAR(500) NULL,
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (JobCardId) REFERENCES JobCards(Id),
    FOREIGN KEY (MachineId) REFERENCES Machines(Id)
);
GO

-- 20. AuditLogs Table
CREATE TABLE AuditLogs (
    Id INT PRIMARY KEY IDENTITY(1,1),
    EntityName NVARCHAR(100) NOT NULL,
    EntityId NVARCHAR(100) NOT NULL,
    Action NVARCHAR(50) NOT NULL,
    Changes NVARCHAR(MAX) NULL,
    PerformedBy NVARCHAR(200) NOT NULL,
    Timestamp DATETIME2 DEFAULT GETUTCDATE()
);
GO

-- 21. Payments Table
CREATE TABLE Payments (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CustomerId INT NOT NULL,
    InvoiceId INT NULL,
    Amount DECIMAL(18, 2) NOT NULL,
    PaymentDate DATETIME2 DEFAULT GETUTCDATE(),
    PaymentMethod NVARCHAR(50) DEFAULT 'Cash',
    ReferenceNumber NVARCHAR(100) NULL,
    Remarks NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    FOREIGN KEY (InvoiceId) REFERENCES Invoices(Id)
);
GO
