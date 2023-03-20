package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class HelloWorldApplication {

	public static void main(String[] args) {
		SpringApplication.run(HelloWorldApplication.class, args);
	}
    @RequestMapping("/hello")
    public String index() {
    	return "Hello Natalia";
    }
    @RequestMapping("/world")
    public String world() {
    	return "ckass kevek annotations are cool too!";
    }
}
