using DigitalErp.Api.Models;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Interfaces;

public interface IAnalyticsRepository
{
    Task<object> GetCustomerAnalysisAsync();
    Task<IEnumerable<object>> GetMonthlyRevenueTrendAsync();
}

public interface IPortalRepository
{
    Task<IEnumerable<JobCard>> GetCustomerJobsAsync(int customerId);
    Task<IEnumerable<Invoice>> GetCustomerInvoicesAsync(int customerId);
}
