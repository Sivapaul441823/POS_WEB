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
        //public async Task<ValidateBarcodeResponseDto> ValidateBarcodeAsync(string itemCode,int branchId,int subUnitId,string connection)
        //{
        //    if (string.IsNullOrWhiteSpace(itemCode))
        //    {
        //        return new ValidateBarcodeResponseDto
        //        {
        //            Success = false,
        //            Message = "Scan Item Code",
        //            CanAdd = false
        //        };
        //    }

        //    itemCode = itemCode.Trim();

        //    // -----------------------------------------
        //    // 1. BillingTag Check
        //    // -----------------------------------------

        //    DataTable dtBillTag = await _billingRepository.GetBillingTagAsync(itemCode,connection);

        //    if (dtBillTag != null &&
        //        dtBillTag.Rows.Count > 0)
        //    {
        //        DataRow row = dtBillTag.Rows[0];

        //        string tagCode =
        //            row["TagCode"]?.ToString() ?? "";

        //        string imageURL =
        //            row["ImageURL"]?.ToString() ?? "";

        //        decimal mrp =
        //            row["MRP"] == DBNull.Value
        //                ? 0
        //                : Convert.ToDecimal(row["MRP"]);

        //        string displayName =
        //            row["DisplayName"]?.ToString() ?? "";

        //        string barcodeType =
        //            row["BarcodeType"]?.ToString() ?? "";

        //        decimal qty =
        //            row["Qty"] == DBNull.Value
        //                ? 0
        //                : Convert.ToDecimal(row["Qty"]);

        //        string stkMonth =
        //            row["StkMonth"]?.ToString() ?? "";

        //        string stkYear =
        //            row["StkYear"]?.ToString() ?? "";

        //        string offerType =
        //            row["OfferType"]?.ToString() ?? "";

        //        string offTypeBillVal =
        //            row["OffType_BillVal"]?.ToString() ?? "";

        //        int sectionId =
        //            row["SectionId"] == DBNull.Value
        //                ? 0
        //                : Convert.ToInt32(row["SectionId"]);

        //        return new ValidateBarcodeResponseDto
        //        {
        //            Success = true,
        //            Message = "Barcode validated successfully",

        //            TagCode = itemCode,
        //            //TagCode = tagCode,
        //            ImageURL = imageURL,
        //            MRP = mrp,
        //            DisplayName = displayName,
        //            BarcodeType = barcodeType,
        //            Qty = qty,
        //            StkMonth = stkMonth,
        //            StkYear = stkYear,
        //            OfferType = offerType,
        //            OffType_BillVal = offTypeBillVal,
        //            SectionId = sectionId,

        //            CanAdd = true
        //        };
        //    }

        //    // -----------------------------------------
        //    // 2. BillingTag Not Found
        //    //    SP_ItemCodeCheck
        //    // -----------------------------------------

        //    DataTable dtItemCheck = await _billingRepository.CheckItemCodeAsync(itemCode, connection);

        //    if (dtItemCheck != null &&
        //        dtItemCheck.Rows.Count > 0)
        //    {
        //        DataRow row = dtItemCheck.Rows[0];

        //        string type =
        //            row["Type"]?.ToString() ?? "";

        //        string billNo =
        //            row["GroupBillNo"]?.ToString() ?? "";

        //        string billDate =
        //            row["BillDate"]?.ToString() ?? "";

        //        // -----------------------------------------
        //        // Type = C
        //        // -----------------------------------------

        //        if (type == "C")
        //        {
        //            return new ValidateBarcodeResponseDto
        //            {
        //                Success = false,
        //                Message =
        //                    $"Bill No - {billNo} BillDate - {billDate}",

        //                TagCode = itemCode,
        //                ItemType = type,

        //                BillNo = billNo,
        //                BillDate = billDate,

        //                CanAdd = false
        //            };
        //        }

        //        // -----------------------------------------
        //        // Already Sold
        //        // -----------------------------------------

        //        return new ValidateBarcodeResponseDto
        //        {
        //            Success = false,

        //            Message =
        //                $"Item already Sold - Bill No {billNo}, BillDate - {billDate}",

        //            TagCode = itemCode,
        //            ItemType = type,

        //            BillNo = billNo,
        //            BillDate = billDate,

        //            IsAlreadySold = true,
        //            CanAdd = false
        //        };
        //    }

        //    // -----------------------------------------
        //    // 3. Nil Stock
        //    // -----------------------------------------

        //    return new ValidateBarcodeResponseDto
        //    {
        //        Success = false,
        //        Message = "Nil Stock!",

        //        TagCode = itemCode  ,

        //        CanAdd = false
        //    };
        //}

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

        // Validate Barcode
        //public async Task<ValidateBarcodeResponseDto> ValidateBarcodeAsync(string itemCode,int branchId,int subUnitId,string connection)
        //{
        //    // -----------------------------------------
        //    // 1. Validate Item Code
        //    // -----------------------------------------

        //    if (string.IsNullOrWhiteSpace(itemCode))
        //    {
        //        return new ValidateBarcodeResponseDto
        //        {
        //            Success = false,
        //            Message = "Scan Item Code",
        //            CanAdd = false
        //        };
        //    }

        //    itemCode = itemCode.Trim();


        //    // -----------------------------------------
        //    // 2. BillingTag Check
        //    // -----------------------------------------

        //    DataTable dtBillTag = await GetBillingTagAsync(itemCode,connection);

        //    if (dtBillTag != null &&
        //        dtBillTag.Rows.Count > 0)
        //    {
        //        DataRow row = dtBillTag.Rows[0];

        //        string tagCode =
        //            row["TagCode"]?.ToString() ?? "";

        //        string imageURL =
        //            row["ImageURL"]?.ToString() ?? "";

        //        decimal mrp =
        //            row["MRP"] == DBNull.Value
        //                ? 0
        //                : Convert.ToDecimal(row["MRP"]);

        //        string displayName =
        //            row["DisplayName"]?.ToString() ?? "";

        //        string barcodeType =
        //            row["BarcodeType"]?.ToString() ?? "";

        //        decimal qty = row["Qty"] == DBNull.Value ? 0 : Convert.ToDecimal(row["Qty"]);
        //        decimal DisPer = row["DisPer"] == DBNull.Value ? 0 : Convert.ToDecimal(row["DisPer"]);
        //        decimal DiscountAmt = row["DiscountAmt"] == DBNull.Value ? 0 : Convert.ToDecimal(row["DiscountAmt"]);
        //        string stkMonth =
        //            row["StkMonth"]?.ToString() ?? "";

        //        string stkYear =
        //            row["StkYear"]?.ToString() ?? "";

        //        string offerType =
        //            row["OfferType"]?.ToString() ?? "";

        //        string offTypeBillVal =
        //            row["OffType_BillVal"]?.ToString() ?? "";

        //        int sectionId =
        //            row["SectionId"] == DBNull.Value
        //                ? 0
        //                : Convert.ToInt32(row["SectionId"]);


        //        // -----------------------------------------
        //        // BillingTag Found
        //        // -----------------------------------------

        //        return new ValidateBarcodeResponseDto
        //        {
        //            Success = true,

        //            Message =
        //                "Barcode validated successfully",

        //            TagCode = itemCode,

        //            ImageURL = imageURL,

        //            MRP = mrp,

        //            DisplayName = displayName,

        //            BarcodeType = barcodeType,

        //            Qty = qty,

        //            DisPer = DisPer,

        //            DiscountAmt = DiscountAmt,

        //            StkMonth = stkMonth,

        //            StkYear = stkYear,

        //            OfferType = offerType,

        //            OffType_BillVal = offTypeBillVal,

        //            SectionId = sectionId,

        //            CanAdd = true
        //        };
        //    }


        //    // -----------------------------------------
        //    // 3. BillingTag Not Found
        //    //    SP_ItemCodeCheck
        //    // -----------------------------------------

        //    DataTable dtItemCheck = await CheckItemCodeAsync(itemCode,connection);

        //    if (dtItemCheck != null &&
        //        dtItemCheck.Rows.Count > 0)
        //    {
        //        DataRow row = dtItemCheck.Rows[0];

        //        string type =
        //            row["Type"]?.ToString() ?? "";

        //        string billNo =
        //            row["GroupBillNo"]?.ToString() ?? "";

        //        string billDate =
        //            row["BillDate"]?.ToString() ?? "";


        //        // -----------------------------------------
        //        // Type = C
        //        // -----------------------------------------

        //        if (type == "C")
        //        {
        //            return new ValidateBarcodeResponseDto
        //            {
        //                Success = false,

        //                Message =
        //                    $"Bill No - {billNo} BillDate - {billDate}",

        //                TagCode = itemCode,

        //                ItemType = type,

        //                BillNo = billNo,

        //                BillDate = billDate,

        //                CanAdd = false
        //            };
        //        }


        //        // -----------------------------------------
        //        // Already Sold
        //        // -----------------------------------------

        //        return new ValidateBarcodeResponseDto
        //        {
        //            Success = false,

        //            Message =
        //                $"Item already Sold - Bill No {billNo}, BillDate - {billDate}",

        //            TagCode = itemCode,

        //            ItemType = type,

        //            BillNo = billNo,

        //            BillDate = billDate,

        //            IsAlreadySold = true,

        //            CanAdd = false
        //        };
        //    }


        //    // -----------------------------------------
        //    // 4. Nil Stock
        //    // -----------------------------------------

        //    return new ValidateBarcodeResponseDto
        //    {
        //        Success = false,

        //        Message = "Nil Stock!",

        //        TagCode = itemCode,

        //        CanAdd = false
        //    };
        //}
        //public async Task<DataTable> GetItemDetailsAsync(string itemCode,int branchId,int subUnitId,string connection)
        //{
        //    var parameters = new[]
        //    {
        //        new SqlParameter("@Case", "Detail"),
        //        new SqlParameter("@ItemCode", itemCode),
        //        new SqlParameter("@BranchId", branchId),
        //        new SqlParameter("@SubunitID", subUnitId)
        //    };

        //    return await _dbHelper.ExecuteSPAsync(connection,"Sp_Billing_GetDetails",parameters);
        //}

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
        //public async Task<DataTable> CheckItemCodeAsync(string itemCode,string connection)
        //{
        //    var parameters = new[] { new SqlParameter("@ItemCode", itemCode) };

        //    return await _dbHelper.ExecuteSPAsync(connection,"SP_ItemCodeCheck",parameters);
        //}

    }
}
