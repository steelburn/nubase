package ai.nubase.ai.gateway.platform;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Read-side aggregation for the platform usage ledger. Powers the platform admin dashboards
 * (who / which app / how many tokens, and how much came from platform config vs custom).
 */
@Repository
public class PlatformUsageQueryRepository {

    private final JdbcTemplate metadataJdbcTemplate;

    public PlatformUsageQueryRepository(@Qualifier("metadataJdbcTemplate") JdbcTemplate metadataJdbcTemplate) {
        this.metadataJdbcTemplate = metadataJdbcTemplate;
    }

    /** Grand totals over the last {@code days} days, optionally filtered by upstream_source. */
    public Map<String, Object> overview(int days, String source) {
        StringBuilder sql = new StringBuilder(
                "SELECT COUNT(*) AS request_count, "
                        + "COALESCE(SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END), 0) AS error_count, "
                        + "COALESCE(SUM(input_tokens), 0) AS input_tokens, "
                        + "COALESCE(SUM(output_tokens), 0) AS output_tokens, "
                        + "COALESCE(SUM(total_tokens), 0) AS total_tokens, "
                        + "COALESCE(SUM(cost_usd), 0) AS cost_usd, "
                        + "COALESCE(SUM(cost_cny), 0) AS cost_cny, "
                        + "COUNT(DISTINCT app_code) AS app_count, "
                        + "COUNT(DISTINCT user_id) AS user_count "
                        + "FROM public.ai_gateway_usage_logs "
                        + "WHERE created_at >= NOW() - (? || ' days')::interval ");
        List<Object> args = new ArrayList<>();
        args.add(days);
        if (source != null && !source.isBlank()) {
            sql.append("AND upstream_source = ? ");
            args.add(source);
        }
        return metadataJdbcTemplate.queryForMap(sql.toString(), args.toArray());
    }

    /** Per-day token series over the last {@code days} days. */
    public List<Map<String, Object>> dailySeries(int days, String source) {
        StringBuilder sql = new StringBuilder(
                "SELECT usage_date, upstream_source, "
                        + "SUM(request_count) AS request_count, SUM(total_tokens) AS total_tokens, "
                        + "SUM(cost_usd) AS cost_usd, SUM(cost_cny) AS cost_cny "
                        + "FROM public.ai_gateway_daily_usage "
                        + "WHERE usage_date >= (CURRENT_DATE - (? || ' days')::interval)::date ");
        List<Object> args = new ArrayList<>();
        args.add(days);
        if (source != null && !source.isBlank()) {
            sql.append("AND upstream_source = ? ");
            args.add(source);
        }
        sql.append("GROUP BY usage_date, upstream_source ORDER BY usage_date ASC");
        return metadataJdbcTemplate.queryForList(sql.toString(), args.toArray());
    }

    /** Totals grouped by app_code (last {@code days} days). */
    public List<Map<String, Object>> byApp(int days, String source) {
        StringBuilder sql = new StringBuilder(
                "SELECT app_code, COUNT(*) AS request_count, "
                        + "COALESCE(SUM(total_tokens), 0) AS total_tokens, "
                        + "COALESCE(SUM(cost_usd), 0) AS cost_usd, COALESCE(SUM(cost_cny), 0) AS cost_cny, "
                        + "COUNT(DISTINCT user_id) AS user_count "
                        + "FROM public.ai_gateway_usage_logs "
                        + "WHERE created_at >= NOW() - (? || ' days')::interval ");
        List<Object> args = new ArrayList<>();
        args.add(days);
        if (source != null && !source.isBlank()) {
            sql.append("AND upstream_source = ? ");
            args.add(source);
        }
        sql.append("GROUP BY app_code ORDER BY total_tokens DESC");
        return metadataJdbcTemplate.queryForList(sql.toString(), args.toArray());
    }

    /** Totals grouped by user_id, optionally scoped to one app (last {@code days} days). */
    public List<Map<String, Object>> byUser(int days, String appCode, String source) {
        StringBuilder sql = new StringBuilder(
                "SELECT user_id, COUNT(*) AS request_count, "
                        + "COALESCE(SUM(total_tokens), 0) AS total_tokens, "
                        + "COALESCE(SUM(cost_usd), 0) AS cost_usd, COALESCE(SUM(cost_cny), 0) AS cost_cny, "
                        + "COUNT(DISTINCT app_code) AS app_count "
                        + "FROM public.ai_gateway_usage_logs "
                        + "WHERE created_at >= NOW() - (? || ' days')::interval ");
        List<Object> args = new ArrayList<>();
        args.add(days);
        if (appCode != null && !appCode.isBlank()) {
            sql.append("AND app_code = ? ");
            args.add(appCode);
        }
        if (source != null && !source.isBlank()) {
            sql.append("AND upstream_source = ? ");
            args.add(source);
        }
        sql.append("GROUP BY user_id ORDER BY total_tokens DESC");
        return metadataJdbcTemplate.queryForList(sql.toString(), args.toArray());
    }

    /** Recent raw ledger rows, filtered by app / user / source, paginated. */
    public List<Map<String, Object>> logs(String appCode, String userId, String source, int limit, int offset) {
        StringBuilder sql = new StringBuilder(
                "SELECT id, app_code, user_id, api_key_id, request_id, model, provider, endpoint, method, "
                        + "status_code, upstream_name, upstream_source, input_tokens, output_tokens, total_tokens, "
                        + "cost_usd, cost_cny, duration_ms, error_message, created_at "
                        + "FROM public.ai_gateway_usage_logs WHERE 1 = 1 ");
        List<Object> args = new ArrayList<>();
        if (appCode != null && !appCode.isBlank()) {
            sql.append("AND app_code = ? ");
            args.add(appCode);
        }
        if (userId != null && !userId.isBlank()) {
            sql.append("AND user_id = ?::uuid ");
            args.add(userId);
        }
        if (source != null && !source.isBlank()) {
            sql.append("AND upstream_source = ? ");
            args.add(source);
        }
        sql.append("ORDER BY created_at DESC LIMIT ? OFFSET ?");
        args.add(limit);
        args.add(offset);
        return metadataJdbcTemplate.queryForList(sql.toString(), args.toArray());
    }
}
