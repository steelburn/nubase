package ai.nubase.ai.gateway.platform;

/**
 * Request-scoped holder for how the current gateway request was routed, so the usage-tracking
 * layer can tag each ledger row with the resolved upstream and whether it came from the project's
 * own custom config or the platform's unified config.
 *
 * <p>Set by the routing/forwarding layer (e.g. {@code getUpstreamInfo}) as soon as an upstream is
 * chosen, and read synchronously by the tracking layer on the same request thread — mirroring how
 * {@code MultiTenancyContext} is already relied upon there. Cleared by
 * {@code GatewayApiKeyAuthFilter} at the end of the request, alongside the tenant context.</p>
 */
public final class GatewayRoutingContext {

    /** Where the serving upstream came from. */
    public enum Source {
        CUSTOM("custom"),
        PLATFORM("platform");

        private final String code;

        Source(String code) {
            this.code = code;
        }

        public String code() {
            return code;
        }
    }

    public record Routing(Source source, String upstreamName) {
    }

    private static final ThreadLocal<Routing> CURRENT = new ThreadLocal<>();

    private GatewayRoutingContext() {
    }

    public static void set(Source source, String upstreamName) {
        CURRENT.set(new Routing(source, upstreamName));
    }

    /** Returns the routing chosen for the current request, or {@code null} if none was recorded. */
    public static Routing get() {
        return CURRENT.get();
    }

    public static void clear() {
        CURRENT.remove();
    }
}
