
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update expired courses
    const { data: expiredCourses, error: updateError } = await supabaseClient
      .from('courses')
      .update({ status: 'expired' })
      .lt('end_date', new Date().toISOString())
      .eq('status', 'active')
      .select()

    if (updateError) {
      throw updateError
    }

    console.log(`Updated ${expiredCourses?.length || 0} courses to expired status`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated_courses: expiredCourses?.length || 0,
        courses: expiredCourses 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error updating course status:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
