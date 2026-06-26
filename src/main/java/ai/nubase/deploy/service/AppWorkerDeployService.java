package ai.nubase.deploy.service;

import ai.nubase.common.context.MultiTenancyContext;
import ai.nubase.deploy.dto.AppDeploymentDtos.AppWorkerDeployMetadata;
import ai.nubase.deploy.dto.AppDeploymentDtos.AppWorkerDeployResponse;
import ai.nubase.deploy.dto.AppDeploymentDtos.AppWorkerActivateVersionRequest;
import ai.nubase.deploy.dto.AppDeploymentDtos.AppWorkerActivateVersionResponse;
import ai.nubase.deploy.dto.AppDeploymentDtos.CompleteDeploymentRequest;
import ai.nubase.deploy.dto.AppDeploymentDtos.CreateDeploymentRequest;
import ai.nubase.deploy.dto.AppDeploymentDtos.RecordDeploymentStepRequest;
import ai.nubase.metadata.entity.AppDeployment;
import ai.nubase.metadata.entity.AppDeploymentStep;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AppWorkerDeployService {

    private final AppDeploymentService deploymentService;
    private final AppWorkerDeployer deployer;

    public AppWorkerDeployResponse deploy(
            AppWorkerDeployMetadata metadata,
            List<MultipartFile> serverFiles,
            List<MultipartFile> assetFiles
    ) {
        validate(metadata, serverFiles);
        String appCode = metadata.appCode().trim();
        String workerName = StringUtils.hasText(metadata.workerName()) ? metadata.workerName().trim() : appCode;
        String previewHost = StringUtils.hasText(metadata.previewHost())
                ? metadata.previewHost().trim()
                : workerName + ".ottermind.app";

        var deployment = deploymentService.createForProjectRef(appCode, new CreateDeploymentRequest(
                appCode,
                manifestSummary(metadata, serverFiles, assetFiles),
                null,
                metadata.version()
        ));
        try {
            List<AppWorkerDeploymentRequest.AppWorkerFile> serverBundle = files(serverFiles);
            deploymentService.recordStepForProjectRef(appCode, deployment.id(), new RecordDeploymentStepRequest(
                    1,
                    "server_bundle_received",
                    metadata.mainModule(),
                    AppDeploymentStep.STATUS_SUCCEEDED,
                    Map.of("fileCount", serverBundle.size()),
                    null
            ));

            List<AppWorkerDeploymentRequest.AppWorkerFile> assets = files(assetFiles);
            deploymentService.recordStepForProjectRef(appCode, deployment.id(), new RecordDeploymentStepRequest(
                    2,
                    "assets_received",
                    metadata.clientDistPath(),
                    AppDeploymentStep.STATUS_SUCCEEDED,
                    Map.of("fileCount", assets.size()),
                    null
            ));

            AppWorkerDeploymentResult result = deployer.deploy(new AppWorkerDeploymentRequest(
                    appCode,
                    metadata.version(),
                    workerName,
                    metadata.mainModule(),
                    metadata.serverEntrypointPath(),
                    previewHost,
                    metadata.compatibilityDate(),
                    metadata.compatibilityFlags(),
                    plainBindings(metadata),
                    secretBindings(metadata),
                    serverBundle,
                    assets
            ));

            deploymentService.recordStepForProjectRef(appCode, deployment.id(), new RecordDeploymentStepRequest(
                    3,
                    "cloudflare_app_worker_deploy",
                    result.providerDeploymentId(),
                    AppDeploymentStep.STATUS_SUCCEEDED,
                    deploymentResult(result),
                    null
            ));
            deploymentService.completeForProjectRef(appCode, deployment.id(), new CompleteDeploymentRequest(
                    AppDeployment.STATUS_SUCCEEDED,
                    result.previewUrl(),
                    null
            ));
            return new AppWorkerDeployResponse(
                    deployment.id(),
                    result.provider(),
                    result.providerDeploymentId(),
                    result.providerVersionId(),
                    result.previewUrl(),
                    result.status(),
                    result.assetManifestHash(),
                    result.assetFileCount(),
                    result.deployedAt(),
                    null
            );
        } catch (Exception e) {
            String message = e.getMessage() == null ? e.toString() : e.getMessage();
            deploymentService.recordStepForProjectRef(appCode, deployment.id(), new RecordDeploymentStepRequest(
                    99,
                    "cloudflare_app_worker_deploy",
                    workerName,
                    AppDeploymentStep.STATUS_FAILED,
                    Map.of(),
                    message
            ));
            deploymentService.completeForProjectRef(appCode, deployment.id(), new CompleteDeploymentRequest(
                    AppDeployment.STATUS_FAILED,
                    null,
                    message
            ));
            return new AppWorkerDeployResponse(
                    deployment.id(),
                    "cloudflare",
                    workerName,
                    null,
                    null,
                    "failed",
                    null,
                    assetFiles == null ? 0 : assetFiles.size(),
                    Instant.now(),
                    message
            );
        }
    }

    public AppWorkerActivateVersionResponse activateVersion(AppWorkerActivateVersionRequest request) {
        validateActivate(request);
        String appCode = StringUtils.hasText(MultiTenancyContext.getAppCode())
                ? MultiTenancyContext.getAppCode().trim()
                : workerAppCode(request.workerName());
        String workerName = StringUtils.hasText(request.workerName()) ? request.workerName().trim() : appCode;
        String previewHost = StringUtils.hasText(request.previewHost())
                ? request.previewHost().trim()
                : workerName + ".ottermind.app";
        String version = StringUtils.hasText(request.version()) ? request.version().trim() : request.providerVersionId().trim();

        var deployment = deploymentService.createForProjectRef(appCode, new CreateDeploymentRequest(
                appCode,
                activateManifestSummary(workerName, version, request.providerVersionId(), previewHost),
                null,
                version
        ));
        try {
            AppWorkerDeploymentResult result = deployer.activate(workerName, request.providerVersionId().trim(), previewHost);
            deploymentService.recordStepForProjectRef(appCode, deployment.id(), new RecordDeploymentStepRequest(
                    1,
                    "cloudflare_app_worker_activate_version",
                    result.providerDeploymentId(),
                    AppDeploymentStep.STATUS_SUCCEEDED,
                    activationResult(result),
                    null
            ));
            deploymentService.completeForProjectRef(appCode, deployment.id(), new CompleteDeploymentRequest(
                    AppDeployment.STATUS_SUCCEEDED,
                    result.previewUrl(),
                    null
            ));
            return new AppWorkerActivateVersionResponse(
                    deployment.id(),
                    result.provider(),
                    result.providerDeploymentId(),
                    result.providerVersionId(),
                    result.previewUrl(),
                    result.status(),
                    result.deployedAt(),
                    null
            );
        } catch (Exception e) {
            String message = e.getMessage() == null ? e.toString() : e.getMessage();
            deploymentService.recordStepForProjectRef(appCode, deployment.id(), new RecordDeploymentStepRequest(
                    99,
                    "cloudflare_app_worker_activate_version",
                    workerName,
                    AppDeploymentStep.STATUS_FAILED,
                    Map.of(),
                    message
            ));
            deploymentService.completeForProjectRef(appCode, deployment.id(), new CompleteDeploymentRequest(
                    AppDeployment.STATUS_FAILED,
                    null,
                    message
            ));
            return new AppWorkerActivateVersionResponse(
                    deployment.id(),
                    "cloudflare",
                    workerName,
                    request.providerVersionId(),
                    null,
                    "failed",
                    Instant.now(),
                    message
            );
        }
    }

    private void validate(AppWorkerDeployMetadata metadata, List<MultipartFile> serverFiles) {
        if (metadata == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "metadata is required");
        }
        String contextApp = MultiTenancyContext.getAppCode();
        if (!StringUtils.hasText(metadata.appCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "metadata.appCode is required");
        }
        if (StringUtils.hasText(contextApp) && !contextApp.equals(metadata.appCode())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "metadata.appCode must match project context");
        }
        requireWorkerNameOwnedByApp(metadata.appCode(), metadata.workerName());
        if (serverFiles == null || serverFiles.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "serverFile is required");
        }
    }

    private void validateActivate(AppWorkerActivateVersionRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "request is required");
        }
        String workerName = request.workerName();
        String appCode = StringUtils.hasText(MultiTenancyContext.getAppCode())
                ? MultiTenancyContext.getAppCode()
                : workerAppCode(workerName);
        if (!StringUtils.hasText(appCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "appCode is required");
        }
        if (!StringUtils.hasText(request.providerVersionId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "providerVersionId is required");
        }
        requireWorkerNameOwnedByApp(appCode, workerName);
    }

    private String workerAppCode(String workerName) {
        return StringUtils.hasText(workerName) ? workerName.trim().split("-", 2)[0] : null;
    }

    /**
     * The Cloudflare dispatch namespace is shared across tenants, so a custom workerName is only
     * allowed when it is namespaced under the project's appCode. This prevents one project from
     * deploying over another project's worker. When omitted, workerName defaults to appCode.
     */
    private void requireWorkerNameOwnedByApp(String appCode, String workerName) {
        if (!StringUtils.hasText(workerName)) {
            return;
        }
        String app = appCode.trim().toLowerCase(Locale.ROOT);
        String worker = workerName.trim().toLowerCase(Locale.ROOT);
        if (!worker.equals(app) && !worker.startsWith(app + "-")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "metadata.workerName must equal the project appCode or start with \"" + app + "-\"");
        }
    }

    private Map<String, Object> manifestSummary(
            AppWorkerDeployMetadata metadata,
            List<MultipartFile> serverFiles,
            List<MultipartFile> assetFiles
    ) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("type", "app_worker");
        summary.put("appCode", metadata.appCode());
        summary.put("version", metadata.version());
        summary.put("workerName", StringUtils.hasText(metadata.workerName()) ? metadata.workerName() : metadata.appCode());
        summary.put("mainModule", metadata.mainModule());
        summary.put("previewHost", metadata.previewHost());
        summary.put("serverFiles", serverFiles == null ? 0 : serverFiles.size());
        summary.put("assetFiles", assetFiles == null ? 0 : assetFiles.size());
        Map<String, String> bindings = plainBindings(metadata);
        String runtimeMode = bindings.get("NUBASE_RUNTIME_MODE");
        putIfPresent(summary, "runtimeMode", runtimeMode);
        putIfPresent(summary, "upstreamEndpoint", bindings.get("NUBASE_UPSTREAM_URL"));
        summary.put("proxyEnabled", "same-origin-proxy".equals(runtimeMode));
        return summary;
    }

    private Map<String, Object> activateManifestSummary(
            String workerName,
            String version,
            String providerVersionId,
            String previewHost
    ) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("type", "app_worker_activate_version");
        summary.put("workerName", workerName);
        summary.put("version", version);
        summary.put("providerVersionId", providerVersionId);
        summary.put("previewHost", previewHost);
        return summary;
    }

    private List<AppWorkerDeploymentRequest.AppWorkerFile> files(List<MultipartFile> files) throws IOException {
        List<AppWorkerDeploymentRequest.AppWorkerFile> out = new ArrayList<>();
        if (files == null) return out;
        for (MultipartFile file : files) {
            String path = StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : file.getName();
            out.add(new AppWorkerDeploymentRequest.AppWorkerFile(
                    path,
                    file.getBytes(),
                    file.getContentType()
            ));
        }
        return out;
    }

    private Map<String, String> plainBindings(AppWorkerDeployMetadata metadata) {
        Map<String, String> bindings = new LinkedHashMap<>();
        if (metadata.envBindings() != null) bindings.putAll(metadata.envBindings());
        if (metadata.plainTextBindings() != null) bindings.putAll(metadata.plainTextBindings());
        return bindings;
    }

    private Map<String, String> secretBindings(AppWorkerDeployMetadata metadata) {
        Map<String, String> bindings = new LinkedHashMap<>();
        if (metadata.secretTextBindings() != null) bindings.putAll(metadata.secretTextBindings());
        return bindings;
    }

    private Map<String, Object> deploymentResult(AppWorkerDeploymentResult result) {
        Map<String, Object> out = new LinkedHashMap<>();
        putIfPresent(out, "provider", result.provider());
        putIfPresent(out, "providerDeploymentId", result.providerDeploymentId());
        putIfPresent(out, "providerVersionId", result.providerVersionId());
        putIfPresent(out, "previewUrl", result.previewUrl());
        putIfPresent(out, "assetManifestHash", result.assetManifestHash());
        out.put("assetFileCount", result.assetFileCount());
        putIfPresent(out, "status", result.status());
        return out;
    }

    private Map<String, Object> activationResult(AppWorkerDeploymentResult result) {
        Map<String, Object> out = new LinkedHashMap<>();
        putIfPresent(out, "provider", result.provider());
        putIfPresent(out, "providerDeploymentId", result.providerDeploymentId());
        putIfPresent(out, "providerVersionId", result.providerVersionId());
        putIfPresent(out, "previewUrl", result.previewUrl());
        putIfPresent(out, "status", result.status());
        return out;
    }

    private void putIfPresent(Map<String, Object> out, String key, Object value) {
        if (value != null) {
            out.put(key, value);
        }
    }
}
