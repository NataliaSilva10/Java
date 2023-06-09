package com.example.demo.controllers;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/daikichi")
public class DaikichiController {

	@RequestMapping("")
	public String daikichi() {
		return "Welcome";
	}
	
	@RequestMapping("/today")
	public String today() {
		return "Today you will find luck in all your endeavors";
	}
	
	@RequestMapping("/tomorrow")
	public String tomorrow() {
		return "Tomorrow an opportunity will arise, so be sure to be open to new ideas!";
	}
	
	
	@RequestMapping ("/travel/{city}")
	public String travel (@PathVariable String city )  { 
		return "Congratulations! You will soon travel to " + city;
	}
		
	@RequestMapping("/lotto/{number}")
		public String lotto(@PathVariable int number) {
		if (number % 2 ==0) {
		return "hi guys I am " + number;	
	}
		else {
			return "<h1 style='color:blue;'>You will take a grand journey in the near future, but be weary of tempting offers.</h1>";
		}
	}
	
}