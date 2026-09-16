using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POSBILLING_WEB.DTOs.Billing;
using POSBILLING_WEB.Services.Interfaces;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;

namespace POSBILLING_WEB.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class BillingController : ControllerBase
    {
        private readonly IBillingService _billingService;

        public BillingController(IBillingService billingService)
        {
            _billingService = billingService;
        }
        [HttpGet("bill-no")]
        public async Task<IActionResult> GetBillNo()
        {
            var branchIdString = HttpContext.Session.GetString("BranchId");

            var connection = HttpContext.Session.GetString("ConnectionName");

            if (string.IsNullOrEmpty(branchIdString))
            {
                return Unauthorized("BranchId not found in session.");
            }

            if (string.IsNullOrEmpty(connection))
            {
                return Unauthorized("ConnectionName not found in session.");
            }

            int branchId = Convert.ToInt32(branchIdString);


            var result = await _billingService.LoadBillNoAsync(branchId, connection);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);

        }
        [HttpPost("validate-barcode")]
        public async Task<IActionResult> ValidateBarcode([FromBody] ValidateBarcodeRequestDto request)
        {
            var branchIdString = HttpContext.Session.GetString("BranchId");

            var subUnitIdString = HttpContext.Session.GetString("SubUnitId");

            var connection = HttpContext.Session.GetString("ConnectionName");

            if (string.IsNullOrEmpty(branchIdString))
            {
                return Unauthorized("BranchId not found in session.");
            }

            if (string.IsNullOrEmpty(subUnitIdString))
            {
                return Unauthorized("SubUnitId not found in session.");
            }

            if (string.IsNullOrEmpty(connection))
            {
                return Unauthorized("ConnectionName not found in session.");
            }

            if (string.IsNullOrWhiteSpace(request.ItemCode))
            {
                return BadRequest("Item Code is required.");
            }

            int branchId = Convert.ToInt32(branchIdString);
            int subUnitId = Convert.ToInt32(subUnitIdString);

            var result = await _billingService.ValidateBarcodeAsync(request.ItemCode.Trim(),branchId,subUnitId,connection);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        [HttpPost("RePrint")]
        public async Task<IActionResult> RePrint([FromBody] RePrintRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.BillNo))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Bill Number is required"
                });
            }

            var branchIdString =
                HttpContext.Session.GetString("BranchId");

            var subUnitIdString =
                HttpContext.Session.GetString("SubUnitId");

            if (!int.TryParse(branchIdString, out int branchId))
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "BranchId not found in session"
                });
            }

            if (!int.TryParse(subUnitIdString, out int subUnitId))
            {
                return Unauthorized(new
                {
                    success = false,
                    message = "SubUnitId not found in session"
                });
            }
            var result = await _billingService.GetPrintDetailsAsync(request.BillNo.Trim(),branchId,subUnitId);

            if (result == null || result.Tables.Count == 0)
            {
                return NotFound(new
                {
                    success = false,
                    message = "Bill not found"
                });
            }
            var tables = new List<object>();

            foreach (DataTable table in result.Tables)
            {
                tables.Add(DataTableToList(table));
            }

            return Ok(new
            {
                success = true,
                tables = tables
            });

        }
        private static List<Dictionary<string, object?>> DataTableToList(DataTable table)
        {
            var list = new List<Dictionary<string, object?>>();

            foreach (DataRow row in table.Rows)
            {
                var item = new Dictionary<string, object?>();

                foreach (DataColumn column in table.Columns)
                {
                    item[column.ColumnName] =
                        row[column] == DBNull.Value
                            ? null
                            : row[column];
                }

                list.Add(item);
            }

            return list;
        }
    }
}
