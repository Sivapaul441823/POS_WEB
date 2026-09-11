using POSBILLING_WEB.DTOs;

namespace POSBILLING_WEB.Repositories.Interfaces
{
    public interface IAuthRepository
    {
        Task<LoginResponseDto?> LoginAsync(string userName,string password);
        Task<LoginResponseDto?> EmployeeLoginAsync(string ecNo);
    }
}
