FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY *.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 8443

RUN mkdir -p /https
USER $APP_UID

ENV ASPNETCORE_URLS=https://+:8443 \
    ASPNETCORE_Kestrel__Certificates__Default__Path=/https/dev.pfx

COPY --from=build /app/publish .

ENTRYPOINT [ "dotnet", "tls-test.api.dll" ]