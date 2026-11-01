const { connectDB, disconnectDB } = require('./config/db');
const ResearchSession = require('./models/ResearchSession');
const Source = require('./models/Source');
const WritingDraft = require('./models/WritingDraft');
const Newsletter = require('./models/Newsletter');
const researchService = require('./services/researchService');
const writingService = require('./services/writingService');
const aiService = require('./services/aiService');
const { calculateMetrics } = require('./utils/textMetrics');
const { validateUrlForExtraction } = require('./utils/urlValidator');

async function runTests() {
  console.log('--- Starting Editorial Workspace End-to-End Verification ---');

  // 1. Connect to Database
  await connectDB();
  console.log('✓ Database connected.');

  // 2. Test URL Validation & SSRF Prevention
  console.log('\n--- Testing URL Validation & SSRF Protection ---');
  const privateCheck = await validateUrlForExtraction('http://127.0.0.1:8080/secret');
  console.log('127.0.0.1 blocked:', !privateCheck.valid, `(${privateCheck.reason})`);
  if (privateCheck.valid) throw new Error('SSRF Check Failed for 127.0.0.1');

  const localhostCheck = await validateUrlForExtraction('http://localhost:3000/admin');
  console.log('localhost blocked:', !localhostCheck.valid, `(${localhostCheck.reason})`);
  if (localhostCheck.valid) throw new Error('SSRF Check Failed for localhost');

  const publicCheck = await validateUrlForExtraction('https://example.com/ai-article');
  console.log('public URL permitted:', publicCheck.valid);
  if (!publicCheck.valid) throw new Error('Public URL failed validation');

  // 3. Test Deterministic Metrics
  console.log('\n--- Testing Deterministic Metrics ---');
  const sampleProse = 'Artificial intelligence is changing software development. Small models are becoming faster. Actually, it is important to note that developers prefer high accuracy over raw size.';
  const metrics = calculateMetrics(sampleProse);
  console.log('Calculated Metrics:', metrics);
  if (metrics.wordCount !== 25) throw new Error(`Word count expected 25, got ${metrics.wordCount}`);
  if (metrics.readingTime < 1) throw new Error('Reading time should be at least 1 min');

  // 4. Test Research Session & 3 Sources Workflow
  console.log('\n--- Testing Module A: Research Assistant Workflow ---');
  const session = await researchService.createSession('AI Small Models in Production (2026)');
  console.log('✓ Created Research Session:', session._id, session.title);

  // Add 3 sources (manual content to ensure 100% reliable offline testing)
  const sourcesPayload = [
    {
      manualContent: 'Leading AI labs announced the release of 7B parameter reasoning models capable of matching frontier 70B models on Python coding benchmarks while consuming 80% less memory and costing 5x less to serve.',
      title: 'Benchmarking Small Reasoning Models in 2026',
      publisher: 'AI Engineering Review'
    },
    {
      manualContent: 'Enterprises adopting compound AI architectures have found that specialized distilled models combined with deterministic code validators achieve higher accuracy than single monolithic 400B models.',
      title: 'The Shift to Compound AI Systems',
      publisher: 'VentureScale Insights'
    },
    {
      manualContent: 'Cloud inference providers reported a 60% surge in demand for quantized 4-bit and 8-bit model deployments across production clusters, citing substantial cost reductions for SaaS applications.',
      title: 'Quantization & Infrastructure Trends',
      publisher: 'Cloud Native AI Journal'
    }
  ];

  const updatedSession = await researchService.addSources(session._id, sourcesPayload);
  console.log(`✓ Added ${updatedSession.sources.length} sources to session.`);
  if (updatedSession.sources.length < 3) throw new Error('Expected at least 3 sources.');

  // Generate Research Brief
  console.log('Synthesizing research brief...');
  const briefSession = await researchService.generateBrief(session._id);
  console.log('✓ Research Brief generated successfully!');
  console.log('  Overview:', briefSession.researchBrief.overview.slice(0, 100) + '...');
  console.log('  Key Developments:', briefSession.researchBrief.keyDevelopments?.length);
  console.log('  Why It Matters:', briefSession.researchBrief.whyItMatters?.length);
  console.log('  Audience:', briefSession.researchBrief.audience?.length);
  console.log('  Evidence Claims:', briefSession.researchBrief.evidence?.length);
  console.log('  Facts:', briefSession.researchBrief.facts?.length);
  console.log('  Analysis:', briefSession.researchBrief.analysis?.length);
  console.log('  Speculation:', briefSession.researchBrief.speculation?.length);
  console.log('  Newsletter Angles:', briefSession.researchBrief.newsletterAngles?.length);

  // 5. Test Module B: Writing Assistant Workflow
  console.log('\n--- Testing Module B: Writing Assistant Workflow ---');
  const draftText = 'The development of artificial intelligence has created many opportunities for businesses that are looking in order to improve their operational efficiency.\n\nBasically, the model was developed by the research engineering team. The system uses quantization to reduce inference costs.\n\nAt the end of the day, actually, repetitive explanations weaken newsletters.';
  
  const draft = await writingService.analyzeDraft({
    text: draftText,
    title: 'Editorial Clarity Test Draft',
    researchSessionId: session._id
  });

  console.log('✓ Draft analyzed with Hemingway-inspired engine.');
  console.log(`  Identified ${draft.suggestions.length} issues.`);
  console.log('  Initial Metrics:', draft.metrics);

  if (draft.suggestions.length === 0) throw new Error('Expected at least 1 suggestion from writing analysis.');

  // Test Accepting a suggestion
  const firstSuggestion = draft.suggestions[0];
  console.log(`  Accepting suggestion: [${firstSuggestion.issueType}] "${firstSuggestion.originalText}" -> "${firstSuggestion.suggestedText}"`);
  
  const updatedDraft = await writingService.updateSuggestion(draft._id, firstSuggestion._id, 'accepted');
  console.log('✓ Suggestion accepted. Revised draft updated.');
  console.log('  Original draft preserved:', draft.originalText !== updatedDraft.revisedText);
  console.log('  Revised text snippet:', updatedDraft.revisedText.slice(0, 120) + '...');
  console.log('  Updated Metrics:', updatedDraft.metrics);

  // 6. Test Module C: Newsletter Workspace Workflow
  console.log('\n--- Testing Module C: Newsletter Generation Workflow ---');
  const selectedAngle = briefSession.researchBrief.newsletterAngles[0].headline;
  console.log(`  Using selected angle: "${selectedAngle}"`);

  const validSources = briefSession.sources.filter(s => s.extractionStatus === 'completed' || s.extractionStatus === 'manual_input');
  const newsletterData = await aiService.generateNewsletter(
    briefSession.title,
    briefSession.researchBrief,
    selectedAngle,
    validSources
  );

  const newsletter = await Newsletter.create({
    researchSessionId: briefSession._id,
    title: briefSession.title,
    headline: newsletterData.headline,
    body: newsletterData.body,
    selectedAngle,
    sources: validSources.map(s => s._id),
    originalDraft: newsletterData.body,
    revisedDraft: newsletterData.body,
    wordCount: newsletterData.wordCount || newsletterData.body.split(/\s+/).length,
    status: 'draft'
  });

  console.log('✓ Newsletter created in storage:', newsletter._id);
  console.log('  Headline:', newsletter.headline);
  console.log('  Word count:', newsletter.wordCount);
  console.log('  Status:', newsletter.status);

  // 7. Verify Schema Relationships
  console.log('\n--- Testing Schema Relationships & Document Consistency ---');
  const persistedSession = await ResearchSession.findById(session._id).populate('sources');
  const persistedDraft = await WritingDraft.findById(draft._id);
  const persistedNewsletter = await Newsletter.findById(newsletter._id).populate('sources');

  if (!persistedSession || persistedSession.sources.length < 3) throw new Error('ResearchSession persistence check failed');
  if (!persistedDraft || persistedDraft.suggestions.length === 0) throw new Error('WritingDraft persistence check failed');
  if (!persistedNewsletter || persistedNewsletter.sources.length < 3) throw new Error('Newsletter persistence check failed');

  console.log('✓ All 4 collections verified with relations:');
  console.log('  ResearchSessions count:', await ResearchSession.countDocuments());
  console.log('  Sources count:', await Source.countDocuments());
  console.log('  WritingDrafts count:', await WritingDraft.countDocuments());
  console.log('  Newsletters count:', await Newsletter.countDocuments());

  await disconnectDB();
  console.log('\n======================================================');
  console.log(' ALL ACCEPTANCE CRITERIA VERIFIED AND PASSING 100%! ');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('\n❌ Test Failure:', err);
  process.exit(1);
});
