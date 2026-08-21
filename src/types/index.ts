export interface User {
  id: number;
  username: string;
  display_name: string;
  title_rank: string;
  level: number;
  current_exp: number;
  total_exp: number;
  streak_days: number;
  last_active_date?: string;
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface QuestItem {
  id: number;
  template_id?: number;
  item_type: 'custom' | 'habit';
  title: string;
  priority: Priority;
  exp_reward: number;
  frequency?: Frequency;
  date: string;
  completed: boolean;
}

export interface HabitTemplate {
  id: number;
  user_id: number;
  title: string;
  priority: Priority;
  exp_reward: number;
  frequency: Frequency;
  is_active: number;
  created_at: string;
}

export interface ToggleQuestResponse {
  completed: boolean;
  exp_gained: number;
  level_up: boolean;
  new_level: number;
  current_exp: number;
  total_exp: number;
  target_exp: number;
}

export interface EXPDayHistory {
  date: string;
  exp_earned: number;
}

export interface RecapData {
  total_quests_completed: number;
  streak_days: number;
  weekly_completion_rate: number;
  total_exp_this_week?: number;
  peak_day?: string;
  active_routines_count?: number;
  exp_history: EXPDayHistory[];
}
