-- Platform-level AI gateway: unified upstream config + central usage ledger.
--
-- These tables live in the metadata database (public schema, like database_configs),
-- NOT in per-tenant ai_gateway schemas. They give the platform:
--   1. A managed, multi-provider "unified upstream" set that any project falls back to
--      when it has not configured its own ai_gateway.upstream_configs (custom-first).
--   2. A cross-project ledger keyed by (app_code, user_id) so the platform can see who,
--      in which app, consumed how many tokens — including which requests were served by
--      platform config vs. the project's own custom upstreams (upstream_source).

-- ---------------------------------------------------------------------------
-- Platform unified upstreams (fallback when a project has no custom upstream).
-- Mirrors the shape of ai_gateway.upstream_configs so routing logic is identical.
-- auth_token is stored encrypted at rest (EncryptionService), never returned to tenants.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_gateway_platform_upstreams (
    id                    BIGSERIAL PRIMARY KEY,
    name                  VARCHAR(128) NOT NULL UNIQUE,
    provider              VARCHAR(32)  NOT NULL DEFAULT 'CLAUDE',
    base_url              TEXT         NOT NULL,
    auth_token_encrypted  TEXT,
    channel_code          VARCHAR(64),
    supported_models      JSONB,
    chat_completions_path VARCHAR(255),
    is_default            BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active             BOOLEAN      NOT NULL DEFAULT TRUE,
    timeout_ms            INTEGER      NOT NULL DEFAULT 60000,
    max_retries           INTEGER      NOT NULL DEFAULT 2,
    priority              INTEGER      NOT NULL DEFAULT 100,
    max_input_tokens      INTEGER,
    description           TEXT,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_upstreams_active_priority
    ON public.ai_gateway_platform_upstreams (is_active, provider, priority ASC);

-- ---------------------------------------------------------------------------
-- Platform central usage ledger — one row per gateway call, every call.
-- upstream_source distinguishes 'custom' (project's own upstream) from 'platform'
-- (served by the unified platform config), so platform-config consumption is filterable.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_gateway_usage_logs (
    id                          BIGSERIAL PRIMARY KEY,
    app_code                    VARCHAR(128) NOT NULL,
    user_id                     UUID,
    api_key_id                  BIGINT,
    request_id                  VARCHAR(128),
    model                       VARCHAR(128),
    provider                    VARCHAR(32),
    endpoint                    VARCHAR(255),
    method                      VARCHAR(16),
    status_code                 INTEGER,
    upstream_name               VARCHAR(255),
    upstream_source             VARCHAR(16)  NOT NULL DEFAULT 'custom',
    input_tokens                INTEGER      NOT NULL DEFAULT 0,
    output_tokens               INTEGER      NOT NULL DEFAULT 0,
    cache_creation_input_tokens INTEGER      NOT NULL DEFAULT 0,
    cache_read_input_tokens     INTEGER      NOT NULL DEFAULT 0,
    total_tokens                INTEGER      NOT NULL DEFAULT 0,
    cost_usd                    NUMERIC(14,6) NOT NULL DEFAULT 0,
    cost_cny                    NUMERIC(14,6) NOT NULL DEFAULT 0,
    duration_ms                 BIGINT,
    error_message               TEXT,
    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_usage_app_created
    ON public.ai_gateway_usage_logs (app_code, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_usage_user_created
    ON public.ai_gateway_usage_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_usage_source_created
    ON public.ai_gateway_usage_logs (upstream_source, created_at DESC);

-- ---------------------------------------------------------------------------
-- Daily rollup keyed by (app_code, user_id, usage_date, model, upstream_source).
-- user_id is NOT NULL with a zero-UUID sentinel for gateway-key calls that carry no
-- user, so the unique key (and ON CONFLICT upsert) stays simple.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_gateway_daily_usage (
    id                          BIGSERIAL PRIMARY KEY,
    app_code                    VARCHAR(128) NOT NULL,
    user_id                     UUID         NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    usage_date                  DATE         NOT NULL,
    model                       VARCHAR(128) NOT NULL,
    upstream_source             VARCHAR(16)  NOT NULL DEFAULT 'custom',
    request_count               BIGINT       NOT NULL DEFAULT 0,
    error_count                 BIGINT       NOT NULL DEFAULT 0,
    input_tokens                BIGINT       NOT NULL DEFAULT 0,
    output_tokens               BIGINT       NOT NULL DEFAULT 0,
    cache_creation_input_tokens BIGINT       NOT NULL DEFAULT 0,
    cache_read_input_tokens     BIGINT       NOT NULL DEFAULT 0,
    total_tokens                BIGINT       NOT NULL DEFAULT 0,
    cost_usd                    NUMERIC(16,6) NOT NULL DEFAULT 0,
    cost_cny                    NUMERIC(16,6) NOT NULL DEFAULT 0,
    created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_platform_daily_usage
        UNIQUE (app_code, user_id, usage_date, model, upstream_source)
);

CREATE INDEX IF NOT EXISTS idx_platform_daily_app_date
    ON public.ai_gateway_daily_usage (app_code, usage_date DESC);
