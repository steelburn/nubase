package ai.nubase.cron.target;

import ai.nubase.common.context.MultiTenancyContext;
import ai.nubase.cron.CronProperties;
import ai.nubase.cron.target.ScheduledJobTarget.RunOutcome;
import ai.nubase.metadata.cron.entity.ScheduledJob;
import ai.nubase.postgrest.api.ApiRequest;
import ai.nubase.postgrest.auth.PostgrestRequestContext;
import ai.nubase.postgrest.query.QueryExecutor;
import ai.nubase.postgrest.query.QueryPlan;
import ai.nubase.postgrest.query.QueryPlanner;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.RowMapper;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DbFunctionJobTargetTest {

    @Mock
    private QueryPlanner queryPlanner;
    @Mock
    private QueryExecutor queryExecutor;
    @Mock
    private JdbcTemplate jdbcTemplate;

    private DbFunctionJobTarget target;

    @BeforeEach
    void setUp() {
        target = new DbFunctionJobTarget(
                queryPlanner,
                queryExecutor,
                jdbcTemplate,
                new ObjectMapper(),
                new CronProperties(),
                new PostgrestRequestContext(jdbcTemplate, new ObjectMapper()));
        MultiTenancyContext.setContext(MultiTenancyContext.ContextData.builder()
                .appCode("app1").schemaName("tenant_app1").build());
    }

    @AfterEach
    void tearDown() {
        MultiTenancyContext.clear();
    }

    @Test
    void plansViaPostgrestEngineAndExecutesWithRows() throws Exception {
        QueryPlan plan = QueryPlan.builder().build();
        when(queryPlanner.plan(any())).thenReturn(plan);
        when(queryExecutor.buildSqlForPlan(plan, "{\"days\":7}")).thenReturn("SELECT tenant_app1.\"refresh_stats\"(days => 7)");
        stubQueryWithSingleRow("refresh_stats", 42);

        RunOutcome outcome = target.execute(job("refresh_stats", "{\"days\":7}"));

        assertThat(outcome.success()).isTrue();
        assertThat(outcome.result()).contains("42");
        ArgumentCaptor<ApiRequest> captor = ArgumentCaptor.forClass(ApiRequest.class);
        verify(queryPlanner).plan(captor.capture());
        ApiRequest apiRequest = captor.getValue();
        assertThat(apiRequest.isRpcCall()).isTrue();
        assertThat(apiRequest.getRpcFunctionName()).isEqualTo("refresh_stats");
        assertThat(apiRequest.getSchema()).isEqualTo("tenant_app1");
        assertThat(apiRequest.getRpcParams()).containsEntry("days", 7);
        verify(jdbcTemplate).execute("SET LOCAL ROLE \"service_role\"");
    }

    @Test
    void rejectsInvalidFunctionNamesWithoutTouchingTheDatabase() throws Exception {
        RunOutcome outcome = target.execute(job("1; DROP TABLE users;--", null));

        assertThat(outcome.success()).isFalse();
        assertThat(outcome.errorMessage()).contains("INVALID_DB_FUNCTION");
        verify(jdbcTemplate, never()).query(any(PreparedStatementCreator.class), any(org.springframework.jdbc.core.ResultSetExtractor.class));
        verify(queryPlanner, never()).plan(any());
    }

    @Test
    void emptyResultIsStillASuccess() throws Exception {
        lenient().when(queryExecutor.buildSqlForPlan(any(), any())).thenReturn("SELECT fn()");
        when(queryPlanner.plan(any())).thenReturn(QueryPlan.builder().build());
        stubQueryWithEmptyResult();

        RunOutcome outcome = target.execute(job("fn", null));

        assertThat(outcome.success()).isTrue();
        assertThat(outcome.result()).isEqualTo("0 rows");
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private void stubQueryWithSingleRow(String column, Object value) {
        when(jdbcTemplate.query(any(PreparedStatementCreator.class), any(org.springframework.jdbc.core.ResultSetExtractor.class)))
                .thenAnswer(inv -> {
                    org.springframework.jdbc.core.ResultSetExtractor extractor = inv.getArgument(1);
                    java.sql.ResultSet rs = org.mockito.Mockito.mock(java.sql.ResultSet.class);
                    java.sql.ResultSetMetaData md = org.mockito.Mockito.mock(java.sql.ResultSetMetaData.class);
                    org.mockito.Mockito.when(rs.getMetaData()).thenReturn(md);
                    org.mockito.Mockito.when(md.getColumnCount()).thenReturn(1);
                    org.mockito.Mockito.lenient().when(md.getColumnLabel(1)).thenReturn(column);
                    org.mockito.Mockito.lenient().when(md.getColumnName(1)).thenReturn(column);
                    org.mockito.Mockito.when(rs.getObject(1)).thenReturn(value);
                    org.mockito.Mockito.when(rs.next()).thenReturn(true, false);
                    return extractor.extractData(rs);
                });
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private void stubQueryWithEmptyResult() {
        when(jdbcTemplate.query(any(PreparedStatementCreator.class), any(org.springframework.jdbc.core.ResultSetExtractor.class)))
                .thenAnswer(inv -> {
                    org.springframework.jdbc.core.ResultSetExtractor extractor = inv.getArgument(1);
                    java.sql.ResultSet rs = org.mockito.Mockito.mock(java.sql.ResultSet.class);
                    org.mockito.Mockito.when(rs.next()).thenReturn(false);
                    return extractor.extractData(rs);
                });
    }

    private ScheduledJob job(String functionName, String argsJson) {
        return ScheduledJob.builder()
                .projectRef("app1")
                .name("job")
                .targetType(ScheduledJob.TARGET_DB_FUNCTION)
                .dbFunctionName(functionName)
                .dbFunctionArgs(argsJson)
                .timeoutSeconds(30)
                .build();
    }
}
