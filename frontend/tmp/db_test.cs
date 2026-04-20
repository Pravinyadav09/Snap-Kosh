using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;

try {
    var connectionString = "Server=DESKTOP-QSEOH2P\\SQLEXPRESS;Database=DigitalSnap;Trusted_Connection=True;TrustServerCertificate=True;";
    using var conn = new SqlConnection(connectionString);
    conn.Open();
    Console.WriteLine("Connection opened.");

    var sql = @"
        SELECT TOP 5 c.CompanyName as Name, SUM(i.GrandTotal) as TotalRevenue
        FROM Invoices i
        JOIN Customers c ON i.CustomerId = c.Id
        WHERE i.IsActive = 1
        GROUP BY c.CompanyName;
        
        SELECT 
            SUM(CASE WHEN DATEDIFF(day, InvoiceDate, GETUTCDATE()) <= 30 THEN GrandTotal ELSE 0 END) as Within30Days
        FROM Invoices
        WHERE PaymentStatus != 'Paid' AND IsActive = 1;

        SELECT 
            c.Id,
            c.CompanyName as Name,
            COUNT(DISTINCT j.Id) as TotalJobs,
            SUM(i.GrandTotal) as TotalRevenue,
            MAX(j.CreatedAt) as LastJobDate,
            MAX(p.PaymentDate) as LastPaymentDate,
            c.NetBalance
        FROM Customers c
        LEFT JOIN JobCards j ON c.Id = j.CustomerId
        LEFT JOIN Invoices i ON c.Id = i.CustomerId AND i.IsActive = 1
        LEFT JOIN Payments p ON c.Id = p.CustomerId
        WHERE c.IsActive = 1
        GROUP BY c.Id, c.CompanyName, c.NetBalance;
    ";

    using var multi = await conn.QueryMultipleAsync(sql);
    var t1 = multi.Read();
    var t2 = multi.Read();
    var t3 = multi.Read();
    Console.WriteLine("Queries executed successfully.");
} catch (Exception ex) {
    Console.WriteLine("Error: " + ex.Message);
    if (ex.InnerException != null) Console.WriteLine("Inner: " + ex.InnerException.Message);
}
