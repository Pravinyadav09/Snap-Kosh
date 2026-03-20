using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Services;

public class SpecializedInventoryService
{
    private readonly ISpecializedInventoryRepository _repo;
    public SpecializedInventoryService(ISpecializedInventoryRepository repo) => _repo = repo;

    // Paper Stocks
    public Task<IEnumerable<PaperStock>> GetPaperStocks() => _repo.GetPaperStocks();
    public Task<PaperStock?> GetPaperStock(int id) => _repo.GetPaperStock(id);
    public async Task<int> AddPaperStock(PaperStock stock) 
    { 
        stock.CreatedAt = DateTime.UtcNow; 
        stock.IsActive = true; 
        return await _repo.AddPaperStock(stock); 
    }
    public Task<bool> UpdatePaperStock(PaperStock stock) => _repo.UpdatePaperStock(stock);
    public Task<bool> DeletePaperStock(int id) => _repo.DeletePaperStock(id);

    // Media Stocks
    public Task<IEnumerable<MediaStock>> GetMediaStocks() => _repo.GetMediaStocks();
    public Task<MediaStock?> GetMediaStock(int id) => _repo.GetMediaStock(id);
    public async Task<int> AddMediaStock(MediaStock stock) 
    { 
        stock.CreatedAt = DateTime.UtcNow; 
        stock.IsActive = true; 
        return await _repo.AddMediaStock(stock); 
    }
    public Task<bool> UpdateMediaStock(MediaStock stock) => _repo.UpdateMediaStock(stock);
    public Task<bool> DeleteMediaStock(int id) => _repo.DeleteMediaStock(id);
}
