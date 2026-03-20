using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Models;
using DigitalErp.Api.Services;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly CustomerService _customerService;

    public CustomersController(CustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int size = 10, [FromQuery] string? search = null)
    {
        return Ok(await _customerService.GetCustomersPaged(page, size, search));
    }

    [HttpGet("lookup")]
    public async Task<IActionResult> GetLookup() => Ok(await _customerService.GetLookup());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var customer = await _customerService.GetCustomer(id);
        if (customer == null) return NotFound();
        return Ok(customer);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto)
    {
        var id = await _customerService.CreateCustomer(dto);
        return CreatedAtAction(nameof(GetById), new { id = id }, new { id = id });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Customer customer)
    {
        if (id != customer.Id) return BadRequest();
        var success = await _customerService.UpdateCustomer(customer);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _customerService.DeleteCustomer(id);
        if (!success) return NotFound();
        return NoContent();
    }
}
