namespace POSBILLING_WEB.FaceRecognition
{
    public class FaceService : IFaceService
    {
        public async Task<byte[]> GenerateFaceTemplateAsync( byte[] imageBytes)
        {
            // Actual face recognition model
            // will be added here.

            await Task.CompletedTask;

            return imageBytes;
        }
    }
}
