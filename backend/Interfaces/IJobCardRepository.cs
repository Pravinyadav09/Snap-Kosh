using DigitalErp.Api.Models;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Interfaces;

public interface IJobCardRepository
{
    Task<IEnumerable<JobCard>> GetAllAsync();
    Task<IEnumerable<JobCard>> GetByCustomerIdAsync(int customerId);
    Task<JobCard?> GetByIdAsync(int id);
    Task<int> CreateAsync(JobCard jobCard);
    Task<bool> UpdateStatusAsync(int id, string status);
    Task<bool> UpdateDesignFileAsync(int id, string filePath);
    Task<bool> DispatchJobAsync(int id, int qty, string mode, string trackingRef);
    Task<PagedResult<JobCard>> GetPagedAsync(int page, int size, string? search);
    Task<IEnumerable<LookupDto>> GetLookupAsync();
}
