using POSBILLING_WEB.DTOs;
using POSBILLING_WEB.Repositories.Interfaces;
using POSBILLING_WEB.Services.Interfaces;

namespace POSBILLING_WEB.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly IJwtService _jwtService;

        public AuthService(IAuthRepository authRepository,IJwtService jwtService)
        {
            _authRepository = authRepository; 
            _jwtService = jwtService;
        }

        public async Task<LoginResponseDto?> LoginAsync(string userName,string password)
        {
            // Existing DB login
            var result =await _authRepository.LoginAsync(userName,password);

            // Login failed
            if (result == null)
            {
                return null;
            }

            // Generate JWT
            result.Token =_jwtService.GenerateToken(result.UserId,result.UserName,result.UserCat,result.BranchId);

            return result;
        }
        public async Task<LoginResponseDto?> GetEmployeeByEcNoAsync(string ecNo)
        {
            var result = await _authRepository.EmployeeLoginAsync(ecNo);

            if (result == null)
            {
                return null;
            }
            // Generate JWT
            result.Token = _jwtService.GenerateToken(result.UserId,result.UserName,result.UserCat,result.BranchId);

            return result;
        }
    }
}