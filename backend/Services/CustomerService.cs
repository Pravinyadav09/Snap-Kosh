using System.Threading.Tasks;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Services;

public class CustomerService
{
    private readonly ICustomerRepository _customerRepo;

    public CustomerService(ICustomerRepository customerRepo)
    {
        _customerRepo = customerRepo;
    }

    public async Task<PagedResult<Customer>> GetCustomersPaged(int page, int size, string? search)
    {
        return await _customerRepo.GetPagedAsync(page, size, search);
    }

    public async Task<Customer?> GetCustomer(int id)
    {
        return await _customerRepo.GetByIdAsync(id);
    }

    public async Task<int> CreateCustomer(CreateCustomerDto dto)
    {
        var customer = new Customer
        {
            Name = dto.Name.ToUpper(),
            GstNumber = dto.GstNumber,
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address,
            NetBalance = 0,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        return await _customerRepo.AddAsync(customer);
    }

    public async Task<bool> UpdateCustomer(Customer customer)
    {
        return await _customerRepo.UpdateAsync(customer);
    }

    public async Task<bool> DeleteCustomer(int id)
    {
        return await _customerRepo.DeleteAsync(id);
    }

    public async Task<IEnumerable<LookupDto>> GetLookup()
    {
        return await _customerRepo.GetLookupAsync();
    }
}
