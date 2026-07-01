package com.sga.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewerController {

    @GetMapping(value = {"/"})
    public String forwardHome() {
        return "forward:/app/index.html";
    }

    @GetMapping(value = {"/login"})
    public String forwardLogin() {
        return "forward:/app/login.html";
    }

    @GetMapping(value = {
            "/dashboard",
            "/admin/students",
            "/admin/students/new",
            "/admin/teachers",
            "/admin/teachers/new",
            "/admin/subjects",
            "/admin/subjects/new",
            "/admin/classes",
            "/admin/classes/new",
            "/student/enrollment",
            "/student/grades",
            "/student/transcript",
            "/teacher/classes"
    })
    public String forwardStaticAppRoutes(HttpServletRequest request) {
        return "forward:/app" + request.getRequestURI() + ".html";
    }

    @GetMapping(value = {
            "/admin/students/{id:[^.]+}",
            "/admin/teachers/{id:[^.]+}",
            "/admin/subjects/{id:[^.]+}",
            "/admin/classes/{id:[^.]+}",
            "/admin/classes/{id:[^.]+}/report",
            "/teacher/classes/{id:[^.]+}/grades",
            "/teacher/classes/{id:[^.]+}/report"
    })
    public String forwardDynamicAppRoutes() {
        return "forward:/app/index.html";
    }
}
