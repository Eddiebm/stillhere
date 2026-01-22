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
    const { profile, topic, platform, count, userApiKey } = await req.json();
    const openaiKey = userApiKey || Deno.env.get('OPENAI_API_KEY');

    const platformLimits: Record<string, number> = {
      twitter: 280,
      linkedin: 3000,
      instagram: 2200,
      facebook: 63206,
      tiktok: 2200,
      youtube: 5000,
      threads: 500,
      pinterest: 500,
      bluesky: 300,
      mastodon: 500,
    };

    const charLimit = platformLimits[platform] || 280;
    const posts: string[] = [];

    if (openaiKey) {
      // Use OpenAI API
      const systemPrompt = `You are a social media content expert. Generate engaging ${platform} posts for a ${profile.industry || 'tech'} company called "${profile.company_name || 'the company'}". 
Tone: ${profile.tone || 'professional'}. 
Business: ${profile.business_description || 'A growing company'}.
${profile.website_content ? `Website context: ${profile.website_content.substring(0, 500)}` : ''}
Keep posts under ${charLimit} characters. Include relevant hashtags for ${platform}. Do not use emojis.`;

      const userPrompt = `Generate ${count} unique ${platform} posts about: ${topic}. Return as JSON array of strings only.`;

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
          temperature: 0.8,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content || '[]';
        try {
          const parsed = JSON.parse(content.replace(/```json\n?|\n?```/g, ''));
          posts.push(...(Array.isArray(parsed) ? parsed : [content]));
        } catch {
          posts.push(content);
        }
      }
    }

    // Fallback to mock generation if no posts generated
    if (posts.length === 0) {
      const templates = getMockTemplates(platform, topic, profile);
      for (let i = 0; i < count; i++) {
        posts.push(templates[i % templates.length]);
      }
    }

    return new Response(JSON.stringify({ posts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, posts: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getMockTemplates(platform: string, topic: string, profile: any): string[] {
  const company = profile.company_name || 'our company';
  const industry = profile.industry || 'tech';
  const tone = profile.tone || 'professional';

  const baseTemplates: Record<string, string[]> = {
    'Product updates': [
      `Big news from ${company}: We just launched a feature that changes everything about how you work. The response has been incredible. #${industry} #ProductUpdate`,
      `After months of development, we are thrilled to announce our latest update. Built based on your feedback, designed for your success. Link in bio.`,
      `What happens when you listen to your customers? You build exactly what they need. Our newest feature is live - and it is a game changer.`,
      `Speed. Simplicity. Results. Our latest update delivers all three. See what ${company} has been building. #Innovation`,
      `Your workflow just got easier. Our team worked around the clock to bring you this update. Try it today and let us know what you think.`,
    ],
    'Industry insights': [
      `The ${industry} industry is shifting faster than ever. Here are 3 trends smart companies are watching right now. Thread below.`,
      `Unpopular opinion: Most ${industry} companies are missing the biggest opportunity of the decade. Here is what I mean.`,
      `I have been in ${industry} for years. The companies winning right now all share one thing in common: they adapt fast.`,
      `Data point: 73% of ${industry} leaders say automation is their top priority this year. Are you keeping up?`,
      `The future of ${industry} is not what you think. We are seeing a fundamental shift in how value gets created.`,
    ],
    'Personal journey': [
      `Year 3 of building ${company}. Biggest lesson: Consistency beats intensity every single time. Keep showing up.`,
      `I almost gave up on ${company} twice. Here is what kept me going. #FounderLife #${industry}`,
      `The hardest part of building a company is not what you think. It is the invisible work nobody talks about.`,
      `What I wish I knew when I started ${company}: Your first idea is rarely your best idea. Stay curious.`,
      `Building in public means sharing the wins AND the losses. Today was a tough one. But we keep moving forward.`,
    ],
    'Tips and advice': [
      `Simple tip that transformed our ${industry} strategy: Focus on one metric that matters. Everything else is noise.`,
      `Stop trying to do everything. Start doing one thing exceptionally well. That is how ${company} grew.`,
      `The best advice I got this year: Your competition is not your enemy - your own inaction is.`,
      `Want to stand out in ${industry}? Do what others won't. Put in the work when no one is watching.`,
      `Three habits that changed everything: Early mornings, deep work blocks, and saying no to good opportunities.`,
    ],
    'Behind the scenes': [
      `A look inside ${company}: This is what our Monday standup actually looks like. Real work, real progress.`,
      `Building a ${industry} company means late nights, early mornings, and a lot of coffee. Would not trade it for anything.`,
      `The team shipped 3 features this week. Here is how we stay productive without burning out.`,
      `Real talk: Running ${company} is harder than I expected. But the impact we are making is worth every challenge.`,
      `What does a day at ${company} look like? Here is the unfiltered version. #StartupLife`,
    ],
    'Customer stories': [
      `One of our clients just shared incredible results: 40% efficiency gains in 3 months. This is why we build.`,
      `Customer spotlight: How one ${industry} team transformed their workflow with ${company}. Their story is inspiring.`,
      `The best part of my job? Messages like this: "Your product changed how we work." Thank you for trusting us.`,
      `Real results from real customers. No fluff, just data. See how ${company} is making a difference.`,
      `When a customer says you saved them 10 hours a week, that is when you know the work matters.`,
    ],
  };

  const templates = baseTemplates[topic] || baseTemplates['Product updates'];
  
  // Adjust for platform tone
  if (tone === 'casual') {
    return templates.map(t => t.replace(/\. /g, '! ').replace('We are', "We're"));
  }
  
  return templates;
}
