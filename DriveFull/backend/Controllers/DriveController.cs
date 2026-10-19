using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace DriveFull.Api.Controllers;

[ApiController]
[Route("api/drive")]
public class DriveController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    public DriveController(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet("children")]
    [HttpGet("public-children")]
    public async Task<IActionResult> PublicChildren([FromQuery] string folderLink)
    {
        // No user login. This endpoint only reads folders/files shared publicly or with "Anyone with the link".
        if (!TryGetFolderId(folderLink, out var folderId))
            return BadRequest(new { message = "Folder link មិនត្រឹមត្រូវ។ សូមប្រើ Google Drive Folder link។" });

        var apiKey = _configuration["Google:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
            return StatusCode(503, new { message = "សូមកំណត់ Google:ApiKey នៅ Backend ដើម្បីអាន Public Folder។" });

        var q = Uri.EscapeDataString($"'{folderId}' in parents and trashed = false");
        var fields = Uri.EscapeDataString("files(id,name,mimeType,modifiedTime,webViewLink,size)");
        var url = $"https://www.googleapis.com/drive/v3/files?q={q}&pageSize=100&orderBy=folder,name&fields={fields}&key={Uri.EscapeDataString(apiKey)}";
        var client = _httpClientFactory.CreateClient();
        using var response = await client.GetAsync(url);
        var body = await response.Content.ReadAsStringAsync();
        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, new { message = "មិនអាចអាន Folder បានទេ។ សូមកំណត់ Share ទៅ Anyone with the link — Viewer ហើយពិនិត្យ API key។" });
        return Content(body, "application/json");
    }

    private static bool TryGetFolderId(string? link, out string id)
    {
        id = "";
        if (!Uri.TryCreate(link, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps ||
            (uri.Host != "drive.google.com" && uri.Host != "docs.google.com")) return false;
        var match = Regex.Match(uri.AbsolutePath, @"/folders/([A-Za-z0-9_-]+)");
        if (!match.Success) return false;
        id = match.Groups[1].Value;
        return id.Length >= 5 && id.Length <= 200;
    }
}
