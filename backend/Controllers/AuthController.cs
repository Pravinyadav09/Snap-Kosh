using Microsoft.AspNetCore.Mvc;
using DigitalErp.Api.DTOs;
using DigitalErp.Api.Services;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    public AuthController(AuthService authService) => _authService = authService;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        if (response == null) return Unauthorized(new { Message = "Invalid credentials" });
        return Ok(response);
    }
}
