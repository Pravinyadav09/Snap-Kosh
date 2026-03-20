using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Repositories;

public class SchedulerRepository : ISchedulerRepository
{
    private readonly string _connectionString;
    public SchedulerRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<ScheduleEntry>> GetByDateRangeAsync(DateTime start, DateTime end)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<ScheduleEntry>(
            "SELECT * FROM Scheduler WHERE StartTime >= @Start AND EndTime <= @End AND IsActive = 1", 
            new { Start = start, End = end });
    }

    public async Task<int> AddAsync(ScheduleEntry entry)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO Scheduler (JobCardId, MachineId, StartTime, EndTime, Remarks, IsActive) 
                    VALUES (@JobCardId, @MachineId, @StartTime, @EndTime, @Remarks, 1);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await conn.ExecuteScalarAsync<int>(sql, entry);
    }

    public async Task<bool> UpdateAsync(ScheduleEntry entry)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = "UPDATE Scheduler SET MachineId=@MachineId, StartTime=@StartTime, EndTime=@EndTime, Remarks=@Remarks WHERE Id=@Id";
        return await conn.ExecuteAsync(sql, entry) > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync("UPDATE Scheduler SET IsActive = 0 WHERE Id = @Id", new { Id = id }) > 0;
    }
}
