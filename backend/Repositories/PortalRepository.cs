using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Repositories;

public class PortalRepository : IPortalRepository
{
    private readonly string _connectionString;
    public PortalRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<JobCard>> GetCustomerJobsAsync(int customerId)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<JobCard>(
            "SELECT * FROM JobCards WHERE CustomerId = @CustomerId AND IsActive = 1 ORDER BY CreatedAt DESC", 
            new { CustomerId = customerId });
    }

    public async Task<IEnumerable<Invoice>> GetCustomerInvoicesAsync(int customerId)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<Invoice>(
            "SELECT * FROM Invoices WHERE CustomerId = @CustomerId AND IsActive = 1 ORDER BY InvoiceDate DESC", 
            new { CustomerId = customerId });
    }
}
