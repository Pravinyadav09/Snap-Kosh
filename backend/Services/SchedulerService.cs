using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Services;

public class SchedulerService
{
    private readonly ISchedulerRepository _repo;
    public SchedulerService(ISchedulerRepository repo) => _repo = repo;

    public Task<IEnumerable<ScheduleEntry>> GetSchedule(DateTime start, DateTime end) => _repo.GetByDateRangeAsync(start, end);
    public Task<int> AddEntry(ScheduleEntry entry) => _repo.AddAsync(entry);
    public Task<bool> UpdateEntry(ScheduleEntry entry) => _repo.UpdateAsync(entry);
    public Task<bool> DeleteEntry(int id) => _repo.DeleteAsync(id);
}
