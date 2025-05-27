/*
  # Initial Schema Setup

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `description` (text)
      - `due_date` (timestamptz)
      - `due_time` (timestamptz)
      - `is_completed` (boolean)
      - `completed_at` (timestamptz)
      - `priority` (text)
      - `category` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `subtasks`
      - `id` (uuid, primary key)
      - `task_id` (uuid, foreign key to tasks)
      - `title` (text)
      - `is_completed` (boolean)
      - `created_at` (timestamptz)

    - `notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `note_tags`
      - `id` (uuid, primary key)
      - `note_id` (uuid, foreign key to notes)
      - `tag` (text)

    - `habits`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `description` (text)
      - `frequency` (text)
      - `days_of_week` (integer[])
      - `time_of_day` (time)
      - `current_streak` (integer)
      - `longest_streak` (integer)
      - `color` (text)
      - `created_at` (timestamptz)

    - `habit_completions`
      - `id` (uuid, primary key)
      - `habit_id` (uuid, foreign key to habits)
      - `date` (date)
      - `completed` (boolean)

    - `user_profiles`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `display_name` (text)
      - `avatar_url` (text)
      - `bio` (text)
      - `timezone` (text)
      - `language` (text)
      - `theme` (text)
      - `notification_preferences` (jsonb)
      - `work_hours` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text,
  due_date timestamptz NOT NULL,
  due_time timestamptz,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  priority text DEFAULT 'medium',
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subtasks table
CREATE TABLE subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create note_tags table
CREATE TABLE note_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES notes ON DELETE CASCADE NOT NULL,
  tag text NOT NULL
);

-- Create habits table
CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text,
  frequency text NOT NULL,
  days_of_week integer[],
  time_of_day time,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create habit_completions table
CREATE TABLE habit_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  completed boolean DEFAULT true
);

-- Create user_profiles table
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  first_name text,
  last_name text,
  display_name text,
  avatar_url text,
  bio text,
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'en',
  theme text DEFAULT 'system',
  notification_preferences jsonb DEFAULT '{"email": true, "push": true, "reminders": true}',
  work_hours jsonb DEFAULT '{"start": "09:00", "end": "17:00", "days": [1,2,3,4,5]}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage subtasks of their tasks"
  ON subtasks
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = subtasks.task_id 
    AND tasks.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own notes"
  ON notes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage tags of their notes"
  ON note_tags
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM notes 
    WHERE notes.id = note_tags.note_id 
    AND notes.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM notes 
    WHERE notes.id = note_tags.note_id 
    AND notes.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage their own habits"
  ON habits
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage completions of their habits"
  ON habit_completions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM habits 
    WHERE habits.id = habit_completions.habit_id 
    AND habits.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM habits 
    WHERE habits.id = habit_completions.habit_id 
    AND habits.user_id = auth.uid()
  ));

-- Create policy
CREATE POLICY "Users can view and update their own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create trigger to update updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();