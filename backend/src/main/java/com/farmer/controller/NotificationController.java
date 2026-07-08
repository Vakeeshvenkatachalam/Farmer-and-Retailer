package com.farmer.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.farmer.model.Notification;
import com.farmer.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Get notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String role) {
        List<Notification> list = notificationService.getNotificationsForUser(userId, role);
        return ResponseEntity.ok(list);
    }

    // Mark as read
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification updated = notificationService.markAsRead(id);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    // Mark all as read
    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String role) {
        notificationService.markAllAsRead(userId, role);
        return ResponseEntity.ok().body("All notifications marked as read");
    }

    // Create notification (Admin / System broadcast)
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification created = notificationService.createNotification(
                notification.getUserId(),
                notification.getRole(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType()
        );
        return ResponseEntity.ok(created);
    }
}
