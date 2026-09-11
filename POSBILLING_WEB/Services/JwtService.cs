using POSBILLING_WEB.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
namespace POSBILLING_WEB.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(int userId,string userName,string userCategory,int branchId)
        {
            var key = _configuration["JwtSettings:Key"];

            var issuer = _configuration["JwtSettings:Issuer"];

            var audience = _configuration["JwtSettings:Audience"];

            var expiryMinutes = Convert.ToDouble(_configuration["JwtSettings:ExpiryMinutes"]);

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!));

            var credentials = new SigningCredentials(securityKey,SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier,userId.ToString()),

                new Claim(ClaimTypes.Name,userName),

                new Claim(ClaimTypes.Role,userCategory),

                new Claim("BranchId",branchId.ToString())
            };

            var token = new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                    signingCredentials: credentials
                );

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}
