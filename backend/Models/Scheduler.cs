namespace DigitalErp.Api.Models;

public class ScheduleEntry
{
    public int Id { get; set; }
    public int JobCardId { get; set; }
    public int MachineId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Remarks { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
