import React from 'react';
import { Bell } from 'lucide-react';

export default function NotificationsList() {
    return (
        <div className="h-full flex items-center justify-center p-4">
            <div className="text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">Notifications</p>
                <p className="text-sm">Your notifications will appear here.</p>
            </div>
        </div>
    );
}