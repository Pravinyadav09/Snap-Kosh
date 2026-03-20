using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Repositories;

public class SpecializedInventoryRepository : ISpecializedInventoryRepository
{
    private readonly string _connectionString;
    public SpecializedInventoryRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    // Paper Stocks Implementation
    public async Task<IEnumerable<PaperStock>> GetPaperStocks()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<PaperStock>("SELECT * FROM PaperStocks WHERE IsActive = 1 ORDER BY Name");
    }

    public async Task<PaperStock?> GetPaperStock(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryFirstOrDefaultAsync<PaperStock>("SELECT * FROM PaperStocks WHERE Id = @Id", new { Id = id });
    }

    public async Task<int> AddPaperStock(PaperStock stock)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO PaperStocks (Name, Type, Gsm, Size, Width, Height, Quantity, UnitPrice, LowStockAlert, CalcMode, RimWeight, SheetsPerPacket, PricePerKg, Color, CreatedAt, IsActive) 
                    VALUES (@Name, @Type, @Gsm, @Size, @Width, @Height, @Quantity, @UnitPrice, @LowStockAlert, @CalcMode, @RimWeight, @SheetsPerPacket, @PricePerKg, @Color, @CreatedAt, @IsActive);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await conn.ExecuteScalarAsync<int>(sql, stock);
    }

    public async Task<bool> UpdatePaperStock(PaperStock stock)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"UPDATE PaperStocks SET Name=@Name, Type=@Type, Gsm=@Gsm, Size=@Size, Width=@Width, Height=@Height, Quantity=@Quantity, UnitPrice=@UnitPrice, LowStockAlert=@LowStockAlert, CalcMode=@CalcMode, RimWeight=@RimWeight, SheetsPerPacket=@SheetsPerPacket, PricePerKg=@PricePerKg, Color=@Color WHERE Id=@Id";
        return await conn.ExecuteAsync(sql, stock) > 0;
    }

    public async Task<bool> DeletePaperStock(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync("UPDATE PaperStocks SET IsActive = 0 WHERE Id = @Id", new { Id = id }) > 0;
    }

    // Media Stocks Implementation
    public async Task<IEnumerable<MediaStock>> GetMediaStocks()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<MediaStock>("SELECT * FROM MediaStocks WHERE IsActive = 1 ORDER BY Name");
    }

    public async Task<MediaStock?> GetMediaStock(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryFirstOrDefaultAsync<MediaStock>("SELECT * FROM MediaStocks WHERE Id = @Id", new { Id = id });
    }

    public async Task<int> AddMediaStock(MediaStock stock)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO MediaStocks (Name, Type, RollWidth, RollLength, CostPerRoll, CostPerSqFt, QuantitySqFt, LowStockAlert, Status, CreatedAt, IsActive) 
                    VALUES (@Name, @Type, @RollWidth, @RollLength, @CostPerRoll, @CostPerSqFt, @QuantitySqFt, @LowStockAlert, @Status, @CreatedAt, @IsActive);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await conn.ExecuteScalarAsync<int>(sql, stock);
    }

    public async Task<bool> UpdateMediaStock(MediaStock stock)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"UPDATE MediaStocks SET Name=@Name, Type=@Type, RollWidth=@RollWidth, RollLength=@RollLength, CostPerRoll=@CostPerRoll, CostPerSqFt=@CostPerSqFt, QuantitySqFt=@QuantitySqFt, LowStockAlert=@LowStockAlert, Status=@Status WHERE Id=@Id";
        return await conn.ExecuteAsync(sql, stock) > 0;
    }

    public async Task<bool> DeleteMediaStock(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync("UPDATE MediaStocks SET IsActive = 0 WHERE Id = @Id", new { Id = id }) > 0;
    }
}
