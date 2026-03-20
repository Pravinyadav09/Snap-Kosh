using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Services;

public class ExpenseService
{
    private readonly IExpenseRepository _repo;

    public ExpenseService(IExpenseRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<Expense>> GetAllExpenses()
    {
        return await _repo.GetAllAsync();
    }

    public async Task<Expense?> GetExpenseDetails(int id)
    {
        return await _repo.GetByIdAsync(id);
    }

    public async Task<int> RecordExpense(Expense expense)
    {
        expense.CreatedAt = DateTime.UtcNow;

        // Any custom business logic (e.g., specific rules for GST bills)
        if (expense.IsGstBill && string.IsNullOrEmpty(expense.VendorId))
        {
            throw new ArgumentException("GST Bills must have a Vendor assigned.");
        }

        return await _repo.AddAsync(expense);
    }

    public async Task<bool> DeleteExpense(int id)
    {
        return await _repo.DeleteAsync(id);
    }
}
