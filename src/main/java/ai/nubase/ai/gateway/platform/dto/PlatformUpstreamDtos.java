package ai.nubase.ai.gateway.platform.dto;

import ai.nubase.ai.gateway.platform.PlatformUpstream;
import ai.nubase.common.enums.ApiProvider;

import java.util.List;

/**
 * Request/response DTOs for the platform unified-upstream admin API. Responses deliberately never
 * carry the decrypted {@code authToken} — only a {@code hasAuthToken} flag — so a platform admin
 * read can never leak the platform's real provider credentials.
 */
public final class PlatformUpstreamDtos {

    private PlatformUpstreamDtos() {
    }

    public record PlatformUpstreamRequest(
            String name,
            String provider,
            String baseUrl,
            /** Write-only; blank/absent on update = keep the existing token. */
            String authToken,
            String channelCode,
            List<String> supportedModels,
            String chatCompletionsPath,
            Boolean isDefault,
            Boolean isActive,
            Integer timeoutMs,
            Integer maxRetries,
            Integer priority,
            Integer maxInputTokens,
            String description) {

        public PlatformUpstream toEntity(Long id) {
            return PlatformUpstream.builder()
                    .id(id)
                    .name(name)
                    .provider(ApiProvider.fromString(provider))
                    .baseUrl(baseUrl)
                    .authToken(authToken)
                    .channelCode(channelCode)
                    .supportedModels(supportedModels == null ? List.of() : supportedModels)
                    .chatCompletionsPath(chatCompletionsPath == null || chatCompletionsPath.isBlank()
                            ? "/v1/chat/completions" : chatCompletionsPath)
                    .isDefault(isDefault != null && isDefault)
                    .isActive(isActive == null || isActive)
                    .timeoutMs(timeoutMs == null ? 60000 : timeoutMs)
                    .maxRetries(maxRetries == null ? 2 : maxRetries)
                    .priority(priority == null ? 100 : priority)
                    .maxInputTokens(maxInputTokens)
                    .description(description)
                    .build();
        }
    }

    public record PlatformUpstreamResponse(
            Long id,
            String name,
            String provider,
            String baseUrl,
            boolean hasAuthToken,
            String channelCode,
            List<String> supportedModels,
            String chatCompletionsPath,
            boolean isDefault,
            boolean isActive,
            Integer timeoutMs,
            Integer maxRetries,
            Integer priority,
            Integer maxInputTokens,
            String description,
            String createdAt,
            String updatedAt) {

        public static PlatformUpstreamResponse from(PlatformUpstream u) {
            return new PlatformUpstreamResponse(
                    u.getId(),
                    u.getName(),
                    u.getProvider() == null ? null : u.getProvider().name(),
                    u.getBaseUrl(),
                    u.getAuthToken() != null && !u.getAuthToken().isBlank(),
                    u.getChannelCode(),
                    u.getSupportedModels(),
                    u.getChatCompletionsPath(),
                    Boolean.TRUE.equals(u.getIsDefault()),
                    Boolean.TRUE.equals(u.getIsActive()),
                    u.getTimeoutMs(),
                    u.getMaxRetries(),
                    u.getPriority(),
                    u.getMaxInputTokens(),
                    u.getDescription(),
                    u.getCreatedAt() == null ? null : u.getCreatedAt().toString(),
                    u.getUpdatedAt() == null ? null : u.getUpdatedAt().toString());
        }
    }
}
