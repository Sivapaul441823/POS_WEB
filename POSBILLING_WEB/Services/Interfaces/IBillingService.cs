using POSBILLING_WEB.DTOs.Billing;
using System.Data;

namespace POSBILLING_WEB.Services.Interfaces
{
    public interface IBillingService 
    {
        // Get Bill No
        Task<BillNoResponseDto> LoadBillNoAsync(int branchId,string connection);
        // Get Reprint Data
        Task<DataSet> GetPrintDetailsAsync(string billNo, int branchId, int subUnitId);
        // Get Barcode Data
        Task<GetItemDetailsResponseDto?> GetItemDetailsAsync(string itemCode,int branchId,int subUnitId,string connection);
        Task<EmployeeEcNoResponseDto?> ValidateECNoAsync(string ecNo, int branchId, int subUnitId, string connection);
    }

}

