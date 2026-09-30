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
        public async Task<GetItemDetailsResponseDto?> GetItemDetailsAsync(string itemCode,int branchId,int subUnitId,string connection)
        {
            var parameters = new[]
            {
                new SqlParameter("@Case", "Detail"),

                new SqlParameter("@ItemCode",itemCode ?? string.Empty),

                new SqlParameter("@BranchId",branchId),

                new SqlParameter("@SubunitID",subUnitId)
            };

            DataTable dt = await _dbHelper.ExecuteSPAsync(connection,"Sp_Billing_GetDetails",parameters);

            // No data
            if (dt == null || dt.Rows.Count == 0)
            {
                return null;
            }

            DataRow row = dt.Rows[0];

            // One row only
            return new GetItemDetailsResponseDto
            {
                TagCode =
                    GetString(row, "TagCode"),

                BranchId =
                    GetInt(row, "BranchId"),

                SubUnitId =
                    GetInt(row, "SubUnitId"),

                ProductName =
                    GetString(row, "ProductName"),

                MRP =
                    GetDecimal(row, "MRP"),

                Qty =
                    GetDecimal(row, "Qty"),

                DisPer =
                    GetDecimal(row, "DisPer"),

                DisVal =
                    GetDecimal(row, "DisVal"),

                TotalAmt =
                    GetDecimal(row, "TotalAmt"),

                HSNCode =
                    GetString(row, "HSNCode"),

                OldMRP =
                    GetDecimal(row, "OldMRP"),

                GSTPer =
                    GetDecimal(row, "GSTPer"),

                GSTAmt =
                    GetDecimal(row, "GSTAmt"),

                OldGSTAmt =
                    GetDecimal(row, "OldGSTAmt"),

                ImageURL =
                    GetString(row, "ImageURL"),

                BarcodeType =
                    GetString(row, "BarcodeType"),

                StkMonth =
                    GetString(row, "StkMonth"),

                StkYear =
                    GetString(row, "StkYear"),

                OfferType =
                    GetString(row, "OfferType"),

                OffType_BillVal =
                    GetString(row, "OffType_BillVal"),

                SectionId =
                    GetInt(row, "SectionId"),

                ItemCode =
                    GetString(row, "ItemCode"),

                ComboSet =
                    GetInt(row, "ComboSet"),

                ComboOffer =
                    GetString(row, "ComboOffer"),

                ComboDiscount =
                    GetDecimal(row, "ComboDiscount"),

                Type =
                    GetString(row, "Type")
            };
        }

        public async Task<EmployeeEcNoResponseDto?> ValidateECNoAsync(string ecNo, int branchId, int subUnitId, string connection)
        {
            var parameters = new[]
            {
                new SqlParameter("@Case", "EcNo"),
                new SqlParameter("@ECNo", ecNo ?? string.Empty),
                new SqlParameter("@BranchId", branchId),
                new SqlParameter("@SubunitID", subUnitId)
            };


            DataTable dt = await _dbHelper.ExecuteSPAsync(connection,"Sp_NTBilling",parameters);


            if (dt == null || dt.Rows.Count == 0)
            {
                return null;
            }


            DataRow row = dt.Rows[0];


            return new EmployeeEcNoResponseDto
            {
                BiometricCode = GetString(row, "BiometricCode"),

                Employee = GetString(row, "Employee")
            };
        }

        // ========================================
        // Helper Methods
        // ========================================

        private static string GetString( DataRow row,string column)
        {
            if (!row.Table.Columns.Contains(column) || row[column] == DBNull.Value)
            {
                return string.Empty;
            }

            return row[column]?.ToString() ?? string.Empty;
        }


        private static int GetInt(DataRow row,string column)
        {
            if (!row.Table.Columns.Contains(column) || row[column] == DBNull.Value)
            {
                return 0;
            }

            return Convert.ToInt32(row[column]);
        }


        private static decimal GetDecimal(DataRow row,string column)
        {
            if (!row.Table.Columns.Contains(column) || row[column] == DBNull.Value)
            {
                return 0;
            }

            return Convert.ToDecimal(row[column]);
        }
    }
}
