-- Specialized Inventory Tables: Paper & Media

-- 1. PaperStocks Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PaperStocks' AND xtype='U')
BEGIN
    CREATE TABLE PaperStocks (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(200) NOT NULL,
        Type NVARCHAR(100) NOT NULL,
        Gsm INT NOT NULL,
        Size NVARCHAR(50) NOT NULL,
        Width DECIMAL(18, 2) NOT NULL,
        Height DECIMAL(18, 2) NOT NULL,
        Quantity DECIMAL(18, 2) NOT NULL DEFAULT 0,
        UnitPrice DECIMAL(18, 4) NOT NULL DEFAULT 0,
        LowStockAlert DECIMAL(18, 2) NOT NULL DEFAULT 0,
        CalcMode NVARCHAR(50) NOT NULL DEFAULT 'manual',
        RimWeight DECIMAL(18, 2) NOT NULL DEFAULT 0,
        SheetsPerPacket INT NOT NULL DEFAULT 0,
        PricePerKg DECIMAL(18, 2) NOT NULL DEFAULT 0,
        Color NVARCHAR(50) NOT NULL DEFAULT 'White',
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsActive BIT NOT NULL DEFAULT 1
    );
END
GO

-- 2. MediaStocks Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MediaStocks' AND xtype='U')
BEGIN
    CREATE TABLE MediaStocks (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(200) NOT NULL,
        Type NVARCHAR(100) NOT NULL,
        RollWidth DECIMAL(18, 2) NOT NULL,
        RollLength DECIMAL(18, 2) NOT NULL,
        CostPerRoll DECIMAL(18, 2) NOT NULL,
        CostPerSqFt DECIMAL(18, 4) NOT NULL,
        QuantitySqFt DECIMAL(18, 2) NOT NULL DEFAULT 0,
        LowStockAlert DECIMAL(18, 2) NOT NULL DEFAULT 0,
        Status NVARCHAR(50) NOT NULL DEFAULT 'In Stock',
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        IsActive BIT NOT NULL DEFAULT 1
    );
END
GO
