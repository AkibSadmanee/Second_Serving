from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    database_url: str = "sqlite+aiosqlite:///./second_serving.db"
    secret_key: str = "change-this-to-a-long-random-string-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    openai_api_key: str = ""


settings = Settings()
