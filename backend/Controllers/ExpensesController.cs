using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly ExpenseService _expenseService;

    public ExpensesController(ExpenseService expenseService)
    {
        _expenseService = expenseService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _expenseService.GetAllExpenses());
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var expense = await _expenseService.GetExpenseDetails(id);
        if (expense == null) return NotFound();
        return Ok(expense);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Expense expense)
    {
        try
        {
            var id = await _expenseService.RecordExpense(expense);
            expense.Id = id;
            return CreatedAtAction(nameof(GetById), new { id = id }, expense);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Error = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _expenseService.DeleteExpense(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
