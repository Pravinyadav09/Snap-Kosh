using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Repositories;

public class InventoryRepository : IInventoryRepository
{
    private readonly string _connectionString;

    public InventoryRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new ArgumentNullException("Connection string not found.");
    }

    public async Task<IEnumerable<InventoryItem>> GetAllAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<InventoryItem>("SELECT * FROM InventoryItems WHERE IsActive = 1");
    }

    public async Task<InventoryItem?> GetByIdAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<InventoryItem>("SELECT * FROM InventoryItems WHERE Id = @Id", new { Id = id });
    }

    public async Task<int> AddAsync(InventoryItem item)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO InventoryItems (Name, Category, Unit, CurrentStock, MinStockLevel, LastPurchasePrice, LastUpdated, IsActive) 
                    VALUES (@Name, @Category, @Unit, @CurrentStock, @MinStockLevel, @LastPurchasePrice, @LastUpdated, @IsActive);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await connection.ExecuteScalarAsync<int>(sql, item);
    }

    public async Task<bool> UpdateStockAsync(int itemId, decimal quantity, string transactionType, string refType, int? refId)
    {
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            // 1. Update InventoryItem Balance
            var updateSql = transactionType.ToLower() == "inward" 
                ? "UPDATE InventoryItems SET CurrentStock = CurrentStock + @Qty, LastUpdated = GETUTCDATE() WHERE Id = @Id"
                : "UPDATE InventoryItems SET CurrentStock = CurrentStock - @Qty, LastUpdated = GETUTCDATE() WHERE Id = @Id";

            await connection.ExecuteAsync(updateSql, new { Qty = quantity, Id = itemId }, transaction);

            // 2. Record Transaction
            var logSql = @"INSERT INTO StockTransactions (InventoryItemId, Quantity, Type, ReferenceType, ReferenceId, TransactionDate) 
                           VALUES (@ItemId, @Qty, @Type, @RefType, @RefId, GETUTCDATE())";

            await connection.ExecuteAsync(logSql, new { ItemId = itemId, Qty = quantity, Type = transactionType, RefType = refType, RefId = refId }, transaction);

            transaction.Commit();
            return true;
        }
        catch
        {
            transaction.Rollback();
            return false;
        }
    }

    public async Task<IEnumerable<StockTransaction>> GetHistoryAsync(int itemId)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<StockTransaction>("SELECT * FROM StockTransactions WHERE InventoryItemId = @ItemId ORDER BY TransactionDate DESC", new { ItemId = itemId });
    }

    public async Task<IEnumerable<LookupDto>> GetLookupAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<LookupDto>("SELECT Id, Name FROM InventoryItems WHERE IsActive = 1 ORDER BY Name");
    }
}
