namespace POSBILLING_WEB.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(int userId,string userName,string userCategory,int branchId);
    }
}
