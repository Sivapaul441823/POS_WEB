namespace POSBILLING_WEB.DTOs.Billing
{
    public class GetItemDetailsResponseDto
    {
        public string TagCode { get; set; } = string.Empty;

        public int BranchId { get; set; }

        public int SubUnitId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public decimal MRP { get; set; }

        public decimal Qty { get; set; }

        public decimal DisPer { get; set; }

        public decimal DisVal { get; set; }

        public decimal TotalAmt { get; set; }

        public string HSNCode { get; set; } = string.Empty;

        public decimal OldMRP { get; set; }

        public decimal GSTPer { get; set; }

        public decimal GSTAmt { get; set; }

        public decimal OldGSTAmt { get; set; }

        public string ImageURL { get; set; } = string.Empty;

        public string BarcodeType { get; set; } = string.Empty;

        public string StkMonth { get; set; } = string.Empty;

        public string StkYear { get; set; } = string.Empty;

        public string OfferType { get; set; } = string.Empty;

        public string OffType_BillVal { get; set; } = string.Empty;

        public int SectionId { get; set; }

        public string ItemCode { get; set; } = string.Empty;

        public int ComboSet { get; set; }

        public string ComboOffer { get; set; } = string.Empty;

        public decimal ComboDiscount { get; set; }

        public string Type { get; set; } = string.Empty;
    }
}
