package com.sga.controller;

import com.sga.controller.dto.MatriculaResponse;
import com.sga.model.Matriculado;
import com.sga.service.RelatorioService;
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
public class RelatorioController {

    private final RelatorioService relatorioService;

    /**
     * GET /api/relatorios/historico
     * Retorna o histórico acadêmico do aluno autenticado.
     */
    @GetMapping("/historico")
    @PreAuthorize("hasRole('ALUNO')")
    public List<MatriculaResponse> historico(@AuthenticationPrincipal Jwt jwt) {
        UUID alunoId = UUID.fromString(jwt.getClaim("pessoaId"));
        return relatorioService.historicoAluno(alunoId)
                .stream()
                .map(MatriculaResponse::new)
                .toList();
    }

    /**
     * GET /api/relatorios/turma/{id}
     * Relatório completo (JSON) de uma turma — aprovações, reprovações etc.
     */
    @GetMapping("/turma/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
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

    /**
     * GET /api/relatorios/turma/{id}/html
     * Exporta o relatório da turma como HTML (download).
     * Para um PDF real, substitua o conteúdo por uma biblioteca como iText/Jasper.
     */
    @GetMapping("/turma/{id}/html")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROFESSOR')")
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
                    .append("<td>").append(m.getAluno() != null ? m.getAluno().getNome() : "-").append("</td>")
                    .append("<td>").append(m.getNota() != null ? m.getNota() : "-").append("</td>")
                    .append("<td>").append(m.getFrequencia() != null ? m.getFrequencia() + "%" : "-").append("</td>")
                    .append("<td>").append(m.getStatus()).append("</td>")
                    .append("</tr>");
        }

        sb.append("</tbody></table></body></html>");
        return sb.toString();
    }
}
