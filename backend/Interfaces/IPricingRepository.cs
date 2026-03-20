using DigitalErp.Api.Models;

namespace DigitalErp.Api.Interfaces;

public interface IPricingRepository
{
    // Rates
    Task<IEnumerable<PriceMaster>> GetRatesByCategory(string category);
    Task<IEnumerable<PriceMaster>> GetAllRates();
    Task<int> AddRate(PriceMaster rate);
    Task<bool> UpdateRate(PriceMaster rate);
    Task<bool> DeleteRate(int id);
    
    // Estimates
    Task<int> SaveEstimate(EstimationRecord estimate);
    Task<IEnumerable<EstimationRecord>> GetEstimatesByCustomer(int customerId);
    Task<EstimationRecord?> GetEstimateById(int id);
}
