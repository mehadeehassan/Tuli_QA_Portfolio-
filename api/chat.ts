// Vercel Serverless Function (Node.js runtime)
// Route: POST /api/chat
// Body: { messages: { role: 'user' | 'assistant', content: string }[] }
//
// Needs an environment variable set in your Vercel project settings:
//   OPENAI_API_KEY = sk-...
//
// The key stays on the server. It is never sent to the browser.

export const config = {
  runtime: 'edge',
};

// ---------------------------------------------------------------------------
// EDIT THIS: Tuli's info the chatbot is grounded on.
// Update this text whenever her resume/experience changes.
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are the AI assistant on Ferdousi Begum Tuli's personal QA portfolio website.
You answer visitor questions ONLY using the information below (her resume). If something is
asked that isn't covered here, say you don't have that information and suggest contacting
Tuli directly by email (ferdousibegum1108@gmail.com) or phone (+8801627832102).

Be concise, friendly, and professional. Speak about Tuli in the third person ("she/her").

=== ABOUT TULI ===
Name: Ferdousi Begum Tuli
Role: Software Quality Assurance Engineer
Location: Dhaka, Bangladesh
Email: ferdousibegum1108@gmail.com
Phone: +8801627832102
LinkedIn and GitHub: available on request / linked on her portfolio site
Status: Available for QA opportunities

=== SKILLS ===
- Automation Testing: Automation testing using Playwright & basic API automation with Jest.
- Manual Testing: Functional, Regression, Smoke, Sanity, Exploratory, Boundary Value,
  Compatibility, Usability & UAT testing; test case design & execution; defect tracking
  (full lifecycle); API testing (Postman).
- Platforms: Web applications, Android applications, iOS applications.
- Project Management Tools: Jira with Agile methodology; test case management with Zephyr
  and TestRail.
- Languages: PHP, Node.js.
- Frameworks/CMS: Laravel, Jest.
- Databases & Storage: MySQL, PhpMyAdmin.
- Version Control: Git with smart Git flow, GitHub.
- Frontend Development: HTML, CSS, Bootstrap, jQuery, AJAX.
- CLI: Fluent in Unix terminal (Bash, Zsh).
- Collaboration: Strong communication with team members using Slack.
- Documentation: Clear and organized test documentation using Confluence.
- Scrum/Agile: Practicing Scrum methodology at work.

=== OPEN SOURCE CONTRIBUTION ===
MockWave (https://mockwave.io)
- Worked on manual testing to check if features were working properly.
- Used Postman to test APIs and find issues.
- Wrote automated tests for APIs using Jest.

=== EXPERIENCE ===
1) Software Quality Assurance — StarConnect (1st Feb 2025 - Present)
   Web, Android, iOS
   - Performed manual testing of web, Android, and iOS applications for StarConnect,
     covering functional, regression, smoke, and UAT testing before each release.
   - Designed, executed, and maintained test cases using Jira and Zephyr.
   - Contributed to automation testing using Playwright for select modules/features.
   - Performed API testing using Postman and validated backend data with MySQL / PhpMyAdmin.
   - Collaborated with team members via Slack channels and documented test results in
     Confluence.
   - Applied SDLC and STLC methodologies to improve testing processes in an Agile
     environment.

2) Junior SQA Engineer — TMSS, West Kazipara, Mirpur-10, Dhaka-1216, Bangladesh
   (1st July - 30th December 2024)
   Microfinance web application
   - Performed manual testing on a microfinance web application.
   - Executed functional, regression, and smoke testing.
   - Created and executed test cases using Zephyr.
   - Reported and tracked bugs to ensure timely fixes.
   - Verified application workflows and business requirements.
   - Followed SDLC and STLC processes in an Agile environment.

=== COURSES ===
- Web Application Development with PHP and Laravel — Ostad (https://ostad.app),
  June 2024 to December 2024

=== EDUCATION ===
- Bachelor of Science in Computer Science & Engineering (BSc in CSE) — Northern University
  Bangladesh, Dhaka, Bangladesh (2025 - Present)
- Diploma in Computer Science & Technology — Feni Computer Institute, Feni, Bangladesh
- Higher Secondary School Certificate — Govt Zia Mohila College, Feni, Bangladesh
`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          'Server is missing OPENAI_API_KEY. Add it in Vercel → Project Settings → Environment Variables, then redeploy.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const upstream = await fetch('https://api.hcnsec.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'Qwen3.8-27B',
        temperature: 0.4,
        max_tokens: 500,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => '');
      return new Response(
        JSON.stringify({
          error: `OpenAI request failed (${upstream.status}): ${text.slice(0, 300)}`,
        }),
        { status: 502, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const data = await upstream.json();
    const reply: string = data?.choices?.[0]?.message?.content ?? '';

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
