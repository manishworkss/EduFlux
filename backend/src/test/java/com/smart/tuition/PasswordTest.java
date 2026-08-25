package com.smart.tuition;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class PasswordTest {
    @Test
    public void test() {
        System.out.println("HASH=" + new BCryptPasswordEncoder().encode("admin123"));
    }
}
