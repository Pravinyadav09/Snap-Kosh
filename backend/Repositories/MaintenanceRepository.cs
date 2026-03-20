using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Repositories;

public class MaintenanceRepository : IMaintenanceRepository
{
    private readonly string _connectionString;
    public MaintenanceRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<MachineMaintenance>> GetAllAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<MachineMaintenance>("SELECT * FROM MachineMaintenance ORDER BY MaintenanceDate DESC");
    }

    public async Task<IEnumerable<MachineMaintenance>> GetByMachineAsync(int machineId)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<MachineMaintenance>("SELECT * FROM MachineMaintenance WHERE MachineId = @MachineId ORDER BY MaintenanceDate DESC", new { MachineId = machineId });
    }

    public async Task<int> AddAsync(MachineMaintenance maintenance)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO MachineMaintenance (MachineId, Category, Priority, Status, Description, MaintenanceDate, Cost, PerformedBy, CreatedAt) 
                    VALUES (@MachineId, @Category, @Priority, @Status, @Description, @MaintenanceDate, @Cost, @PerformedBy, @CreatedAt);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await conn.ExecuteScalarAsync<int>(sql, maintenance);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync("DELETE FROM MachineMaintenance WHERE Id = @Id", new { Id = id }) > 0;
    }
}
