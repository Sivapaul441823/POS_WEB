namespace POSBILLING_WEB.DTOs
{
    public class LoginResponseDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string UserCat { get; set; }
        public string Email { get; set; }
        public string EmpDesignation { get; set; }
        public DateTime? ExpiryDate { get; set; }

        public int CompanyId { get; set; }
        public int BranchId { get; set; }
        public string Branch { get; set; }

        public int EmployeeId { get; set; }
        public int FinYearId { get; set; }

        public string MenuType { get; set; }
        public string LogECNo { get; set; }

        public string BillEntReq { get; set; }
        public string StockEntReq { get; set; }
        public string Category { get; set; }
        public string Reprint { get; set; }
        public string Discount { get; set; }

        public string Token { get; set; } = string.Empty;
    }
}
