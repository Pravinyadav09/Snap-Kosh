using DigitalErp.Api.Models;

namespace DigitalErp.Api.Interfaces;

public interface ISpecializedInventoryRepository
{
    // Paper Stocks
    Task<IEnumerable<PaperStock>> GetPaperStocks();
    Task<PaperStock?> GetPaperStock(int id);
    Task<int> AddPaperStock(PaperStock stock);
    Task<bool> UpdatePaperStock(PaperStock stock);
    Task<bool> DeletePaperStock(int id);
    
    // Media Stocks
    Task<IEnumerable<MediaStock>> GetMediaStocks();
    Task<MediaStock?> GetMediaStock(int id);
    Task<int> AddMediaStock(MediaStock stock);
    Task<bool> UpdateMediaStock(MediaStock stock);
    Task<bool> DeleteMediaStock(int id);
}
