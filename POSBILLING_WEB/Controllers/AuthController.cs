using Microsoft.AspNetCore.Authorization;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using POSBILLING_WEB.DTOs;
using POSBILLING_WEB.Services.Interfaces;

namespace POSBILLINGWEB.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequestDto request)
        {
            var result = await _authService.LoginAsync(request.UserName,request.Password);

            if (result == null)
            {
                return Unauthorized();
            }

            return Ok(result);
        }
        [HttpPost("EmployeeLogin")]
        public async Task<IActionResult> EmployeeLogin(LoginRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "EC No is required"
                });
            }

            var result = await _authService.GetEmployeeByEcNoAsync(request.UserName);

            if (result == null)
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "Invalid Employee. Please contact Admin."
                });
            }

            // Store employee login session
            HttpContext.Session.SetString("LoginResponse",JsonSerializer.Serialize(result));

            // Allow Billing navigation
            HttpContext.Session.SetString("BillingInitiated","true");

            HttpContext.Session.SetString("BranchId",result.BranchId.ToString());

            HttpContext.Session.SetString("SubUnitId", result.BranchId.ToString());

            HttpContext.Session.SetString("Branch", result.Branch.ToString());

            HttpContext.Session.SetString("UserName", result.UserName.ToString());

            HttpContext.Session.SetString("ConnectionName","TNV");

            return Ok(new
            {
                success = true,
                message = "Employee verified successfully.",
                branch = result.Branch.ToString(),
                UserName = result.UserName.ToString()
            });
        }

    }
}
