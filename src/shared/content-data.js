// Shared page content - identical text across all themes

export const homeContent = {
  title: 'Welcome to DuckSquack',
  subtitle: 'Essays on AI, Technology & Society by Tim Hughes.',
  description: `I write about artificial intelligence, technological transformation, and the future we're building together. These essays explore pattern recognition, systems thinking, and what it means to be human in an age of machine intelligence.`,
};

export const aboutContent = {
  title: 'About Me',
  bio: `Sup, I'm Tim Hughes, also known as Duck. I'm a dad, developer, and just a dude from Adelaide, Australia. All the D's.

My writings are all my words. The only AI used is for grammar checking and to periodically update this about page, summarising my core beliefs from my writings in a succinct manner.

My formal education spans Computer Science (specialising in AI and pattern recognition), Design, and I am currently a student of Philosophy. This combination has shaped how I approach technology: not merely as systems to be engineered, but as forces that fundamentally reshape how we live, work, and relate to one another. I find genuine joy in creating things, breaking things, reverse engineering things. All the things.

I live with cluster headaches, a condition the medical literature describes as among the most painful known to humanity. More than half my existence involves managing this pain. I mention this not seeking sympathy but because it has fundamentally shaped my perspective. It taught me that human resilience exceeds our intuitions about it, in nearly every domain. It forced me to find meaning outside of productivity and income long before AI made that search relevant for everyone else. And it provided a fifteen year education in how systems fail when they encounter problems that do not fit their standard categories.

When I am not talking to a computer, you can find me at the gym, playing footy, cricket or golf, painting, or spending time with my best friend and fiancee Chiara, our son Arthur, and our dog Luna. Arthur's arrival recalibrated everything. Before him, I thought I understood what it meant to care about something. I was wrong. The scale I operated on went to ten. After him, I discovered it goes to a thousand.

I write about artificial intelligence, technological transformation, and the future we are constructing together, whether we are paying attention or not. My essays explore the intersection of technology and humanity: the economic implications of AI, the philosophical questions raised by machine intelligence, and the structural decay of institutions that were built for a world that is rapidly ceasing to exist.

I write from Australia, which means I observe the great powers manoeuvre from a distance, with the particular clarity that comes from having no illusions about our own significance.

I believe we are living through a turning point in human history. I believe the decisions made in the coming years will echo through generations. And I believe most of us have not yet noticed.

This is my echo.`,
  contact: {
    twitter: { handle: '@timhughes92', url: 'https://twitter.com/timhughes92' },
    rss: { url: '/rss.xml', label: 'Subscribe to new posts' },
  }
};

export const projectsContent = {
  title: 'Projects',
  intro: 'Things I build when I should probably be sleeping.',
  projects: [
    {
      id: 'fitportal',
      name: 'FitPortal',
      tagline: 'White-label fitness SaaS platform',
      url: 'https://fitportal.app',
      description: `I built this because every fitness platform I looked at wanted to slap their own brand on your business. Your clients see their logo, their colours, their name. You are renting someone else's shopfront. FitPortal is the opposite. Zero platform branding, complete white-label. Trainers and gyms run everything under their own identity. Workout programming, client management, habit tracking, meal plans, analytics, check-ins, automations, billing. The whole thing.

The bit I am most proud of is the architecture. Every tenant is completely isolated. Separate data, separate theming, separate auth. You give me a single hex colour and the system generates your entire visual identity from it using OKLCH colour science. Thirty-plus CSS variables, computed on the fly. Clients log in with a PIN. Trainers get full credentials. The dashboard reshapes itself between desktop and mobile. I wanted it to feel like software that was built specifically for each gym, not a platform they happen to share.`,
      tech: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Drizzle ORM', 'Tailwind CSS', 'shadcn/ui', 'Turborepo', 'Docker', 'Cloudflare Tunnel'],
      status: 'In Development',
    },
    {
      id: 'duckos',
      name: 'DuckOS',
      tagline: 'A personal operating system that replaces your phone',
      description: `Your phone is an attention extraction device disguised as a tool. Every notification, every feed, every red badge. Engineered to pull you back in. I got tired of carrying a machine that works for advertisers and calling it mine. So I am building the replacement.

DuckOS spans three physical devices. The Duck is a handheld running a custom Android fork that I stripped to its foundations. No home screen. No app drawer. No notification shade. The entire interface is a single fluid glow orb. A GLSL fragment shader rendering six gradient layers with organic shape morphing and icon masking. It communicates through light, colour, motion, and haptics. Eleven distinct states, each with its own palette and behavioural signature. The orb is not an element of the interface. It is the interface.

The Nest is a home server running a custom Linux distribution I built from scratch. Apps run here, not on the handheld. An AI agent navigates them autonomously. It learns to read screens, traverse accessibility trees, and eventually invoke app capabilities directly. Then it sends distilled templates to the Duck. You never see a stock Android interface. Every piece of information is filtered, prioritised, and presented by an agent that understands your context, your urgency, and what actually matters to you right now.

The cognitive layer is where it gets interesting. Most personalisation approaches store what the system knows about you. Retrieval, fine-tuning, that sort of thing. I am building something different. A learned routing function that changes how the system thinks when it thinks about you. It compresses your life context into a vector that shapes the model's behaviour at inference time, without modifying the model itself. It trains continuously from how you actually respond to its decisions. It runs entirely on local hardware. Your data never leaves your home.

The third device is the Egg. A small pendant that captures ambient audio and processes it through a structured pipeline. Not raw transcripts. The system identifies speakers, segments utterances, detects commitments, extracts entities. It remembers what was said in conversation and tracks the open loops. It builds a temporal graph of your life that you can scroll through like a timeline.

Everything is hardware-encrypted. The handheld's secure enclave is the root of trust. Biometric authentication derives the key. When you lock the device, the server zeroes its memory. The model of your life, the most intimate data structure I can imagine building, exists only inside a cryptographic container that only you can open.

I am building DuckOS because I believe the device that replaces the phone cannot be designed by the people who built the phone. It has to be distraction-free not by settings or willpower but by architecture. There is no path through which an attention-extracting interface can reach the user. The agent is the gatekeeper, and the agent works for you.`,
      tech: ['Custom AOSP Fork', 'GLSL Shaders', 'Kotlin', 'KVM Virtualisation', 'Custom Linux OS', 'Local LLM Inference', 'Neural Routing Architecture', 'BLE Audio Pipeline', 'Hardware Security', 'DuckDB'],
      status: 'In Development',
    },
  ],
};
