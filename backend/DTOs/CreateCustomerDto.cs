namespace DigitalErp.Api.DTOs;

public class CreateCustomerDto
{
    public string Name { get; set; } = string.Empty;
    public string? GstNumber { get; set; }
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}
