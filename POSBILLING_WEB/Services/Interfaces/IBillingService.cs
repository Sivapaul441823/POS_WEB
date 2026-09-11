using POSBILLING_WEB.DTOs.Billing;
using System.Data;

namespace POSBILLING_WEB.Services.Interfaces
{
    public interface IBillingService 
    {
        // Get Bill No
        Task<BillNoResponseDto> LoadBillNoAsync(int branchId,string connection);

        // Get Barcode
        Task<ValidateBarcodeResponseDto> ValidateBarcodeAsync(string itemCode,int branchId,int subUnitId,string connection);

        // Get Reprint Data
        Task<DataSet> GetPrintDetailsAsync(string billNo,int branchId,int subUnitId);
    }
}
