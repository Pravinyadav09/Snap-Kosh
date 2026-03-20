using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Repositories;

public class PurchaseRepository : IPurchaseRepository
{
    private readonly string _connectionString;
    public PurchaseRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<Purchase>> GetAllAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<Purchase>("SELECT * FROM Purchases WHERE IsActive = 1 ORDER BY PurchaseDate DESC");
    }

    public async Task<Purchase?> GetByIdAsync(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryFirstOrDefaultAsync<Purchase>("SELECT * FROM Purchases WHERE Id = @Id", new { Id = id });
    }

    public async Task<int> AddAsync(Purchase purchase)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO Purchases (PurchaseNumber, VendorId, InventoryItemId, Quantity, Rate, TotalAmount, Status, PurchaseDate, CreatedAt, IsActive) 
                    VALUES (@PurchaseNumber, @VendorId, @InventoryItemId, @Quantity, @Rate, @TotalAmount, @Status, @PurchaseDate, @CreatedAt, @IsActive);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await conn.ExecuteScalarAsync<int>(sql, purchase);
    }

    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync("UPDATE Purchases SET Status = @Status WHERE Id = @Id", new { Id = id, Status = status }) > 0;
    }
}
