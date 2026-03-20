using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Services;

public class MachineService
{
    private readonly IMachineRepository _repo;
    public MachineService(IMachineRepository repo) => _repo = repo;

    public Task<IEnumerable<Machine>> GetAll() => _repo.GetAllAsync();
    public Task<Machine?> GetById(int id) => _repo.GetByIdAsync(id);
    public Task<int> Add(Machine machine) { machine.CreatedAt = DateTime.UtcNow; return _repo.AddAsync(machine); }
    public Task<bool> Update(Machine machine) => _repo.UpdateAsync(machine);
    public Task<IEnumerable<LookupDto>> GetLookup() => _repo.GetLookupAsync();
}

public class QuotationService
{
    private readonly IQuotationRepository _repo;
    private readonly IAuditRepository _auditRepo;
    public QuotationService(IQuotationRepository repo, IAuditRepository auditRepo) 
    {
        _repo = repo;
        _auditRepo = auditRepo;
    }

    public Task<IEnumerable<Quotation>> GetAll() => _repo.GetAllAsync();
    public Task<Quotation?> GetById(int id) => _repo.GetByIdAsync(id);

    public async Task<int> Create(Quotation q)
    {
        q.QuotationNumber = $"QT-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";
        q.ProfitMargin = q.QuotedPrice > 0 ? ((q.QuotedPrice - q.EstimatedCost) / q.QuotedPrice) * 100 : 0;
        q.CreatedAt = DateTime.UtcNow;
        var id = await _repo.AddAsync(q);
        
        await _auditRepo.LogAsync(new AuditLog 
        { 
            EntityName = "Quotation", 
            EntityId = id.ToString(), 
            Action = "CREATED", 
            Changes = $"Customer: {q.CustomerId}, Total: {q.QuotedPrice}",
            PerformedBy = "System",
            Timestamp = DateTime.UtcNow
        });

        return id;
    }

    public Task<bool> UpdateStatus(int id, string status) => _repo.UpdateStatusAsync(id, status);
}

public class OutsourceService
{
    private readonly IOutsourceRepository _repo;
    public OutsourceService(IOutsourceRepository repo) => _repo = repo;

    public Task<IEnumerable<Vendor>> GetAllVendors() => _repo.GetAllVendorsAsync();
    public Task<int> AddVendor(Vendor v) { v.CreatedAt = DateTime.UtcNow; return _repo.AddVendorAsync(v); }
    public Task<IEnumerable<OutsourceJob>> GetAllJobs() => _repo.GetAllJobsAsync();
    public Task<int> AddJob(OutsourceJob j) { j.CreatedAt = DateTime.UtcNow; return _repo.AddJobAsync(j); }
    public Task<bool> UpdateJobStatus(int id, string status) => _repo.UpdateJobStatusAsync(id, status);
    public Task<IEnumerable<LookupDto>> GetVendorLookup() => _repo.GetVendorLookupAsync();
}

public class PurchaseService
{
    private readonly IPurchaseRepository _repo;
    private readonly InventoryService _inventoryService;
    private readonly IAuditRepository _auditRepo;

    public PurchaseService(IPurchaseRepository repo, InventoryService inventoryService, IAuditRepository auditRepo)
    {
        _repo = repo;
        _inventoryService = inventoryService;
        _auditRepo = auditRepo;
    }

    public Task<IEnumerable<Purchase>> GetAll() => _repo.GetAllAsync();
    public Task<Purchase?> GetById(int id) => _repo.GetByIdAsync(id);

    public async Task<int> Create(Purchase p)
    {
        p.PurchaseNumber = $"PO-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}";
        p.TotalAmount = p.Quantity * p.Rate;
        p.CreatedAt = DateTime.UtcNow;
        p.Status = "Completed"; // Mark as completed on receipt
        
        var id = await _repo.AddAsync(p);

        // Auto-update Inventory Stock (Inward)
        await _inventoryService.RecordStockMovement(
            p.InventoryItemId, 
            p.Quantity, 
            "Inward", 
            "PurchaseOrder", 
            id);

        await _auditRepo.LogAsync(new AuditLog 
        { 
            EntityName = "Purchase", 
            EntityId = id.ToString(), 
            Action = "GRN_COMPLETED", 
            Changes = $"InventoryItem: {p.InventoryItemId}, Qty: {p.Quantity}, Rate: {p.Rate}",
            PerformedBy = "System",
            Timestamp = DateTime.UtcNow
        });

        return id;
    }

    public Task<bool> UpdateStatus(int id, string status) => _repo.UpdateStatusAsync(id, status);
}

public class ManagementService
{
    private readonly IManagementRepository _repo;
    public ManagementService(IManagementRepository repo) => _repo = repo;

    // Categories
    public Task<IEnumerable<ExpenseCategory>> GetCategories() => _repo.GetAllCategoriesAsync();
    public Task<int> AddCategory(ExpenseCategory c) => _repo.AddCategoryAsync(c);
    public Task<bool> DeleteCategory(int id) => _repo.DeleteCategoryAsync(id);

    // Processes
    public Task<IEnumerable<ProcessMaster>> GetProcesses() => _repo.GetAllProcessesAsync();
    public Task<int> AddProcess(ProcessMaster p) => _repo.AddProcessAsync(p);
    public Task<bool> UpdateProcess(ProcessMaster p) => _repo.UpdateProcessAsync(p);
    public Task<bool> DeleteProcess(int id) => _repo.DeleteProcessAsync(id);
    public Task<IEnumerable<LookupDto>> GetProcessLookup() => _repo.GetProcessLookupAsync();

    // Users
    public Task<IEnumerable<AppUser>> GetUsers() => _repo.GetAllUsersAsync();
    public Task<AppUser?> GetUser(int id) => _repo.GetUserByIdAsync(id);
    public Task<int> AddUser(AppUser u) { u.CreatedAt = DateTime.UtcNow; return _repo.AddUserAsync(u); }
    public Task<bool> UpdateUser(AppUser u) => _repo.UpdateUserAsync(u);
    public Task<bool> DeleteUser(int id) => _repo.DeleteUserAsync(id);

    // Roles
    public Task<IEnumerable<Role>> GetRoles() => _repo.GetAllRolesAsync();
    public Task<int> AddRole(Role r) => _repo.AddRoleAsync(r);
    public Task<bool> UpdateRole(Role r) => _repo.UpdateRoleAsync(r);
    public Task<bool> DeleteRole(int id) => _repo.DeleteRoleAsync(id);

    // Settings
    public Task<IEnumerable<AppSetting>> GetSettings() => _repo.GetAllSettingsAsync();
    public Task<bool> SaveSetting(AppSetting s) => _repo.UpsertSettingAsync(s);
    public Task<IEnumerable<LookupDto>> GetCategoryLookup() => _repo.GetCategoryLookupAsync();
}

public class MaintenanceService
{
    private readonly IMaintenanceRepository _repo;
    public MaintenanceService(IMaintenanceRepository repo) => _repo = repo;

    public Task<IEnumerable<MachineMaintenance>> GetAll() => _repo.GetAllAsync();
    public Task<IEnumerable<MachineMaintenance>> GetByMachine(int machineId) => _repo.GetByMachineAsync(machineId);
    
    public Task<int> LogMaintenance(MachineMaintenance m) 
    { 
        m.CreatedAt = DateTime.UtcNow; 
        if (m.MaintenanceDate == default) m.MaintenanceDate = DateTime.UtcNow;
        return _repo.AddAsync(m); 
    }
}

public class AuditService
{
    private readonly IAuditRepository _repo;
    public AuditService(IAuditRepository repo) => _repo = repo;

    public Task<IEnumerable<AuditLog>> GetRecent(int count) => _repo.GetRecentAsync(count);
    public Task<int> Log(AuditLog log) { log.Timestamp = DateTime.UtcNow; return _repo.LogAsync(log); }
}
