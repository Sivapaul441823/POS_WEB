using POSBILLING_WEB.DTOs.Billing;
using System.Data;

namespace POSBILLING_WEB.Repositories.Interfaces
{
    public interface IBillingRepository
    {
        Task<BillNoResponseDto> LoadBillNoAsync(int branchId,string connection);

        Task<ValidateBarcodeResponseDto> ValidateBarcodeAsync(string itemCode,int branchId,int subUnitId,string connection);

        Task<DataSet> GetPrintDetailsAsync( string billNo,int branchId,int subUnitId);

    }
}
