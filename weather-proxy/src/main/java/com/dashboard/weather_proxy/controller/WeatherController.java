package com.dashboard.weather_proxy.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "https://local-dash-board.netlify.app"
})
public class WeatherController {

    private final WebClient webClient;

    @Value("${meteored.api.key}")
    private String apiKey;

    public WeatherController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl("https://api.meteored.com")
                .build();
    }

    @GetMapping("/{zip}")
    public Mono<String> getWeather(@PathVariable String zip) {
        return webClient.get()
                .uri("/api/location/v1/search/postalcode/{zip}", zip)
                .header("x-api-key", apiKey)
                .retrieve()
                .bodyToMono(String.class);
    }

    @GetMapping("/forecast/{hash}")
    public Mono<String> getForecast(@PathVariable String hash) {
        return webClient.get()
                .uri("/api/forecast/v1/hourly/{hash}", hash)
                .header("x-api-key", apiKey)
                .retrieve()
                .bodyToMono(String.class);
    }
}