using DigitalErp.Api.Models;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Interfaces;

public interface ICustomerRepository
{
    Task<PagedResult<Customer>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm);
    Task<Customer?> GetByIdAsync(int id);
    Task<int> AddAsync(Customer customer);
    Task<bool> UpdateAsync(Customer customer);
    Task<bool> DeleteAsync(int id);
    Task<Customer?> GetByEmailAsync(string email);
    Task<IEnumerable<Customer>> GetAllAsync();
    Task<IEnumerable<LookupDto>> GetLookupAsync();
}
