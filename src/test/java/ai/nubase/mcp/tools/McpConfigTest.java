package ai.nubase.mcp.tools;

import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.ToolCallbackProvider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class McpConfigTest {

    @Test
    void registersDatabaseMemoryAndAssetsTools() {
        McpConfig config = new McpConfig();
        DatabaseMcpTools databaseMcpTools = mock(DatabaseMcpTools.class);
        MemoryMcpTools memoryMcpTools = new MemoryMcpTools(mock(ai.nubase.mem.service.MemoryService.class));
        AssetsMcpTools assetsMcpTools = new AssetsMcpTools(mock(ai.nubase.assets.service.AssetsService.class));

        ToolCallbackProvider provider = config.toolProvider(databaseMcpTools, memoryMcpTools, assetsMcpTools);

        assertThat(provider).isNotNull();
    }
}
