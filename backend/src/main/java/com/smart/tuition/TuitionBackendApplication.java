package com.smart.tuition;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableScheduling
public class TuitionBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TuitionBackendApplication.class, args);
	}

    @Bean
    public org.springframework.boot.CommandLineRunner migrateOldIds(com.smart.tuition.repository.StudentRepository repo, com.smart.tuition.repository.UserRepository userRepo) {
        return args -> {
            java.util.List<com.smart.tuition.entity.Student> students = repo.findAll();
            long nextId = 2601010;
            for (com.smart.tuition.entity.Student s : students) {
                if (s.getEnrollmentNumber() != null && s.getEnrollmentNumber().startsWith("ENR")) {
                    s.setEnrollmentNumber(String.valueOf(nextId++));
                    repo.save(s);
                }
            }
            
            // Populate rawPassword for existing users
            java.util.List<com.smart.tuition.entity.User> users = userRepo.findAll();
            for (com.smart.tuition.entity.User u : users) {
                if (u.getRawPassword() == null) {
                    if (u.getEmail().equals("mehtaneel410@gmail.com") || u.getEmail().equals("admin@eduflux.com")) {
                        u.setRawPassword("Neel@101");
                    } else {
                        u.setRawPassword("password123");
                    }
                    userRepo.save(u);
                }
            }
            
            System.out.println("MIGRATED ALL OLD ENR IDs and raw passwords.");
        };
    }
}
