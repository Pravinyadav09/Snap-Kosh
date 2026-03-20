-- 1. Create MachineMaintenance Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MachineMaintenance' AND xtype='U')
BEGIN
    CREATE TABLE MachineMaintenance (
        Id INT PRIMARY KEY IDENTITY(1,1),
        MachineId INT NOT NULL,
        Category NVARCHAR(100) NOT NULL,
        Priority NVARCHAR(50) NOT NULL DEFAULT 'Medium',
        Status NVARCHAR(50) NOT NULL DEFAULT 'Completed',
        Description NVARCHAR(MAX) NOT NULL,
        MaintenanceDate DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        Cost DECIMAL(18, 2) NULL,
        PerformedBy NVARCHAR(200) NULL,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY (MachineId) REFERENCES Machines(Id)
    );
END
GO

-- 2. Update JobCards Table with Dispatch Fields
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('JobCards') AND name = 'DispatchedQuantity')
BEGIN
    ALTER TABLE JobCards ADD DispatchedQuantity INT NOT NULL DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('JobCards') AND name = 'DeliveryMode')
BEGIN
    ALTER TABLE JobCards ADD DeliveryMode NVARCHAR(100) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('JobCards') AND name = 'TrackingRef')
BEGIN
    ALTER TABLE JobCards ADD TrackingRef NVARCHAR(100) NULL;
END
GO
