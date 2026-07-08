package com.farmer.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.farmer.model.Notification;
import com.farmer.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification createNotification(Long userId, String role, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setRole(role != null ? role.toUpperCase() : null);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long userId, String role) {
        if (userId != null && role != null) {
            return notificationRepository.findByUserIdOrRoleOrderByCreatedAtDesc(userId, role.toUpperCase());
        } else if (userId != null) {
            return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else if (role != null) {
            return notificationRepository.findByRoleOrderByCreatedAtDesc(role.toUpperCase());
        }
        return notificationRepository.findAll();
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification != null) {
            notification.setReadStatus(true);
            return notificationRepository.save(notification);
        }
        return null;
    }

    public void markAllAsRead(Long userId, String role) {
        List<Notification> notifications = getNotificationsForUser(userId, role);
        for (Notification n : notifications) {
            if (!n.isReadStatus()) {
                n.setReadStatus(true);
                notificationRepository.save(n);
            }
        }
    }
}
