import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    const { tripId, tripData, routeType = 'balanced', distanceMatrix, optimizedRoute } = await req.json()

    if (!tripId || !tripData) {
      throw new Error('Trip ID and trip data are required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    console.log('Generating AI route for trip:', tripId, 'routeType:', routeType)

    // Prepare data for Gemini AI
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Create prompt for Gemini with real distance and time data
    const savedPlaces = tripData.savedPlaces || []
    const destinations = tripData.coordinates || []
    const dates = tripData.dates
    
    // Prepare distance and time information for AI
    const distanceInfo = distanceMatrix ? 
      `Real Distance Data Available:
${distanceMatrix.map(place => 
  `${place.placeName}: ${place.distancesTo.map(d => 
    `${d.distance.toFixed(1)}km (${d.travelTime}min by ${d.transportType})`
  ).join(', ')}`
).join('\n')}` : 'Distance data not available - use geographical estimates.';

    const optimizedRouteInfo = optimizedRoute ? 
      `Suggested Optimal Route Order: ${optimizedRoute.places.map(p => p.name).join(' → ')}
Total Travel Time: ${optimizedRoute.travelTime} minutes
Total Visit Time: ${optimizedRoute.visitTime} minutes
Total Route Time: ${optimizedRoute.totalTime} minutes` : '';
    
    const prompt = `You are a professional travel planner. Generate a BALANCED travel route for the following trip using REAL distance and time data:

Trip: ${tripData.name}
Dates: ${dates}
Destinations: ${destinations.map(d => d.name).join(', ')}
Saved Places: ${savedPlaces.map(p => `${p.name} (${p.category}, priority: ${p.priority}, time needed: ${p.estimatedTime})`).join(', ')}

${distanceInfo}

${optimizedRouteInfo}

IMPORTANT INSTRUCTIONS:
- Use the provided REAL distance and travel times in your calculations
- Create a BALANCED route with 2-3 places per day
- Consider opening hours (assume museums 9-17, restaurants 11-22, outdoor places always open)
- Minimize total travel time by following logical geographical order
- Account for meal times and rest periods
- Include realistic buffer time between activities

Please generate a detailed day-by-day itinerary that includes:
1. Optimal order based on real distances provided
2. Realistic time allocations considering travel times
3. Specific opening hours and best visiting times
4. Walking and transport estimates using real data
5. Structured daily schedule with breaks

Return the response as a JSON object with this structure:
{
  "itinerary": [
    {
      "day": 1,
      "date": "2024-01-01",
      "destinationName": "Paris",
      "places": [
        {
          "id": "place-id",
          "name": "Place Name",
          "category": "attraction",
          "rating": 4.5,
          "priority": "high",
          "aiRecommendedDuration": "2 hours",
          "bestTimeToVisit": "Morning",
          "orderInRoute": 1,
          "lat": 48.8566,
          "lng": 2.3522
        }
      ],
      "totalTime": "6 hours",
      "walkingTime": "45 minutes",
      "transportTime": "30 minutes",
      "freeTime": "4 hours",
      "allocatedDays": 3,
      "isTentative": false
    }
  ]
}

Make sure the JSON is valid and complete.`

    // Call Gemini AI
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    })

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      console.error('Gemini API error:', errorText)
      throw new Error('Failed to generate AI route')
    }

    const geminiData = await geminiResponse.json()
    console.log('Gemini response:', geminiData)

    let aiItinerary
    try {
      const generatedText = geminiData.candidates[0].content.parts[0].text
      
      // Extract JSON from the response (remove markdown formatting if present)
      const jsonStart = generatedText.indexOf('{')
      const jsonEnd = generatedText.lastIndexOf('}') + 1
      const jsonString = generatedText.substring(jsonStart, jsonEnd)
      
      aiItinerary = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError)
      // Fallback to simple mock data if AI parsing fails
      aiItinerary = {
        itinerary: savedPlaces.map((place, index) => ({
          day: index + 1,
          date: new Date().toISOString().split('T')[0],
          destinationName: place.destinationName || destinations[0]?.name || 'Unknown',
          places: [{
            ...place,
            lat: place.lat || destinations[0]?.lat || 0,
            lng: place.lng || destinations[0]?.lng || 0,
            aiRecommendedDuration: place.estimatedTime || '2 hours',
            bestTimeToVisit: 'Morning',
            orderInRoute: 1
          }],
          totalTime: '6 hours',
          walkingTime: '30 minutes',
          transportTime: '20 minutes',
          freeTime: '4 hours',
          allocatedDays: Math.ceil(savedPlaces.length / 3),
          isTentative: false
        }))
      }
    }

    // Save to database
    const { data: saveData, error: saveError } = await supabase
      .from('ai_itineraries')
      .upsert({
        trip_id: tripId,
        user_id: user.id,
        route_type: routeType,
        itinerary_data: aiItinerary
      }, {
        onConflict: 'trip_id,user_id,route_type'
      })

    if (saveError) {
      console.error('Error saving itinerary:', saveError)
      // Don't throw error, just log it
    }

    return new Response(JSON.stringify({
      success: true,
      itinerary: aiItinerary.itinerary,
      routeType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in ai-route-generator:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check the edge function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})