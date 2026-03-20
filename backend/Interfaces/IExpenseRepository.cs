using DigitalErp.Api.Models;

namespace DigitalErp.Api.Interfaces;

public interface IExpenseRepository
{
    Task<IEnumerable<Expense>> GetAllAsync();
    Task<Expense?> GetByIdAsync(int id);
    Task<int> AddAsync(Expense expense);
    Task<bool> DeleteAsync(int id);
}
