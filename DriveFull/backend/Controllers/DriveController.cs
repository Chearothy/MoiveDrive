using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using System.IO;

namespace DriveFull.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DriveController : ControllerBase
    {
        // ... Keep all existing constructor dependencies & services intact ...

        /// <summary>
        /// Stream or download shared file by token
        /// </summary>
        [HttpGet("share/{shareToken}")]
        [AllowAnonymous]
        public IActionResult GetSharedFile(string shareToken)
        {
            // Retrieve file record by token (Adapt method name to your service layer)
            var fileItem = _driveService.GetFileByShareToken(shareToken);
            if (fileItem == null)
            {
                return NotFound(new { message = "Shared link is invalid or has expired." });
            }

            var filePath = fileItem.PhysicalPath;
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { message = "File not found on server storage." });
            }

            // Determine content MIME type dynamically
            var contentType = GetContentType(fileItem.FileName);

            // Create read stream for range processing
            var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);

            // enableRangeProcessing: true allows seeking/buffering in HTML5 <video> elements
            return File(
                fileStream: stream,
                contentType: contentType,
                fileDownloadName: fileItem.FileName,
                enableRangeProcessing: true
            );
        }

        private string GetContentType(string fileName)
        {
            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(fileName, out string contentType))
            {
                contentType = "application/octet-stream";
            }
            return contentType;
        }

        // ... Keep all existing actions (Upload, Delete, List, etc.) intact ...
    }
}
