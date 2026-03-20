using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.Services;
namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UtilityController : ControllerBase
{
    private readonly UtilityService _service;
    public UtilityController(UtilityService service) => _service = service;

    [HttpGet("vendors")]
    public async Task<IActionResult> GetVendors() => Ok(await _service.GetVendors());

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers() => Ok(await _service.GetCustomers());

    [HttpGet("expense-categories")]
    public async Task<IActionResult> GetExpenseCategories() => Ok(await _service.GetExpenseCategories());

    [HttpGet("inventory-items")]
    public async Task<IActionResult> GetInventoryItems() => Ok(await _service.GetInventoryItems());

    [HttpGet("machine-types")]
    public async Task<IActionResult> GetMachineTypes() => Ok(await _service.GetMachineTypes());

    [HttpGet("machines")]
    public async Task<IActionResult> GetMachines() => Ok(await _service.GetMachines());

    [HttpGet("tax-rates")]
    public async Task<IActionResult> GetTaxRates() => Ok(await _service.GetTaxRates());

    [HttpGet("delivery-modes")]
    public async Task<IActionResult> GetDeliveryModes() => Ok(await _service.GetDeliveryModes());
    [HttpGet("verify-gst")]
    public IActionResult VerifyGst([FromQuery] string gstNumber)
    {
        // Mock GST Verification Logic
        if (string.IsNullOrWhiteSpace(gstNumber))
        {
            return BadRequest(new { Message = "GST Number is required." });
        }

        // Simulate network delay
        System.Threading.Thread.Sleep(500);

        // Simple validation rule for Indian GST (15 chars)
        if (gstNumber.Length != 15)
        {
            return BadRequest(new { Message = "Invalid GST Number format." });
        }

        // Mock data based on first 2 characters (State Code) to make it feel slightly real
        string stateCode = gstNumber.Substring(0, 2);
        string companyName = $"Mock Enterprise (State {stateCode})";
        string address = $"123 Main Street, Sector {stateCode}, City";

        return Ok(new
        {
            GstNumber = gstNumber.ToUpper(),
            LegalName = companyName,
            TradeName = companyName,
            Status = "Active",
            Address = address,
            RegistrationDate = DateTime.UtcNow.AddYears(-2).ToString("yyyy-MM-dd")
        });
    }
}
