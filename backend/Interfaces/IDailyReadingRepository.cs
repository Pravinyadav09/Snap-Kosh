using DigitalErp.Api.Models;

namespace DigitalErp.Api.Interfaces;

public interface IDailyReadingRepository
{
    Task<IEnumerable<DailyReading>> GetAllAsync();
    Task<DailyReading?> GetLastReadingByMachineAsync(string machineName);
    Task<int> AddAsync(DailyReading reading);
}
