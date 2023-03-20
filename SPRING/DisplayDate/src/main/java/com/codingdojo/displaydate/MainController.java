package com.codingdojo.displaydate;

import java.util.Date;
import java.text.SimpleDateFormat;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {
	@GetMapping("/")
	public String home() {
		return "index.jsp";
	}

	@GetMapping("/date")
	public String date(Model model) {
		SimpleDateFormat sdf = new SimpleDateFormat("EEEE, MMM d, yyyy");
		
		Date date = new Date();
		
		model.addAttribute("date", sdf.format(date));
		
		return "date.jsp";
	}
		
	
	@GetMapping("/time")
	public String time(Model model) {
     SimpleDateFormat sdf = new SimpleDateFormat("h:mm a");
		
		Date date = new Date();
		
		model.addAttribute("time", sdf.format(date));
		return "time.jsp";
	}
}
