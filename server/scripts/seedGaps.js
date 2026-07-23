/* eslint-disable no-console */
// Additive, non-destructive seed: fills only collections that are currently
// empty (FAQTopic, Abstract, SupportTicket, NewsletterSubscriber) and links
// existing FAQs to the new topics. Never touches collections that already
// have data (Registration, ContactMessage, SpeakerApplication,
// SponsorshipInquiry, Speaker, Testimonial, NewsArticle, etc.).
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Edition           = require('../models/Edition');
const ScientificSession = require('../models/ScientificSession');
const FAQ                = require('../models/FAQ');
const FAQTopic           = require('../models/FAQTopic');
const Abstract            = require('../models/Abstract');
const SupportTicket       = require('../models/SupportTicket');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');

const log = (msg) => console.log(`  ✓ ${msg}`);
const skip = (msg) => console.log(`  – ${msg} (already has data, skipped)`);
const section = (msg) => console.log(`\n► ${msg}`);

async function seedFAQTopicsAndLink() {
  section('FAQ topics...');
  const existingTopics = await FAQTopic.countDocuments();
  if (existingTopics > 0) return skip('FAQ topics');

  const topics = await FAQTopic.insertMany([
    { name: 'About the congress',       subtitle: 'General information about the event.',      icon: 'info',        displayOrder: 1, isActive: true },
    { name: 'Abstract Submission',        subtitle: 'Submitting and presenting your research.',   icon: 'file-text',   displayOrder: 2, isActive: true },
    { name: 'Registration & Pricing',     subtitle: 'Fees, discounts, and cancellation policy.',   icon: 'credit-card', displayOrder: 3, isActive: true },
    { name: 'Attending & Virtual Access', subtitle: 'In-person and virtual attendance options.',   icon: 'video',       displayOrder: 4, isActive: true },
    { name: 'Sponsorship & Exhibits',     subtitle: 'Partnering with the Aging congress.',         icon: 'users',       displayOrder: 5, isActive: true },
  ]);
  log(`${topics.length} FAQ topics created`);

  const [about, abstractTopic, pricing, attending, sponsorship] = topics;
  const questionTopicMap = {
    'What is the Aging congress?': about._id,
    'Who can submit an abstract?': abstractTopic._id,
    'What are the abstract submission requirements?': abstractTopic._id,
    'What presentation formats are available?': abstractTopic._id,
    'When will I receive notification of acceptance?': abstractTopic._id,
    'Is there a student discount?': pricing._id,
    'Can I attend virtually?': attending._id,
    'What is the cancellation and refund policy?': pricing._id,
    'Are visa invitation letters provided?': pricing._id,
    'How do I apply for sponsorship or exhibition space?': sponsorship._id,
  };

  const faqs = await FAQ.find({ topic: { $exists: false } });
  let linked = 0;
  for (const faq of faqs) {
    const topicId = questionTopicMap[faq.question];
    if (topicId) {
      faq.topic = topicId;
      await faq.save();
      linked += 1;
    }
  }
  log(`${linked} existing FAQs linked to topics`);
}

async function seedAbstracts() {
  section('Abstract submissions...');
  const existing = await Abstract.countDocuments();
  if (existing > 0) return skip('Abstract submissions');

  const edition = await Edition.findOne({ isActive: true }) || await Edition.findOne().sort({ createdAt: -1 });
  if (!edition) return console.log('  ! No edition found skipping abstracts');

  const sessions = await ScientificSession.find({ edition: edition._id });
  const byTitle = (needle) => sessions.find((s) => s.title.toLowerCase().includes(needle.toLowerCase())) || sessions[0];

  const molecular  = byTitle('Molecular');
  const senolytics = byTitle('Senolytics');
  const neuro      = byTitle('Neuro');
  const cardio     = byTitle('Cardiovascular');
  const metabolic  = byTitle('Metabolic') || byTitle('Neuroscience');
  const oncology   = byTitle('Oncology');
  const frailty    = byTitle('Frailty');
  const ai         = byTitle('AI');

  await Abstract.insertMany([
    { edition: edition._id, firstName: 'Mei',      lastName: 'Zhang',      email: 'mei.zhang@example.edu',      phone: '+86 138 0013 8000', country: 'China',       organization: 'Peking University',            presentationType: 'oral_inperson',   topic: molecular?._id,  abstractTitle: 'Telomerase Reactivation Reverses Senescence Markers in Aged Fibroblasts', abstractText: 'This study examines the effects of controlled telomerase reactivation on senescence-associated markers in primary human fibroblasts derived from aged donors, demonstrating measurable reductions in p16INK4a expression and improved proliferative capacity.', keywords: 'telomerase, senescence, fibroblasts', coAuthors: 'Li Wei, Chen Yu', status: 'approved',    submittedAt: new Date('2025-05-12') },
    { edition: edition._id, firstName: 'Daniel',   lastName: 'Okafor',     email: 'd.okafor@example.edu',       phone: '+234 803 555 0192', country: 'Nigeria',     organization: 'University of Lagos',          presentationType: 'poster_inperson', topic: senolytics?._id, abstractTitle: 'Dasatinib and Quercetin Combination Therapy in a Murine Model of Age-Related Frailty', abstractText: 'We evaluated the senolytic combination of dasatinib and quercetin in aged mice, observing significant improvements in grip strength, gait speed, and reductions in circulating senescence-associated secretory phenotype (SASP) factors.', keywords: 'senolytics, frailty, SASP', coAuthors: 'Adaeze Nwosu', status: 'approved',   submittedAt: new Date('2025-05-18') },
    { edition: edition._id, firstName: 'Sophia',   lastName: 'Mueller',    email: 'sophia.mueller@example.edu', phone: '+49 30 1234 5678',  country: 'Germany',     organization: 'Charité Berlin',               presentationType: 'oral_virtual',    topic: neuro?._id,      abstractTitle: "Tau Propagation Dynamics Across Cortical Regions in Early-Stage Alzheimer's Disease", abstractText: "Using longitudinal PET imaging, we mapped the spread of tau pathology across cortical networks in a cohort of 84 patients with early-stage Alzheimer's disease, identifying novel predictive biomarkers of progression rate.", keywords: "tau, Alzheimer's, PET imaging", coAuthors: 'Hans Richter, Anna Fischer', status: 'under_review', submittedAt: new Date('2025-06-02') },
    { edition: edition._id, firstName: 'Carlos',   lastName: 'Reyes',      email: 'carlos.reyes@example.edu',   phone: '+52 55 1234 5678',  country: 'Mexico',      organization: 'UNAM',                          presentationType: 'poster_virtual',  topic: cardio?._id,     abstractTitle: 'Arterial Stiffness as a Predictor of Cardiovascular Events in Octogenarians', abstractText: 'A prospective cohort study of 312 octogenarians examining pulse wave velocity as a predictive marker for major adverse cardiovascular events over a 5-year follow-up period.', keywords: 'arterial stiffness, cardiovascular risk, octogenarians', coAuthors: '', status: 'pending', submittedAt: new Date('2025-06-20') },
    { edition: edition._id, firstName: 'Priya',    lastName: 'Sharma',     email: 'priya.sharma@example.edu',   phone: '+91 98765 43210',   country: 'India',       organization: 'AIIMS New Delhi',              presentationType: 'oral_inperson',   topic: metabolic?._id,  abstractTitle: 'Caloric Restriction Mimetics and AMPK Activation in Skeletal Muscle Aging', abstractText: 'We investigated the effects of a novel AMPK-activating compound on mitochondrial biogenesis and insulin sensitivity in skeletal muscle biopsies from healthy older adults undergoing a 12-week intervention.', keywords: 'AMPK, caloric restriction, muscle aging', coAuthors: 'Rajesh Kumar', status: 'approved', submittedAt: new Date('2025-05-25') },
    { edition: edition._id, firstName: 'Olumide',  lastName: 'Adeyemi',    email: 'o.adeyemi@example.edu',      phone: '+234 802 555 0147', country: 'Nigeria',     organization: 'University of Ibadan',         presentationType: 'poster_inperson', topic: oncology?._id,   abstractTitle: 'Immunosenescence and Response to Checkpoint Inhibitor Therapy in Elderly Cancer Patients', abstractText: 'Retrospective analysis of 156 elderly patients receiving PD-1/PD-L1 checkpoint inhibitors, correlating markers of immunosenescence with treatment response and progression-free survival.', keywords: 'immunosenescence, checkpoint inhibitors, geriatric oncology', coAuthors: 'Folake Bello', status: 'rejected', adminNotes: 'Sample size too small for the claimed statistical power; encourage resubmission with expanded cohort.', submittedAt: new Date('2025-06-10') },
    { edition: edition._id, firstName: 'Isabella', lastName: 'Conti',      email: 'isabella.conti@example.edu', phone: '+39 06 1234 5678',  country: 'Italy',       organization: 'Sapienza University of Rome',  presentationType: 'oral_virtual',    topic: frailty?._id,    abstractTitle: 'Resistance Training Protocols for Sarcopenia Reversal in Community-Dwelling Older Adults', abstractText: 'A randomized controlled trial comparing two resistance training protocols in 210 community-dwelling adults aged 70+, measuring changes in appendicular lean mass, gait speed, and SPPB scores.', keywords: 'sarcopenia, resistance training, frailty', coAuthors: 'Marco Bianchi, Giulia Russo', status: 'approved', submittedAt: new Date('2025-05-30') },
    { edition: edition._id, firstName: 'Wei',      lastName: 'Tan',        email: 'wei.tan@example.edu',        phone: '+65 6123 4567',     country: 'Singapore',   organization: 'National University of Singapore', presentationType: 'oral_inperson', topic: ai?._id,        abstractTitle: 'Deep Learning-Based Biological Age Prediction from Retinal Fundus Images', abstractText: 'We trained a convolutional neural network on 45,000 retinal fundus images to predict biological age, achieving a mean absolute error of 3.2 years and identifying accelerated aging in diabetic subgroups.', keywords: 'deep learning, biological age, retinal imaging', coAuthors: 'Hui Ling Koh', status: 'approved', submittedAt: new Date('2025-06-05') },
    { edition: edition._id, firstName: 'Amina',    lastName: 'Diallo',     email: 'amina.diallo@example.edu',   phone: '+221 77 123 4567',  country: 'Senegal',     organization: 'Cheikh Anta Diop University',  presentationType: 'poster_virtual',  topic: molecular?._id,  abstractTitle: 'Epigenetic Clock Acceleration Associated with Chronic Psychosocial Stress in West African Cohorts', abstractText: 'Using the GrimAge epigenetic clock, we assessed biological age acceleration in a cohort of 198 adults exposed to varying levels of chronic psychosocial stress, finding significant associations with cortisol dysregulation.', keywords: 'epigenetic clock, stress, GrimAge', coAuthors: 'Fatou Ndiaye', status: 'under_review', submittedAt: new Date('2025-06-25') },
    { edition: edition._id, firstName: 'Robert',   lastName: 'Hayes',      email: 'robert.hayes@example.edu',   phone: '+1 617 555 0134',   country: 'USA',         organization: 'Boston University',            presentationType: 'oral_inperson',   topic: metabolic?._id,  abstractTitle: 'NAD+ Precursor Supplementation and Mitochondrial Function in Aged Human Skeletal Muscle', abstractText: 'A double-blind placebo-controlled trial of nicotinamide riboside supplementation in 96 older adults, assessing changes in mitochondrial respiratory capacity via high-resolution respirometry.', keywords: 'NAD+, mitochondria, nicotinamide riboside', coAuthors: 'Jennifer Walsh', status: 'pending', submittedAt: new Date('2025-06-28') },
    { edition: edition._id, firstName: 'Hana',     lastName: 'Kobayashi',  email: 'hana.kobayashi@example.edu', phone: '+81 3 1234 5678',   country: 'Japan',       organization: 'University of Tokyo',          presentationType: 'poster_inperson', topic: neuro?._id,      abstractTitle: 'Gut Microbiome Composition and Cognitive Decline Trajectories in a Longitudinal Japanese Cohort', abstractText: 'We characterized gut microbiome diversity in 267 participants over a 6-year longitudinal study, identifying specific taxa associated with slower rates of cognitive decline.', keywords: 'gut microbiome, cognitive decline, longitudinal study', coAuthors: 'Takeshi Yamamoto', status: 'approved', submittedAt: new Date('2025-06-08') },
    { edition: edition._id, firstName: 'Emma',     lastName: 'Johansson',  email: 'emma.johansson@example.edu', phone: '+46 8 123 456',     country: 'Sweden',      organization: 'Karolinska Institute',         presentationType: 'oral_virtual',    topic: cardio?._id,     abstractTitle: 'Sex Differences in Vascular Aging Trajectories: A 20-Year Population Cohort Analysis', abstractText: 'Analysis of vascular aging biomarkers across sex in a 20-year population-based cohort of 4,200 participants, revealing divergent trajectories in arterial elasticity post-menopause.', keywords: 'vascular aging, sex differences, cohort study', coAuthors: 'Erik Lindgren', status: 'under_review', submittedAt: new Date('2025-07-01') },
  ]);
  log('12 abstract submissions created (mixed statuses)');
}

async function seedSupportTickets() {
  section('Support tickets...');
  const existing = await SupportTicket.countDocuments();
  if (existing > 0) return skip('Support tickets');

  await SupportTicket.insertMany([
    { name: 'Faisal Al-Sayed',  email: 'faisal.alsayed@example.com',  subject: 'Cannot upload abstract file', message: 'I keep getting an error when trying to upload my abstract PDF. The file is 8MB and in the correct format. Can you help me troubleshoot?', status: 'resolved',    submittedAt: new Date('2025-06-01') },
    { name: 'Charlotte Dubois', email: 'charlotte.dubois@example.com', subject: 'Payment charged twice',      message: 'I was charged twice for my registration fee on my credit card statement. Please investigate and refund the duplicate charge.', status: 'in_progress', submittedAt: new Date('2025-06-08') },
    { name: 'Kenji Watanabe',   email: 'kenji.watanabe@example.com',  subject: 'Unable to reset password',   message: 'The password reset email for my registration portal account never arrives, even after multiple attempts. My spam folder is also empty.', status: 'open',        submittedAt: new Date('2025-06-16') },
    { name: 'Sofia Ricci',      email: 'sofia.ricci@example.com',     subject: 'Wrong presentation type selected', message: 'I accidentally selected "Poster" instead of "Oral" during submission. Is it possible to change this before the review deadline?', status: 'resolved', submittedAt: new Date('2025-06-21') },
    { name: 'Benjamin Osei',    email: 'benjamin.osei@example.com',   subject: 'Confirmation email not received', message: 'I completed my registration payment successfully but never received a confirmation email. Can you resend it or confirm my registration status?', status: 'in_progress', submittedAt: new Date('2025-06-29') },
    { name: 'Nadia Petrova',    email: 'nadia.petrova@example.com',   subject: 'Co-author cannot be added to abstract', message: 'The submission form only allows me to add 3 co-authors, but our paper has 5. Is there a way to add all co-authors?', status: 'open', submittedAt: new Date('2025-07-04') },
  ]);
  log('6 support tickets created (mixed statuses)');
}

async function seedNewsletterSubscribers() {
  section('Newsletter subscribers...');
  const existing = await NewsletterSubscriber.countDocuments();
  if (existing > 0) return skip('Newsletter subscribers');

  await NewsletterSubscriber.insertMany([
    { email: 'subscriber1@example.com', subscribedAt: new Date('2025-03-05') },
    { email: 'subscriber2@example.com', subscribedAt: new Date('2025-03-18') },
    { email: 'subscriber3@example.com', subscribedAt: new Date('2025-04-02') },
    { email: 'subscriber4@example.com', subscribedAt: new Date('2025-04-20') },
    { email: 'subscriber5@example.com', subscribedAt: new Date('2025-05-11') },
    { email: 'subscriber6@example.com', subscribedAt: new Date('2025-05-29') },
    { email: 'subscriber7@example.com', subscribedAt: new Date('2025-06-14') },
    { email: 'subscriber8@example.com', subscribedAt: new Date('2025-07-02') },
  ]);
  log('8 newsletter subscribers created');
}

async function main() {
  console.log('\n══════════════════════════════════════════');
  console.log('  Aging congress Gap-Fill Seed (additive)  ');
  console.log('══════════════════════════════════════════');
  console.log('  Only fills empty collections. Existing data is never modified or deleted.');

  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('\nConnected to MongoDB:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***@'));

  await seedFAQTopicsAndLink();
  await seedAbstracts();
  await seedSupportTickets();
  await seedNewsletterSubscribers();

  console.log('\n══════════════════════════════════════════');
  console.log('  Gap-fill seed complete!');
  console.log('══════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nGap-fill seed failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
