import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔐 ReCaptcha validation function called')
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { token, userInfo } = await req.json()
    console.log('📝 Received validation request for user:', userInfo?.email)

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'ReCaptcha token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get ReCaptcha settings from database
    console.log('🔍 Fetching ReCaptcha settings from database')
    const { data: settings, error: settingsError } = await supabase
      .from('recaptcha_settings')
      .select('secret_key')
      .single()

    if (settingsError || !settings?.secret_key) {
      console.error('❌ ReCaptcha not configured:', settingsError)
      return new Response(
        JSON.stringify({ error: 'ReCaptcha not configured on server' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ ReCaptcha settings found, validating token with Google')

    // Validate token with Google ReCaptcha API
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify'
    const verifyData = new URLSearchParams({
      secret: settings.secret_key,
      response: token,
    })

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: verifyData,
    })

    const verifyResult = await verifyResponse.json()
    console.log('🎯 Google ReCaptcha validation result:', verifyResult)

    if (!verifyResult.success) {
      console.log('❌ ReCaptcha validation failed:', verifyResult['error-codes'])
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ReCaptcha validation failed',
          details: verifyResult['error-codes']
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check score for ReCaptcha v3 (optional - can be configured later)
    const score = verifyResult.score || 1
    const minScore = 0.5 // Configurable threshold
    
    if (score < minScore) {
      console.log(`❌ ReCaptcha score too low: ${score} < ${minScore}`)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Security check failed',
          score: score
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`✅ ReCaptcha validation successful! Score: ${score}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        score: score,
        message: 'ReCaptcha validation successful'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('💥 Error in ReCaptcha validation:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error during validation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})