-- Update Invoices and Purchases with Tax Details

-- 1. Update Invoices
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Invoices') AND name = 'TaxRate')
BEGIN
    ALTER TABLE Invoices ADD TaxRate DECIMAL(18, 2) NOT NULL DEFAULT 18;
END
GO

-- 2. Update Purchases
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Purchases') AND name = 'TaxRate')
BEGIN
    ALTER TABLE Purchases ADD TaxRate DECIMAL(18, 2) NOT NULL DEFAULT 18;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Purchases') AND name = 'TaxAmount')
BEGIN
    ALTER TABLE Purchases ADD TaxAmount DECIMAL(18, 2) NOT NULL DEFAULT 0;
END
GO
