using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Interfaces;

public interface IUtilityRepository
{
    Task<IEnumerable<LookupDto>> GetVendors();
    Task<IEnumerable<LookupDto>> GetCustomers();
    Task<IEnumerable<LookupDto>> GetExpenseCategories();
    Task<IEnumerable<LookupDto>> GetInventoryItems();
    Task<IEnumerable<LookupDto>> GetMachineTypes();
    Task<IEnumerable<LookupDto>> GetMachines();
    Task<IEnumerable<LookupDto>> GetTaxRates();
    Task<IEnumerable<LookupDto>> GetDeliveryModes();
}
