using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Services;

public class JobCardService
{
    private readonly IJobCardRepository _repo;
    private readonly InventoryService _inventoryService;
    private readonly IAuditRepository _auditRepo;

    public JobCardService(IJobCardRepository repo, InventoryService inventoryService, IAuditRepository auditRepo)
    {
        _repo = repo;
        _inventoryService = inventoryService;
        _auditRepo = auditRepo;
    }

    public async Task<PagedResult<JobCard>> GetJobsPaged(int page, int size, string? search)
    {
        return await _repo.GetPagedAsync(page, size, search);
    }

    public async Task<IEnumerable<JobCard>> GetCustomerJobs(int customerId)
    {
        return await _repo.GetByCustomerIdAsync(customerId);
    }

    public async Task<JobCard?> GetJobDetails(int id)
    {
        return await _repo.GetByIdAsync(id);
    }

    public async Task<int> CreateJobCard(JobCard jobCard)
    {
        // Auto-generate Job Ticket Number
        jobCard.JobNumber = $"JOB-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";
        jobCard.CreatedAt = DateTime.UtcNow;

        return await _repo.CreateAsync(jobCard);
    }

    public async Task<bool> UpdateJobStatus(int id, string status)
    {
        var job = await _repo.GetByIdAsync(id);
        if (job == null) return false;

        // Auto-Stock Deduction Logic
        // If status moves to 'Printing' and inventory info is provided, deduct stock
        if (status.Equals("Printing", StringComparison.OrdinalIgnoreCase) && 
            job.JobStatus.Equals("Pending", StringComparison.OrdinalIgnoreCase) &&
            job.InventoryItemId.HasValue && job.InventoryQuantity.HasValue)
        {
            await _inventoryService.RecordStockMovement(
                job.InventoryItemId.Value, 
                job.InventoryQuantity.Value, 
                "Outward", 
                $"Job-{job.JobNumber}");
        }

        var success = await _repo.UpdateStatusAsync(id, status);
        if (success)
        {
            await _auditRepo.LogAsync(new AuditLog 
            { 
                EntityName = "JobCard", 
                EntityId = id.ToString(), 
                Action = "STATUS_UPDATE", 
                Changes = $"Old: {job.JobStatus}, New: {status}",
                PerformedBy = "System",
                Timestamp = DateTime.UtcNow
            });
        }
        return success;
    }
    public async Task<bool> UpdateDesignFile(int id, string filePath)
    {
        var success = await _repo.UpdateDesignFileAsync(id, filePath);
        if (success)
        {
            await _auditRepo.LogAsync(new AuditLog 
            { 
                EntityName = "JobCard", 
                EntityId = id.ToString(), 
                Action = "FILE_UPLOAD", 
                Changes = $"New Path: {filePath}",
                PerformedBy = "System",
                Timestamp = DateTime.UtcNow
            });
        }
        return success;
    }

    public async Task<bool> DispatchJob(int id, int qty, string mode, string trackingRef)
    {
        var job = await _repo.GetByIdAsync(id);
        if (job == null) return false;

        var success = await _repo.DispatchJobAsync(id, qty, mode, trackingRef);
        if (success)
        {
            await _auditRepo.LogAsync(new AuditLog 
            { 
                EntityName = "JobCard", 
                EntityId = id.ToString(), 
                Action = "DISPATCH", 
                Changes = $"Qty: {qty}, Mode: {mode}, Tracking: {trackingRef}",
                PerformedBy = "System",
                Timestamp = DateTime.UtcNow
            });
        }
        return success;
    }

    public async Task<IEnumerable<LookupDto>> GetLookup()
    {
        return await _repo.GetLookupAsync();
    }
}
