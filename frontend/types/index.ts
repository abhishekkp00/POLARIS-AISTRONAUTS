// Type definitions for TaskMuse

export interface Task {
  id: number;
  title: string;
  description: string;
  assignee: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'completed';
  progress: number;
  deadline: string;
  created_at?: string;
  updated_at?: string;
  ai_suggestion?: {
    next: string;
    who: string;
    time: string;
    why: string;
    confidence: number;
  };
}

export interface Message {
  id: number;
  text: string;
  user_id: number;
  user_name: string;
  timestamp: string;
  analysis: {
    badges: Array<{
      type: 'blocker' | 'decision' | 'action' | 'risk';
      text: string;
      color: string;
    }>;
    decisions?: string[];
    blockers?: string[];
    actions?: string[];
    risks?: string[];
  };
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  id: number;
  message_id: number;
  user_id: number;
  emoji: string;
  created_at: string;
}

export interface ContributionStats {
  name: string;
  completed: number;
  in_progress: number;
  pending: number;
  total: number;
  percentage: number;
  impact: 'high' | 'medium' | 'low';
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface KPIData {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  color: string;
}

export interface Blocker {
  id: number;
  title: string;
  description: string;
  from: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'active' | 'resolved';
  timestamp: string;
  impact?: string;
  affectedTasks?: string[];
  estimatedDelay?: string;
}

export interface Decision {
  id: number;
  title: string;
  description: string;
  by: string;
  timestamp: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'implemented' | 'pending' | 'in_progress';
  rationale?: string;
  affectedAreas?: string[];
  implementedAt?: string;
}

export interface HealthScore {
  score: number;
  status: 'excellent' | 'healthy' | 'warning' | 'critical';
  message: string;
  trend: 'up' | 'down' | 'stable';
  breakdown?: {
    completion: number;
    onTime: number;
    quality: number;
    collaboration: number;
  };
  details?: string[];
  recommendations?: string[];
}

export interface DemoData {
  tasks: Task[];
  messages: Message[];
  contributions: ContributionStats[];
  blockers: Blocker[];
  decisions: Decision[];
  healthScore: HealthScore;
}
