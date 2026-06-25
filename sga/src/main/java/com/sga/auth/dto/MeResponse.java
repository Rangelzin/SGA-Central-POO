package com.sga.auth.dto;

import com.sga.model.enums.Role;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MeResponse {
    private String id;
    private String nome;
    private String email;
    private Role role;
    private List<String> scopes;
}