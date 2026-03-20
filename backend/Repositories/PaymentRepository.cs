using Dapper;
using Microsoft.Data.SqlClient;
using DigitalErp.Api.Models;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly string _connectionString;
    public PaymentRepository(IConfiguration config) => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<Payment>> GetByCustomerAsync(int customerId)
    {
        using var conn = new SqlConnection(_connectionString);
        return await conn.QueryAsync<Payment>(
            "SELECT * FROM Payments WHERE CustomerId = @CustomerId AND IsActive = 1 ORDER BY PaymentDate DESC", 
            new { CustomerId = customerId });
    }

    public async Task<int> AddAsync(Payment payment)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();
        using var trans = conn.BeginTransaction();

        try
        {
            var sql = @"INSERT INTO Payments (CustomerId, InvoiceId, Amount, PaymentDate, PaymentMethod, ReferenceNumber, Remarks, CreatedAt, IsActive) 
                        VALUES (@CustomerId, @InvoiceId, @Amount, @PaymentDate, @PaymentMethod, @ReferenceNumber, @Remarks, @CreatedAt, 1);
                        SELECT CAST(SCOPE_IDENTITY() as int);";
            
            var id = await conn.ExecuteScalarAsync<int>(sql, payment, trans);

            // Update Customer Net Balance (Payment reduces balance)
            await conn.ExecuteAsync(
                "UPDATE Customers SET NetBalance = NetBalance - @Amount WHERE Id = @CustomerId", 
                new { Amount = payment.Amount, CustomerId = payment.CustomerId }, trans);

            await trans.CommitAsync();
            return id;
        }
        catch
        {
            await trans.RollbackAsync();
            throw;
        }
    }
}
