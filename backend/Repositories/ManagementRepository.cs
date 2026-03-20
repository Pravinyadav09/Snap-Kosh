using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Repositories;

public class ManagementRepository : IManagementRepository
{
    private readonly string _connectionString;
    public ManagementRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    // ── Expense Categories ──
    public async Task<IEnumerable<ExpenseCategory>> GetAllCategoriesAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<ExpenseCategory>("SELECT * FROM ExpenseCategories WHERE IsActive = 1 ORDER BY Name");
    }

    public async Task<int> AddCategoryAsync(ExpenseCategory category)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteScalarAsync<int>(
            "INSERT INTO ExpenseCategories (Name, Type, IsActive) VALUES (@Name, @Type, 1); SELECT CAST(SCOPE_IDENTITY() as int);", category);
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync("UPDATE ExpenseCategories SET IsActive = 0 WHERE Id = @Id", new { Id = id }) > 0;
    }

    // ── Process Masters ──
    public async Task<IEnumerable<ProcessMaster>> GetAllProcessesAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<ProcessMaster>("SELECT * FROM ProcessMasters WHERE IsActive = 1 ORDER BY Name");
    }

    public async Task<int> AddProcessAsync(ProcessMaster process)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteScalarAsync<int>(
            @"INSERT INTO ProcessMasters (Name, Type, Description, DefaultRate, SetupFee, MinPrice, Unit, IsActive) 
              VALUES (@Name, @Type, @Description, @DefaultRate, @SetupFee, @MinPrice, @Unit, 1); SELECT CAST(SCOPE_IDENTITY() as int);", process);
    }

    public async Task<bool> UpdateProcessAsync(ProcessMaster process)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync(
            "UPDATE ProcessMasters SET Name=@Name, Type=@Type, Description=@Description, DefaultRate=@DefaultRate, SetupFee=@SetupFee, MinPrice=@MinPrice, Unit=@Unit WHERE Id=@Id", process) > 0;
    }

    public async Task<bool> DeleteProcessAsync(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync("UPDATE ProcessMasters SET IsActive = 0 WHERE Id = @Id", new { Id = id }) > 0;
    }

    // ── Users ──
    public async Task<IEnumerable<AppUser>> GetAllUsersAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<AppUser>("SELECT Id, FullName, Email, Phone, RoleId, Department, Status, CreatedAt, IsActive FROM AppUsers WHERE IsActive = 1 ORDER BY FullName");
    }

    public async Task<AppUser?> GetUserByIdAsync(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryFirstOrDefaultAsync<AppUser>("SELECT * FROM AppUsers WHERE Id = @Id", new { Id = id });
    }

    public async Task<AppUser?> GetUserByEmailAsync(string email)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryFirstOrDefaultAsync<AppUser>("SELECT * FROM AppUsers WHERE Email = @Email AND IsActive = 1", new { Email = email });
    }

    public async Task<int> AddUserAsync(AppUser user)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteScalarAsync<int>(
            @"INSERT INTO AppUsers (FullName, Email, Phone, PasswordHash, RoleId, Department, Status, CreatedAt, IsActive) 
              VALUES (@FullName, @Email, @Phone, @PasswordHash, @RoleId, @Department, @Status, @CreatedAt, 1); SELECT CAST(SCOPE_IDENTITY() as int);", user);
    }

    public async Task<bool> UpdateUserAsync(AppUser user)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync(
            @"UPDATE AppUsers SET FullName=@FullName, Email=@Email, Phone=@Phone, RoleId=@RoleId, 
              Department=@Department, Status=@Status WHERE Id=@Id", user) > 0;
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync("UPDATE AppUsers SET IsActive = 0 WHERE Id = @Id", new { Id = id }) > 0;
    }

    // ── Roles ──
    public async Task<IEnumerable<Role>> GetAllRolesAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<Role>("SELECT * FROM Roles WHERE IsActive = 1 ORDER BY Name");
    }

    public async Task<int> AddRoleAsync(Role role)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteScalarAsync<int>(
            "INSERT INTO Roles (Name, Permissions, IsActive) VALUES (@Name, @Permissions, 1); SELECT CAST(SCOPE_IDENTITY() as int);", role);
    }

    public async Task<bool> UpdateRoleAsync(Role role)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync("UPDATE Roles SET Name=@Name, Permissions=@Permissions WHERE Id=@Id", role) > 0;
    }

    public async Task<bool> DeleteRoleAsync(int id)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.ExecuteAsync("UPDATE Roles SET IsActive = 0 WHERE Id = @Id", new { Id = id }) > 0;
    }

    // ── Settings ──
    public async Task<IEnumerable<AppSetting>> GetAllSettingsAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<AppSetting>("SELECT * FROM AppSettings ORDER BY [Key]");
    }

    public async Task<bool> UpsertSettingAsync(AppSetting setting)
    {
        using var conn = new SqlConnection(_connectionString);
        var sql = @"IF EXISTS (SELECT 1 FROM AppSettings WHERE [Key] = @Key)
                        UPDATE AppSettings SET Value = @Value, Description = @Description WHERE [Key] = @Key
                    ELSE
                        INSERT INTO AppSettings ([Key], Value, Description) VALUES (@Key, @Value, @Description);";
        return await conn.ExecuteAsync(sql, setting) > 0;
    }

    public async Task<IEnumerable<LookupDto>> GetProcessLookupAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<LookupDto>("SELECT Id, Name FROM ProcessMasters WHERE IsActive = 1 ORDER BY Name");
    }

    public async Task<IEnumerable<LookupDto>> GetCategoryLookupAsync()
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<LookupDto>("SELECT Id, Name FROM ExpenseCategories WHERE IsActive = 1 ORDER BY Name");
    }
}
