using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Repositories;

public class MachineRepository : IMachineRepository
{
    private readonly string _connectionString;
    public MachineRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<Machine>> GetAllAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<Machine>("SELECT * FROM Machines WHERE IsActive = 1 ORDER BY Name");
    }

    public async Task<Machine?> GetByIdAsync(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryFirstOrDefaultAsync<Machine>("SELECT * FROM Machines WHERE Id = @Id", new { Id = id });
    }

    public async Task<int> AddAsync(Machine machine)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO Machines (Name, Type, Status, CurrentMeterReading, LastServiceDate, CreatedAt, IsActive) 
                    VALUES (@Name, @Type, @Status, @CurrentMeterReading, @LastServiceDate, @CreatedAt, @IsActive);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await conn.ExecuteScalarAsync<int>(sql, machine);
    }

    public async Task<bool> UpdateAsync(Machine machine)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"UPDATE Machines SET Name=@Name, Type=@Type, Status=@Status, CurrentMeterReading=@CurrentMeterReading, LastServiceDate=@LastServiceDate WHERE Id=@Id";
        return await conn.ExecuteAsync(sql, machine) > 0;
    }

    public async Task<IEnumerable<LookupDto>> GetLookupAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<LookupDto>("SELECT Id, Name FROM Machines WHERE IsActive = 1 ORDER BY Name");
    }
}
