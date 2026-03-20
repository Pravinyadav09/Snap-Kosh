using DigitalErp.Api.DTOs;
using DigitalErp.Api.Repositories;

namespace DigitalErp.Api.Services;

public class ReportService
{
    private readonly ReportRepository _repo;
    public ReportService(ReportRepository repo) => _repo = repo;

    public Task<IEnumerable<CustomerLedgerDto>> GetCustomerLedger(int customerId) => _repo.GetCustomerLedgerAsync(customerId);
    
    public Task<IEnumerable<GstReportDto>> GetGstReport(DateTime start, DateTime end) => _repo.GetGstSalesAsync(start, end);

    public Task<GstSummaryDto> GetGstSummary(DateTime start, DateTime end) => _repo.GetGstSummaryAsync(start, end);
}
