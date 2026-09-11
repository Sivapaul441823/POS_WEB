namespace POSBILLING_WEB.DTOs.Billing
{
    public class ValidateBarcodeResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = "";

        public string TagCode { get; set; } = "";
        public string ImageURL { get; set; } = "";
        public decimal MRP { get; set; }
        public string DisplayName { get; set; } = "";
        public string BarcodeType { get; set; } = "";
        public decimal Qty { get; set; }
        public string StkMonth { get; set; } = "";
        public string StkYear { get; set; } = "";
        public string OfferType { get; set; } = "";
        public string OffType_BillVal { get; set; } = "";
        public int SectionId { get; set; }
    }
}
