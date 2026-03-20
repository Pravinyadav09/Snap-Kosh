using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Services;

public class AuthService
{
    private readonly IManagementRepository _userRepo;
    private readonly ICustomerRepository _customerRepo;
    private readonly IConfiguration _config;

    public AuthService(IManagementRepository userRepo, ICustomerRepository customerRepo, IConfiguration config)
    {
        _userRepo = userRepo;
        _customerRepo = customerRepo;
        _config = config;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        if (request.UserType == "Admin")
        {
            var user = await _userRepo.GetUserByEmailAsync(request.Email);
            if (user == null || user.PasswordHash != request.Password) return null; // Simplified for demo, should use proper hash check

            return new AuthResponse
            {
                Token = GenerateJwtToken(user.Email, "Admin", user.RoleId.ToString()),
                FullName = user.FullName,
                Role = "Admin" // Should fetch role name
            };
        }
        else // Portal Login
        {
            // For portal, we use Email as login
            var customer = await _customerRepo.GetByEmailAsync(request.Email);
            
            if (customer == null) return null;

            return new AuthResponse
            {
                Token = GenerateJwtToken(customer.Email, "Portal", customer.Id.ToString()),
                FullName = customer.Name,
                Role = "Customer"
            };
        }
    }

    private string GenerateJwtToken(string email, string type, string id)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "SUPER_SECRET_KEY_FOR_DIGITAL_ERP_2026"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Email, email),
            new Claim("UserType", type),
            new Claim("UserId", id)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
