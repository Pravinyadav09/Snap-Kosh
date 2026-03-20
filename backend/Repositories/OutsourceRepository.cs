using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Repositories;

public class OutsourceRepository : IOutsourceRepository
{
    private readonly string _connectionString;
    public OutsourceRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<Vendor>> GetAllVendorsAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<Vendor>("SELECT * FROM Vendors WHERE IsActive = 1 ORDER BY Name");
    }

    public async Task<int> AddVendorAsync(Vendor vendor)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO Vendors (Name, GstNumber, Phone, Email, Address, Specialization, CreatedAt, IsActive) 
                    VALUES (@Name, @GstNumber, @Phone, @Email, @Address, @Specialization, @CreatedAt, @IsActive);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await conn.ExecuteScalarAsync<int>(sql, vendor);
    }

    public async Task<IEnumerable<OutsourceJob>> GetAllJobsAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<OutsourceJob>("SELECT * FROM OutsourceJobs WHERE IsActive = 1 ORDER BY CreatedAt DESC");
    }

    public async Task<int> AddJobAsync(OutsourceJob job)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO OutsourceJobs (VendorId, JobCardId, Description, Cost, Status, DueDate, CreatedAt, IsActive) 
                    VALUES (@VendorId, @JobCardId, @Description, @Cost, @Status, @DueDate, @CreatedAt, @IsActive);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await conn.ExecuteScalarAsync<int>(sql, job);
    }

    public async Task<bool> UpdateJobStatusAsync(int id, string status)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync("UPDATE OutsourceJobs SET Status = @Status WHERE Id = @Id", new { Id = id, Status = status }) > 0;
    }

    public async Task<IEnumerable<LookupDto>> GetVendorLookupAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<LookupDto>("SELECT Id, Name FROM Vendors WHERE IsActive = 1 ORDER BY Name");
    }
}
