from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SCRAPER_", env_file=".env", extra="ignore")

    env: str = "development"
    queue_url: str = "amqp://guest:guest@localhost:5672"
    api_base_url: str = "http://localhost:4000"
    proxy_url: str | None = None
    concurrency: int = 6
    rate_limit_per_domain: int = 2
    cron: str = "*/15 * * * *"
    marketplace_timeout_seconds: int = 45
    user_agent: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    )


settings = Settings()
