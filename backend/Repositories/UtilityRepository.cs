using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Repositories;

public class UtilityRepository : IUtilityRepository
{
    private readonly string _connectionString;
    public UtilityRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<LookupDto>> GetVendors()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<LookupDto>("SELECT Id, Name FROM Vendors WHERE IsActive = 1 ORDER BY Name");
    }

    public async Task<IEnumerable<LookupDto>> GetCustomers()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<LookupDto>("SELECT Id, Name FROM Customers WHERE IsActive = 1 ORDER BY Name");
    }

    public async Task<IEnumerable<LookupDto>> GetExpenseCategories()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<LookupDto>("SELECT Id, Name FROM ExpenseCategories WHERE IsActive = 1 ORDER BY Name");
    }

    public async Task<IEnumerable<LookupDto>> GetInventoryItems()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<LookupDto>("SELECT Id, Name FROM InventoryItems WHERE IsActive = 1 ORDER BY Name");
    }

    public async Task<IEnumerable<LookupDto>> GetMachineTypes()
    {
        // Static for now, can be a table later
        return await Task.FromResult(new List<LookupDto> {
            new() { Id = 1, Name = "Offset" },
            new() { Id = 2, Name = "Digital" },
            new() { Id = 3, Name = "Flex" },
            new() { Id = 4, Name = "Wide-Format" }
        });
    }

    public async Task<IEnumerable<LookupDto>> GetMachines()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<LookupDto>("SELECT Id, Name FROM Machines WHERE IsActive = 1 ORDER BY Name");
    }

    public async Task<IEnumerable<LookupDto>> GetTaxRates()
    {
        // Static for common GST rates
        return await Task.FromResult(new List<LookupDto> {
            new() { Id = 5, Name = "5% GST" },
            new() { Id = 12, Name = "12% GST" },
            new() { Id = 18, Name = "18% GST" }
        });
    }

    public async Task<IEnumerable<LookupDto>> GetDeliveryModes()
    {
        return await Task.FromResult(new List<LookupDto> {
            new() { Id = 1, Name = "Self" },
            new() { Id = 2, Name = "Staff" },
            new() { Id = 3, Name = "Courier" },
            new() { Id = 4, Name = "Third-Party" }
        });
    }
}
