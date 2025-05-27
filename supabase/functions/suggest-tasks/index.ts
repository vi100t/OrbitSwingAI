import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SuggestTasksRequest {
  userId: string;
  completedTaskId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, completedTaskId } = await req.json() as SuggestTasksRequest;

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get the completed task details
    const { data: completedTask, error: taskError } = await supabaseClient
      .from('tasks')
      .select('*')
      .eq('id', completedTaskId)
      .single();

    if (taskError) {
      throw taskError;
    }

    // Use built-in AI to generate task suggestions
    const { data: suggestions, error } = await supabaseClient.functions.invoke('ai-suggest-tasks', {
      body: {
        userId,
        completedTask,
      },
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify(suggestions),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});