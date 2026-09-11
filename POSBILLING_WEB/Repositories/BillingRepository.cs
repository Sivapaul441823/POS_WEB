using Microsoft.Data.SqlClient;
using POSBILLING_WEB.Data;
using POSBILLING_WEB.DTOs.Billing;
using POSBILLING_WEB.Repositories.Interfaces;
using System.Data;

namespace POSBILLING_WEB.Repositories
{
    public class BillingRepository : IBillingRepository
    {
        private readonly DbHelper _dbHelper;

        public BillingRepository(DbHelper dbHelper)
        {
            _dbHelper = dbHelper;

        }

        public async Task<BillNoResponseDto> LoadBillNoAsync(int branchId,string connection)
        {
            // 1. Get Bill Sequence

            var parameter = new[] { new SqlParameter("@BranchId", branchId) };

            DataTable dt = await _dbHelper.ExecuteSPAsync(connection, "Sp_BillSequence_Get", parameter);

            if (dt == null || dt.Rows.Count == 0)
            {
                return new BillNoResponseDto 
                {
                    Success = false,
                    Message = "Insert Bill Sequence!",
                    CanBill = false
                };
            }

            DataRow row = dt.Rows[0];

            int billNo = Convert.ToInt32(row["BillNo"]);
            string billPrefix = row["BillPrefix"]?.ToString() ?? "";

            // 2.Determine Bill Prefix

            string validPrefix = "";

            if (connection == "NotRetail")
            {
                validPrefix = "N";
            }
            else if (
                connection == "TNV" ||
                connection == "NT" ||
                connection == "CBE2" ||
                connection == "MDU" ||
                connection == "TUT")
            {
                validPrefix = "K";
            }

            // 3. Bill Sequence Validation

            var validParameters = new[] 
            {
                new SqlParameter("@BillPrefix", validPrefix)
            };

            DataTable validDt = await _dbHelper.ExecuteSPAsync(connection, "Sp_POS_BillSeqValid", validParameters);

            int billValid = 0;

            if (validDt.Rows.Count > 0)
            {
                billValid = Convert.ToInt32(validDt.Rows[0][0]);
            }

            // 4. Validate Bill Number

            if (billValid < billNo)
            {
                return new BillNoResponseDto
                {
                    Success = false,

                    Message = "Re Set Bill Sequence To Continue !",

                    BillNo = billNo,

                    BillPrefix = billPrefix,

                    BillValid = billValid,

                    CanBill = false
                };
            }

            // 5. Next Bill Number

            int nextBillNo = billNo + 1;

            string nextBillNumber = billPrefix + "/" + nextBillNo;

            return new BillNoResponseDto
            {
                Success = true,

                Message = "Bill number loaded successfully",

                BillNo = nextBillNo,

                BillPrefix = billPrefix,

                BillNumber = nextBillNumber,

                BillValid = billValid,

                CanBill = true
            };
        }
        public async Task<ValidateBarcodeResponseDto> ValidateBarcodeAsync(string itemCode,int branchId,int subUnitId,string connection)
        {
            var parameters = new[]
            {new SqlParameter("@TagCode", itemCode)};

            DataTable dt = await _dbHelper.ExecuteSPAsync(connection, "SP_ItemCodeCheck", parameters);

            if (dt != null && dt.Rows.Count > 0)
            {
                DataRow row = dt.Rows[0];

                return new ValidateBarcodeResponseDto
                {
                    Success = true,
                    Message = "Barcode validated successfully.",

                    TagCode = row["TagCode"]?.ToString() ?? "",
                    ImageURL = row["ImageURL"]?.ToString() ?? "",
                    MRP = row["MRP"] == DBNull.Value
                        ? 0
                        : Convert.ToDecimal(row["MRP"]),

                    DisplayName = row["DisplayName"]?.ToString() ?? "",
                    BarcodeType = row["BarcodeType"]?.ToString() ?? "",

                    Qty = row["Qty"] == DBNull.Value
                        ? 0
                        : Convert.ToDecimal(row["Qty"]),

                    StkMonth = row["StkMonth"]?.ToString() ?? "",
                    StkYear = row["StkYear"]?.ToString() ?? "",

                    OfferType = row["OfferType"]?.ToString() ?? "",
                    OffType_BillVal = row["OffType_BillVal"]?.ToString() ?? "",

                    SectionId = row["SectionId"] == DBNull.Value
                        ? 0
                        : Convert.ToInt32(row["SectionId"])
                };
            }

            // BillingTag-la barcode kidaikkala
            // Old code next SP_ItemCodeCheck call pannum.

            return new ValidateBarcodeResponseDto
            {
                Success = false,
                Message = "Barcode not found."
            };
        }

        public async Task<DataSet> GetPrintDetailsAsync(string billNo,int branchId,int subUnitId)
        {
            var parameters = new[]
            {   
                new SqlParameter("@BillNo", billNo),
                new SqlParameter("@BranchId", branchId),
                new SqlParameter("@SubunitID", subUnitId)
            };          

            return await _dbHelper.ExecuteSPDataSetAsync("TNV","Sp_Bill_Print",parameters);
        }
    }
}
