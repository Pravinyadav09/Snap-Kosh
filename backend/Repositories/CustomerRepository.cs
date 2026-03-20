using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;
using Microsoft.Extensions.Configuration;

namespace DigitalErp.Api.Repositories;

public class CustomerRepository : ICustomerRepository
{
    private readonly string _connectionString;

    public CustomerRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new ArgumentNullException("Connection string not found.");
    }

    public async Task<PagedResult<Customer>> GetPagedAsync(int pageNumber, int pageSize, string? searchTerm)
    {
        using var connection = new SqlConnection(_connectionString);
        
        var sql = @"SELECT * FROM Customers 
                    WHERE IsActive = 1 
                    AND (@SearchTerm IS NULL OR Name LIKE '%' + @SearchTerm + '%' OR Phone LIKE '%' + @SearchTerm + '%')
                    ORDER BY Name
                    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
                    
                    SELECT COUNT(*) FROM Customers 
                    WHERE IsActive = 1 
                    AND (@SearchTerm IS NULL OR Name LIKE '%' + @SearchTerm + '%' OR Phone LIKE '%' + @SearchTerm + '%');";

        using var multi = await connection.QueryMultipleAsync(sql, new 
        { 
            SearchTerm = searchTerm, 
            Offset = (pageNumber - 1) * pageSize, 
            PageSize = pageSize 
        });

        var result = new PagedResult<Customer>
        {
            Items = await multi.ReadAsync<Customer>(),
            TotalCount = await multi.ReadFirstAsync<int>(),
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        return result;
    }

    public async Task<Customer?> GetByIdAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "SELECT * FROM Customers WHERE Id = @Id";
        return await connection.QueryFirstOrDefaultAsync<Customer>(sql, new { Id = id });
    }

    public async Task<int> AddAsync(Customer customer)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO Customers (Name, GstNumber, Phone, Email, Address, NetBalance, CreatedAt, IsActive) 
                    VALUES (@Name, @GstNumber, @Phone, @Email, @Address, @NetBalance, @CreatedAt, @IsActive);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await connection.ExecuteScalarAsync<int>(sql, customer);
    }

    public async Task<bool> UpdateAsync(Customer customer)
    {
        using var connection = new SqlConnection(_connectionString);
        customer.UpdatedAt = DateTime.UtcNow;
        var sql = @"UPDATE Customers 
                    SET Name = @Name, GstNumber = @GstNumber, Phone = @Phone, 
                        Email = @Email, Address = @Address, NetBalance = @NetBalance, 
                        UpdatedAt = @UpdatedAt 
                    WHERE Id = @Id";
        var rows = await connection.ExecuteAsync(sql, customer);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "UPDATE Customers SET IsActive = 0 WHERE Id = @Id";
        var rows = await connection.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }

    public async Task<Customer?> GetByEmailAsync(string email)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "SELECT * FROM Customers WHERE Email = @Email AND IsActive = 1";
        return await connection.QueryFirstOrDefaultAsync<Customer>(sql, new { Email = email });
    }

    public async Task<IEnumerable<Customer>> GetAllAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "SELECT * FROM Customers WHERE IsActive = 1 ORDER BY Name";
        return await connection.QueryAsync<Customer>(sql);
    }

    public async Task<IEnumerable<LookupDto>> GetLookupAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "SELECT Id, Name FROM Customers WHERE IsActive = 1 ORDER BY Name";
        return await connection.QueryAsync<LookupDto>(sql);
    }
}
