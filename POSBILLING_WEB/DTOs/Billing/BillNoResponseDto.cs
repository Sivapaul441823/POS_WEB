namespace POSBILLING_WEB.DTOs.Billing
{
    public class BillNoResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int BillNo { get; set; }

        public string BillPrefix { get; set; } = string.Empty;

        public string BillNumber { get; set; } = string.Empty;

        public int BillValid { get; set; }

        public bool CanBill { get; set; }

    }
}
