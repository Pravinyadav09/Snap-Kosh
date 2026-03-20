using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Services;

public class PaymentService
{
    private readonly IPaymentRepository _repo;
    private readonly IAuditRepository _auditRepo;
    public PaymentService(IPaymentRepository repo, IAuditRepository auditRepo) 
    {
        _repo = repo;
        _auditRepo = auditRepo;
    }

    public Task<IEnumerable<Payment>> GetCustomerPayments(int customerId) => _repo.GetByCustomerAsync(customerId);
    
    public async Task<int> RecordPayment(Payment payment) 
    {
        payment.CreatedAt = DateTime.UtcNow;
        var id = await _repo.AddAsync(payment);
        
        await _auditRepo.LogAsync(new AuditLog 
        { 
            EntityName = "Payment", 
            EntityId = id.ToString(), 
            Action = "CREATED", 
            Changes = $"Amount: {payment.Amount}, Method: {payment.PaymentMethod}",
            PerformedBy = "System", // Ideally use current user
            Timestamp = DateTime.UtcNow
        });

        return id;
    }
}

public class AnalyticsService
{
    private readonly IAnalyticsRepository _repo;
    public AnalyticsService(IAnalyticsRepository repo) => _repo = repo;

    public Task<object> GetCustomerAnalysis() => _repo.GetCustomerAnalysisAsync();
    public Task<IEnumerable<object>> GetRevenueTrend() => _repo.GetMonthlyRevenueTrendAsync();
}

public class PortalService
{
    private readonly IPortalRepository _repo;
    public PortalService(IPortalRepository repo) => _repo = repo;

    public Task<IEnumerable<JobCard>> GetMyJobs(int customerId) => _repo.GetCustomerJobsAsync(customerId);
    public Task<IEnumerable<Invoice>> GetMyInvoices(int customerId) => _repo.GetCustomerInvoicesAsync(customerId);
}
