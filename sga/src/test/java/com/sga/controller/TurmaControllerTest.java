package com.sga.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sga.auth.dto.LoginRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
class TurmaControllerTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String adminToken;
    private String professorToken;

    @BeforeEach
    void setUp() throws Exception {
        adminToken = obterToken("admin@ufg.br", "123456");
        professorToken = obterToken("alan@ufg.br", "123456");
    }

    @Test
    void deveListarTurmasComoAdmin() throws Exception {
        mockMvc.perform(get("/api/turmas")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void deveListarTurmasComoProfessor() throws Exception {
        mockMvc.perform(get("/api/turmas")
                        .header("Authorization", "Bearer " + professorToken))
                .andExpect(status().isOk());
    }

    @Test
    void deveRetornar404TurmaInexistente() throws Exception {
        mockMvc.perform(get("/api/turmas/00000000-0000-0000-0000-000000000000")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void deveRetornar404AlunosDeTurmaInexistente() throws Exception {
        mockMvc.perform(get("/api/turmas/00000000-0000-0000-0000-000000000000/alunos")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    // ----- helper -----

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

        return objectMapper.readTree(response).get("acessToken").asText();
    }
}
