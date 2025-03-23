const mongoose = require('mongoose');

// Define the notification schema
const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'Loan_Application', 
            'Loan_Approved', 
            'Loan_Rejected', 
            'Loan_Disbursed',
            'Repayment_Due', 
            'Repayment_Overdue', 
            'Repayment_Received',
            'Credit_Score_Updated',
            'Document_Required',
            'Document_Verified',
            'Account_Activity',
            'System_Update',
            'Marketing',
            'Other'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedEntityType: {
        type: String,
        enum: ['Loan', 'User', 'CreditScore', 'Transaction', 'Document', 'System', 'Other'],
        default: 'Other'
    },
    relatedEntityId: {
        type: mongoose.Schema.Types.ObjectId
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    channel: {
        type: String,
        enum: ['In-App', 'Email', 'SMS', 'Push', 'All'],
        default: 'In-App'
    },
    status: {
        type: String,
        enum: ['Pending', 'Sent', 'Delivered', 'Read', 'Failed'],
        default: 'Pending'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    sentAt: Date,
    deliveredAt: Date,
    expiresAt: Date,
    action: {
        text: String,
        url: String
    },
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    systemGenerated: {
        type: Boolean,
        default: true
    },
    retryCount: {
        type: Number,
        default: 0
    },
    lastError: String
}, {
    timestamps: true
});

// Indexes for faster querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ recipient: 1, expiresAt: 1 });
notificationSchema.index({ relatedEntityType: 1, relatedEntityId: 1 });
notificationSchema.index({ status: 1, channel: 1 });

// Virtual field for notification age in hours
notificationSchema.virtual('ageInHours').get(function() {
    const now = new Date();
    const notificationDate = this.createdAt || now;
    const diffTime = Math.abs(now - notificationDate);
    return Math.ceil(diffTime / (1000 * 60 * 60));
});

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function() {
    this.isRead = true;
    this.readAt = new Date();
    this.status = 'Read';
    return this.save();
};

// Method to update notification status
notificationSchema.methods.updateStatus = async function(newStatus) {
    const validStatuses = ['Pending', 'Sent', 'Delivered', 'Read', 'Failed'];
    
    if (!validStatuses.includes(newStatus)) {
        throw new Error('Invalid status');
    }
    
    this.status = newStatus;
    
    // Update corresponding timestamps based on status
    if (newStatus === 'Sent') {
        this.sentAt = new Date();
    } else if (newStatus === 'Delivered') {
        this.deliveredAt = new Date();
    } else if (newStatus === 'Read') {
        this.isRead = true;
        this.readAt = new Date();
    }
    
    return this.save();
};

// Method to retry failed notification
notificationSchema.methods.retry = async function() {
    if (this.status !== 'Failed') {
        throw new Error('Only failed notifications can be retried');
    }
    
    this.status = 'Pending';
    this.retryCount += 1;
    this.lastError = null;
    
    return this.save();
};

// Static method to create a new notification
notificationSchema.statics.createNotification = async function(notificationData) {
    const notification = new this({
        recipient: notificationData.recipient,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        relatedEntityType: notificationData.relatedEntityType,
        relatedEntityId: notificationData.relatedEntityId,
        priority: notificationData.priority || 'Medium',
        channel: notificationData.channel || 'In-App',
        action: notificationData.action,
        metadata: notificationData.metadata,
        sender: notificationData.sender,
        systemGenerated: notificationData.systemGenerated !== undefined ? notificationData.systemGenerated : true
    });
    
    // Set expiration date if provided or default based on priority
    if (notificationData.expiresAt) {
        notification.expiresAt = notificationData.expiresAt;
    } else {
        const now = new Date();
        
        // Default expiration based on priority
        switch (notification.priority) {
            case 'Low':
                // 30 days
                notification.expiresAt = new Date(now.setDate(now.getDate() + 30));
                break;
            case 'Medium':
                // 14 days
                notification.expiresAt = new Date(now.setDate(now.getDate() + 14));
                break;
            case 'High':
                // 7 days
                notification.expiresAt = new Date(now.setDate(now.getDate() + 7));
                break;
            case 'Urgent':
                // 2 days
                notification.expiresAt = new Date(now.setDate(now.getDate() + 2));
                break;
            default:
                // 14 days default
                notification.expiresAt = new Date(now.setDate(now.getDate() + 14));
        }
    }
    
    await notification.save();
    return notification;
};

// Static method to get unread notifications count for a user
notificationSchema.statics.getUnreadCount = function(userId) {
    return this.countDocuments({
        recipient: userId,
        isRead: false,
        expiresAt: { $gt: new Date() }
    });
};

// Static method to delete expired notifications
notificationSchema.statics.deleteExpired = function() {
    return this.deleteMany({
        expiresAt: { $lt: new Date() }
    });
};

// Static method to get notifications by recipient
notificationSchema.statics.getByRecipient = function(userId, options = {}) {
    const { unreadOnly = false, limit = 20, skip = 0, type = null } = options;
    
    const query = {
        recipient: userId,
        expiresAt: { $gt: new Date() }
    };
    
    if (unreadOnly) {
        query.isRead = false;
    }
    
    if (type) {
        query.type = type;
    }
    
    return this.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification; 