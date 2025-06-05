/*
  # Add Repeatable Tasks Support

  1. Changes
    - Add repeatable task fields to tasks table
    - Add repeat_history table for tracking task repetitions

  2. New Fields
    - `repeat_type` (text): daily, weekly, monthly
    - `repeat_frequency` (integer): number of repetitions
    - `repeat_days` (integer[]): days for weekly repeats (0-6)
    - `repeat_ends` (timestamptz): when repetition ends
    - `parent_task_id` (uuid): links repeated instances to original

  3. Security
    - Enable RLS on new table
    - Add policies for authenticated users
*/

-- Add repeat fields to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS repeat_type text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS repeat_frequency integer;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS repeat_days integer[];
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS repeat_ends timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id uuid REFERENCES tasks(id);

-- Create repeat_history table
CREATE TABLE IF NOT EXISTS repeat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  completed_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE repeat_history ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can manage their task repetition history"
  ON repeat_history
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = repeat_history.task_id 
    AND tasks.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM tasks 
    WHERE tasks.id = repeat_history.task_id 
    AND tasks.user_id = auth.uid()
  ));