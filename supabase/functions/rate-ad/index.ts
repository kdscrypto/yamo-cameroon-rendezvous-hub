import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateAdRequest {
  rating: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get ad ID from URL - Handle both patterns: /rate-ad/{adId}/rating or /rate-ad?adId={adId}
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(part => part.length > 0)
    let adId: string | null = null;
    
    // Check for path pattern: /rate-ad/{adId}/rating
    if (pathParts.length >= 2 && pathParts[0] === 'rate-ad') {
      adId = pathParts[1];
    }
    
    // Fallback: check for query parameter
    if (!adId) {
      adId = url.searchParams.get('adId');
    }

    if (!adId) {
      return new Response(
        JSON.stringify({ error: 'Ad ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'POST') {
      const { rating }: RateAdRequest = await req.json()

      // Validate rating value
      if (!rating || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
        return new Response(
          JSON.stringify({ error: 'Rating must be an integer between 1 and 5' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Verify the ad exists and is active
      const { data: adData, error: adError } = await supabaseClient
        .from('ads')
        .select('id, title')
        .eq('id', adId)
        .eq('status', 'active')
        .eq('moderation_status', 'approved')
        .single()

      if (adError || !adData) {
        console.error('Ad not found:', adError)
        return new Response(
          JSON.stringify({ error: 'Ad not found or not available' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Check if user already rated this ad
      const { data: existingRating, error: ratingCheckError } = await supabaseClient
        .from('ratings')
        .select('*')
        .eq('user_id', user.id)
        .eq('ad_id', adId)
        .maybeSingle()

      if (ratingCheckError) {
        console.error('Error checking existing rating:', ratingCheckError)
        return new Response(
          JSON.stringify({ error: 'Error checking existing rating' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      let ratingOperation;
      
      if (existingRating) {
        // Update existing rating
        ratingOperation = supabaseClient
          .from('ratings')
          .update({ 
            rating_value: rating,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('ad_id', adId)
      } else {
        // Create new rating
        ratingOperation = supabaseClient
          .from('ratings')
          .insert({
            user_id: user.id,
            ad_id: adId,
            rating_value: rating
          })
      }

      const { error: ratingError } = await ratingOperation

      if (ratingError) {
        console.error('Error saving rating:', ratingError)
        return new Response(
          JSON.stringify({ error: 'Error saving rating' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Get updated ad stats (automatically calculated by triggers)
      const { data: updatedAd, error: updateError } = await supabaseClient
        .from('ads')
        .select('average_rating, rating_count')
        .eq('id', adId)
        .single()

      if (updateError) {
        console.error('Error fetching updated stats:', updateError)
        return new Response(
          JSON.stringify({ error: 'Error fetching updated stats' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log(`Rating ${existingRating ? 'updated' : 'created'} for ad ${adId} by user ${user.id}`)

      return new Response(
        JSON.stringify({
          success: true,
          message: existingRating ? 'Rating updated successfully' : 'Rating created successfully',
          data: {
            userRating: rating,
            averageRating: parseFloat(updatedAd.average_rating) || 0,
            ratingCount: updatedAd.rating_count || 0
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // GET method - retrieve user's rating for this ad
    if (req.method === 'GET') {
      const { data: userRating, error: ratingError } = await supabaseClient
        .from('ratings')
        .select('rating_value')
        .eq('user_id', user.id)
        .eq('ad_id', adId)
        .maybeSingle()

      if (ratingError) {
        console.error('Error fetching user rating:', ratingError)
        return new Response(
          JSON.stringify({ error: 'Error fetching user rating' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          userRating: userRating?.rating_value || null
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})