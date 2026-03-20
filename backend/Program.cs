using DigitalErp.Api.Interfaces;
using DigitalErp.Api.Repositories;
using DigitalErp.Api.Services;
using DigitalErp.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs",
        policy => policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// 2. Register Dependency Injection (Repositories & Services)
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<IInvoiceRepository, InvoiceRepository>();
builder.Services.AddScoped<InvoiceService>();
builder.Services.AddScoped<IInventoryRepository, InventoryRepository>();
builder.Services.AddScoped<InventoryService>();
builder.Services.AddScoped<IJobCardRepository, JobCardRepository>();
builder.Services.AddScoped<JobCardService>();
builder.Services.AddScoped<IExpenseRepository, ExpenseRepository>();
builder.Services.AddScoped<ExpenseService>();
builder.Services.AddScoped<IDailyReadingRepository, DailyReadingRepository>();
builder.Services.AddScoped<DailyReadingService>();
builder.Services.AddScoped<IMachineRepository, MachineRepository>();
builder.Services.AddScoped<MachineService>();
builder.Services.AddScoped<IQuotationRepository, QuotationRepository>();
builder.Services.AddScoped<QuotationService>();
builder.Services.AddScoped<IOutsourceRepository, OutsourceRepository>();
builder.Services.AddScoped<OutsourceService>();
builder.Services.AddScoped<IPurchaseRepository, PurchaseRepository>();
builder.Services.AddScoped<PurchaseService>();
builder.Services.AddScoped<IManagementRepository, ManagementRepository>();
builder.Services.AddScoped<ManagementService>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<DashboardService>();
builder.Services.AddScoped<ISchedulerRepository, SchedulerRepository>();
builder.Services.AddScoped<SchedulerService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ReportRepository>();
builder.Services.AddScoped<ReportService>();
builder.Services.AddScoped<IAuditRepository, AuditRepository>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<PaymentService>();
builder.Services.AddScoped<IAnalyticsRepository, AnalyticsRepository>();
builder.Services.AddScoped<AnalyticsService>();
builder.Services.AddScoped<IPortalRepository, PortalRepository>();
builder.Services.AddScoped<PortalService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IMaintenanceRepository, MaintenanceRepository>();
builder.Services.AddScoped<MaintenanceService>();
builder.Services.AddScoped<IUtilityRepository, UtilityRepository>();
builder.Services.AddScoped<UtilityService>();
builder.Services.AddScoped<ISpecializedInventoryRepository, SpecializedInventoryRepository>();
builder.Services.AddScoped<SpecializedInventoryService>();
builder.Services.AddScoped<IPricingRepository, PricingRepository>();
builder.Services.AddScoped<PricingService>();
builder.Services.AddScoped<AuditService>();

var app = builder.Build();

// 3. Configure the HTTP request pipeline
app.UseMiddleware<ExceptionMiddleware>();
app.UseStaticFiles(); // Enable serving files from wwwroot
app.UseCors("AllowNextJs");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); // Access at /swagger
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();
