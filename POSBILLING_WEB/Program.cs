using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using POSBILLING_WEB.Data;
using POSBILLING_WEB.Repositories;
using POSBILLING_WEB.Repositories.Interfaces;
using POSBILLING_WEB.Services;
using POSBILLING_WEB.Services.Interfaces;
using POSBILLING_WEBPOSBILLINGWEB.Repositories;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


// =========================================================
// SERVICES
// =========================================================

builder.Services.AddControllers();

builder.Services.AddScoped<DbHelper>();

builder.Services.AddScoped<IAuthRepository, AuthRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddScoped<IBillingRepository, BillingRepository>();

builder.Services.AddScoped<IBillingService, BillingService>();


// =========================================================
// SESSION
// =========================================================

builder.Services.AddDistributedMemoryCache();

builder.Services.AddSession(options =>
{
    options.IdleTimeout =TimeSpan.FromHours(8);

    options.Cookie.HttpOnly = true;

    options.Cookie.IsEssential = true;

    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;

    options.Cookie.SameSite = SameSiteMode.Strict;
});


// =========================================================
// JWT AUTHENTICATION
// =========================================================

var jwtKey = builder.Configuration["JwtSettings:Key"];

var jwtIssuer = builder.Configuration["JwtSettings:Issuer"];

var jwtAudience = builder.Configuration["JwtSettings:Audience"];


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,

                ValidateAudience = true,

                ValidateLifetime = true,

                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtIssuer,

                ValidAudience = jwtAudience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtKey!))
            };


        // JWT from HttpOnly Cookie
        options.Events =
            new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    context.Token =
                        context.Request.Cookies[
                            "AuthToken"
                        ];

                    return Task.CompletedTask;
                }
            };
    });


builder.Services.AddScoped<IJwtService, JwtService>();


// =========================================================
// SWAGGER
// =========================================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen();


// =========================================================
// BUILD
// =========================================================

var app = builder.Build();


// =========================================================
// HTTP PIPELINE
// =========================================================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    app.UseSwaggerUI();
}


app.UseHttpsRedirection();


// =========================================================
// SESSION
// =========================================================

app.UseSession();


// =========================================================
// AUTHENTICATION
// =========================================================

app.UseAuthentication();

app.UseAuthorization();


// =========================================================
// PROTECT BILLING.HTML
// =========================================================

app.Use(async (context, next) =>
{
    if (context.Request.Path.Equals("/billing.html",StringComparison.OrdinalIgnoreCase))
    {
        var loginSession = context.Session.GetString("LoginResponse");

        var billingInitiated = context.Session.GetString("BillingInitiated");


        // Employee login check
        if (string.IsNullOrEmpty(loginSession))
        {
            context.Response.Redirect("/login.html");
            return;
        }


        // Billing initiation check
        if (billingInitiated != "true")
        {
            context.Response.Redirect("/login.html");
            return;
        }
    }

    await next();
});


// =========================================================
// STATIC FILES
// =========================================================

app.UseStaticFiles();


// =========================================================
// CONTROLLERS
// =========================================================

app.MapControllers();


// =========================================================
// RUN
// =========================================================

app.Run();