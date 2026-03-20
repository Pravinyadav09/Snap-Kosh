using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Interfaces;

public interface IDashboardRepository
{
    Task<AdminDashboardSummary> GetAdminSummaryAsync();
}
