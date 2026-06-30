package com.sga.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sga.auth.dto.LoginRequest;
import com.sga.controller.dto.AlunoRequest;
import com.sga.controller.dto.DepartamentoIdRef;
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
class AlunoControllerTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String adminToken;
    private String alunoToken;

    @BeforeEach
    void setUp() throws Exception {
        adminToken = obterToken("admin@ufg.br", "123456");
        alunoToken = obterToken("ada@discente.ufg.br", "123456");
    }

    @Test
    void deveListarAlunosComoAdmin() throws Exception {
        mockMvc.perform(get("/api/alunos")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void deveRetornar401SemToken() throws Exception {
        mockMvc.perform(get("/api/alunos"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deveRetornar403AlunoListandoAlunos() throws Exception {
        // Aluno não tem scope READ_ALUNOS / ALL, então deve ser 403
        mockMvc.perform(get("/api/alunos")
                        .header("Authorization", "Bearer " + alunoToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void deveCriarAlunoComoAdmin() throws Exception {
        AlunoRequest req = new AlunoRequest();
        req.setNome("Novo Aluno Teste");
        req.setEmail("novoaluno.teste@discente.ufg.br");
        req.setCpf("111.222.333-99");
        req.setSenha("senha123");
        DepartamentoIdRef dep = new DepartamentoIdRef();
        dep.setId(1L);
        req.setDepartamento(dep);

        mockMvc.perform(post("/api/alunos")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.email").value("novoaluno.teste@discente.ufg.br"));
    }

    @Test
    void deveRetornar400SemCamposObrigatorios() throws Exception {
        AlunoRequest req = new AlunoRequest(); // sem campos

        mockMvc.perform(post("/api/alunos")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos").isArray());
    }

    @Test
    void deveRetornar404AlunoInexistente() throws Exception {
        mockMvc.perform(get("/api/alunos/00000000-0000-0000-0000-000000000000")
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
