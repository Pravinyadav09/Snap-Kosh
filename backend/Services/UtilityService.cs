using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Services;

public class UtilityService
{
    private readonly IUtilityRepository _repo;
    public UtilityService(IUtilityRepository repo) => _repo = repo;

    public Task<IEnumerable<LookupDto>> GetVendors() => _repo.GetVendors();
    public Task<IEnumerable<LookupDto>> GetCustomers() => _repo.GetCustomers();
    public Task<IEnumerable<LookupDto>> GetExpenseCategories() => _repo.GetExpenseCategories();
    public Task<IEnumerable<LookupDto>> GetInventoryItems() => _repo.GetInventoryItems();
    public Task<IEnumerable<LookupDto>> GetMachineTypes() => _repo.GetMachineTypes();
    public Task<IEnumerable<LookupDto>> GetMachines() => _repo.GetMachines();
    public Task<IEnumerable<LookupDto>> GetTaxRates() => _repo.GetTaxRates();
    public Task<IEnumerable<LookupDto>> GetDeliveryModes() => _repo.GetDeliveryModes();
}
