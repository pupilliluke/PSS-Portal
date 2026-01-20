# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["ConsultingAuditPortal.sln", "./"]
COPY ["src/CAP.Api/CAP.Api.csproj", "src/CAP.Api/"]
COPY ["src/CAP.Application/CAP.Application.csproj", "src/CAP.Application/"]
COPY ["src/CAP.Domain/CAP.Domain.csproj", "src/CAP.Domain/"]
COPY ["src/CAP.Infrastructure/CAP.Infrastructure.csproj", "src/CAP.Infrastructure/"]

# Restore dependencies
RUN dotnet restore

# Copy everything else
COPY . .

# Build the project
WORKDIR "/src/src/CAP.Api"
RUN dotnet build "CAP.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "CAP.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080

# Copy published files
COPY --from=publish /app/publish .

# Run the application
ENTRYPOINT ["dotnet", "CAP.Api.dll"]
