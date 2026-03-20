using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Repositories;

public class JobCardRepository : IJobCardRepository
{
    private readonly string _connectionString;

    public JobCardRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new ArgumentNullException("Connection string not found.");
    }

    public async Task<IEnumerable<JobCard>> GetAllAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "SELECT * FROM JobCards WHERE IsActive = 1 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<JobCard>(sql);
    }

    public async Task<IEnumerable<JobCard>> GetByCustomerIdAsync(int customerId)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "SELECT * FROM JobCards WHERE CustomerId = @CustomerId AND IsActive = 1 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<JobCard>(sql, new { CustomerId = customerId });
    }

    public async Task<JobCard?> GetByIdAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "SELECT * FROM JobCards WHERE Id = @Id";
        return await connection.QueryFirstOrDefaultAsync<JobCard>(sql, new { Id = id });
    }

    public async Task<int> CreateAsync(JobCard jobCard)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = @"INSERT INTO JobCards (JobNumber, CustomerId, JobDescription, MachineType, Quantity, DispatchedQuantity, DeliveryMode, TrackingRef, InventoryItemId, InventoryQuantity, Rate, PaperSize, PaperType, BookDetails, DesignFilePath, JobStatus, DueDate, CreatedAt, IsActive) 
                    VALUES (@JobNumber, @CustomerId, @JobDescription, @MachineType, @Quantity, @DispatchedQuantity, @DeliveryMode, @TrackingRef, @InventoryItemId, @InventoryQuantity, @Rate, @PaperSize, @PaperType, @BookDetails, @DesignFilePath, @JobStatus, @DueDate, @CreatedAt, @IsActive);
                    SELECT CAST(SCOPE_IDENTITY() as int);";
        return await connection.ExecuteScalarAsync<int>(sql, jobCard);
    }

    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "UPDATE JobCards SET JobStatus = @Status";
        
        if (status.Equals("Delivered", StringComparison.OrdinalIgnoreCase) || status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
        {
            sql += ", CompletedAt = GETUTCDATE()";
        }
        
        sql += " WHERE Id = @Id";

        var rows = await connection.ExecuteAsync(sql, new { Id = id, Status = status });
        return rows > 0;
    }

    public async Task<bool> UpdateDesignFileAsync(int id, string filePath)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "UPDATE JobCards SET DesignFilePath = @FilePath WHERE Id = @Id";
        var rows = await connection.ExecuteAsync(sql, new { Id = id, FilePath = filePath });
        return rows > 0;
    }

    public async Task<bool> DispatchJobAsync(int id, int qty, string mode, string trackingRef)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = @"UPDATE JobCards 
                    SET DispatchedQuantity = DispatchedQuantity + @Qty,
                        DeliveryMode = @Mode,
                        TrackingRef = @TrackingRef,
                        JobStatus = CASE WHEN (DispatchedQuantity + @Qty) >= Quantity THEN 'Delivered' ELSE 'Partial' END,
                        CompletedAt = CASE WHEN (DispatchedQuantity + @Qty) >= Quantity THEN GETUTCDATE() ELSE CompletedAt END
                    WHERE Id = @Id";
        var rows = await connection.ExecuteAsync(sql, new { Id = id, Qty = qty, Mode = mode, TrackingRef = trackingRef });
        return rows > 0;
    }

    public async Task<PagedResult<JobCard>> GetPagedAsync(int page, int size, string? search)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = @"
            SELECT j.*, c.Name as CustomerName 
            FROM JobCards j
            JOIN Customers c ON j.CustomerId = c.Id
            WHERE j.IsActive = 1 
            AND (@Search IS NULL OR j.JobNumber LIKE '%' + @Search + '%' OR j.JobDescription LIKE '%' + @Search + '%' OR c.Name LIKE '%' + @Search + '%')
            ORDER BY j.CreatedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

            SELECT COUNT(*) 
            FROM JobCards j
            JOIN Customers c ON j.CustomerId = c.Id
            WHERE j.IsActive = 1 
            AND (@Search IS NULL OR j.JobNumber LIKE '%' + @Search + '%' OR j.JobDescription LIKE '%' + @Search + '%' OR c.Name LIKE '%' + @Search + '%');
        ";

        using var multi = await connection.QueryMultipleAsync(sql, new 
        { 
            Search = search, 
            Offset = (page - 1) * size, 
            Limit = size 
        });

        return new PagedResult<JobCard>
        {
            Items = await multi.ReadAsync<JobCard>(),
            TotalCount = await multi.ReadFirstAsync<int>(),
            PageNumber = page,
            PageSize = size
        };
    }

    public async Task<IEnumerable<LookupDto>> GetLookupAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<LookupDto>("SELECT Id, JobNumber as Name FROM JobCards WHERE IsActive = 1 ORDER BY CreatedAt DESC");
    }
}
