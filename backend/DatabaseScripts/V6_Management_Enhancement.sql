-- Migration V6: Management Enhancement
-- Adding new fields to ProcessMasters and AppUsers

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ProcessMasters') AND name = 'Type')
BEGIN
    ALTER TABLE ProcessMasters ADD [Type] NVARCHAR(50) DEFAULT 'Others';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ProcessMasters') AND name = 'SetupFee')
BEGIN
    ALTER TABLE ProcessMasters ADD SetupFee DECIMAL(18,2) DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('ProcessMasters') AND name = 'MinPrice')
BEGIN
    ALTER TABLE ProcessMasters ADD MinPrice DECIMAL(18,2) DEFAULT 0;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AppUsers') AND name = 'Department')
BEGIN
    ALTER TABLE AppUsers ADD Department NVARCHAR(100) DEFAULT 'Operations';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('AppUsers') AND name = 'Status')
BEGIN
    ALTER TABLE AppUsers ADD [Status] NVARCHAR(50) DEFAULT 'Active';
END
