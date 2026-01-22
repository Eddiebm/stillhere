Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { profile, userApiKey } = await req.json();
    const openaiKey = userApiKey || Deno.env.get('OPENAI_API_KEY');

    const systemPrompt = `You are a business strategist and content marketing expert. Analyze the business information provided and generate actionable insights. Return a JSON object with the following structure:
{
  "businessSummary": {
    "overview": "2-3 sentence overview of the business",
    "strengths": ["strength1", "strength2", "strength3"],
    "targetPersona": "Description of ideal customer persona"
  },
  "contentStrategy": {
    "pillars": [
      {"name": "Pillar name", "description": "Brief description", "examples": ["example topic 1", "example topic 2"]}
    ],
    "bestPlatforms": [{"platform": "platform name", "reason": "why it fits"}],
    "postingFrequency": "Recommended frequency with reasoning"
  },
  "competitivePositioning": {
    "differentiation": "How to stand out from competitors",
    "gaps": ["gap1", "gap2"],
    "uniqueAngles": ["angle1", "angle2", "angle3"]
  },
  "quickWins": [
    {"action": "Specific action", "impact": "Expected impact", "effort": "Low/Medium/High"}
  ]
}`;

    const userPrompt = `Analyze this business and generate insights:

Company: ${profile.company_name || 'Unknown'}
Industry: ${profile.industry || 'Unknown'}
Business Description: ${profile.business_description || 'Not provided'}
Target Audience: ${profile.target_audience || 'Not specified'}
Value Proposition: ${profile.value_proposition || 'Not specified'}
Competitors: ${profile.competitors || 'Not specified'}
Business Goals: ${profile.business_goals || 'Not specified'}
Tone: ${profile.tone || 'professional'}
Website Content: ${profile.website_content ? profile.website_content.substring(0, 1000) : 'Not available'}

Generate comprehensive, actionable insights based on this information.`;

    let insights = null;

    if (openaiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content || '{}';
        try {
          insights = JSON.parse(content);
        } catch {
          insights = null;
        }
      }
    }

    // Fallback to mock insights if AI fails
    if (!insights) {
      insights = generateMockInsights(profile);
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, insights: null }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateMockInsights(profile: any) {
  const company = profile.company_name || 'Your company';
  const industry = profile.industry || 'technology';
  const goals = profile.business_goals || 'brand awareness';
  
  return {
    businessSummary: {
      overview: `${company} operates in the ${industry} space, focusing on delivering value to their target market. Based on the business description and goals, there is significant opportunity for growth through strategic content marketing.`,
      strengths: [
        `Strong positioning in the ${industry} market`,
        'Clear understanding of target audience needs',
        'Differentiated value proposition',
      ],
      targetPersona: profile.target_audience || `Decision-makers and professionals in ${industry} looking for solutions that save time and improve outcomes.`,
    },
    contentStrategy: {
      pillars: [
        {
          name: 'Educational Content',
          description: `Share expertise and insights about ${industry}`,
          examples: ['How-to guides', 'Industry trend analysis', 'Best practices'],
        },
        {
          name: 'Behind the Scenes',
          description: 'Build trust by showing the human side',
          examples: ['Team stories', 'Product development journey', 'Company culture'],
        },
        {
          name: 'Customer Success',
          description: 'Showcase results and build social proof',
          examples: ['Case studies', 'Testimonials', 'Before/after stories'],
        },
        {
          name: 'Thought Leadership',
          description: 'Position as an industry authority',
          examples: ['Industry predictions', 'Opinion pieces', 'Expert interviews'],
        },
      ],
      bestPlatforms: [
        { platform: 'LinkedIn', reason: `Ideal for ${industry} B2B content and professional networking` },
        { platform: 'Twitter/X', reason: 'Great for quick updates, engagement, and industry conversations' },
        { platform: 'Instagram', reason: 'Visual storytelling and brand personality' },
      ],
      postingFrequency: 'Start with 3-4 posts per week across platforms. Consistency matters more than volume. Focus on quality and engagement over quantity.',
    },
    competitivePositioning: {
      differentiation: profile.value_proposition || `Focus on what makes ${company} unique - whether it is speed, quality, price, or customer experience. Lead with this in all content.`,
      gaps: [
        'Competitors may not be active on all platforms - claim your space',
        'Most competitors focus on product features - you can focus on customer outcomes',
        'There may be underserved audience segments to target',
      ],
      uniqueAngles: [
        'Share the founder story and company mission',
        'Be more transparent about processes and pricing',
        'Create content that competitors are not creating',
        'Engage more authentically with your community',
      ],
    },
    quickWins: [
      {
        action: 'Optimize your LinkedIn company page with updated messaging and visuals',
        impact: 'Better first impressions and increased follower conversion',
        effort: 'Low',
      },
      {
        action: 'Create a content calendar for the next 30 days',
        impact: 'Consistent posting and reduced daily decision fatigue',
        effort: 'Medium',
      },
      {
        action: `Write 3 posts about ${goals === 'thought leadership' ? 'industry insights' : 'customer success stories'}`,
        impact: 'Immediate content to publish and test engagement',
        effort: 'Low',
      },
    ],
  };
}
