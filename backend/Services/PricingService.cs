using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Services;

public class PricingService
{
    private readonly IPricingRepository _repo;
    public PricingService(IPricingRepository repo) => _repo = repo;

    // Rates
    public Task<IEnumerable<PriceMaster>> GetRatesByCategory(string category) => _repo.GetRatesByCategory(category);
    public Task<IEnumerable<PriceMaster>> GetAllRates() => _repo.GetAllRates();
    public async Task<int> AddRate(PriceMaster rate) { rate.UpdatedAt = DateTime.UtcNow; return await _repo.AddRate(rate); }
    public async Task<bool> UpdateRate(PriceMaster rate) { rate.UpdatedAt = DateTime.UtcNow; return await _repo.UpdateRate(rate); }
    public Task<bool> DeleteRate(int id) => _repo.DeleteRate(id);

    // Estimates
    public async Task<int> SaveEstimate(EstimationRecord estimate) 
    { 
        estimate.CreatedAt = DateTime.UtcNow; 
        return await _repo.SaveEstimate(estimate); 
    }
    public Task<IEnumerable<EstimationRecord>> GetByCustomer(int customerId) => _repo.GetEstimatesByCustomer(customerId);
    public Task<EstimationRecord?> GetById(int id) => _repo.GetEstimateById(id);
}
