using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Repositories;

public class ReportRepository
{
    private readonly string _connectionString;
    public ReportRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<CustomerLedgerDto>> GetCustomerLedgerAsync(int customerId)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"
            SELECT InvoiceDate as Date, 'Invoice' as Type, InvoiceNumber as Reference, GrandTotal as Debit, 0 as Credit 
            FROM Invoices 
            WHERE CustomerId = @CustomerId AND IsActive = 1
            UNION ALL
            -- Assuming a Payments table exists or keeping it simple for now
            SELECT CreatedAt, 'Opening', 'Initial', 0, 0 FROM Customers WHERE Id = @CustomerId
            ORDER BY Date ASC";
        
        return await conn.QueryAsync<CustomerLedgerDto>(sql, new { CustomerId = customerId });
    }

    public async Task<IEnumerable<GstReportDto>> GetGstSalesAsync(DateTime start, DateTime end)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"
            SELECT i.InvoiceNumber, i.InvoiceDate as Date, c.Name as CustomerName, c.GstNumber, 
                   i.TotalAmount as TaxableAmount, i.TaxAmount, i.GrandTotal as TotalAmount
            FROM Invoices i
            JOIN Customers c ON i.CustomerId = c.Id
            WHERE i.InvoiceDate BETWEEN @Start AND @End AND i.IsActive = 1
            ORDER BY i.InvoiceDate DESC";
        
        return await conn.QueryAsync<GstReportDto>(sql, new { Start = start, End = end });
    }

    public async Task<GstSummaryDto> GetGstSummaryAsync(DateTime start, DateTime end)
    {
        using var conn = new SqlConnection(_connectionString);
        var summary = new GstSummaryDto();

        // 1. Get Sales GST (Output Tax)
        var salesSql = @"
            SELECT i.InvoiceNumber, i.InvoiceDate as Date, c.Name as CustomerName, c.GstNumber, 
                   i.TotalAmount as TaxableAmount, i.TaxAmount, i.GrandTotal as TotalAmount
            FROM Invoices i
            JOIN Customers c ON i.CustomerId = c.Id
            WHERE i.InvoiceDate BETWEEN @Start AND @End AND i.IsActive = 1";
        
        summary.SalesDetails = (await conn.QueryAsync<GstReportDto>(salesSql, new { Start = start, End = end })).ToList();
        summary.OutputTax = summary.SalesDetails.Sum(x => x.TaxAmount);

        // 2. Get Purchase GST (ITC)
        var purchaseSql = @"
            SELECT p.PurchaseNumber as InvoiceNumber, p.PurchaseDate as Date, v.Name as CustomerName, v.GstNumber, 
                   (p.Quantity * p.Rate) as TaxableAmount, p.TaxAmount, p.TotalAmount
            FROM Purchases p
            JOIN Vendors v ON p.VendorId = v.Id
            WHERE p.PurchaseDate BETWEEN @Start AND @End AND p.IsActive = 1";
        
        summary.PurchaseDetails = (await conn.QueryAsync<GstReportDto>(purchaseSql, new { Start = start, End = end })).ToList();
        summary.ITC = summary.PurchaseDetails.Sum(x => x.TaxAmount);

        return summary;
    }
}
