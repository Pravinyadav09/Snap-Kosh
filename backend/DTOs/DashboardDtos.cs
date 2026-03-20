namespace DigitalErp.Api.DTOs;

public class AdminDashboardSummary
{
    public decimal TodaySales { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public decimal MonthlyExpenses { get; set; }
    public decimal GstNetPayable { get; set; }
    public int ActiveJobs { get; set; }
    public int PendingOutsource { get; set; }
    public int MaintenanceAlerts { get; set; }
    public decimal TotalReceivables { get; set; } 
    public List<RecentJobDto> RecentJobs { get; set; } = new();
    public List<StockAlertDto> StockAlerts { get; set; } = new();
    public List<StockAlertDto> SpecialStockAlerts { get; set; } = new(); // Paper & Media
}

public class RecentJobDto
{
    public string JobNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class StockAlertDto
{
    public string ItemName { get; set; } = string.Empty;
    public decimal CurrentStock { get; set; }
    public decimal MinLevel { get; set; }
}
