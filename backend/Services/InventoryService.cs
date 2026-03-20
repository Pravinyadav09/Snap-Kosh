using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Services;

public class InventoryService
{
    private readonly IInventoryRepository _inventoryRepo;

    public InventoryService(IInventoryRepository inventoryRepo)
    {
        _inventoryRepo = inventoryRepo;
    }

    public async Task<IEnumerable<InventoryItem>> GetAllInventory()
    {
        return await _inventoryRepo.GetAllAsync();
    }

    public async Task<InventoryItem?> GetItemDetails(int id)
    {
        return await _inventoryRepo.GetByIdAsync(id);
    }

    public async Task<int> AddNewItem(InventoryItem item)
    {
        return await _inventoryRepo.AddAsync(item);
    }

    public async Task<bool> RecordStockMovement(int itemId, decimal quantity, string transactionType, string refType, int? refId = null)
    {
        // Business Rule: Ensure we don't dispatch more than we have (if transactionType is 'Outward')
        if (transactionType.Equals("Outward", StringComparison.OrdinalIgnoreCase))
        {
            var item = await _inventoryRepo.GetByIdAsync(itemId);
            if (item == null || item.CurrentStock < quantity)
            {
                throw new InvalidOperationException("Insufficient stock to fulfill this request.");
            }
        }

        return await _inventoryRepo.UpdateStockAsync(itemId, quantity, transactionType, refType, refId);
    }

    public async Task<IEnumerable<StockTransaction>> GetItemHistory(int itemId)
    {
        return await _inventoryRepo.GetHistoryAsync(itemId);
    }

    public Task<IEnumerable<LookupDto>> GetLookup()
    {
        return _inventoryRepo.GetLookupAsync();
    }
}
