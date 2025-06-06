-- Create labels table
CREATE TABLE IF NOT EXISTS public.labels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own labels"
    ON public.labels
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own labels"
    ON public.labels
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own labels"
    ON public.labels
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own labels"
    ON public.labels
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add labels column to tasks table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'labels'
    ) THEN
        ALTER TABLE public.tasks ADD COLUMN labels UUID[] DEFAULT '{}';
    END IF;
END $$; 