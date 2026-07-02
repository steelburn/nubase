package ai.nubase.ai.gateway.platform.controller;

import ai.nubase.ai.gateway.platform.PlatformUsageQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Platform control-plane read APIs over the central usage ledger — who (user_id), in which app
 * (app_code), consumed how many tokens, and how much came from platform config vs. custom upstreams
 * ({@code source=platform|custom}). Cross-tenant, authenticated by {@code AdminInitAuthFilter}.
 */
@RestController
@RequestMapping("/ai-gateway/platform/v1/usage")
@RequiredArgsConstructor
public class PlatformUsageAdminController {

    private final PlatformUsageQueryRepository queryRepository;

    private static int clampDays(Integer days) {
        if (days == null) {
            return 14;
        }
        return Math.max(1, Math.min(days, 365));
    }

    private static int clampLimit(Integer size) {
        if (size == null) {
            return 50;
        }
        return Math.max(1, Math.min(size, 500));
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> overview(
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) String source) {
        int d = clampDays(days);
        Map<String, Object> totals = queryRepository.overview(d, source);
        List<Map<String, Object>> series = queryRepository.dailySeries(d, source);
        return ResponseEntity.ok(Map.of("days", d, "source", source == null ? "all" : source,
                "totals", totals, "series", series));
    }

    @GetMapping("/by-app")
    public ResponseEntity<List<Map<String, Object>>> byApp(
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) String source) {
        return ResponseEntity.ok(queryRepository.byApp(clampDays(days), source));
    }

    @GetMapping("/by-user")
    public ResponseEntity<List<Map<String, Object>>> byUser(
            @RequestParam(required = false) Integer days,
            @RequestParam(required = false) String appCode,
            @RequestParam(required = false) String source) {
        return ResponseEntity.ok(queryRepository.byUser(clampDays(days), appCode, source));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, Object>>> logs(
            @RequestParam(required = false) String appCode,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        int limit = clampLimit(size);
        int offset = Math.max(0, (page == null ? 0 : page)) * limit;
        return ResponseEntity.ok(queryRepository.logs(appCode, userId, source, limit, offset));
    }
}
