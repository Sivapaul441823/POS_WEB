using POSBILLING_WEB.DTOs;

namespace POSBILLING_WEB.Services.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(string userName,string password);
        Task<LoginResponseDto?> GetEmployeeByEcNoAsync(string userName);
    }
}
