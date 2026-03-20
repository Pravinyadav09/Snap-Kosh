using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Repositories;

public class QuotationRepository : IQuotationRepository
{
    private readonly string _connectionString;
    public QuotationRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<Quotation>> GetAllAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<Quotation>("SELECT * FROM Quotations WHERE IsActive = 1 ORDER BY CreatedAt DESC");
    }

    public async Task<Quotation?> GetByIdAsync(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryFirstOrDefaultAsync<Quotation>("SELECT * FROM Quotations WHERE Id = @Id", new { Id = id });
    }

    public async Task<int> AddAsync(Quotation quotation)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO Quotations (QuotationNumber, CustomerId, Description, PaperSize, PaperType, BookDetails, EstimatedCost, QuotedPrice, ProfitMargin, Status, ValidTill, CreatedAt, IsActive) 
                    VALUES (@QuotationNumber, @CustomerId, @Description, @PaperSize, @PaperType, @BookDetails, @EstimatedCost, @QuotedPrice, @ProfitMargin, @Status, @ValidTill, @CreatedAt, @IsActive);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await conn.ExecuteScalarAsync<int>(sql, quotation);
    }

    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync("UPDATE Quotations SET Status = @Status WHERE Id = @Id", new { Id = id, Status = status }) > 0;
    }
}
