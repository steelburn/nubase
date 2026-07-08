package ai.nubase.deploy.service;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.unit.DataSize;

@Data
@Component
@ConfigurationProperties(prefix = "nubase.deploy.app-worker")
public class AppWorkerDeployProperties {
    private DataSize maxFileSize = DataSize.ofMegabytes(64);
    private DataSize maxRequestSize = DataSize.ofMegabytes(128);
}
