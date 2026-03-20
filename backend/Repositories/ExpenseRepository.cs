using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Repositories;

public class ExpenseRepository : IExpenseRepository
{
    private readonly string _connectionString;

    public ExpenseRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new ArgumentNullException("Connection string not found.");
    }

    public async Task<IEnumerable<Expense>> GetAllAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "SELECT * FROM Expenses WHERE IsActive = 1 ORDER BY ExpenseDate DESC";
        return await connection.QueryAsync<Expense>(sql);
    }

    public async Task<Expense?> GetByIdAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "SELECT * FROM Expenses WHERE Id = @Id AND IsActive = 1";
        return await connection.QueryFirstOrDefaultAsync<Expense>(sql, new { Id = id });
    }

    public async Task<int> AddAsync(Expense expense)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO Expenses (Title, Category, Amount, ExpenseDate, PaymentMethod, ReferenceNumber, IsGstBill, VendorId, Notes, CreatedAt, IsActive) 
                    VALUES (@Title, @Category, @Amount, @ExpenseDate, @PaymentMethod, @ReferenceNumber, @IsGstBill, @VendorId, @Notes, @CreatedAt, @IsActive);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await connection.ExecuteScalarAsync<int>(sql, expense);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        // Soft delete
        var sql = "UPDATE Expenses SET IsActive = 0 WHERE Id = @Id";
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }
}
