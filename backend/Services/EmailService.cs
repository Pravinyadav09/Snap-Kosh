using System.Net;
using System.Net.Mail;
using DigitalErp.Api.Interfaces;

namespace DigitalErp.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpSettings = _config.GetSection("SmtpSettings");
        var host = smtpSettings["Host"];
        var port = int.Parse(smtpSettings["Port"] ?? "587");
        var user = smtpSettings["Username"];
        var pass = smtpSettings["Password"];
        var from = smtpSettings["FromEmail"];

        if (string.IsNullOrEmpty(host)) return; // Don't send if not configured

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(user, pass),
            EnableSsl = true
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(from ?? user ?? "no-reply@digitalerp.com"),
            Subject = subject,
            Body = body,
            IsBodyHtml = true
        };

        mailMessage.To.Add(to);

        await client.SendMailAsync(mailMessage);
    }
}
