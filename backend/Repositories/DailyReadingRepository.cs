using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Repositories;

public class DailyReadingRepository : IDailyReadingRepository
{
    private readonly string _connectionString;

    public DailyReadingRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new ArgumentNullException("Connection string not found.");
    }

    public async Task<IEnumerable<DailyReading>> GetAllAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "SELECT * FROM DailyReadings ORDER BY ReadingDate DESC, Machine";
        return await connection.QueryAsync<DailyReading>(sql);
    }

    public async Task<DailyReading?> GetLastReadingByMachineAsync(string machineName)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "SELECT TOP 1 * FROM DailyReadings WHERE Machine = @Machine ORDER BY ReadingDate DESC, Id DESC";
        return await connection.QueryFirstOrDefaultAsync<DailyReading>(sql, new { Machine = machineName });
    }

    public async Task<int> AddAsync(DailyReading reading)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO DailyReadings (Machine, ReadingDate, Opening, Closing, Impressions, Remarks, CreatedAt) 
                    VALUES (@Machine, @ReadingDate, @Opening, @Closing, @Impressions, @Remarks, @CreatedAt);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await connection.ExecuteScalarAsync<int>(sql, reading);
    }
}
