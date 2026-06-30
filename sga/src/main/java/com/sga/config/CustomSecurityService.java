package com.sga.config;

import com.sga.model.Matriculado;
import com.sga.repository.MatriculadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service("customSecurity")
@RequiredArgsConstructor
public class CustomSecurityService {

    private final MatriculadoRepository matriculadoRepository;

    public boolean isOwner(UUID id) {
        UUID pessoaId = authenticatedPessoaId();
        if (pessoaId == null || id == null) {
            return false;
        }

        if (pessoaId.equals(id)) {
            return true;
        }

        return matriculadoRepository.findById(id)
                .map(Matriculado::getAluno)
                .map(aluno -> aluno.getId())
                .filter(pessoaId::equals)
                .isPresent();
    }

    private UUID authenticatedPessoaId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            return null;
        }

        try {
            return UUID.fromString(jwt.getClaimAsString("pessoaId"));
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }
}
