package com.sga.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "SGA – Sistema de Gestão Acadêmica",
                description = "API REST do Sistema de Gestão Acadêmica (UFG 2026.01). "
                        + "Autentique-se em POST /api/auth/login para obter o Bearer token.",
                version = "1.0.0",
                contact = @Contact(name = "Equipe SGA", email = "sga@ufg.br")
        )
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Informe o JWT obtido em /api/auth/login"
)
public class SwaggerConfig {
}
