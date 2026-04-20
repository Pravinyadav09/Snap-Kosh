using System;
using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace DebugDb
{
    class Program
    {
        static void Main()
        {
            string connString = "Server=DESKTOP-QSEOH2P\\SQLEXPRESS;Database=DigitalSnap;Trusted_Connection=True;TrustServerCertificate=True;";
            
            using var conn = new SqlConnection(connString);
            conn.Open();
            
            string[] tables = { "Customers", "Invoices", "JobCards", "InventoryItems" };
            
            foreach (var table in tables)
            {
                Console.WriteLine($"\n--- Columns for {table} ---");
                using var cmd = new SqlCommand($"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table}'", conn);
                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    Console.WriteLine($" - {reader[0]}");
                }
            }
        }
    }
}
