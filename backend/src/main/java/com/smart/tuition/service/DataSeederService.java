package com.smart.tuition.service;

import com.smart.tuition.entity.*;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.entity.enums.Role;
import com.smart.tuition.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataSeederService implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final FeeStructureRepository feeStructureRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final StudentFeeConfigRepository studentFeeConfigRepository;
    private final PasswordEncoder passwordEncoder;
    private final PaymentAllocationService paymentAllocationService;
    private final NotificationRepository notificationRepository;
    private final PaymentRepository paymentRepository;
    private final MonthlyFeeGeneratorService feeGeneratorService;

    @Override
    public void run(String... args) throws Exception {
        User admin = null;
        if (!userRepository.existsByEmail("mehtaneel410@gmail.com")) {
            admin = new User();
            admin.setName("Neel Mehta");
            admin.setEmail("mehtaneel410@gmail.com");
            admin.setPassword(passwordEncoder.encode("Neel@101"));
            admin.setRawPassword("Neel@101");
            admin.setRole(Role.ROLE_ADMIN);
            admin = userRepository.save(admin);
        } else {
            admin = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ROLE_ADMIN).findFirst().orElse(null);
        }

        if (admin != null) {
            final User primaryAdmin = admin;
            // Migrate existing Courses without admin
            courseRepository.findAll().stream().filter(c -> c.getAdmin() == null).forEach(c -> {
                c.setAdmin(primaryAdmin);
                courseRepository.save(c);
            });

            // Migrate existing FeeStructures without admin
            feeStructureRepository.findAll().stream().filter(fs -> fs.getAdmin() == null).forEach(fs -> {
                fs.setAdmin(primaryAdmin);
                feeStructureRepository.save(fs);
            });

            // Migrate existing Students without admin
            studentRepository.findAll().stream().filter(s -> s.getAdmin() == null).forEach(s -> {
                s.setAdmin(primaryAdmin);
                studentRepository.save(s);
            });
        }

        if (studentRepository.count() == 0 && admin != null) {
            log.info("Seeding realistic data...");

            Course bca = new Course(); bca.setCourseName("BCA"); bca.setDuration("3 Years"); bca.setAdmin(admin); bca = courseRepository.save(bca);
            Course mca = new Course(); mca.setCourseName("MCA"); mca.setDuration("2 Years"); mca.setAdmin(admin); mca = courseRepository.save(mca);
            
            FeeStructure fsBca = new FeeStructure(); 
            fsBca.setCourse(bca); 
            fsBca.setAmount(1500.0); 
            fsBca.setSemester(1);
            fsBca.setFeeType("Tuition");
            fsBca.setAcademicYear("2026-27");
            fsBca.setAdmin(admin);
            feeStructureRepository.save(fsBca);
            
            String[] names = {"Amit Kumar", "Neha Sharma", "Rahul Verma", "Priya Singh", "Rohan Das", "Anjali Gupta", 
                "Vikram Desai", "Pooja Patel", "Suresh Nair", "Kavita Reddy", "Arjun Rao", "Divya Menon", 
                "Sanjay Iyer", "Meera Joshi", "Ravi Pillai", "Sneha Kapoor", "Vijay Thakur", "Riya Sen", 
                "Manoj Tiwari", "Kiran Bedi"};
            
            for (int i = 0; i < names.length; i++) {
                String name = names[i];
                LocalDate dob = LocalDate.of(2003 + (i % 3), 1 + (i % 12), 10 + (i % 15));
                Student s = seedStudent(name, name.split(" ")[0].toLowerCase() + "@example.com", "98765432" + String.format("%02d", i), bca, dob, admin);
                
                // Seed StudentFeeConfig
                StudentFeeConfig config = new StudentFeeConfig();
                config.setStudent(s);
                config.setMonthlyAmount(1500.0);
                config.setFeeStartMonth(LocalDate.of(2026, 3, 1));
                studentFeeConfigRepository.save(config);
            }
            
            // Generate fees for March, April, May
            feeGeneratorService.generateFeesUpTo(LocalDate.of(2026, 5, 1));
            
            // Generate Payments (Partial, Paid, Overdue)
            List<StudentFee> allFees = studentFeeRepository.findAll();
            for (int i = 0; i < allFees.size(); i++) {
                StudentFee fee = allFees.get(i);
                if (i % 3 == 0) {
                    // Fully Paid
                    paymentAllocationService.processSpecificFeePayment(fee.getStudent().getStudentId(), fee.getStudentFeeId(), fee.getAmount(), "UPI");
                } else if (i % 3 == 1) {
                    // Partially Paid
                    paymentAllocationService.processSpecificFeePayment(fee.getStudent().getStudentId(), fee.getStudentFeeId(), fee.getAmount() / 2, "Cash");
                }
                // Remaining are left unpaid (Pending/Overdue based on month)
                
                // If it's a March fee and it's unpaid, mark it OVERDUE
                if (fee.getFeeMonth().getMonthValue() == 3 && (i % 3 == 2)) {
                    fee.setStatus(FeeStatus.OVERDUE);
                    studentFeeRepository.save(fee);
                }
            }

            log.info("Data seeding completed successfully!");
        }
    }

    private Student seedStudent(String name, String email, String phone, Course course, LocalDate dob, User admin) {
        String firstTwo = "st";
        if (name != null) {
            String firstName = name.trim().split("\\s+")[0].replaceAll("[^a-zA-Z]", "");
            if (firstName.length() >= 2) {
                firstTwo = firstName.substring(0, 2).toLowerCase();
            } else if (firstName.length() == 1) {
                firstTwo = (firstName + "a").toLowerCase();
            }
        }
        String year = dob != null ? String.valueOf(dob.getYear()) : String.valueOf(java.time.LocalDate.now().getYear());
        String generatedPassword = firstTwo + "@" + year;

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(generatedPassword));
        user.setRawPassword(generatedPassword);
        user.setRole(Role.ROLE_STUDENT);
        user = userRepository.save(user);

        Student student = new Student();
        student.setUser(user);
        student.setAdmin(admin);
        
        Long maxId = studentRepository.findMaxEnrollmentNumber();
        long nextId = 2601010L;
        if (maxId != null && maxId >= 2601010L) {
            nextId = maxId + 1;
        }
        student.setEnrollmentNumber(String.valueOf(nextId));
        
        student.setPersonalEmail(email);
        student.setPhone(phone);
        student.setDob(dob);
        student.setCourse(course);
        student.setAcademicYear("2026-27");
        student.setSemester(1);
        student.setAdmissionDate(LocalDate.now().minusMonths(2));
        return studentRepository.save(student);
    }
}
