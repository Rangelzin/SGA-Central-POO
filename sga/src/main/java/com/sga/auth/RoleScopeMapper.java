package com.sga.auth;

import com.sga.model.enums.Role;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public final class RoleScopeMapper {

    public List<String> getScopes(Role role) {
        if (role == null) {
            return List.of();
        }

        return switch (role) {
            case ADMIN -> List.of(
                    Scopes.ALL
            );
            case PROFESSOR -> List.of(
                    Scopes.READ_DISCIPLINAS,
                    Scopes.WRITE_NOTAS,
                    Scopes.READ_ALUNOS
            );
            case ALUNO -> List.of(
                    Scopes.READ_DISCIPLINAS,
                    Scopes.READ_NOTAS
            );
        };
    }
}