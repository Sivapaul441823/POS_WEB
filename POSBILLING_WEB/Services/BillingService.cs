using POSBILLING_WEB.DTOs.Billing;
using POSBILLING_WEB.Repositories.Interfaces;
using POSBILLING_WEB.Services.Interfaces;
using System.Data;
using System.Collections.Generic;

namespace POSBILLING_WEB.Services
{
    public class BillingService : IBillingService
    {
        private readonly IBillingRepository _billingRepository;

        public BillingService(IBillingRepository billingRepository)
        {
            _billingRepository = billingRepository;
        }

        // Get Bill No
        public async Task<BillNoResponseDto> LoadBillNoAsync(int branchId, string connection)
        {
            return await _billingRepository.LoadBillNoAsync(branchId, connection);

        }
        // Get Reprint Data
        public async Task<DataSet> GetPrintDetailsAsync(string billNo, int branchId, int subUnitId)
        {
            return await _billingRepository.GetPrintDetailsAsync(billNo, branchId, subUnitId);
        }
        // Get Barcode Data
        public async Task<GetItemDetailsResponseDto?> GetItemDetailsAsync(string itemCode,int branchId,int subUnitId,string connection)
        {
            return await _billingRepository.GetItemDetailsAsync(itemCode,branchId,subUnitId,connection);
        }

        public async Task<EmployeeEcNoResponseDto?> ValidateECNoAsync(string ecNo, int branchId, int subUnitId, string connection)
        {
            return await _billingRepository.ValidateECNoAsync(ecNo, branchId, subUnitId, connection);
        }

    }
}
