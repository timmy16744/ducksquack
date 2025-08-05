// Fixed and consolidated app.js with all components properly organized

// Function to parse markdown bold syntax **text** and render as HTML
const parseMarkdownBold = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    // Split text by **bold** markers and create elements
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            // Remove ** markers and make bold
            const boldText = part.slice(2, -2);
            return React.createElement('span', { 
                key: index, 
                className: 'markdown-bold' 
            }, boldText);
        }
        return part;
    });
};

// Main App Component
const App = () => {
    const [theme, setTheme] = React.useState('dark');
    const themeVars = theme === 'dark' ? {
        app: { backgroundColor: '#333444' },
        terminal: { boxShadow: '0 2px 5px #111' },
        window: { backgroundColor: '#222345', color: '#F4F4F4' },
        field: { backgroundColor: '#222333', color: '#F4F4F4', fontWeight: '400' },
        cursor: { animation: '1.02s blink-dark step-end infinite' }
    } : {
        app: { backgroundColor: '#ACA9BB' },
        terminal: { boxShadow: '0 2px 5px #33333375' },
        window: { backgroundColor: '#5F5C6D', color: '#E3E3E3' },
        field: { backgroundColor: '#E3E3E3', color: '#474554', fontWeight: '400' },
        cursor: { animation: '1.02s blink-light step-end infinite' }
    };

    return (
        <div id="app" style={themeVars.app}>
            <Terminal theme={themeVars} setTheme={setTheme} />
        </div>
    );
};

// AsciiNav Component
const AsciiNav = ({ handleNavClick, currentPage }) => {
    const getNavLinkClass = (pageName) => {
        return `nav-tree-item nav-${pageName} ${currentPage === pageName ? 'active-nav-item' : ''}`;
    };

    return (
        <div className="nav-tree">
            <div>/</div>
            <div>
                <span>├── </span>
                <span className={getNavLinkClass('about')} onClick={() => handleNavClick('about')}>about</span>
            </div>
            <div>
                <span>├── </span>
                <span className={getNavLinkClass('projects')} onClick={() => handleNavClick('projects')}>projects</span>
            </div>
            <div>
                <span>├── </span>
                <span className={getNavLinkClass('writings')} onClick={() => handleNavClick('writings')}>writings</span>
            </div>
            <div>
                <span>└── </span>
                <span className={getNavLinkClass('mode')} onClick={() => handleNavClick('mode cli')}>mode cli</span>
            </div>
        </div>
    );
};

// Simple Terminal Duck Banner 
const TerminalDuckBanner = () => {
    return (
        <div id="terminal-banner" style={{ padding: '20px', color: '#FFD700' }}>
            <pre>{`    __
___( o)>
\\ <_. )
 \`---'`}</pre>
        </div>
    );
};

// Field Component
const Field = ({ theme, setTheme, setTitle }) => {
    const [fieldHistory, setFieldHistory] = React.useState([]);
    const [userInput, setUserInput] = React.useState('');
    const [commandHistory, setCommandHistory] = React.useState([]);
    const [commandHistoryIndex, setCommandHistoryIndex] = React.useState(0);
    const [navMode, setNavMode] = React.useState('ux');
    const [currentPage, setCurrentPage] = React.useState('home');
    const [typingQueue, setTypingQueue] = React.useState([]);
    const [isGlobalTyping, setIsGlobalTyping] = React.useState(false);
    const [currentTypingItem, setCurrentTypingItem] = React.useState(null);
    const fieldRef = React.useRef(null);
    const typingIntervalRef = React.useRef(null);

    const projectsData = [
        {
            title: "StormCaddie",
            url: "https://stormcaddie.com",
            synopsis: "A compact, powerful leaf blower designed for golfers to keep the green clear."
        },
        {
            title: "Pawfect Match",
            url: "https://pawfectmatch.app",
            synopsis: "A Tinder-style app for rescuing animals from shelters, connecting pets with loving homes."
        }
    ];

    const writingsData = [
        {
            title: "Is China Already Leading the Race for AI Domination?",
            date: "2025-08-02",
            file: "china-ai-domination.md",
            color: "blue",
            content: "The narrative of the U.S. versus China in AI often paints the picture of a race with two contenders – but is the U.S. really still leading, or has China already won? The truth may surprise you. While it's true that the U.S. remains the dominant force in some areas of AI, China is rapidly catching up in critical aspects. Momentum, as any entrepreneur will tell you, matters more than milestones. And China's momentum in AI, semiconductors, and technology manufacturing isn't just impressive – it's becoming nearly unstoppable.\n\nIn a race with no finish line, every incremental advantage compounds into long-term dominance. China is not just moving fast, but in a multi-pronged assault across technology sectors. From open-source AI models and semiconductor innovations to energy production and industrial capacity, China is positioning itself to dominate all the critical technologies of the 21st century. And let's be clear, when it comes to momentum, the U.S. is not just behind; it's struggling to keep up.\n\n**Manufacturing: China's Unrivaled Edge**\n\nOne key reason China's momentum seems insurmountable is its manufacturing dominance. China's manufacturing base is so vast that it holds a massive strategic advantage over the U.S. China controls about 29% of global manufacturing, dwarfing its competitors. This isn't just about making cheap gadgets – it's about being the backbone of AI hardware and semiconductor production, two sectors that the U.S. is increasingly dependent on. If China ever escalates tensions over Taiwan, where TSMC currently supplies the U.S. with 92% of its advanced chips, the U.S. would be left vulnerable, unable to source its critical components. But China isn't just waiting around; it's been working tirelessly to replace the U.S. in semiconductors with Huawei's CloudMatrix 384, a formidable alternative to Nvidia's chips. The Taiwan issue looms large, but China's push for domestic semiconductor independence may end up making it irrelevant.\n\n**Energy Independence and Green Technology**\n\nChina's dominance extends far beyond manufacturing into energy production and green technology. China produces over 80% of the world's solar panels and controls most of the supply chain for lithium-ion battery production. This isn't just market positioning; it's strategic preparation for the next phase of global technology competition. While the U.S. debates climate policy, China has already cornered the market on the technologies that will power the future.\n\nThe implications are staggering. As the world transitions to renewable energy and electric vehicles, China will be the primary supplier of the critical components. This gives them unprecedented leverage over global energy markets and, by extension, global politics. The U.S. found itself dependent on Middle Eastern oil for decades; now it risks becoming dependent on Chinese green technology.\n\n**The AI Race: Open Source vs. Closed Systems**\n\nIn artificial intelligence, China has taken a radically different approach than Silicon Valley. While American companies like OpenAI and Google focus on proprietary, closed-source models, Chinese companies are embracing open-source development. This strategy creates network effects that compound over time. Open-source models improve faster because they benefit from global collaboration, and they're more resistant to regulatory pressure because they can't be controlled by any single entity.\n\nChina's approach to AI development is also more pragmatic and application-focused. While American companies chase theoretical breakthroughs and worry about existential risks, Chinese companies are deploying AI solutions in manufacturing, logistics, and urban planning. This practical focus means Chinese AI is becoming embedded in the real economy, creating competitive advantages that are difficult to replicate.\n\n**The Semiconductor Challenge**\n\nThe semiconductor industry represents perhaps the most critical battleground in the tech war between the U.S. and China. The U.S. has imposed extensive sanctions on Chinese chip companies, trying to prevent China from accessing advanced manufacturing equipment. However, these restrictions may backfire by accelerating China's push for semiconductor independence.\n\nChina is investing hundreds of billions of dollars in domestic chip production, and they're making significant progress. While they may lag behind Taiwan and South Korea in the most advanced processes, they're rapidly closing the gap in mature nodes that power most electronic devices. More importantly, they're developing alternative architectures that could leapfrog traditional silicon-based computing.\n\n**Conclusion: The Momentum Advantage**\n\nThe race for AI domination isn't just about who has the best algorithms or the most advanced chips today. It's about who has the momentum to sustain long-term innovation and deployment. China's integrated approach, combining manufacturing dominance, energy independence, open-source AI development, and massive state investment, creates a virtuous cycle that's difficult to counter.\n\nThe U.S. still has advantages in fundamental research and venture capital, but advantages in research mean nothing if you can't manufacture and deploy at scale. China has built the infrastructure for the AI economy of the future, while the U.S. is still debating how to respond. In a race where momentum matters more than milestones, China may have already crossed the finish line."
        },
        {
            title: "The System is Already Dead",
            date: "2025-07-15",
            file: "the-system-is-already-dead.md",
            color: "red",
            content: "Let's start with the core premise: Australia's economy is no longer in decline. It has already failed structurally, technologically, and demographically. The signs are everywhere. Housing functions as a speculative asset. Employment has decoupled from productive value. Our national infrastructure is reliant on foreign compute, foreign capital, and foreign vision. The state has ceded control of the future and replaced it with legislative theatre.\n\nIn this context, rational actors don't seek participation. They build insulation. Integration into legacy systems, whether political, corporate, or social, is no longer a lever for change. It's latency.\n\nThis perspective isn't an abstract theory for me. It's a reality crystallized by a 15-year battle within a healthcare system that proves the rule.\n\n## The Personal Cost of a Failed System\n\nI live with cluster headaches: technically the worst pain known to humankind. I spend over 50% of my life experiencing this pain, helplessly alone. I didn't choose to live this life but I have chosen how to survive. My journey through the medical system has been a 15-year case study in its failure: well over 100 trialed drugs, six surgeries, and a brain implant that was a for-profit procedure I never should have had (but at least my surgeon got a new car). The Australian health system isn't equipped for edge cases; it can't solve what doesn't fit its actuarial design. Every interaction produces compounding failures: financially, functionally, psychologically.\n\nSo I had to build a system around it. The 25,000+ steps a day minimum, the two-hour resistance training sessions, the strict caloric, cognitive, and environmental control. This isn't fitness. It's runtime maintenance. A personal operating system patched daily to prevent collapse.\n\n## The Broader Pattern\n\nMy experience with healthcare mirrors the broader collapse of Australian institutions. Every system is optimized for extraction rather than delivery. The mining industry extracts resources and leaves communities with contaminated water. The education system extracts student debt and leaves graduates with credentials that don't match market needs. The housing market extracts wealth from younger generations and concentrates it in the hands of existing property owners.\n\nThis isn't a bug; it's the feature. The system isn't broken; it's working exactly as designed. The politicians, bureaucrats, and corporate leaders who run these systems are getting exactly what they want: wealth extraction without accountability.\n\n## Why Traditional Solutions Don't Work\n\nVoting won't fix this. The major parties are captured by the same interests that benefit from the current system. Labor and Liberal may disagree on cultural issues, but they're aligned on the fundamental economic structure that prioritizes capital over people.\n\nProtesting won't fix this. The system has learned to absorb and neutralize dissent. Every protest is channeled into ineffective symbolic gestures that release social pressure without changing underlying power structures.\n\nWorking within the system won't fix this. The system is designed to co-opt and corrupt anyone who tries to change it from within. Well-intentioned people enter politics or corporate leadership with plans to reform, but they quickly discover that the incentive structures make meaningful change impossible.\n\n## The Alternative: Building Parallel Systems\n\nThe only rational response is to build parallel systems that operate outside the failing institutional framework. This means:\n\n**Economic Independence**: Developing income streams that aren't dependent on traditional employment or institutional validation. Building skills and assets that retain value regardless of what happens to the broader economy.\n\n**Health Autonomy**: Taking responsibility for your own health and fitness rather than relying on a medical system that profits from keeping you sick. This includes preventive care, nutrition, exercise, and mental health practices.\n\n**Information Independence**: Developing your own information sources and analytical frameworks rather than relying on mainstream media or institutional expertise. Learning to think critically and independently about complex issues.\n\n**Social Networks**: Building relationships with people who share your values and commitment to self-reliance. Creating communities of mutual support that can function independently of institutional services.\n\n## The Time Horizon\n\nThis isn't about preparing for some distant collapse. The collapse has already happened. We're living in the aftermath. The institutions that previous generations relied on for stability and prosperity no longer serve that function.\n\nThe question isn't whether the system will fail. It has already failed. The question is whether you'll recognize this reality and adapt accordingly, or whether you'll continue trying to work within a system that's designed to extract value from you rather than provide it.\n\nBuilding parallel systems isn't a political statement or an ideological position. It's a practical response to observable reality. The old system is dead. The sooner you accept this and start building alternatives, the better positioned you'll be for whatever comes next."
        },
        {
            title: "From Cricket to Collapse",
            date: "2025-05-28",
            file: "from-cricket-to-collapse.md",
            color: "green",
            content: "Australia isn't the land of mateship anymore. It's the playground for a privileged few squeezing the rest of us dry. Politicians pull in $600k+ while your account shrinks. Mateship? It's daylight robbery. We're richer on paper than ever, yet you've never felt poorer.\n\nWe'll tear Steve Smith apart for Sandpapergate, but the politicians who decide whether we live or die glide past real scrutiny. Three consecutive quarters of economic contraction should bench a cabinet, not hand them new portfolios. Meanwhile, 50% of 16-year-olds are unable to swim, small businesses shut daily, and households cling to a token 3% wage rise that employers claw back with shorter rosters.\n\n**The Overpaid Political Class**\n\nThe very people presiding over this mess are the best-paid public officials on Earth. The Prime Minister clears about A$607k a year and back-bench MPs start above A$230k, more than counterparts in much larger economies. Paying corporate-tier salaries attracts careerists, not custodians.\n\nPeg their pay to the lower 50% of national incomes: if Australians can't afford to eat, neither should their leaders.\n\n**Resource Wealth Squandered**\n\nWe also sit on an unrivalled treasure chest of minerals: roughly a fifth of global lithium, a third of rutile and iron ore, world-class nickel, copper, and rare-earth deposits. Yet we export raw ore at discount and buy back finished batteries at luxury prices. The same lunacy plays out in agriculture: our beef is so prized it's cheaper on a Shanghai menu than in a suburban Coles. Regulations suffocate anyone who tries to fix this.\n\n**The Housing Ponzi Scheme**\n\nHousing has become Australia's national obsession, but not because we're building homes for families. We've turned shelter into a speculative casino where existing owners profit from artificial scarcity while young Australians are priced out of their own country.\n\nThe median house price in Sydney is now over $1.3 million. In Melbourne, it's approaching $1 million. These aren't luxury mansions; they're basic family homes that previous generations could afford on a single income. Today, even dual-income professional couples struggle to enter the market.\n\nThis isn't natural market evolution. It's the result of deliberate policy choices: negative gearing that subsidizes property speculation, capital gains discounts that reward unproductive investment, and immigration policies that inflate demand without corresponding supply increases.\n\n**The Skills Shortage Lie**\n\nPoliticians claim we need mass immigration to address skills shortages, but this is economic gaslighting. We don't have a skills shortage; we have a wage shortage. Employers have become addicted to cheap labor and refuse to invest in training or pay competitive wages for local workers.\n\nWhen a mining company claims it can't find Australian workers, what they really mean is they can't find Australians willing to work for the wages they want to pay. When a tech company brings in overseas workers on temporary visas, they're not filling genuine skill gaps; they're suppressing wages for local engineers and developers.\n\nMeanwhile, we've created an education system that produces graduates in fields where there are no jobs, while neglecting the trades and technical skills we actually need. Universities have become degree mills, extracting wealth from students through HECS debt while providing credentials that don't match market demand.\n\n**The Innovation Mirage**\n\nAustralia talks about becoming an innovation nation while systematically destroying the conditions that make innovation possible. We've allowed foreign companies to acquire our most promising startups before they can scale. We've failed to develop sovereign capabilities in critical technologies. We've created a regulatory environment that favors established players over disruptors.\n\nThe result is an economy that's increasingly dependent on digging stuff out of the ground and selling it to the highest bidder. We've become a resource colony again, just as we were 150 years ago.\n\n**The Path Forward**\n\nFixing Australia requires acknowledging that our current political and economic elite have failed catastrophically. They've prioritized their own wealth and status over the long-term prosperity of the nation.\n\nReal reform would mean:\n\n- Eliminating tax subsidies for property speculation\n- Dramatically reducing immigration until housing supply catches up\n- Investing in domestic manufacturing and technology capabilities\n- Reforming education to focus on practical skills rather than credential inflation\n- Breaking up media and retail monopolies that stifle competition\n- Making politicians accountable for economic outcomes through performance-based pay\n\nBut none of this will happen through normal political processes. The system is too captured by vested interests. Real change will only come when enough Australians recognize that the current system is designed to exploit them, not serve them.\n\nUntil then, we'll continue the slow slide from prosperity to irrelevance, cheering for cricket teams while our country is sold out from under us."
        },
        {
            title: "Nurturing the Future: Becoming a Father at the Dawn of Super Intelligence",
            date: "2025-04-20",
            file: "nurturing-the-future.md",
            color: "yellow",
            content: "Fatherhood fundamentally alters perspectives. Before becoming a parent, I thought I was operating at the peak of my potential, scoring life at a solid nine or ten out of ten. Yet, the moment I welcomed my son into the world, the scale shifted dramatically. Suddenly, life wasn't graded out of ten but out of a thousand, revealing previously unseen depths and complexities. This profound shift in consciousness felt like an upgrade for my brain, expanding my understanding of responsibility, empathy, purpose, and interconnectedness.\n\nAs my son drew his first breaths, I simultaneously felt awe and anxiety, not merely at the everyday responsibilities of parenting, but at the unprecedented world into which he's born. His arrival aligns precisely with humanity's first steps into a new epoch: the dawn of super intelligence.\n\n**The AI Revolution: A Father's Perspective**\n\nThe acceleration of artificial intelligence isn't merely technological; it's deeply human. We stand on the precipice of a fundamental shift in what it means to live, work, and relate to one another. Closely tracking the trajectory of AI's evolution, I've grown acutely aware of how unprepared our current systems, educational, economic, and social, are to manage such monumental changes. Yet, as a father, retreating from this change isn't an option. I must engage with it, understand it, and ultimately prepare my child for it.\n\n**Redefining Education for the AI Era**\n\nOur current models of education seem archaic, emphasizing standardized outcomes, rigid structures, and skills destined for automation. AI starkly exposes these inadequacies. My son won't benefit from a traditional path equating memorization with intelligence. Instead, his growth should nurture adaptability, creativity, and emotional intelligence, qualities that AI complements but can't replace.\n\nThe traditional model of education—sit still, memorize facts, take tests, get grades—was designed for an industrial economy that no longer exists. In a world where AI can access and process information instantly, the ability to recall facts becomes less valuable than the ability to ask good questions, think critically, and adapt to new situations.\n\nI envision an education for my son that emphasizes:\n\n**Creative Problem Solving**: Rather than learning rote procedures, he should learn to approach problems from multiple angles, combining insights from different domains, and generating novel solutions.\n\n**Emotional Intelligence**: Understanding and managing emotions—both his own and others'—will be crucial in a world where human connection becomes increasingly valuable as AI handles routine interactions.\n\n**Systems Thinking**: The ability to understand complex, interconnected systems will be essential as the world becomes more complex and interdependent through AI integration.\n\n**Ethical Reasoning**: As AI systems make more decisions that affect human lives, the ability to think through ethical implications and advocate for human values becomes critical.\n\n**The Economic Transformation**\n\nThe economic implications of AI are staggering and largely underestimated. We're not just talking about job displacement; we're talking about the fundamental reorganization of economic value. In a world where AI can perform most cognitive tasks, what does human labor become worth?\n\nTraditional career advice—get good grades, go to university, find a stable job—assumes an economic structure that AI will fundamentally disrupt. Many of the careers we consider secure today may not exist when my son reaches working age. Conversely, entirely new categories of work will emerge that we can't yet imagine.\n\nThis uncertainty isn't cause for despair; it's cause for preparation. Rather than trying to predict which specific skills will be valuable, I need to help my son develop meta-skills: learning how to learn, adapting to change, and creating value in whatever context emerges.\n\n**The Social Contract**\n\nAI will force us to rethink fundamental social contracts around work, education, and human purpose. If AI can perform most productive work more efficiently than humans, what justifies human economic participation? How do we maintain social cohesion when traditional paths to status and meaning disappear?\n\nThese aren't just economic questions; they're deeply personal ones that will shape my son's sense of identity and purpose. I need to help him develop a sense of worth that isn't entirely dependent on economic productivity—while also ensuring he can navigate whatever economic realities emerge.\n\n**Preparing for Uncertainty**\n\nThe most honest thing I can say about my son's future is that I don't know what it will look like. The rate of technological change is accelerating beyond our ability to predict specific outcomes. But uncertainty doesn't mean helplessness.\n\nWhat I can do is help him develop the foundational capacities that will serve him regardless of how the details unfold:\n\n**Resilience**: The ability to adapt to setbacks and unexpected changes without losing core stability.\n\n**Curiosity**: A genuine interest in understanding how things work and why they matter.\n\n**Agency**: The confidence and skills to shape his environment rather than just react to it.\n\n**Connection**: Deep relationships with family, friends, and community that provide meaning beyond external achievements.\n\n**Values**: A clear sense of what matters and why, providing internal guidance when external structures become unreliable.\n\n**The Parenting Challenge**\n\nParenting at the dawn of super intelligence means accepting that I'm preparing my child for a world I can't fully comprehend. The skills that served my generation may be irrelevant for his. The assumptions that guided my choices may not apply to his decisions.\n\nThis is both humbling and liberating. Humbling because it forces me to acknowledge the limits of my knowledge and experience. Liberating because it frees me from trying to replicate my own path and instead focus on helping him develop his own.\n\nThe best gift I can give my son isn't a predetermined plan for his future. It's the tools, confidence, and support he needs to create his own path through whatever future emerges. In a world of accelerating change, the ability to adapt and thrive amid uncertainty isn't just useful—it's essential.\n\nAs I watch him grow, I'm constantly reminded that we're not just raising children; we're raising the first generation of truly AI-native humans. They will inhabit a world where artificial intelligence is as fundamental as electricity or the internet is to us. My job isn't to protect him from this reality, but to help him engage with it thoughtfully, creatively, and humanely.\n\nThe future is uncertain, but it's also full of possibility. By focusing on fundamental human capacities—creativity, empathy, resilience, and wisdom—I can help prepare my son not just to survive in an AI-transformed world, but to help shape it in ways that honor human flourishing."
        }
    ];

    const welcomeMessage = [
        { text: "sup, I'm Tim. I reverse engineer cross-platform malware, automate my home with AI agents that talk like ducks, and train like I'm about to step on stage every weekend. My life runs on gym splits, zero-day exploits, and WAY too many Google Sheets. When I'm not dissecting binary payloads or building self-hosted systems that outpace the market, I'm painting whatevers in my brain or designing smarter ways to log life, and raise my son in a collapsing world. If it's got a shell, I'll talk to it. If it's got reps, I'll log it. If it exists, I'm probably trying to automate it." },
        { text: ' ', hasBuffer: true },
        { text: "Making predictions is the only viable way to test your model of the world. It's easy to fall prey to hindsight bias, looking at past events and feeling like the outcome was obvious. The real test is to make forward-looking, falsifiable predictions and then check back later to see if they came true. This brain dump is an attempt to do just that." },
        { text: ' ', hasBuffer: true },
        { text: 'You can use the navigation above, or type `help` for a list of commands.', hasBuffer: true },
    ];

    // Global typing animation system
    const addToTypingQueue = React.useCallback((items) => {
        const itemsArray = Array.isArray(items) ? items : [items];
        setTypingQueue(prev => [...prev, ...itemsArray]);
    }, []);

    const clearTypingQueue = React.useCallback(() => {
        if (typingIntervalRef.current) {
            clearTimeout(typingIntervalRef.current);
            typingIntervalRef.current = null;
        }
        setTypingQueue([]);
        setIsGlobalTyping(false);
        setCurrentTypingItem(null);
    }, []);

    const processTypingQueue = React.useCallback(() => {
        setTypingQueue(prev => {
            if (prev.length === 0) {
                setIsGlobalTyping(false);
                setCurrentTypingItem(null);
                return prev;
            }

            const [nextItem, ...remainingQueue] = prev;
            
            // Handle empty or buffer items instantly
            if (!nextItem.text || nextItem.text.trim() === '' || nextItem.text.length < 5) {
                setFieldHistory(prevHistory => [...prevHistory, nextItem]);
                return remainingQueue;
            }

            // Smart typing speed based on content length and type
            const text = nextItem.text;
            let typingSpeed, intervalDelay;
            
            // For extremely long content or items marked for instant display, show instantly
            if (text.length > 800 || nextItem.fastTyping === false) {
                setFieldHistory(prevHistory => [...prevHistory, nextItem]);
                return remainingQueue;
            } else if (text.length > 300) {
                // Long content: very fast typing
                typingSpeed = Math.floor(text.length / 25); // Even faster
                intervalDelay = 6;
            } else if (text.length > 100) {
                // Medium content: fast typing
                typingSpeed = Math.floor(text.length / 35);
                intervalDelay = 10;
            } else if (text.length > 30) {
                // Short content: moderate typing for readability
                typingSpeed = 2;
                intervalDelay = 18;
            } else {
                // Very short content: character by character for realism
                typingSpeed = 1;
                intervalDelay = 30;
            }

            // Start typing animation for this item
            setIsGlobalTyping(true);
            setCurrentTypingItem(nextItem);

            // Add item to history immediately but with typing state
            setFieldHistory(prevHistory => [...prevHistory, {
                ...nextItem,
                text: '',
                isTyping: true,
                showCursor: true
            }]);

            let currentIndex = 0; // Define currentIndex in proper scope

            const typeNextChunk = () => {
                if (currentIndex >= text.length) {
                    // Typing complete
                    setFieldHistory(prevHistory => {
                        const newHistory = [...prevHistory];
                        const lastIndex = newHistory.length - 1;
                        if (newHistory[lastIndex]) {
                            newHistory[lastIndex] = {
                                ...newHistory[lastIndex],
                                text: text,
                                isTyping: false,
                                showCursor: false
                            };
                        }
                        return newHistory;
                    });

                    setCurrentTypingItem(null);
                    setIsGlobalTyping(false);
                    
                    // Final scroll
                    if (fieldRef.current) {
                        fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                    }
                    return;
                }

                // Add natural variation to typing speed
                const variation = Math.random() * 0.4 + 0.8; // 80% to 120% of base speed
                const adjustedSpeed = Math.max(1, Math.floor(typingSpeed * variation));
                
                currentIndex += adjustedSpeed;
                const currentText = text.substring(0, Math.min(currentIndex, text.length));

                // Update the history item with current progress
                setFieldHistory(prevHistory => {
                    const newHistory = [...prevHistory];
                    const lastIndex = newHistory.length - 1;
                    if (newHistory[lastIndex]) {
                        newHistory[lastIndex] = {
                            ...newHistory[lastIndex],
                            text: currentText,
                            showCursor: currentIndex < text.length
                        };
                    }
                    return newHistory;
                });

                // Auto-scroll to bottom during typing
                if (fieldRef.current) {
                    fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                }

                // Calculate next delay based on current character
                let nextDelay = intervalDelay;
                const lastChar = currentText.slice(-1);
                
                if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
                    nextDelay = intervalDelay * 3; // Longer pause at sentence endings
                } else if (lastChar === ',' || lastChar === ';' || lastChar === ':') {
                    nextDelay = intervalDelay * 2; // Pause at punctuation
                } else if (lastChar === ' ') {
                    nextDelay = intervalDelay * 0.8; // Slightly faster through spaces
                }

                // Schedule next typing chunk
                typingIntervalRef.current = setTimeout(typeNextChunk, nextDelay);
            };

            // Start the typing animation
            typeNextChunk();

            return remainingQueue;
        });
    }, []);

    // Process typing queue when items are added
    React.useEffect(() => {
        if (typingQueue.length > 0 && !isGlobalTyping && !currentTypingItem) {
            processTypingQueue();
        }
        // Always keep terminal scrolled to bottom during typing
        if (fieldRef.current) {
            fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
        }
    }, [typingQueue, isGlobalTyping, currentTypingItem, processTypingQueue]);

    // Auto-scroll during typing animation
    React.useEffect(() => {
        const scrollToBottom = () => {
            if (fieldRef.current) {
                fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
            }
        };

        if (isGlobalTyping) {
            // Scroll to bottom every 100ms during typing
            const scrollInterval = setInterval(scrollToBottom, 100);
            return () => clearInterval(scrollInterval);
        }
    }, [isGlobalTyping]);

    // Scroll to bottom when field history changes
    React.useEffect(() => {
        if (fieldRef.current) {
            fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
        }
    }, [fieldHistory]);

    // Enhanced addToHistory that uses typing animation
    const addToHistory = React.useCallback((items, useTyping = true) => {
        // Dim all previous content when new content is added
        setFieldHistory(prev => prev.map(item => ({ ...item, dimmed: true })));
        
        if (!useTyping) {
            // Instant addition for special cases
            const itemsArray = Array.isArray(items) ? items : [items];
            setFieldHistory(prev => [...prev, ...itemsArray.map(item => ({ ...item, dimmed: false }))]);
            return;
        }

        // Add to typing queue for animated addition
        addToTypingQueue(items);
        
        // Auto-scroll to bottom immediately and after a delay
        if (fieldRef.current) {
            fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
        }
        setTimeout(() => {
            if (fieldRef.current) {
                fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
            }
        }, 50);
    }, [addToTypingQueue]);

    // Enhanced article reading system
    const openArticle = React.useCallback((article, index) => {
        clearTypingQueue();
        setCurrentPage('reading');
        
        // Clear field and show reading interface
        setFieldHistory([]);
        
        // Format the complete document content
        const formattedContent = formatDocumentContent(article.content);
        
        const readingContent = [
            { text: `┌─────────────────────────────────────────────────────────────────┐`, hasBuffer: false, cssClass: 'terminal-border' },
            { text: `│ DOCUMENT READER v1.0                           [ESC] Back        │`, hasBuffer: false, cssClass: 'terminal-header' },
            { text: `├─────────────────────────────────────────────────────────────────┤`, hasBuffer: false, cssClass: 'terminal-border' },
            { text: `│ Title: ${article.title.padEnd(50, ' ')} │`, hasBuffer: false, cssClass: 'terminal-title' },
            { text: `│ Date:  ${article.date.padEnd(50, ' ')} │`, hasBuffer: false, cssClass: 'terminal-meta' },
            { text: `│ File:  ${article.file.padEnd(50, ' ')} │`, hasBuffer: true, cssClass: 'terminal-meta' },
            { text: `└─────────────────────────────────────────────────────────────────┘`, hasBuffer: true, cssClass: 'terminal-border' },
            ...formattedContent,
            { text: ' ', hasBuffer: true },
            { text: '┌─────────────────────────────────────────────────────────────────┐', cssClass: 'terminal-border' },
            { text: '│ End of document.                                                │', cssClass: 'terminal-footer' },
            { text: '│                                                                 │', cssClass: 'terminal-border' },
            { 
                text: '│ [← Back to Articles] Press [ESC] or click to return to library │', 
                cssClass: 'terminal-back-button',
                isClickable: true,
                onClick: () => {
                    clearTypingQueue();
                    setCurrentPage('writings');
                    setFieldHistory([]);
                    
                    const libraryContent = displayWritingsLibrary();
                    setFieldHistory([
                        { text: 'Writings:', hasBuffer: true, isHighlight: true },
                        ...libraryContent
                    ]);
                    
                    setTimeout(() => {
                        if (fieldRef.current) {
                            fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                        }
                    }, 10);
                }
            },
            { text: '└─────────────────────────────────────────────────────────────────┘', cssClass: 'terminal-border' },
            { text: ' ', hasBuffer: true },
            { text: ' ', hasBuffer: true },
            { text: ' ', hasBuffer: true }
        ];
        
        // Display everything instantly without typing animation
        setFieldHistory(readingContent);
        
        // Scroll to top for document reading (documents start at beginning)
        setTimeout(() => {
            if (fieldRef.current) {
                fieldRef.current.scrollTop = 0;
            }
        }, 10);
    }, [clearTypingQueue, formatDocumentContent]);

    // Document content formatting for smooth display
    const formatDocumentContent = React.useCallback((content) => {
        // Format content into readable paragraphs
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        
        const formatParagraph = (text) => {
            // Handle markdown bold syntax and preserve formatting
            return text.replace(/\*\*(.*?)\*\*/g, '$1');
        };
        
        // Format all content at once for instant display
        const allLines = [];
        
        paragraphs.forEach((paragraph, pIndex) => {
            const formattedParagraph = formatParagraph(paragraph);
            
            // Format paragraph for better terminal reading
            const maxWidth = 65;
            const words = formattedParagraph.split(' ');
            let currentLine = '';
            
            words.forEach(word => {
                if ((currentLine + word).length > maxWidth) {
                    if (currentLine) {
                        allLines.push({
                            text: currentLine.trim(),
                            hasBuffer: false,
                            cssClass: 'document-text'
                        });
                        currentLine = word + ' ';
                    } else {
                        allLines.push({
                            text: word,
                            hasBuffer: false,
                            cssClass: 'document-text'
                        });
                        currentLine = '';
                    }
                } else {
                    currentLine += word + ' ';
                }
            });
            
            if (currentLine.trim()) {
                allLines.push({
                    text: currentLine.trim(),
                    hasBuffer: false,
                    cssClass: 'document-text'
                });
            }
            
            // Add spacing between paragraphs (except for last paragraph)
            if (pIndex < paragraphs.length - 1) {
                allLines.push({ text: ' ', hasBuffer: true });
            }
        });
        
        return allLines;
    }, []);

    // Terminal file directory display system with previews
    const displayWritingsLibrary = React.useCallback(() => {
        // Sort articles by date (newest first)
        const sortedArticles = writingsData
            .map((article, index) => ({ ...article, index }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const directoryLines = [
            { text: 'tim@portfolio:~/writings$ ls -la --preview', cssClass: 'terminal-command', hasBuffer: false },
            { text: 'total 16', cssClass: 'terminal-ls-header', hasBuffer: false },
            { text: 'drwxr-xr-x 3 tim tim 4096 Aug  5 12:34 .', cssClass: 'terminal-ls-header', hasBuffer: false },
            { text: 'drwxr-xr-x 8 tim tim 4096 Aug  5 12:30 ..', cssClass: 'terminal-ls-header', hasBuffer: true }
        ];

        // Process each article
        sortedArticles.forEach(article => {
            // Parse actual date from article content
            const actualDate = new Date(article.date);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = monthNames[actualDate.getMonth()];
            const day = actualDate.getDate().toString().padStart(2, ' ');
            
            // Generate realistic time based on date
            const timeMap = {
                '2025-08-02': '14:30',
                '2025-07-15': '09:15', 
                '2025-05-28': '16:45',
                '2025-04-20': '11:20'
            };
            const time = timeMap[article.date] || '12:00';

            const fileSize = article.content.length.toString().padStart(5, ' ');
            const fileName = article.file;

            // File listing line
            directoryLines.push({
                text: `-rw-r--r-- 1 tim tim ${fileSize} ${month} ${day} ${time} ${fileName}`,
                cssClass: `terminal-file ${article.color ? 'article-' + article.color : ''}`,
                isClickable: true,
                onClick: () => openArticle(article, article.index),
                hasBuffer: false
            });

            // File preview (first 100 characters)
            const preview = article.content.length > 100 ?
                article.content.substring(0, 100).replace(/\s+\S*$/, '') + '...' :
                article.content;
            
            directoryLines.push({
                text: `  │ ${preview}`,
                cssClass: 'terminal-file-preview',
                isClickable: true,
                onClick: () => openArticle(article, article.index),
                hasBuffer: true
            });
        });

        // Add footer with command prompt
        directoryLines.push(
            { text: 'tim@portfolio:~/writings$ # Click any file to read, or use "cat filename.md"', cssClass: 'terminal-prompt-hint', hasBuffer: false }
        );

        return directoryLines;
    }, [writingsData, openArticle]);

    // Handle ESC key to return from document reader
    React.useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Escape' && currentPage === 'reading') {
                // Return to writings library (same logic as back button)
                clearTypingQueue();
                setCurrentPage('writings');
                setFieldHistory([]);
                
                const libraryContent = displayWritingsLibrary();
                setFieldHistory([
                    { text: 'Writings:', hasBuffer: true, isHighlight: true },
                    ...libraryContent
                ]);
                
                setTimeout(() => {
                    if (fieldRef.current) {
                        fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                    }
                }, 10);
            }
        };
        
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentPage, clearTypingQueue, displayWritingsLibrary]);

    const recognizedCommands = {
        'help': {
            purpose: 'Displays this help message.',
            execute: () => {
                const commands = Object.keys(recognizedCommands).map(cmd => {
                    return `${cmd.padEnd(15, ' ')} - ${recognizedCommands[cmd].purpose}`;
                });
                addToHistory([
                    { text: 'Available commands:', hasBuffer: true, isHighlight: true }, 
                    { text: commands.join('\n'), hasBuffer: true }
                ]);
                setCurrentPage('help');
            }
        },
        'about': {
            purpose: 'Displays information about me.',
            execute: () => {
                // Load about page instantly for better UX
                setFieldHistory([{ 
                    text: "My name is Tim, a designer and developer from Adelaide, Australia. I have a Master's in Computer Science and a Bachelor's in Design. I love creating things, from web apps to logos. When I'm not coding, you can find me at the gym, painting, or spending time with my wife Chiara and our dog Luna.", 
                    hasBuffer: true 
                }]);
                setCurrentPage('about');
                
                // Scroll to bottom
                setTimeout(() => {
                    if (fieldRef.current) {
                        fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                    }
                }, 10);
            }
        },
        'projects': {
            purpose: 'Shows my recent projects.',
            execute: () => {
                const projectLines = projectsData.flatMap(p => [
                    { text: p.title, isLink: true, url: p.url },
                    { text: `  ${p.synopsis}`, hasBuffer: true }
                ]);
                
                // Load projects page instantly for better UX
                setFieldHistory([
                    { text: 'Projects:', hasBuffer: true, isHighlight: true }, 
                    ...projectLines
                ]);
                setCurrentPage('projects');
                
                // Scroll to bottom
                setTimeout(() => {
                    if (fieldRef.current) {
                        fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                    }
                }, 10);
            }
        },
        'writings': {
            purpose: 'Opens the writings directory listing.',
            execute: (args) => {
                // Check if specific document number was provided
                if (args && args[0] && !isNaN(parseInt(args[0]))) {
                    const docNumber = parseInt(args[0]) - 1;
                    if (writingsData[docNumber]) {
                        openArticle(writingsData[docNumber], docNumber);
                        return;
                    }
                }

                clearTypingQueue();
                setCurrentPage('writings');

                // Display writings directory instantly
                const libraryContent = displayWritingsLibrary();
                setFieldHistory(libraryContent);
                
                // Scroll to bottom immediately
                setTimeout(() => {
                    if (fieldRef.current) {
                        fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                    }
                }, 10);
            }
        },
        'cat': {
            purpose: 'Read a specific article file (e.g., cat china-ai-domination.md).',
            execute: (args) => {
                if (!args || !args[0]) {
                    addToHistory([{ text: 'cat: missing file operand', isError: true, hasBuffer: true }]);
                    return;
                }

                const filename = args[0];
                const article = writingsData.find(w => w.file === filename);
                
                if (article) {
                    const index = writingsData.indexOf(article);
                    openArticle(article, index);
                } else {
                    addToHistory([{ text: `cat: ${filename}: No such file or directory`, isError: true, hasBuffer: true }]);
                }
            }
        },
        'ls': {
            purpose: 'List writings directory contents.',
            execute: (args) => {
                if (args && (args[0] === 'writings' || args[0] === '-la' || args[0] === '--preview')) {
                    // Show writings directory
                    clearTypingQueue();
                    setCurrentPage('writings');
                    const libraryContent = displayWritingsLibrary();
                    setFieldHistory(libraryContent);
                    
                    setTimeout(() => {
                        if (fieldRef.current) {
                            fieldRef.current.scrollTop = fieldRef.current.scrollHeight;
                        }
                    }, 10);
                } else {
                    // Navigate to writings
                    recognizedCommands['writings'].execute();
                }
            }
        },
        'head': {
            purpose: 'Show first few lines of an article (e.g., head china-ai-domination.md).',
            execute: (args) => {
                if (!args || !args[0]) {
                    addToHistory([{ text: 'head: missing file operand', isError: true, hasBuffer: true }]);
                    return;
                }

                const filename = args[0];
                const article = writingsData.find(w => w.file === filename);
                
                if (article) {
                    const lines = article.content.split('\n').slice(0, 10);
                    const preview = lines.join('\n');
                    
                    addToHistory([
                        { text: `==> ${filename} <==`, isHighlight: true, hasBuffer: false },
                        { text: preview, hasBuffer: true, cssClass: 'document-text' },
                        { text: `[Use "cat ${filename}" to read full article]`, cssClass: 'terminal-prompt-hint', hasBuffer: true }
                    ]);
                } else {
                    addToHistory([{ text: `head: ${filename}: No such file or directory`, isError: true, hasBuffer: true }]);
                }
            }
        },
        'clear': {
            purpose: 'Clears the terminal screen.',
            execute: () => {
                clearTypingQueue();
                setFieldHistory([]);
                setCurrentPage('home');
            }
        },
        'theme': {
            purpose: 'Switches the color theme (e.g., theme dark).',
            execute: (args) => {
                const newTheme = args[0];
                if (newTheme === 'dark' || newTheme === 'light') {
                    setTheme(newTheme);
                    addToHistory([{ text: `Theme set to ${newTheme}.`, hasBuffer: true }]);
                } else {
                    addToHistory([{ text: 'Invalid theme. Use "dark" or "light".', isError: true, hasBuffer: true }]);
                }
            }
        },
        'mode': {
            purpose: 'Switch between UX and CLI mode (e.g., mode cli).',
            execute: (args) => {
                const newMode = args[0];
                if (newMode === 'cli' || newMode === 'ux') {
                    setNavMode(newMode);
                    addToHistory([{ text: `Navigation mode switched to ${newMode.toUpperCase()}.`, hasBuffer: true }]);
                    setCurrentPage(newMode === 'cli' ? 'cli' : 'home');
                } else {
                    addToHistory([{ text: 'Invalid mode. Use "cli" or "ux".', isError: true, hasBuffer: true }]);
                }
            }
        },
        'exit': {
            purpose: 'Exits CLI mode.',
            execute: () => {
                setNavMode('ux');
                addToHistory([{ text: 'Exited CLI mode.', hasBuffer: true }]);
                setCurrentPage('home');
            }
        }
    };

    const processCommand = (input) => {
        const [command, ...args] = input.trim().toLowerCase().split(' ');
        if (command in recognizedCommands) {
            recognizedCommands[command].execute(args);
        } else {
            addToHistory([{ text: `Command not found: ${command}`, isError: true, hasBuffer: true }]);
        }
    };

    const handleTyping = (e) => {
        e.preventDefault();
        const { key } = e;

        if (key === 'Enter') {
            const newHistory = [...fieldHistory, { text: userInput, isCommand: true }];
            setFieldHistory(newHistory);
            
            if (userInput) {
                setCommandHistory([userInput, ...commandHistory]);
                setCommandHistoryIndex(0);
                processCommand(userInput);
            }
            setUserInput('');
            return;
        }

        if (key === 'Backspace') {
            setUserInput(userInput.slice(0, -1));
        } else if (key.length === 1) {
            setUserInput(userInput + key);
        } else if (key === 'ArrowUp') {
            if (commandHistoryIndex < commandHistory.length) {
                const newIndex = commandHistoryIndex + 1;
                setCommandHistoryIndex(newIndex);
                setUserInput(commandHistory[newIndex - 1]);
            }
        } else if (key === 'ArrowDown') {
            if (commandHistoryIndex > 0) {
                const newIndex = commandHistoryIndex - 1;
                setCommandHistoryIndex(newIndex);
                setUserInput(commandHistory[newIndex - 1] || '');
            }
        }
    };

    // Click/key handler to skip typing
    const handleSkipTyping = React.useCallback((e) => {
        if (isGlobalTyping && (e.type === 'click' || e.key === 'Escape' || e.key === 'Enter')) {
            if (currentTypingItem) {
                // Complete current item instantly
                setFieldHistory(prev => {
                    const newHistory = [...prev];
                    const lastIndex = newHistory.length - 1;
                    if (newHistory[lastIndex] && newHistory[lastIndex].isTyping) {
                        newHistory[lastIndex] = {
                            ...newHistory[lastIndex],
                            text: currentTypingItem.text,
                            isTyping: false,
                            showCursor: false
                        };
                    }
                    return newHistory;
                });
                
                // Clear current typing
                if (typingIntervalRef.current) {
                    clearTimeout(typingIntervalRef.current);
                    typingIntervalRef.current = null;
                }
                setCurrentTypingItem(null);
                setIsGlobalTyping(false);
                
                // Process next item after brief delay
                setTimeout(() => processTypingQueue(), 50);
            }
        }
    }, [isGlobalTyping, currentTypingItem, processTypingQueue]);

    React.useEffect(() => {
        // Load welcome message with faster typing for short content only
        const fastWelcomeMessage = welcomeMessage.map(item => ({
            ...item, 
            dimmed: false,
            fastTyping: item.text.length < 100 // Only type short messages, instant for long ones
        }));
        addToHistory(fastWelcomeMessage);
        if (fieldRef.current) {
            fieldRef.current.focus();
        }
    }, [addToHistory]);

    return (
        <>
            <div id="terminal-header">
                <AsciiNav handleNavClick={processCommand} currentPage={currentPage} />
                <TerminalDuckBanner />
            </div>
            <div 
                ref={fieldRef} 
                id="field" 
                className={theme.field.backgroundColor === '#222333' ? 'dark' : 'light'} 
                style={theme.field} 
                onKeyDown={handleTyping} 
                onClick={handleSkipTyping}
                tabIndex={0}
            >
                {fieldHistory.map((item, index) => {
                    const itemClasses = [
                        'history-item',
                        item.isCommand ? 'prompt' : '',
                        item.isError ? 'error' : '',
                        item.isHighlight ? 'highlight' : '',
                        item.isLink ? 'link' : '',
                        item.cssClass ? item.cssClass : '',
                        item.dimmed ? 'dimmed' : ''
                    ].join(' ');

                    const content = item.isLink ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">{item.text}</a>
                    ) : item.isClickable ? (
                        <span onClick={item.onClick} className="clickable-text" style={{ cursor: 'pointer' }}>
                            {parseMarkdownBold(item.text)}
                        </span>
                    ) : (
                        parseMarkdownBold(item.text)
                    );

                    return (
                        <div key={index} className={itemClasses} style={{ marginBottom: item.hasBuffer ? '1rem' : '0' }}>
                            {content}
                            {item.isTyping && item.showCursor && <span className="typing-cursor" />}
                        </div>
                    );
                })}
                {navMode === 'cli' && (
                    <div>
                        <span className="prompt">$</span>
                        <span id="query">{userInput}</span>
                        <span id="cursor" style={theme.cursor}></span>
                    </div>
                )}
            </div>
        </>
    );
};

// Terminal Component
const Terminal = ({ theme, setTheme }) => {
    const [maximized, setMaximized] = React.useState(false);
    const [title, setTitle] = React.useState('Duck Quack');

    const handleClose = () => (window.location.href = 'https://github.com/timmy16744');
    const handleMinMax = () => {
        setMaximized(!maximized);
        const field = document.querySelector('#field');
        if (field) field.focus();
    };

    return (
        <div id="terminal" style={maximized ? { height: '100vh', width: '100vw', maxWidth: '100vw' } : theme.terminal}>
            <div id="window" style={theme.window}>
                <button className="btn red" onClick={handleClose} />
                <button className="btn yellow" />
                <button className="btn green" onClick={handleMinMax} />
                <span id="title" style={{ color: theme.window.color }}>{title}</span>
            </div>
            <Field 
                theme={theme} 
                setTheme={setTheme} 
                setTitle={setTitle}
                maximized={maximized}
            />
        </div>
    );
};

// Initialize the app
ReactDOM.render(<App />, document.getElementById('root'));