using Microsoft.AspNetCore.Mvc;

namespace DigitalErp.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public UploadsController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpPost]
    public async Task<IActionResult> UploadFile(IFormFile file, [FromQuery] string folder = "designs")
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var uploadsRoot = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", folder);
        if (!Directory.Exists(uploadsRoot))
            Directory.CreateDirectory(uploadsRoot);

        var fileName = $"{Guid.NewGuid()}_{file.FileName}";
        var filePath = Path.Combine(uploadsRoot, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var relativePath = $"/uploads/{folder}/{fileName}";
        return Ok(new { FileUrl = relativePath, FileName = file.FileName });
    }
}
