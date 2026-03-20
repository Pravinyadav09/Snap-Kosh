using DigitalErp.Api.Models;

namespace DigitalErp.Api.Interfaces;

public interface ISchedulerRepository
{
    Task<IEnumerable<ScheduleEntry>> GetByDateRangeAsync(DateTime start, DateTime end);
    Task<int> AddAsync(ScheduleEntry entry);
    Task<bool> UpdateAsync(ScheduleEntry entry);
    Task<bool> DeleteAsync(int id);
}
