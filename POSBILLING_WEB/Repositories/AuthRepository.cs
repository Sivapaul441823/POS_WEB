using System.Data;
using Microsoft.Data.SqlClient;
using POSBILLING_WEB.Data;
using POSBILLING_WEB.DTOs;
using POSBILLING_WEB.Repositories.Interfaces;
using JitSecurity;


namespace POSBILLING_WEBPOSBILLINGWEB.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly DbHelper _dbHelper;

        public AuthRepository(DbHelper dbHelper)
        {
            _dbHelper = dbHelper;
        }

        public async Task<LoginResponseDto?> LoginAsync(string userName,string password)
        {
            string encryptedPassword = JitSecurity.JitSecurity.EncryptText(password);
            SqlParameter[] parameters =
            {
                new SqlParameter("@UserName",SqlDbType.NVarChar, 50){Value = userName},
                new SqlParameter("@Password",SqlDbType.NVarChar, 50){Value = encryptedPassword}
            };

            DataTable dt = await _dbHelper.ExecuteSPAsync("TNV", "Sp_BranchLogin",parameters);

            if (dt.Rows.Count == 0)
            {
                return null;
            }

            DataRow row = dt.Rows[0];

            LoginResponseDto response = new LoginResponseDto
            {
                UserId = Convert.ToInt32(row["UserId"]),
                UserName = row["UserName"].ToString(),
                UserCat = row["UserCat"].ToString(),
                Email = row["Email"].ToString(),
                EmpDesignation = row["EmpDesignation"].ToString(),

                ExpiryDate = row["ExpiryDate"] == DBNull.Value
                    ? null
                    : Convert.ToDateTime(row["ExpiryDate"]),

                CompanyId = Convert.ToInt32(row["CompanyId"]),
                BranchId = Convert.ToInt32(row["BranchId"]),
                Branch = row["Branch"].ToString(),

                EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                FinYearId = Convert.ToInt32(row["FinYearId"]),

                MenuType = row["MenuType"].ToString(),
                LogECNo = row["LogECNo"].ToString(),

                BillEntReq = row["BillEntReq"].ToString(),
                StockEntReq = row["StockEntReq"].ToString(),
                Category = row["Category"].ToString(),
                Reprint = row["Reprint"].ToString(),
                Discount = row["Discount"].ToString()
            };

            return response;
        }
        public async Task<LoginResponseDto?> EmployeeLoginAsync(string userName)
        {
            SqlParameter[] parameters = {new SqlParameter("@UserName",SqlDbType.NVarChar,50)
                {
                    Value = userName
                }
            };

            DataTable dt = await _dbHelper.ExecuteSPAsync("TNV", "Sp_BranchWebLogin", parameters);

            if (dt.Rows.Count == 0)
            {
                return null;
            }

            DataRow row = dt.Rows[0];

            LoginResponseDto response = new LoginResponseDto
                {
                    UserId = Convert.ToInt32(row["UserId"]),

                    UserName = row["UserName"].ToString(),

                    UserCat = row["UserCat"].ToString(),

                    Email = row["Email"].ToString(),

                    EmpDesignation = row["EmpDesignation"].ToString(),

                    ExpiryDate = row["ExpiryDate"] == DBNull.Value ? null : Convert.ToDateTime(row["ExpiryDate"]),

                    CompanyId = Convert.ToInt32(row["CompanyId"]),

                    BranchId = Convert.ToInt32(row["BranchId"]),

                    Branch = row["Branch"].ToString(),

                    EmployeeId = Convert.ToInt32(row["EmployeeId"]),

                    FinYearId = Convert.ToInt32(row["FinYearId"]),

                    MenuType = row["MenuType"].ToString(),

                    LogECNo = row["LogECNo"].ToString(),

                    BillEntReq = row["BillEntReq"].ToString(),

                    StockEntReq = row["StockEntReq"].ToString(),

                    Category = row["Category"].ToString(),

                    Reprint = row["Reprint"].ToString(),

                    Discount = row["Discount"].ToString()
                };

            return response;
        }
    }
}