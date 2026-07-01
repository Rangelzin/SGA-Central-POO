package com.sga.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CorsConfigTest {

    @Test
    void devePermitirFrontendLocalEmQualquerPorta() {
        CorsConfiguration configuration = getConfigurationFor("http://localhost:3000");

        assertEquals("http://localhost:3000", configuration.checkOrigin("http://localhost:3000"));
        assertEquals("http://127.0.0.1:5173", configuration.checkOrigin("http://127.0.0.1:5173"));
        assertNull(configuration.checkOrigin("http://evil.example"));
        assertTrue(Boolean.TRUE.equals(configuration.getAllowCredentials()));
    }

    private CorsConfiguration getConfigurationFor(String origin) {
        CorsConfig corsConfig = new CorsConfig();
        ReflectionTestUtils.setField(
                corsConfig,
                "allowedOriginPatterns",
                List.of("http://localhost:*", "http://127.0.0.1:*", "http://sga-frontend-app:*")
        );

        CorsConfigurationSource source = corsConfig.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/auth/login");
        request.addHeader("Origin", origin);
        request.addHeader("Access-Control-Request-Method", "POST");
        return source.getCorsConfiguration(request);
    }
}
