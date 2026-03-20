namespace DigitalErp.Api.Models;

public class DailyReading
{
    public int Id { get; set; }
    public string Machine { get; set; } = string.Empty;
    public DateTime ReadingDate { get; set; } = DateTime.UtcNow;
    public int Opening { get; set; }
    public int Closing { get; set; }
    public int Impressions { get; set; }
    public string Remarks { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
