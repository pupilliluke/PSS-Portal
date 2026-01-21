using CAP.Application.Common;
using Microsoft.Extensions.Configuration;

namespace CAP.Infrastructure.Storage;

public class LocalFileStorage : IFileStorage
{
    private readonly string _basePath;

    public LocalFileStorage(IConfiguration config)
    {
        _basePath = config["FileStorage:LocalPath"] ?? "uploads";
        Directory.CreateDirectory(_basePath);
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
    {
        var storageKey = $"{Guid.NewGuid()}_{SanitizeFileName(fileName)}";
        var filePath = Path.Combine(_basePath, storageKey);

        using var fileOut = File.Create(filePath);
        await fileStream.CopyToAsync(fileOut);

        return storageKey;
    }

    public Task<Stream> DownloadAsync(string storageKey)
    {
        var filePath = Path.Combine(_basePath, storageKey);
        if (!File.Exists(filePath))
            throw new FileNotFoundException("File not found", storageKey);

        return Task.FromResult<Stream>(File.OpenRead(filePath));
    }

    public Task DeleteAsync(string storageKey)
    {
        var filePath = Path.Combine(_basePath, storageKey);
        if (File.Exists(filePath))
            File.Delete(filePath);

        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string storageKey)
    {
        var filePath = Path.Combine(_basePath, storageKey);
        return Task.FromResult(File.Exists(filePath));
    }

    private static string SanitizeFileName(string fileName)
    {
        var invalid = Path.GetInvalidFileNameChars();
        return string.Join("_", fileName.Split(invalid, StringSplitOptions.RemoveEmptyEntries));
    }
}
