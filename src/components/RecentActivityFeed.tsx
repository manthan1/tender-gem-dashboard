import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, TrendingUp, Bell, CheckCircle } from "lucide-react";

interface ActivityItem {
  id: string;
  type: 'bid_placed' | 'tender_viewed' | 'keyword_match' | 'bid_status' | 'document_uploaded';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'info';
}

const activityData: ActivityItem[] = [
  {
    id: "1",
    type: "bid_placed",
    title: "Bid Submitted",
    description: "CCTV Installation - Gujarat Police Department",
    timestamp: "2 hours ago",
    status: "success"
  },
  {
    id: "2",
    type: "keyword_match",
    title: "New Tender Match",
    description: "IT Infrastructure tender matches your keywords",
    timestamp: "4 hours ago",
    status: "info"
  },
  {
    id: "3",
    type: "tender_viewed",
    title: "Tender Viewed",
    description: "Road Construction Project - PWD Maharashtra",
    timestamp: "6 hours ago"
  },
  {
    id: "4",
    type: "bid_status",
    title: "Bid Status Update",
    description: "Your bid for Office Supplies is under review",
    timestamp: "1 day ago",
    status: "pending"
  },
  {
    id: "5",
    type: "document_uploaded",
    title: "Document Uploaded",
    description: "Company Certificate added to your profile",
    timestamp: "2 days ago",
    status: "success"
  }
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'bid_placed':
      return <TrendingUp className="h-4 w-4" />;
    case 'tender_viewed':
      return <FileText className="h-4 w-4" />;
    case 'keyword_match':
      return <Bell className="h-4 w-4" />;
    case 'bid_status':
      return <Clock className="h-4 w-4" />;
    case 'document_uploaded':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'info':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const RecentActivityFeed = () => {
  return (
    <Card className="table-shadow border-0 rounded-2xl bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold brand-navy">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activityData.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
              <div className="text-blue-600">
                {getActivityIcon(activity.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                {activity.status && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(activity.status)}`}
                  >
                    {activity.status}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {activity.description}
              </p>
              <p className="text-xs text-gray-400 mt-1 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;