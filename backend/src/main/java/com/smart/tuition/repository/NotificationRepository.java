package com.smart.tuition.repository;

import com.smart.tuition.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByStudent_StudentIdOrderByCreatedAtDesc(Long studentId);
    List<Notification> findByStudent_Admin_UserId(Long adminId);
}
