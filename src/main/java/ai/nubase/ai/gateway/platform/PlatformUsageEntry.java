package ai.nubase.ai.gateway.platform;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Immutable value passed to {@link PlatformUsageRepository} for one gateway call's platform-level
 * ledger row + daily rollup. Carries the cross-project identity (appCode + userId) and the routing
 * source so platform-config consumption is filterable.
 */
@Builder
public record PlatformUsageEntry(
        String appCode,
        UUID userId,
        Long apiKeyId,
        String requestId,
        String model,
        String provider,
        String endpoint,
        String method,
        Integer statusCode,
        String upstreamName,
        String upstreamSource,
        int inputTokens,
        int outputTokens,
        int cacheCreationInputTokens,
        int cacheReadInputTokens,
        int totalTokens,
        BigDecimal costUsd,
        BigDecimal costCny,
        Long durationMs,
        String errorMessage) {
}
