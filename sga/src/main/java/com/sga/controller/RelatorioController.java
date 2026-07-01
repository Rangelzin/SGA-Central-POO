package com.sga.controller;

import com.sga.controller.dto.ErrorResponse;
import com.sga.controller.dto.MatriculaResponse;
import com.sga.model.Matriculado;
import com.sga.service.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("api/relatorios")
@RequiredArgsConstructor
@Tag(name = "Relatórios", description = "Histórico acadêmico e relatórios de desempenho de turma (UC-06, UC-07)")
@SecurityRequirement(name = "bearerAuth")
public class RelatorioController {

    private final RelatorioService relatorioService;

    @GetMapping("/historico")
    @PreAuthorize("hasRole('ALUNO')")
    @Operation(summary = "Histórico acadêmico do aluno autenticado", description = "Retorna todas as matrículas do aluno logado. Requer ALUNO.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Histórico retornado"),
            @ApiResponse(responseCode = "403", description = "Sem permissão",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public List<MatriculaResponse> historico(@AuthenticationPrincipal Jwt jwt) {
        UUID alunoId = UUID.fromString(jwt.getClaim("pessoaId"));
        return relatorioService.historicoAluno(alunoId)
                .stream()
                .map(MatriculaResponse::new)
                .toList();
    }

    @GetMapping("/turma/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Relatório de desempenho de turma (JSON)", description = "Retorna aprovações, reprovações e percentual. Requer ADMIN ou PROFESSOR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Relatório gerado"),
            @ApiResponse(responseCode = "404", description = "Turma não encontrada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public Map<String, Object> relatorioTurma(@PathVariable UUID id) {
        RelatorioService.ResumoAprovacao resumo = relatorioService.resumoAprovacaoTurma(id);
        List<MatriculaResponse> matriculas = relatorioService.relatorioTurma(id)
                .stream()
                .map(MatriculaResponse::new)
                .toList();
        return Map.of(
                "turmaId", id,
                "resumo", resumo,
                "matriculas", matriculas
        );
    }

    @GetMapping("/turma/{id}/html")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
    @Operation(summary = "Exporta relatório de turma em HTML", description = "Retorna o relatório como arquivo HTML para download. Requer ADMIN ou PROFESSOR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Arquivo HTML retornado",
                    content = @Content(mediaType = "text/html")),
            @ApiResponse(responseCode = "404", description = "Turma não encontrada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<byte[]> relatorioTurmaHtml(@PathVariable UUID id) {
        RelatorioService.ResumoAprovacao resumo = relatorioService.resumoAprovacaoTurma(id);
        List<Matriculado> matriculas = relatorioService.relatorioTurma(id);

        String html = buildHtmlRelatorio(id, resumo, matriculas);
        byte[] bytes = html.getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"relatorio-turma-" + id + ".html\"")
                .contentType(MediaType.TEXT_HTML)
                .contentLength(bytes.length)
                .body(bytes);
    }

    // ----- helper -----

    private String buildHtmlRelatorio(UUID turmaId,
                                      RelatorioService.ResumoAprovacao resumo,
                                      List<Matriculado> matriculas) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html lang='pt-BR'><head><meta charset='UTF-8'>")
                .append("<title>Relatório Turma ").append(turmaId).append("</title>")
                .append("<style>body{font-family:sans-serif;padding:2rem}")
                .append("table{border-collapse:collapse;width:100%}")
                .append("th,td{border:1px solid #ccc;padding:8px;text-align:left}")
                .append("th{background:#f0f0f0}</style></head><body>")
                .append("<h1>Relatório da Turma</h1>")
                .append("<p><strong>ID:</strong> ").append(turmaId).append("</p>")
                .append("<h2>Resumo</h2>")
                .append("<ul>")
                .append("<li>Total: ").append(resumo.total()).append("</li>")
                .append("<li>Aprovados: ").append(resumo.aprovados()).append("</li>")
                .append("<li>Reprovados: ").append(resumo.reprovados()).append("</li>")
                .append(String.format("<li>Aprovação: %.1f%%</li>", resumo.percentualAprovacao()))
                .append("</ul>")
                .append("<h2>Alunos</h2>")
                .append("<table><thead><tr>")
                .append("<th>Aluno</th><th>Nota</th><th>Frequência</th><th>Status</th>")
                .append("</tr></thead><tbody>");

        for (Matriculado m : matriculas) {
            sb.append("<tr>")
                    .append("<td>").append(m.getAluno() != null ? org.springframework.web.util.HtmlUtils.htmlEscape(m.getAluno().getNome()) : "-").append("</td>")
                    .append("<td>").append(m.getNota() != null ? org.springframework.web.util.HtmlUtils.htmlEscape(String.valueOf(m.getNota())) : "-").append("</td>")
                    .append("<td>").append(m.getFrequencia() != null ? org.springframework.web.util.HtmlUtils.htmlEscape(m.getFrequencia() + "%") : "-").append("</td>")
                    .append("<td>").append(m.getStatus() != null ? org.springframework.web.util.HtmlUtils.htmlEscape(String.valueOf(m.getStatus())) : "-").append("</td>")
                    .append("</tr>");
        }

        sb.append("</tbody></table></body></html>");
        return sb.toString();
    }
}
