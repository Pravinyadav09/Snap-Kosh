using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Repositories;

public class AnalyticsRepository : IAnalyticsRepository
{
    private readonly string _connectionString;
    public AnalyticsRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<object> GetCustomerAnalysisAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"
            -- Top 5 Customers by Revenue
            SELECT TOP 5 c.Name, SUM(i.GrandTotal) as TotalRevenue
            FROM Invoices i
            JOIN Customers c ON i.CustomerId = c.Id
            WHERE i.IsActive = 1
            GROUP BY c.Name
            ORDER BY TotalRevenue DESC;

            -- Outstanding Payments Aging
            SELECT 
                SUM(CASE WHEN DATEDIFF(day, InvoiceDate, GETUTCDATE()) <= 30 THEN GrandTotal ELSE 0 END) as Within30Days,
                SUM(CASE WHEN DATEDIFF(day, InvoiceDate, GETUTCDATE()) > 30 AND DATEDIFF(day, InvoiceDate, GETUTCDATE()) <= 60 THEN GrandTotal ELSE 0 END) as Within60Days,
                SUM(CASE WHEN DATEDIFF(day, InvoiceDate, GETUTCDATE()) > 60 THEN GrandTotal ELSE 0 END) as Over60Days
            FROM Invoices
            WHERE PaymentStatus != 'Paid' AND IsActive = 1;
        ";

        using var multi = await conn.QueryMultipleAsync(sql);
        return new
        {
            TopCustomers = await multi.ReadAsync<object>(),
            AgingReport = await multi.ReadFirstOrDefaultAsync<object>()
        };
    }

    public async Task<IEnumerable<object>> GetMonthlyRevenueTrendAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"
            SELECT TOP 12
                FORMAT(InvoiceDate, 'MMM yyyy') as Month,
                SUM(GrandTotal) as Revenue
            FROM Invoices
            WHERE IsActive = 1
            GROUP BY FORMAT(InvoiceDate, 'MMM yyyy'), YEAR(InvoiceDate), MONTH(InvoiceDate)
            ORDER BY YEAR(InvoiceDate) DESC, MONTH(InvoiceDate) DESC";
        return await conn.QueryAsync<object>(sql);
    }

    public async Task<IEnumerable<object>> GetJobProfitabilityAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"
            SELECT 
                j.JobNumber,
                c.Name as CustomerName,
                q.QuotedPrice as Revenue,
                (SELECT ISNULL(SUM(Quantity * Rate), 0) FROM Purchases WHERE IsActive = 1) as RawMaterialCost, -- This is broad, in real ERP would link to JobId
                (SELECT ISNULL(SUM(Cost), 0) FROM OutsourceJobs WHERE JobCardId = j.Id AND IsActive = 1) as OutsourceCost,
                (q.QuotedPrice - (SELECT ISNULL(SUM(Cost), 0) FROM OutsourceJobs WHERE JobCardId = j.Id AND IsActive = 1)) as NetProfit
            FROM JobCards j
            JOIN Customers c ON j.CustomerId = c.Id
            LEFT JOIN Quotations q ON j.QuotationId = q.Id
            WHERE j.IsActive = 1
            ORDER BY j.CreatedAt DESC";
        return await conn.QueryAsync<object>(sql);
    }
}
