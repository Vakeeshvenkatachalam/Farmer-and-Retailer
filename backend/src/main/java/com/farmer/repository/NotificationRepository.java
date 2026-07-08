package com.farmer.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.farmer.model.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Notification> findByRoleOrderByCreatedAtDesc(String role);

    List<Notification> findByUserIdOrRoleOrderByCreatedAtDesc(Long userId, String role);
}
