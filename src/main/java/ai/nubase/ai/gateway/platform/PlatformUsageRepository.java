package ai.nubase.ai.gateway.platform;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Metadata-DB writes for the platform central usage ledger
 * ({@code public.ai_gateway_usage_logs} + {@code public.ai_gateway_daily_usage}).
 *
 * <p>These writes target the metadata datasource directly and do NOT depend on the tenant routing
 * ThreadLocal, so they are safe to call from the same synchronous tracking path that writes the
 * per-tenant logs.</p>
 */
@Slf4j
@Repository
public class PlatformUsageRepository {

    /** Sentinel used for the daily rollup when a call carries no authenticated user. */
    private static final UUID NO_USER = new UUID(0L, 0L);

    private final JdbcTemplate metadataJdbcTemplate;

    public PlatformUsageRepository(@Qualifier("metadataJdbcTemplate") JdbcTemplate metadataJdbcTemplate) {
        this.metadataJdbcTemplate = metadataJdbcTemplate;
    }

    public void insertUsageLog(PlatformUsageEntry e) {
        metadataJdbcTemplate.update(
                "INSERT INTO public.ai_gateway_usage_logs "
                        + "(app_code, user_id, api_key_id, request_id, model, provider, endpoint, method, "
                        + " status_code, upstream_name, upstream_source, input_tokens, output_tokens, "
                        + " cache_creation_input_tokens, cache_read_input_tokens, total_tokens, "
                        + " cost_usd, cost_cny, duration_ms, error_message) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                e.appCode(), e.userId(), e.apiKeyId(), e.requestId(), e.model(), e.provider(),
                e.endpoint(), e.method(), e.statusCode(), e.upstreamName(), e.upstreamSource(),
                e.inputTokens(), e.outputTokens(), e.cacheCreationInputTokens(), e.cacheReadInputTokens(),
                e.totalTokens(), nz(e.costUsd()), nz(e.costCny()), e.durationMs(), e.errorMessage());
    }

    public void upsertDailyUsage(PlatformUsageEntry e) {
        UUID userId = e.userId() == null ? NO_USER : e.userId();
        String model = e.model() == null ? "unknown" : e.model();
        int errorCount = e.statusCode() != null && e.statusCode() >= 400 ? 1 : 0;

        metadataJdbcTemplate.update(
                "INSERT INTO public.ai_gateway_daily_usage "
                        + "(app_code, user_id, usage_date, model, upstream_source, request_count, error_count, "
                        + " input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens, "
                        + " total_tokens, cost_usd, cost_cny) "
                        + "VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?) "
                        + "ON CONFLICT (app_code, user_id, usage_date, model, upstream_source) DO UPDATE SET "
                        + " request_count = public.ai_gateway_daily_usage.request_count + 1, "
                        + " error_count = public.ai_gateway_daily_usage.error_count + EXCLUDED.error_count, "
                        + " input_tokens = public.ai_gateway_daily_usage.input_tokens + EXCLUDED.input_tokens, "
                        + " output_tokens = public.ai_gateway_daily_usage.output_tokens + EXCLUDED.output_tokens, "
                        + " cache_creation_input_tokens = public.ai_gateway_daily_usage.cache_creation_input_tokens "
                        + "     + EXCLUDED.cache_creation_input_tokens, "
                        + " cache_read_input_tokens = public.ai_gateway_daily_usage.cache_read_input_tokens "
                        + "     + EXCLUDED.cache_read_input_tokens, "
                        + " total_tokens = public.ai_gateway_daily_usage.total_tokens + EXCLUDED.total_tokens, "
                        + " cost_usd = public.ai_gateway_daily_usage.cost_usd + EXCLUDED.cost_usd, "
                        + " cost_cny = public.ai_gateway_daily_usage.cost_cny + EXCLUDED.cost_cny, "
                        + " updated_at = NOW()",
                e.appCode(), userId, LocalDate.now(), model, e.upstreamSource(), errorCount,
                e.inputTokens(), e.outputTokens(), e.cacheCreationInputTokens(), e.cacheReadInputTokens(),
                e.totalTokens(), nz(e.costUsd()), nz(e.costCny()));
    }

    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }
}
