-- Pricing Masters & Estimates Tables

-- 1. PriceMasters Table (Rates for Estimator)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PriceMasters' AND xtype='U')
BEGIN
    CREATE TABLE PriceMasters (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Category NVARCHAR(100) NOT NULL, -- Paper, Printing, Finishing, CTP
        ItemName NVARCHAR(200) NOT NULL,
        Rate DECIMAL(18, 4) NOT NULL DEFAULT 0,
        Unit NVARCHAR(50) NOT NULL DEFAULT 'Sheet',
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- 2. Estimates Table (Saved Estimations)
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Estimates' AND xtype='U')
BEGIN
    CREATE TABLE Estimates (
        Id INT PRIMARY KEY IDENTITY(1,1),
        CustomerId INT NOT NULL,
        JobDescription NVARCHAR(MAX) NOT NULL,
        EstimatedCost DECIMAL(18, 2) NOT NULL DEFAULT 0,
        QuotedPrice DECIMAL(18, 2) NOT NULL DEFAULT 0,
        SpecsJson NVARCHAR(MAX) NOT NULL, -- Store full specs as JSON
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
    );
END
GO

-- 3. Pre-load some common Pricing data (Optional Seeding)
IF NOT EXISTS (SELECT * FROM PriceMasters)
BEGIN
    INSERT INTO PriceMasters (Category, ItemName, Rate, Unit) VALUES 
    ('Printing', 'A3 Digital Color (Single Side)', 10.00, 'Side'),
    ('Printing', 'A3 Digital Color (Double Side)', 18.00, 'Side'),
    ('Printing', 'A3 Digital B/W', 2.00, 'Side'),
    ('Finishing', 'Lamination - Glossy (A3)', 3.00, 'Sheet'),
    ('Finishing', 'Lamination - Matte (A3)', 4.00, 'Sheet'),
    ('CTP', 'Offset Plate (Per Color)', 250.00, 'Plate');
END
GO
