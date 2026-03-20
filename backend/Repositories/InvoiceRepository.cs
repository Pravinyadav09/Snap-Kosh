using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;
using DigitalErp.Api.DTOs;

namespace DigitalErp.Api.Repositories;

public class InvoiceRepository : IInvoiceRepository
{
    private readonly string _connectionString;

    public InvoiceRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? throw new ArgumentNullException("Connection string not found.");
    }

    public async Task<IEnumerable<Invoice>> GetAllAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "SELECT * FROM Invoices WHERE IsActive = 1 ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<Invoice>(sql);
    }

    public async Task<Invoice?> GetByIdAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = @"SELECT * FROM Invoices WHERE Id = @Id;
                    SELECT * FROM InvoiceItems WHERE InvoiceId = @Id;";

        using var multi = await connection.QueryMultipleAsync(sql, new { Id = id });
        var invoice = await multi.ReadFirstOrDefaultAsync<Invoice>();
        if (invoice != null)
        {
            invoice.Items = (await multi.ReadAsync<InvoiceItem>()).ToList();
        }
        return invoice;
    }

    public async Task<int> CreateAsync(Invoice invoice)
    {
        using var connection = new SqlConnection(_connectionString);
        await connection.OpenAsync();
        using var transaction = connection.BeginTransaction();

        try
        {
            var invoiceSql = @"INSERT INTO Invoices (InvoiceNumber, CustomerId, InvoiceDate, TotalAmount, TaxAmount, GrandTotal, PaymentStatus, CreatedAt, IsActive) 
                               VALUES (@InvoiceNumber, @CustomerId, @InvoiceDate, @TotalAmount, @TaxAmount, @GrandTotal, @PaymentStatus, @CreatedAt, @IsActive);
                               SELECT CAST(SCOPE_IDENTITY() as int);";

            var invoiceId = await connection.ExecuteScalarAsync<int>(invoiceSql, invoice, transaction);

            var itemsSql = @"INSERT INTO InvoiceItems (InvoiceId, Description, Quantity, Rate, Amount) 
                             VALUES (@InvoiceId, @Description, @Quantity, @Rate, @Amount);";

            foreach (var item in invoice.Items)
            {
                item.InvoiceId = invoiceId;
                await connection.ExecuteAsync(itemsSql, item, transaction);
            }

            transaction.Commit();
            return invoiceId;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = "UPDATE Invoices SET PaymentStatus = @Status WHERE Id = @Id";
        var rows = await connection.ExecuteAsync(sql, new { Id = id, Status = status });
        return rows > 0;
    }

    public async Task<PagedResult<Invoice>> GetPagedAsync(int page, int size, string? search)
    {
        using var connection = new SqlConnection(_connectionString);
        var sql = @"
            SELECT i.*, c.Name as CustomerName 
            FROM Invoices i
            JOIN Customers c ON i.CustomerId = c.Id
            WHERE i.IsActive = 1 
            AND (@Search IS NULL OR i.InvoiceNumber LIKE '%' + @Search + '%' OR c.Name LIKE '%' + @Search + '%')
            ORDER BY i.CreatedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

            SELECT COUNT(*) 
            FROM Invoices i
            JOIN Customers c ON i.CustomerId = c.Id
            WHERE i.IsActive = 1 
            AND (@Search IS NULL OR i.InvoiceNumber LIKE '%' + @Search + '%' OR c.Name LIKE '%' + @Search + '%');
        ";

        using var multi = await connection.QueryMultipleAsync(sql, new 
        { 
            Search = search, 
            Offset = (page - 1) * size, 
            Limit = size 
        });

        return new PagedResult<Invoice>
        {
            Items = await multi.ReadAsync<Invoice>(),
            TotalCount = await multi.ReadFirstAsync<int>(),
            PageNumber = page,
            PageSize = size
        };
    }
}
