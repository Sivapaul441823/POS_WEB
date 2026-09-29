using POSBILLING_WEB.DTOs.Billing;
using System.Data;

namespace POSBILLING_WEB.Repositories.Interfaces
{
    public interface IBillingRepository
    {
        // Get Bill No
        Task<BillNoResponseDto> LoadBillNoAsync(int branchId,string connection);
        // Get Reprint Data
        Task<DataSet> GetPrintDetailsAsync(string billNo, int branchId, int subUnitId);

        // Validate Barcode
        //Task<ValidateBarcodeResponseDto> ValidateBarcodeAsync(string itemCode,int branchId,int subUnitId,string connection);

        //Task<DataTable> GetItemDetailsAsync(string itemCode,int branchId,int subUnitId,string connection);

        Task<GetItemDetailsResponseDto?> GetItemDetailsAsync(string itemCode,int branchId,int subUnitId,string connection);

    }
}
