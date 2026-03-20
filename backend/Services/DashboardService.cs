using DigitalErp.Api.DTOs;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Services;

public class DashboardService
{
    private readonly IDashboardRepository _repo;
    public DashboardService(IDashboardRepository repo) => _repo = repo;

    public Task<AdminDashboardSummary> GetAdminDashboard() => _repo.GetAdminSummaryAsync();
}
