package com.sga.auth;

import lombok.Builder;

@Builder
public class LoginResponse {
    private String acessToken;
    private Long expiresIN;
}
