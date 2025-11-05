package fi.vnest.speechtherapy.api.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuthController {

    @GetMapping("/login")
    public String login(
            @RequestParam(required = false) String error,
            @RequestParam(required = false) String logout,
            Model model) {

        if (error != null) {
            model.addAttribute("error", "Virheellinen sähköposti tai salasana");
        }

        if (logout != null) {
            model.addAttribute("message", "Olet kirjautunut ulos");
        }

        return "login";
    }
}

