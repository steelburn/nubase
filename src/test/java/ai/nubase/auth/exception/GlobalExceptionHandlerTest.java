package ai.nubase.auth.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void maxUploadSizeExceededReturnsPayloadTooLarge() {
        var response = handler.handleMaxUploadSizeExceeded(new MaxUploadSizeExceededException(1024));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getError()).isEqualTo("payload_too_large");
        assertThat(response.getBody().getErrorDescription()).contains("App worker upload exceeds maximum size");
        assertThat(response.getBody().getErrorDescription()).contains("NUBASE_MULTIPART_MAX_FILE_SIZE");
    }

    @Test
    void multipartSizeLimitExceptionReturnsPayloadTooLarge() {
        var response = handler.handleMultipartException(new MultipartException(
                "Failed to parse multipart servlet request",
                new RuntimeException("Maximum upload size exceeded")
        ));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getError()).isEqualTo("payload_too_large");
    }

    @Test
    void nonSizeMultipartExceptionReturnsBadRequest() {
        var response = handler.handleMultipartException(new MultipartException("missing boundary"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getError()).isEqualTo("invalid_request");
        assertThat(response.getBody().getErrorDescription()).isEqualTo("missing boundary");
    }

    @Test
    void responseStatusPayloadTooLargeReturnsSupabaseError() {
        var response = handler.handleResponseStatusException(new ResponseStatusException(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "App worker upload exceeds maximum file size: part=serverFile file=server/index.js size=1025 limit=1024"
        ));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getError()).isEqualTo("payload_too_large");
        assertThat(response.getBody().getErrorDescription())
                .contains("server/index.js")
                .contains("size=1025")
                .contains("limit=1024");
    }
}
