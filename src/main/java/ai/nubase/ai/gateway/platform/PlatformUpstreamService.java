package ai.nubase.ai.gateway.platform;

import ai.nubase.common.enums.ApiProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/**
 * Resolves the platform's unified upstream configuration — the fallback used when a project has
 * not configured its own {@code ai_gateway.upstream_configs} (custom-first, platform-second).
 *
 * <p>Unlike the per-tenant {@code UpstreamConfigService}, this snapshot is <b>global</b> (one set of
 * upstreams shared by all projects), so it is cached once in memory and refreshed on admin changes.
 * Loading is lazy and safe from any request thread because it reads from the metadata DB, which is
 * not tenant-routed.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlatformUpstreamService {

    private final PlatformUpstreamRepository repository;

    /** Cached active upstreams (priority ascending). {@code null} = not yet loaded. */
    private volatile List<PlatformUpstream> snapshot;

    private List<PlatformUpstream> active() {
        List<PlatformUpstream> local = snapshot;
        if (local == null) {
            synchronized (this) {
                if (snapshot == null) {
                    snapshot = repository.findAllActive();
                    log.info("Loaded {} active platform upstream(s)", snapshot.size());
                }
                local = snapshot;
            }
        }
        return local;
    }

    /** Reload the global snapshot after an admin mutation. */
    public synchronized void refresh() {
        snapshot = repository.findAllActive();
        log.info("Refreshed platform upstream snapshot: {} active", snapshot.size());
    }

    /** True if the platform has at least one active upstream to fall back to. */
    public boolean hasAnyActive() {
        return !active().isEmpty();
    }

    public Optional<PlatformUpstream> getByName(String name) {
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }
        return active().stream().filter(u -> name.equals(u.getName())).findFirst();
    }

    /**
     * Default upstream for a provider: the one flagged {@code is_default}, else the highest-priority
     * active upstream for that provider.
     */
    public Optional<PlatformUpstream> getDefaultByProvider(ApiProvider provider) {
        List<PlatformUpstream> candidates = active().stream()
                .filter(u -> u.getProvider() == provider)
                .sorted(Comparator.comparingInt(u -> u.getPriority() == null ? Integer.MAX_VALUE : u.getPriority()))
                .toList();
        return candidates.stream().filter(u -> Boolean.TRUE.equals(u.getIsDefault())).findFirst()
                .or(() -> candidates.stream().findFirst());
    }

    /**
     * Highest-priority active platform upstream that explicitly lists {@code model} in its
     * supported_models, if any.
     */
    public Optional<PlatformUpstream> getBySupportedModel(String model) {
        if (model == null || model.isBlank()) {
            return Optional.empty();
        }
        String normalized = model.trim().toLowerCase(Locale.ROOT);
        return active().stream()
                .filter(u -> u.getSupportedModels() != null && u.getSupportedModels().stream()
                        .anyMatch(m -> m != null && m.trim().toLowerCase(Locale.ROOT).equals(normalized)))
                .min(Comparator.comparingInt(u -> u.getPriority() == null ? Integer.MAX_VALUE : u.getPriority()));
    }

    /** Failover candidates for a provider, excluding already-tried upstream names, priority ascending. */
    public List<PlatformUpstream> getFailoverByProvider(ApiProvider provider, List<String> excludeNames) {
        return active().stream()
                .filter(u -> u.getProvider() == provider)
                .filter(u -> excludeNames == null || !excludeNames.contains(u.getName()))
                .sorted(Comparator.comparingInt(u -> u.getPriority() == null ? Integer.MAX_VALUE : u.getPriority()))
                .toList();
    }
}
