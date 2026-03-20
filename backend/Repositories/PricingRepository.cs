using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Repositories;

public class PricingRepository : IPricingRepository
{
    private readonly string _connectionString;
    public PricingRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    // Rates Implementation
    public async Task<IEnumerable<PriceMaster>> GetRatesByCategory(string category)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<PriceMaster>("SELECT * FROM PriceMasters WHERE Category = @Category ORDER BY ItemName", new { Category = category });
    }

    public async Task<IEnumerable<PriceMaster>> GetAllRates()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<PriceMaster>("SELECT * FROM PriceMasters ORDER BY Category, ItemName");
    }

    public async Task<int> AddRate(PriceMaster rate)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "INSERT INTO PriceMasters (Category, ItemName, Rate, Unit, UpdatedAt) VALUES (@Category, @ItemName, @Rate, @Unit, @UpdatedAt); SELECT CAST(SCOPE_IDENTITY() as int);";
        return await conn.ExecuteScalarAsync<int>(sql, rate);
    }

    public async Task<bool> UpdateRate(PriceMaster rate)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "UPDATE PriceMasters SET Category=@Category, ItemName=@ItemName, Rate=@Rate, Unit=@Unit, UpdatedAt=@UpdatedAt WHERE Id=@Id";
        return await conn.ExecuteAsync(sql, rate) > 0;
    }

    public async Task<bool> DeleteRate(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync("DELETE FROM PriceMasters WHERE Id = @Id", new { Id = id }) > 0;
    }

    // Estimates Implementation
    public async Task<int> SaveEstimate(EstimationRecord estimate)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "INSERT INTO Estimates (CustomerId, JobDescription, EstimatedCost, QuotedPrice, SpecsJson, CreatedAt) VALUES (@CustomerId, @JobDescription, @EstimatedCost, @QuotedPrice, @SpecsJson, @CreatedAt); SELECT CAST(SCOPE_IDENTITY() as int);";
        return await conn.ExecuteScalarAsync<int>(sql, estimate);
    }

    public async Task<IEnumerable<EstimationRecord>> GetEstimatesByCustomer(int customerId)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<EstimationRecord>("SELECT * FROM Estimates WHERE CustomerId = @CustomerId ORDER BY CreatedAt DESC", new { CustomerId = customerId });
    }

    public async Task<EstimationRecord?> GetEstimateById(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryFirstOrDefaultAsync<EstimationRecord>("SELECT * FROM Estimates WHERE Id = @Id", new { Id = id });
    }
}
