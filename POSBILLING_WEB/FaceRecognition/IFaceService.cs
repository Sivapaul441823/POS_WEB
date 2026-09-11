namespace POSBILLING_WEB.FaceRecognition
{
    public interface IFaceService
    {
        Task<byte[]> GenerateFaceTemplateAsync(byte[] imageBytes);
    }
}
