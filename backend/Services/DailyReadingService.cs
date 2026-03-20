using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Services;

public class DailyReadingService
{
    private readonly IDailyReadingRepository _repo;

    public DailyReadingService(IDailyReadingRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<DailyReading>> GetAllReadings()
    {
        return await _repo.GetAllAsync();
    }

    public async Task<DailyReading?> GetLastReading(string machineName)
    {
        return await _repo.GetLastReadingByMachineAsync(machineName);
    }

    public async Task<int> LogReading(DailyReading reading)
    {
        // Auto-calculate impressions
        reading.Impressions = reading.Closing - reading.Opening;

        if (reading.Impressions < 0)
        {
            throw new ArgumentException("Closing reading cannot be less than Opening reading.");
        }

        reading.CreatedAt = DateTime.UtcNow;
        return await _repo.AddAsync(reading);
    }
}
