package com.sga.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sga.auth.dto.LoginRequest;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
class AuthControllerTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // -------------------------------------------------------------------------
    // LOGIN
    // -------------------------------------------------------------------------

    @Test
    void deveRetornarTokenAoFazerLoginValido() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("alan@ufg.br");
        request.setSenha("123456");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.expiresIn").value(3600));
    }

    @Test
    void deveRetornar401ComCredenciaisInvalidas() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("alan@ufg.br");
        request.setSenha("senhaErrada");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRetornar401ComEmailInexistente() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("naoexiste@ufg.br");
        request.setSenha("123456");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    // -------------------------------------------------------------------------
    // ME
    // -------------------------------------------------------------------------

    @Test
    void deveRetornarDadosDoUsuarioAutenticado() throws Exception {
        String token = obterToken("alan@ufg.br", "123456");

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("alan@ufg.br"))
                .andExpect(jsonPath("$.nome").isNotEmpty())
                .andExpect(jsonPath("$.role").value("PROFESSOR"))
                .andExpect(jsonPath("$.scopes").isArray());
    }

    @Test
    void deveRetornar401NoMeSemToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRetornar401NoMeComTokenInvalido() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer token.invalido.aqui"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRetornar401NoMeComTokenExpirado() throws Exception {
        // Token gerado com expiração no passado (assinado mas expirado)
        String tokenExpirado = "eyJhbGciOiJSUzI1NiJ9." +
                "eyJpc3MiOiJzZ2EtYmFja2VuZCIsInN1YiI6IlRlc3RlIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDM2MDB9." +
                "assinatura_invalida";

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + tokenExpirado))
                .andExpect(status().isUnauthorized());
    }

    // -------------------------------------------------------------------------
    // LOGOUT
    // -------------------------------------------------------------------------

    @Test
    void deveRetornar204NoLogout() throws Exception {
        String token = obterToken("alan@ufg.br", "123456");

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    // -------------------------------------------------------------------------
    // ACESSO NÃO AUTORIZADO (403)
    // -------------------------------------------------------------------------

    @Test
    @Disabled("Aguardando implementação do endpoint /api/admin/usuarios")
    void deveRetornar403AoAcessarRotaProtegidaSemPermissao() throws Exception {
        // Aluno tentando acessar rota exclusiva de admin/professor
        String tokenAluno = obterToken("ada@discente.ufg.br", "123456");

        mockMvc.perform(get("/api/admin/usuarios")
                        .header("Authorization", "Bearer " + tokenAluno))
                .andExpect(status().isForbidden());
    }

    // -------------------------------------------------------------------------
    // Helper
    // -------------------------------------------------------------------------

    private String obterToken(String email, String senha) throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setSenha(senha);

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        return objectMapper.readTree(response).get("token").asText();
    }
}