using DigitalErp.Api.Models;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Interfaces;

public interface IInvoiceRepository
{
    Task<IEnumerable<Invoice>> GetAllAsync();
    Task<Invoice?> GetByIdAsync(int id);
    Task<int> CreateAsync(Invoice invoice);
    Task<bool> UpdateStatusAsync(int id, string status);
    Task<PagedResult<Invoice>> GetPagedAsync(int page, int size, string? search);
}
