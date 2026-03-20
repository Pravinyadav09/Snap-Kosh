using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Repositories;

public class AuditRepository : IAuditRepository
{
    private readonly string _connectionString;
    public AuditRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<int> LogAsync(AuditLog log)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO AuditLogs (EntityName, EntityId, Action, Changes, PerformedBy, Timestamp) 
                    VALUES (@EntityName, @EntityId, @Action, @Changes, @PerformedBy, @Timestamp);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await conn.ExecuteScalarAsync<int>(sql, log);
    }

    public async Task<IEnumerable<AuditLog>> GetRecentAsync(int count)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<AuditLog>(
            "SELECT TOP (@Count) * FROM AuditLogs ORDER BY Timestamp DESC", 
            new { Count = count });
    }
}
