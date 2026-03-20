using DigitalErp.Api.Models;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Interfaces;

public interface IInventoryRepository
{
    Task<IEnumerable<InventoryItem>> GetAllAsync();
    Task<InventoryItem?> GetByIdAsync(int id);
    Task<int> AddAsync(InventoryItem item);
    Task<bool> UpdateStockAsync(int itemId, decimal quantity, string transactionType, string refType, int? refId);
    Task<IEnumerable<StockTransaction>> GetHistoryAsync(int itemId);
    Task<IEnumerable<LookupDto>> GetLookupAsync();
}
