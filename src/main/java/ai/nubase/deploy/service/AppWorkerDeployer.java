package ai.nubase.deploy.service;

public interface AppWorkerDeployer {

    AppWorkerDeploymentResult deploy(AppWorkerDeploymentRequest request);

    AppWorkerDeploymentResult activate(String workerName, String versionId, String previewHost);

    /**
     * Read live provider state for one worker. Returns {@link AppWorkerInfo#exists()} == false
     * when the worker is not present (already deleted / never deployed).
     */
    AppWorkerInfo get(String workerName);

    /**
     * Remove (undeploy) one worker from the provider. Idempotent: deleting an absent worker
     * is treated as success.
     */
    void delete(String workerName);
}
