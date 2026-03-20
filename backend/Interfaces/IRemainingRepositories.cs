using DigitalErp.Api.Models;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Interfaces;

public interface IMachineRepository
{
    Task<IEnumerable<Machine>> GetAllAsync();
    Task<Machine?> GetByIdAsync(int id);
    Task<int> AddAsync(Machine machine);
    Task<bool> UpdateAsync(Machine machine);
    Task<IEnumerable<LookupDto>> GetLookupAsync();
}

public interface IQuotationRepository
{
    Task<IEnumerable<Quotation>> GetAllAsync();
    Task<Quotation?> GetByIdAsync(int id);
    Task<int> AddAsync(Quotation quotation);
    Task<bool> UpdateStatusAsync(int id, string status);
}

public interface IOutsourceRepository
{
    Task<IEnumerable<Vendor>> GetAllVendorsAsync();
    Task<int> AddVendorAsync(Vendor vendor);
    Task<IEnumerable<OutsourceJob>> GetAllJobsAsync();
    Task<int> AddJobAsync(OutsourceJob job);
    Task<bool> UpdateJobStatusAsync(int id, string status);
    Task<IEnumerable<LookupDto>> GetVendorLookupAsync();
}

public interface IPurchaseRepository
{
    Task<IEnumerable<Purchase>> GetAllAsync();
    Task<Purchase?> GetByIdAsync(int id);
    Task<int> AddAsync(Purchase purchase);
    Task<bool> UpdateStatusAsync(int id, string status);
}

public interface IManagementRepository
{
    // Expense Categories
    Task<IEnumerable<ExpenseCategory>> GetAllCategoriesAsync();
    Task<int> AddCategoryAsync(ExpenseCategory category);
    Task<bool> DeleteCategoryAsync(int id);
    Task<IEnumerable<LookupDto>> GetCategoryLookupAsync();

    // Process Masters
    Task<IEnumerable<ProcessMaster>> GetAllProcessesAsync();
    Task<int> AddProcessAsync(ProcessMaster process);
    Task<bool> UpdateProcessAsync(ProcessMaster process);
    Task<bool> DeleteProcessAsync(int id);
    Task<IEnumerable<LookupDto>> GetProcessLookupAsync();

    // Users
    Task<IEnumerable<AppUser>> GetAllUsersAsync();
    Task<AppUser?> GetUserByIdAsync(int id);
    Task<AppUser?> GetUserByEmailAsync(string email);
    Task<int> AddUserAsync(AppUser user);
    Task<bool> UpdateUserAsync(AppUser user);
    Task<bool> DeleteUserAsync(int id);

    // Roles
    Task<IEnumerable<Role>> GetAllRolesAsync();
    Task<int> AddRoleAsync(Role role);
    Task<bool> UpdateRoleAsync(Role role);
    Task<bool> DeleteRoleAsync(int id);

    // Settings
    Task<IEnumerable<AppSetting>> GetAllSettingsAsync();
    Task<bool> UpsertSettingAsync(AppSetting setting);
}

public interface IPaymentRepository
{
    Task<IEnumerable<Payment>> GetByCustomerAsync(int customerId);
    Task<int> AddAsync(Payment payment);
}

public interface IAuditRepository
{
    Task<int> LogAsync(AuditLog log);
    Task<IEnumerable<AuditLog>> GetRecentAsync(int count);
}

public interface IMaintenanceRepository
{
    Task<IEnumerable<MachineMaintenance>> GetAllAsync();
    Task<IEnumerable<MachineMaintenance>> GetByMachineAsync(int machineId);
    Task<int> AddAsync(MachineMaintenance maintenance);
    Task<bool> DeleteAsync(int id);
}
