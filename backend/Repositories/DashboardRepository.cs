using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.DTOs;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly string _connectionString;
    public DashboardRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<AdminDashboardSummary> GetAdminSummaryAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"
            -- 1. Today's Sales
            SELECT ISNULL(SUM(GrandTotal), 0) FROM Invoices WHERE CAST(InvoiceDate AS DATE) = CAST(GETUTCDATE() AS DATE) AND IsActive = 1;

            -- 2. Monthly Revenue (Sales)
            SELECT ISNULL(SUM(GrandTotal), 0) FROM Invoices WHERE MONTH(InvoiceDate) = MONTH(GETUTCDATE()) AND YEAR(InvoiceDate) = YEAR(GETUTCDATE()) AND IsActive = 1;

            -- 3. Monthly Expenses
            SELECT ISNULL(SUM(Amount), 0) FROM Expenses WHERE MONTH(ExpenseDate) = MONTH(GETUTCDATE()) AND YEAR(ExpenseDate) = YEAR(GETUTCDATE()) AND IsActive = 1;

            -- 4. GST Liability Month (Output - ITC)
            SELECT 
                (SELECT ISNULL(SUM(TaxAmount), 0) FROM Invoices WHERE MONTH(InvoiceDate) = MONTH(GETUTCDATE()) AND ISActive = 1) - 
                (SELECT ISNULL(SUM(TaxAmount), 0) FROM Purchases WHERE MONTH(PurchaseDate) = MONTH(GETUTCDATE()) AND ISActive = 1);

            -- 5. Active Jobs Count
            SELECT COUNT(*) FROM JobCards WHERE JobStatus NOT IN ('Completed', 'Delivered') AND IsActive = 1;

            -- 6. Pending Outsource Count
            SELECT COUNT(*) FROM OutsourceJobs WHERE Status != 'Completed' AND IsActive = 1;

            -- 7. Maintenance Alerts (Overdue/Today)
            SELECT COUNT(*) FROM MachineMaintenance WHERE MaintenanceDate <= GETUTCDATE() AND IsActive = 1;

            -- 8. Total Receivables
            SELECT ISNULL(SUM(NetBalance), 0) FROM Customers WHERE IsActive = 1;

            -- 9. Recent Jobs
            SELECT TOP 5 j.JobNumber, c.Name as CustomerName, j.JobStatus as Status 
            FROM JobCards j 
            JOIN Customers c ON j.CustomerId = c.Id 
            WHERE j.IsActive = 1 
            ORDER BY j.CreatedAt DESC;

            -- 10. General Stock Alerts
            SELECT Name as ItemName, CurrentStock, MinStockLevel as MinLevel 
            FROM InventoryItems 
            WHERE CurrentStock <= MinStockLevel AND IsActive = 1;

            -- 11. Special Stock Alerts (Paper & Media)
            SELECT Name as ItemName, Quantity as CurrentStock, LowStockAlert as MinLevel FROM PaperStocks WHERE Quantity <= LowStockAlert AND IsActive = 1
            UNION ALL
            SELECT Name as ItemName, QuantitySqFt as CurrentStock, LowStockAlert as MinLevel FROM MediaStocks WHERE QuantitySqFt <= LowStockAlert AND IsActive = 1;
        ";

        using var multi = await conn.QueryMultipleAsync(sql);
        var summary = new AdminDashboardSummary();
        
        summary.TodaySales = await multi.ReadFirstAsync<decimal>();
        summary.MonthlyRevenue = await multi.ReadFirstAsync<decimal>();
        summary.MonthlyExpenses = await multi.ReadFirstAsync<decimal>();
        summary.GstNetPayable = await multi.ReadFirstAsync<decimal>();
        summary.ActiveJobs = await multi.ReadFirstAsync<int>();
        summary.PendingOutsource = await multi.ReadFirstAsync<int>();
        summary.MaintenanceAlerts = await multi.ReadFirstAsync<int>();
        summary.TotalReceivables = await multi.ReadFirstAsync<decimal>();
        summary.RecentJobs = (await multi.ReadAsync<RecentJobDto>()).ToList();
        summary.StockAlerts = (await multi.ReadAsync<StockAlertDto>()).ToList();
        summary.SpecialStockAlerts = (await multi.ReadAsync<StockAlertDto>()).ToList();

        return summary;
    }
}
