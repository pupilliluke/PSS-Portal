namespace CAP.Application.Common;

public interface IFileStorage
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType);
    Task<Stream> DownloadAsync(string storageKey);
    Task DeleteAsync(string storageKey);
    Task<bool> ExistsAsync(string storageKey);
}
