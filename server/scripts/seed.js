/* eslint-disable no-console */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const Admin              = require('../models/Admin');
const SiteSettings       = require('../models/SiteSettings');
const StaticPage         = require('../models/StaticPage');
const Edition            = require('../models/Edition');
const ScientificSession  = require('../models/ScientificSession');
const Speaker            = require('../models/Speaker');
const CommitteeMember    = require('../models/CommitteeMember');
const Organizer          = require('../models/Organizer');
const Venue              = require('../models/Venue');
const ImportantDate      = require('../models/ImportantDate');
const ProgramSlot        = require('../models/ProgramSlot');
const PricingTier        = require('../models/PricingTier');
const Partner            = require('../models/Partner');
const NewsArticle        = require('../models/NewsArticle');
const Report             = require('../models/Report');
const Download           = require('../models/Download');
const Brochure           = require('../models/Brochure');
const Testimonial        = require('../models/Testimonial');
const FAQ                = require('../models/FAQ');
const FAQTopic           = require('../models/FAQTopic');
const Abstract           = require('../models/Abstract');
const Registration       = require('../models/Registration');
const ContactMessage     = require('../models/ContactMessage');
const SupportTicket      = require('../models/SupportTicket');
const SpeakerApplication = require('../models/SpeakerApplication');
const SponsorshipInquiry = require('../models/SponsorshipInquiry');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');

const FORCE = process.argv.includes('--force');

const log = (msg) => console.log(`  ✓ ${msg}`);
const section = (msg) => console.log(`\n► ${msg}`);

async function clearAll() {
  section('Clearing existing data...');
  const models = [
    Admin, SiteSettings, StaticPage, Edition, ScientificSession,
    Speaker, CommitteeMember, Organizer, Venue, ImportantDate,
    ProgramSlot, PricingTier, Partner, NewsArticle, Report,
    Download, Brochure, Testimonial, FAQ, FAQTopic, Abstract,
    Registration, ContactMessage, SupportTicket, SpeakerApplication,
    SponsorshipInquiry, NewsletterSubscriber,
  ];
  for (const M of models) {
    await M.deleteMany({});
  }
  log('All collections cleared');
}

// ─────────────────────────────────────────────
// 1. ADMINS
// ─────────────────────────────────────────────
async function seedAdmins() {
  section('Seeding admins...');
  await Admin.create([
    {
      name: 'Super Admin',
      email: 'admin@agingcongress.com',
      password: 'Admin@123456',
      role: 'super_admin',
    },
    {
      name: 'Content Editor',
      email: 'editor@agingcongress.com',
      password: 'Editor@123456',
      role: 'editor',
    },
  ]);
  log('super_admin: admin@agingcongress.com / Admin@123456');
  log('editor:      editor@agingcongress.com / Editor@123456');
}

// ─────────────────────────────────────────────
// 2. SITE SETTINGS
// ─────────────────────────────────────────────
async function seedSiteSettings() {
  section('Seeding site settings...');
  await SiteSettings.create({
    siteName: 'Aging congress',
    tagline: 'Advancing the Science of Healthy Aging',
    contactEmail: 'info@agingcongress.com',
    contactPhone: '+1 (555) 234-5678',
    address: '123 Research Blvd, Boston, MA 02115, USA',
    socialLinks: {
      linkedin:  'https://linkedin.com/company/aging-congress',
      twitter:   'https://twitter.com/agingconf',
      facebook:  'https://facebook.com/agingcongress',
      youtube:   'https://youtube.com/@agingcongress',
      instagram: 'https://instagram.com/agingcongress',
    },
    seo: {
      title:       'Aging congress 2025 Science of Healthy Aging',
      description: 'The premier international congress on geroscience, longevity research, and translational aging medicine.',
      keywords:    'aging congress, geroscience, longevity, healthy aging, aging research 2025',
    },
    footerText: '© 2025 Aging congress. All rights reserved.',
  });
  log('SiteSettings created');
}

// ─────────────────────────────────────────────
// 3. STATIC PAGES
// ─────────────────────────────────────────────
async function seedStaticPages() {
  section('Seeding static pages...');
  await StaticPage.create([
    {
      key: 'guidelines',
      title: 'Presentation Guidelines',
      content: `<h2>Abstract Submission Guidelines</h2>
<p>All abstracts submitted to the Aging congress must adhere to the following guidelines to ensure a fair and consistent review process.</p>
<h3>General Requirements</h3>
<ul>
  <li>Abstracts must be written in English.</li>
  <li>Word count: 250–400 words (excluding title and author information).</li>
  <li>Each corresponding author may submit a maximum of 2 abstracts.</li>
  <li>Abstracts must report original, previously unpublished research.</li>
</ul>
<h3>Structure</h3>
<p>Abstracts should follow the IMRaD structure: Introduction, Methods, Results, and Conclusions. Clinical case reports should include background, case description, and discussion.</p>
<h3>Presentation Formats</h3>
<ul>
  <li><strong>Oral (In-Person):</strong> 15-minute presentation + 5-minute Q&A. Slide deck required (PowerPoint/PDF).</li>
  <li><strong>Poster (In-Person):</strong> Printed poster, A0 size (841 × 1189 mm), portrait orientation.</li>
  <li><strong>Virtual Oral:</strong> Pre-recorded 12-minute video + live Q&A via Zoom.</li>
</ul>
<h3>Review Process</h3>
<p>All submissions undergo double-blind peer review by the Scientific Committee. Acceptance notifications are sent within 4 weeks of the submission deadline.</p>`,
    },
    {
      key: 'publication',
      title: 'Publication Policy',
      content: `<h2>Publication Policy</h2>
<p>The Aging congress is committed to open and ethical dissemination of research findings.</p>
<h3>congress Proceedings</h3>
<p>Accepted abstracts will be published in the official congress Proceedings, which will be indexed in major academic databases including PubMed and Scopus. Authors of accepted abstracts must provide written consent for publication.</p>
<h3>Extended Papers</h3>
<p>Authors of high-scoring abstracts will be invited to submit full manuscripts to the <em>Journal of Translational Aging Research</em> (partner journal, ISSN: 2045-9918). Submitted papers undergo standard single-blind peer review independent of the congress review process.</p>
<h3>Open Access</h3>
<p>All congress proceedings are published under a Creative Commons CC BY 4.0 license. Authors retain copyright of their work.</p>
<h3>Plagiarism & Ethics</h3>
<p>Submissions must represent the authors' own original work. Plagiarism, data fabrication, or falsification will result in immediate rejection and may be reported to the author's institution.</p>`,
    },
    {
      key: 'terms',
      title: 'Terms & Conditions',
      content: `<h2>Terms &amp; Conditions</h2>
<p>By registering for or submitting to the Aging congress, you agree to the following terms.</p>
<h3>Registration</h3>
<ul>
  <li>Registration fees are non-refundable after the cancellation deadline (30 days before the congress start).</li>
  <li>Substitutions may be made up to 7 days before the event with written notice to the organizers.</li>
  <li>The organizing committee reserves the right to cancel or postpone the event due to force majeure. Full refunds will be issued in such cases.</li>
</ul>
<h3>Photography &amp; Recording</h3>
<p>The congress may be photographed and recorded. By attending, you consent to appearing in official congress media. Speaker presentations may be recorded for post-congress distribution unless the speaker opts out in writing.</p>
<h3>Code of Conduct</h3>
<p>All attendees, speakers, and sponsors are expected to behave professionally and respectfully. Harassment of any kind will not be tolerated. Violations may result in removal from the congress without refund.</p>
<h3>Liability</h3>
<p>The organizers are not liable for any loss, injury, or damage sustained by attendees during the congress or related events.</p>`,
    },
  ]);
  log('StaticPages: guidelines, publication, terms');
}

// ─────────────────────────────────────────────
// 4. EDITION
// ─────────────────────────────────────────────
async function seedEdition() {
  section('Seeding edition...');
  const edition = await Edition.create({
    title: '7th International Aging congress',
    year: 2025,
    theme: 'From Molecules to Populations: Translating Longevity Research',
    startDate: new Date('2025-10-15'),
    endDate:   new Date('2025-10-17'),
    city: 'Boston',
    country: 'USA',
    status: 'active',
    isActive: true,
    description: 'The 7th International Aging congress brings together leading geroscientists, clinicians, and policymakers to advance the translation of aging research into healthspan-extending interventions.',
    highlights: [
      { label: 'Expected Attendees', value: '1,200+' },
      { label: 'Countries Represented', value: '45+' },
      { label: 'Scientific Sessions', value: '8' },
      { label: 'Keynote Speakers', value: '12' },
    ],
  });
  log(`Edition: "${edition.title}" (${edition._id})`);
  return edition;
}

// ─────────────────────────────────────────────
// 5. SCIENTIFIC SESSIONS
// ─────────────────────────────────────────────
async function seedSessions(edition) {
  section('Seeding scientific sessions...');
  const sessions = await ScientificSession.insertMany([
    { edition: edition._id, title: 'Molecular Mechanisms of Aging',         description: 'Explore the fundamental cellular and molecular processes driving biological aging, including telomere dynamics, DNA damage responses, and epigenetic clocks.',       icon: '🧬', displayOrder: 1 },
    { edition: edition._id, title: 'Senolytics & Senotherapeutics',          description: 'Latest advances in targeting senescent cells to delay age-related diseases, covering senolytic drug candidates and clinical trial data.',                              icon: '💊', displayOrder: 2 },
    { edition: edition._id, title: 'Neurodegeneration & Brain Aging',        description: 'Mechanisms underlying Alzheimer\'s disease, Parkinson\'s disease, and other neurodegenerative conditions with a focus on age-related risk factors.',                 icon: '🧠', displayOrder: 3 },
    { edition: edition._id, title: 'Cardiovascular Aging',                   description: 'Age-related changes in cardiac function, arterial stiffness, and vascular biology. Preventive strategies and emerging therapeutic targets.',                          icon: '❤️', displayOrder: 4 },
    { edition: edition._id, title: 'Metabolic Health & Longevity',           description: 'Interactions between metabolic dysregulation and aging, including mTOR, IGF-1, AMPK pathways. Dietary interventions and caloric restriction mimetics.',                icon: '⚗️', displayOrder: 5 },
    { edition: edition._id, title: 'Geriatric Oncology',                     description: 'Cancer biology in the context of aging. Immunosenescence, age-adapted treatment protocols, and the tumor microenvironment in older patients.',                         icon: '🔬', displayOrder: 6 },
    { edition: edition._id, title: 'Frailty, Sarcopenia & Rehabilitation',   description: 'Clinical assessment and management of frailty and muscle wasting. Exercise interventions, nutritional strategies, and rehabilitation outcomes.',                       icon: '🏃', displayOrder: 7 },
    { edition: edition._id, title: 'AI & Big Data in Aging Research',        description: 'Machine learning approaches to aging biomarker discovery, digital health technologies for monitoring older adults, and AI-driven drug discovery.',                     icon: '💻', displayOrder: 8 },
  ]);
  log(`${sessions.length} scientific sessions created`);
  return sessions;
}

// ─────────────────────────────────────────────
// 6. SPEAKERS
// ─────────────────────────────────────────────
async function seedSpeakers(edition) {
  section('Seeding speakers...');
  const speakerData = [
    { fullName: 'Dr. Elena Vasquez',    designation: 'Professor of Geroscience',          organization: 'Harvard Medical School',             country: 'USA',          biography: 'Dr. Vasquez is a pioneering researcher in cellular senescence and its role in age-related diseases. She leads the Longevity Biology Lab at HMS and has published over 200 peer-reviewed articles.',    isFeatured: true,  displayOrder: 1 },
    { fullName: 'Prof. James Kirkland', designation: 'Chair, Department of Aging Medicine', organization: 'Mayo Clinic',                        country: 'USA',          biography: 'Professor Kirkland pioneered the clinical translation of senolytics. His landmark trials on dasatinib and quercetin have transformed the field of translational aging medicine.',                        isFeatured: true,  displayOrder: 2 },
    { fullName: 'Dr. Nir Barzilai',     designation: 'Director, Institute for Aging Research', organization: 'Albert Einstein College of Medicine', country: 'USA',      biography: 'Dr. Barzilai studies centenarians and their genetic secrets. He is the principal investigator of the TAME (Targeting Aging with Metformin) trial, the first FDA-approved clinical trial targeting aging.', isFeatured: true,  displayOrder: 3 },
    { fullName: 'Prof. Linda Partridge', designation: 'Director, Max Planck Inst. for Biology of Ageing', organization: 'Max Planck Institute',   country: 'Germany',     biography: 'A world leader in the genetics of aging, Prof. Partridge has used model organisms to uncover conserved pathways that extend lifespan, including the insulin/IGF-1 signaling pathway.',               isFeatured: true,  displayOrder: 4 },
    { fullName: 'Dr. Vera Gorbunova',   designation: 'Professor of Biology',               organization: 'University of Rochester',            country: 'USA',          biography: 'Dr. Gorbunova investigates the molecular mechanisms that allow some species like naked mole rats to live extraordinarily long lives and resist cancer.',                                                   isFeatured: false, displayOrder: 5 },
    { fullName: 'Prof. Marco Pahor',    designation: 'Director, Institute on Aging',        organization: 'University of Florida',              country: 'USA',          biography: 'A leading expert in geriatrics and clinical trials in older adults. He led the LIFE Study, the largest randomized trial of physical activity in older adults with mobility limitations.',                  isFeatured: false, displayOrder: 6 },
    { fullName: 'Dr. Anne Brunet',      designation: 'Professor of Genetics',              organization: 'Stanford University',                country: 'USA',          biography: 'Dr. Brunet studies epigenetic and metabolic mechanisms underlying aging and neural stem cell function. Her research on epigenetic reprogramming offers new avenues for rejuvenation strategies.',          isFeatured: false, displayOrder: 7 },
    { fullName: 'Prof. Shin-ichiro Imai', designation: 'Professor of Developmental Biology', organization: 'Washington University in St. Louis', country: 'USA',         biography: 'Prof. Imai discovered that NAD+ metabolism plays a critical role in aging and that supplementation with NMN can counteract age-related physiological decline in mice.',                              isFeatured: false, displayOrder: 8 },
    { fullName: 'Dr. Claudia Cavadas',  designation: 'Professor of Neuropharmacology',     organization: 'University of Coimbra',              country: 'Portugal',     biography: 'Dr. Cavadas investigates hypothalamic regulation of aging and age-related disease. Her lab focuses on NPY signaling, stress responses, and the neuroendocrine control of longevity.',                isFeatured: false, displayOrder: 9 },
    { fullName: 'Prof. Cynthia Kenyon', designation: 'Vice President, Aging Research',      organization: 'Calico Life Sciences',               country: 'USA',          biography: 'Prof. Kenyon\'s discovery that a single gene mutation could double the lifespan of C. elegans revolutionized aging research and established the genetic basis of aging.',                              isFeatured: true,  displayOrder: 10 },
  ];

  const speakers = [];
  for (const d of speakerData) {
    const s = await Speaker.create({ ...d, editions: [edition._id] });
    speakers.push(s);
  }
  log(`${speakers.length} speakers created`);
  return speakers;
}

// ─────────────────────────────────────────────
// 7. COMMITTEE MEMBERS
// ─────────────────────────────────────────────
async function seedCommittee() {
  section('Seeding scientific committee...');
  await CommitteeMember.insertMany([
    { fullName: 'Prof. Thomas von Zglinicki',  designation: 'Professor of Cellular Gerontology',   organization: 'Newcastle University',              country: 'UK',          displayOrder: 1 },
    { fullName: 'Dr. Judith Campisi',          designation: 'Senior Scientist',                    organization: 'Buck Institute for Research on Aging', country: 'USA',      displayOrder: 2 },
    { fullName: 'Prof. Aubrey de Grey',        designation: 'Chief Science Officer',               organization: 'SENS Research Foundation',           country: 'UK',          displayOrder: 3 },
    { fullName: 'Dr. Morgan Levine',           designation: 'Assistant Professor',                 organization: 'Yale School of Medicine',            country: 'USA',          displayOrder: 4 },
    { fullName: 'Prof. Caleb Finch',           designation: 'ARCO/William F. Kieschnick Chair',    organization: 'USC Leonard Davis School',           country: 'USA',          displayOrder: 5 },
    { fullName: 'Dr. Ana Maria Cuervo',        designation: 'Professor and Co-Director',           organization: 'Einstein Institute for Aging Research', country: 'USA',      displayOrder: 6 },
    { fullName: 'Prof. David Gems',            designation: 'Professor of the Biology of Aging',   organization: 'University College London',          country: 'UK',           displayOrder: 7 },
    { fullName: 'Dr. Valter Longo',            designation: 'Professor of Gerontology',            organization: 'USC Longevity Institute',            country: 'USA',          displayOrder: 8 },
    { fullName: 'Prof. Rafael de Cabo',        designation: 'Senior Investigator',                 organization: 'National Institute on Aging',        country: 'USA',          displayOrder: 9 },
    { fullName: 'Dr. Joao Pedro de Magalhaes', designation: 'Professor of Molecular Biogerontology', organization: 'University of Birmingham',         country: 'UK',           displayOrder: 10 },
    { fullName: 'Prof. Marie-Laure Ninio',     designation: 'Head, Cardiovascular Aging Group',    organization: 'INSERM',                             country: 'France',        displayOrder: 11 },
    { fullName: 'Dr. Felipe Sierra',           designation: 'Director Emeritus, Division of Aging Biology', organization: 'National Institute on Aging', country: 'USA',       displayOrder: 12 },
  ]);
  log('12 committee members created');
}

// ─────────────────────────────────────────────
// 8. ORGANIZERS
// ─────────────────────────────────────────────
async function seedOrganizers() {
  section('Seeding organizers...');
  await Organizer.insertMany([
    { name: 'Dr. Sarah Mitchell',    designation: 'congress Chair',            bio: 'Dr. Mitchell is Associate Professor of Geriatrics at Boston University School of Medicine and has chaired the Aging congress since 2021.',             displayOrder: 1 },
    { name: 'Dr. Robert Chen',       designation: 'Scientific Program Director', bio: 'Dr. Chen oversees the scientific program and abstract review process. He is Director of Research at the New England Geroscience Consortium.',             displayOrder: 2 },
    { name: 'Ms. Amara Osei',        designation: 'Executive Director',          bio: 'Ms. Osei manages all operational aspects of the congress including logistics, sponsorships, and partnerships. She brings 15 years of event management experience.', displayOrder: 3 },
    { name: 'Dr. Yuki Tanaka',       designation: 'International Relations',     bio: 'Dr. Tanaka coordinates international speakers and delegates, ensuring global representation across the Americas, Europe, and Asia-Pacific regions.',        displayOrder: 4 },
    { name: 'Mr. David Okonkwo',     designation: 'Communications Manager',      bio: 'Mr. Okonkwo manages all congress communications, social media, and press relations. He holds an MSc in Science Communication from MIT.',                  displayOrder: 5 },
  ]);
  log('5 organizers created');
}

// ─────────────────────────────────────────────
// 9. VENUE
// ─────────────────────────────────────────────
async function seedVenue(edition) {
  section('Seeding venue...');
  await Venue.create({
    edition: edition._id,
    name: 'Boston Convention & Exhibition Center',
    address: '415 Summer Street',
    city: 'Boston',
    country: 'USA',
    description: 'The Boston Convention & Exhibition Center (BCEC) is one of the largest convention facilities in the northeastern United States. Situated in the South Boston Waterfront district, it offers state-of-the-art meeting rooms, a world-class auditorium, and seamless access to downtown Boston hotels and Logan International Airport.',
  });
  log('Venue: Boston Convention & Exhibition Center');
}

// ─────────────────────────────────────────────
// 10. IMPORTANT DATES
// ─────────────────────────────────────────────
async function seedImportantDates(edition) {
  section('Seeding important dates...');
  await ImportantDate.insertMany([
    { edition: edition._id, label: 'Abstract Submission Opens',        date: new Date('2025-03-01'), category: 'abstracts',      isHighlighted: false, displayOrder: 1 },
    { edition: edition._id, label: 'Early Bird Registration Deadline', date: new Date('2025-06-30'), category: 'registrations',  isHighlighted: true,  displayOrder: 2 },
    { edition: edition._id, label: 'Abstract Submission Deadline',     date: new Date('2025-07-15'), category: 'abstracts',      isHighlighted: true,  displayOrder: 3 },
    { edition: edition._id, label: 'Notification of Acceptance',       date: new Date('2025-08-15'), category: 'abstracts',      isHighlighted: false, displayOrder: 4 },
    { edition: edition._id, label: 'Mid-Term Registration Deadline',   date: new Date('2025-09-15'), category: 'registrations',  isHighlighted: false, displayOrder: 5 },
    { edition: edition._id, label: 'Camera-Ready Submission',          date: new Date('2025-09-20'), category: 'abstracts',      isHighlighted: false, displayOrder: 6 },
    { edition: edition._id, label: 'Pre-congress Workshops',         date: new Date('2025-10-14'), category: 'congress',     isHighlighted: false, displayOrder: 7 },
    { edition: edition._id, label: 'congress Opening Day',           date: new Date('2025-10-15'), category: 'congress',     isHighlighted: true,  displayOrder: 8 },
    { edition: edition._id, label: 'congress Closing Day',           date: new Date('2025-10-17'), category: 'congress',     isHighlighted: true,  displayOrder: 9 },
    { edition: edition._id, label: 'On-Site Registration Closes',      date: new Date('2025-10-15'), category: 'registrations',  isHighlighted: false, displayOrder: 10 },
  ]);
  log('10 important dates created');
}

// ─────────────────────────────────────────────
// 11. PROGRAM SLOTS
// ─────────────────────────────────────────────
async function seedProgram(edition, speakers) {
  section('Seeding program slots...');
  const [vasquez, kirkland, barzilai, partridge, gorbunova, pahor, brunet, imai, cavadas, kenyon] = speakers;

  await ProgramSlot.insertMany([
    // DAY 1
    { edition: edition._id, day: 1, startTime: '08:00', endTime: '09:00', title: 'Registration & Coffee',                           type: 'other',        room: 'Main Lobby',       displayOrder: 1 },
    { edition: edition._id, day: 1, startTime: '09:00', endTime: '09:30', title: 'Opening Ceremony & Welcome Address',               type: 'opening',      room: 'Grand Auditorium', displayOrder: 2 },
    { edition: edition._id, day: 1, startTime: '09:30', endTime: '10:30', title: 'Keynote: The Biology of Aging Where Are We Now?', type: 'keynote',      room: 'Grand Auditorium', speaker: kenyon._id,    description: 'A comprehensive overview of the current state of aging science and the most promising directions for the next decade.', displayOrder: 3 },
    { edition: edition._id, day: 1, startTime: '10:30', endTime: '11:00', title: 'Coffee Break',                                    type: 'coffee_break', room: 'Foyer',            displayOrder: 4 },
    { edition: edition._id, day: 1, startTime: '11:00', endTime: '12:00', title: 'Plenary: Senolytic Therapies in Clinical Trials',  type: 'plenary',      room: 'Grand Auditorium', speaker: kirkland._id,  description: 'Overview of completed and ongoing Phase I/II trials evaluating dasatinib, quercetin, and navitoclax as senolytic agents.', displayOrder: 5 },
    { edition: edition._id, day: 1, startTime: '12:00', endTime: '13:00', title: 'Lunch Break',                                     type: 'lunch',        room: 'Exhibition Hall',  displayOrder: 6 },
    { edition: edition._id, day: 1, startTime: '13:00', endTime: '14:00', title: 'Scientific Session: Molecular Mechanisms of Aging', type: 'scientific',  room: 'Hall A',           speaker: vasquez._id,   description: 'Parallel session covering telomere biology, DNA damage repair, and epigenetic drift in aging cells.', displayOrder: 7 },
    { edition: edition._id, day: 1, startTime: '13:00', endTime: '14:00', title: 'Scientific Session: Neurodegeneration',            type: 'scientific',   room: 'Hall B',           speaker: brunet._id,    description: 'Parallel session on Alzheimer\'s disease biomarkers, tau pathology, and novel neuroprotective strategies.', displayOrder: 8 },
    { edition: edition._id, day: 1, startTime: '14:00', endTime: '15:00', title: 'Workshop: Aging Biomarkers & Epigenetic Clocks',   type: 'workshop',     room: 'Workshop Room 1',  description: 'Hands-on workshop covering the application of DNA methylation clocks (Horvath, GrimAge) in clinical research settings.', displayOrder: 9 },
    { edition: edition._id, day: 1, startTime: '15:00', endTime: '15:30', title: 'Coffee Break',                                    type: 'coffee_break', room: 'Foyer',            displayOrder: 10 },
    { edition: edition._id, day: 1, startTime: '15:30', endTime: '16:30', title: 'Plenary: Centenarian Studies & Longevity Genes',   type: 'plenary',      room: 'Grand Auditorium', speaker: barzilai._id,  description: 'Insights from the LonGenity study and what the genetics of exceptional longevity reveals about druggable aging pathways.', displayOrder: 11 },
    { edition: edition._id, day: 1, startTime: '16:30', endTime: '18:00', title: 'Poster Session I',                                type: 'other',        room: 'Exhibition Hall',  description: 'Presenter-led poster discussions covering abstracts from sessions 1–4.', displayOrder: 12 },
    { edition: edition._id, day: 1, startTime: '19:00', endTime: '22:00', title: 'Welcome Reception & Gala Dinner',                 type: 'other',        room: 'Seaport Terrace',  displayOrder: 13 },

    // DAY 2
    { edition: edition._id, day: 2, startTime: '09:00', endTime: '10:00', title: 'Keynote: NAD+ Metabolism and Aging',               type: 'keynote',      room: 'Grand Auditorium', speaker: imai._id,      description: 'The discovery and therapeutic implications of NAD+ decline with age, and the emerging clinical evidence for NMN and NR supplementation.', displayOrder: 1 },
    { edition: edition._id, day: 2, startTime: '10:00', endTime: '10:30', title: 'Coffee Break',                                    type: 'coffee_break', room: 'Foyer',            displayOrder: 2 },
    { edition: edition._id, day: 2, startTime: '10:30', endTime: '11:30', title: 'Scientific Session: Metabolic Health & Longevity', type: 'scientific',   room: 'Grand Auditorium', description: 'mTOR, AMPK, sirtuins, and caloric restriction mimetics translational perspectives.', displayOrder: 3 },
    { edition: edition._id, day: 2, startTime: '10:30', endTime: '11:30', title: 'Scientific Session: Frailty & Sarcopenia',         type: 'scientific',   room: 'Hall A',           speaker: pahor._id,     description: 'Assessment tools, exercise prescriptions, and nutritional interventions for preventing and reversing frailty.', displayOrder: 4 },
    { edition: edition._id, day: 2, startTime: '11:30', endTime: '12:30', title: 'Plenary: Naked Mole Rats & Cancer Resistance',     type: 'plenary',      room: 'Grand Auditorium', speaker: gorbunova._id, description: 'What the extraordinary biology of Heterocephalus glaber teaches us about cancer suppression and longevity.', displayOrder: 5 },
    { edition: edition._id, day: 2, startTime: '12:30', endTime: '13:30', title: 'Lunch Break',                                     type: 'lunch',        room: 'Exhibition Hall',  displayOrder: 6 },
    { edition: edition._id, day: 2, startTime: '13:30', endTime: '14:30', title: 'Keynote: Genetics of Aging in Model Organisms',    type: 'keynote',      room: 'Grand Auditorium', speaker: partridge._id, description: 'Conserved genetic pathways that extend lifespan from yeast to mammals, and lessons for human aging research.', displayOrder: 7 },
    { edition: edition._id, day: 2, startTime: '14:30', endTime: '15:00', title: 'Coffee Break',                                    type: 'coffee_break', room: 'Foyer',            displayOrder: 8 },
    { edition: edition._id, day: 2, startTime: '15:00', endTime: '16:00', title: 'Poster Session II & Award Presentations',          type: 'other',        room: 'Exhibition Hall',  description: 'Best poster and best oral presentation awards announced. Presenters of shortlisted abstracts attend.', displayOrder: 9 },
    { edition: edition._id, day: 2, startTime: '16:00', endTime: '17:00', title: 'Panel Discussion: Translating Aging Science to Policy', type: 'other',   room: 'Grand Auditorium', description: 'A cross-disciplinary panel with researchers, clinicians, and policymakers discussing the roadmap for geroscience integration into healthcare systems.', displayOrder: 10 },
    { edition: edition._id, day: 2, startTime: '17:00', endTime: '17:30', title: 'Closing Ceremony & Next Edition Announcement',     type: 'closing',      room: 'Grand Auditorium', displayOrder: 11 },
  ]);
  log('24 program slots created (Day 1: 13, Day 2: 11)');
}

// ─────────────────────────────────────────────
// 12. PRICING TIERS
// ─────────────────────────────────────────────
async function seedPricing(edition) {
  section('Seeding pricing tiers...');
  const tiers = await PricingTier.insertMany([
    {
      edition: edition._id,
      name: 'early_bird',
      label: 'Early Bird',
      deadline: new Date('2025-06-30'),
      isActive: true,
      displayOrder: 1,
      prices: { oral_inperson: 450, oral_virtual: 250, poster_inperson: 380, poster_virtual: 200, listener_inperson: 320, listener_virtual: 150, student: 150 },
    },
    {
      edition: edition._id,
      name: 'mid_term',
      label: 'Standard',
      deadline: new Date('2025-09-15'),
      isActive: false,
      displayOrder: 2,
      prices: { oral_inperson: 600, oral_virtual: 350, poster_inperson: 520, poster_virtual: 280, listener_inperson: 450, listener_virtual: 220, student: 220 },
    },
    {
      edition: edition._id,
      name: 'on_spot',
      label: 'On-Site',
      deadline: new Date('2025-10-15'),
      isActive: false,
      displayOrder: 3,
      prices: { oral_inperson: 750, oral_virtual: 450, poster_inperson: 650, poster_virtual: 350, listener_inperson: 580, listener_virtual: 300, student: 300 },
    },
  ]);
  log('3 pricing tiers: early_bird ($450), mid_term ($600), on_spot ($750)');
  return tiers;
}

// ─────────────────────────────────────────────
// 13. PARTNERS
// ─────────────────────────────────────────────
async function seedPartners() {
  section('Seeding partners...');
  await Partner.insertMany([
    { name: 'National Institute on Aging',         website: 'https://www.nia.nih.gov',              type: 'partner',       displayOrder: 1 },
    { name: 'American Federation for Aging Research', website: 'https://www.afar.org',              type: 'partner',       displayOrder: 2 },
    { name: 'The Glenn Foundation for Medical Research', website: 'https://glennfoundation.org',    type: 'sponsor',       displayOrder: 3 },
    { name: 'Journal of Translational Aging Research', website: 'https://jtar.example.com',         type: 'media_partner', displayOrder: 4 },
    { name: 'Aging Cell Journal',                  website: 'https://onlinelibrary.wiley.com/journal/14749726', type: 'media_partner', displayOrder: 5 },
    { name: 'Life Biosciences',                    website: 'https://www.lifebiosciences.com',      type: 'sponsor',       displayOrder: 6 },
    { name: 'Calico Life Sciences',                website: 'https://www.calicolabs.com',           type: 'sponsor',       displayOrder: 7 },
    { name: 'International Longevity Centre',      website: 'https://ilcuk.org.uk',                 type: 'partner',       displayOrder: 8 },
  ]);
  log('8 partners/sponsors/media-partners created');
}

// ─────────────────────────────────────────────
// 14. NEWS ARTICLES
// ─────────────────────────────────────────────
async function seedNews() {
  section('Seeding news articles...');
  const articles = [
    {
      title: 'Abstract Submission Now Open for Aging congress 2025',
      excerpt: 'We are pleased to announce that abstract submissions for the 7th International Aging congress are now open. Submit your research by July 15th, 2025.',
      content: `<p>The organizing committee of the 7th International Aging congress is thrilled to announce that the abstract submission portal is now open. Researchers from all areas of aging science from basic geroscience to clinical geriatrics and health policy are invited to submit their original work.</p>
<h3>Submission Categories</h3>
<ul>
  <li>Oral presentations (in-person and virtual)</li>
  <li>Poster presentations (in-person and virtual)</li>
</ul>
<p>Abstracts will undergo double-blind peer review by our Scientific Committee. The acceptance notification will be sent by August 15th, 2025.</p>
<p>Visit the <a href="/abstract-submission">Abstract Submission</a> page for complete guidelines and to begin your submission.</p>`,
      tags: ['abstracts', 'submissions', 'announcement'],
      author: 'Aging congress Team',
      status: 'published',
    },
    {
      title: 'Nobel Laureate to Deliver Opening Keynote at AC2025',
      excerpt: 'We are honoured to announce that Prof. Cynthia Kenyon will open the 7th International Aging congress with a landmark keynote address.',
      content: `<p>The 7th International Aging congress is proud to announce that Prof. Cynthia Kenyon, Vice President of Aging Research at Calico Life Sciences and pioneer of aging genetics, will deliver the Opening Keynote Address on October 15th, 2025.</p>
<p>Prof. Kenyon's discovery that mutations in the daf-2 gene doubled the lifespan of <em>C. elegans</em> changed the trajectory of aging research and inspired a generation of scientists. Her talk, titled "The Biology of Aging Where Are We Now?", will chart the journey from those early genetic discoveries to today's clinical trials in humans.</p>
<p>"We are incredibly honored to have Professor Kenyon open our congress," said congress Chair Dr. Sarah Mitchell. "Her work fundamentally transformed how we think about aging as a malleable biological process."</p>`,
      tags: ['speakers', 'keynote', 'announcement'],
      author: 'Aging congress Team',
      status: 'published',
    },
    {
      title: 'Early Bird Registration Now Open Save Up to 40%',
      excerpt: 'Register before June 30th to take advantage of early bird pricing for the 7th International Aging congress in Boston.',
      content: `<p>Early bird registration for Aging congress 2025 is now open. Register by <strong>June 30th, 2025</strong> to secure significant savings on your registration fee.</p>
<h3>Early Bird Rates</h3>
<ul>
  <li>Oral Presenter (In-Person): $450</li>
  <li>Poster Presenter (In-Person): $380</li>
  <li>Listener (In-Person): $320</li>
  <li>All Virtual categories: from $150</li>
  <li>Student registration: $150</li>
</ul>
<p>Standard rates apply from July 1st. All registration types include access to all plenary sessions, the welcome reception, congress proceedings, and a digital certificate of attendance.</p>`,
      tags: ['registration', 'pricing', 'announcement'],
      author: 'Aging congress Team',
      status: 'published',
    },
    {
      title: 'New Partnership Announced with Journal of Translational Aging Research',
      excerpt: 'Authors of top-scoring abstracts at AC2025 will be invited to submit full manuscripts to our new official partner journal.',
      content: `<p>The Aging congress is pleased to announce a formal partnership with the <em>Journal of Translational Aging Research</em> (JTAR), a peer-reviewed open-access journal indexed in PubMed and Scopus.</p>
<p>Under this partnership, authors of the top 15% of accepted abstracts as rated by our Scientific Committee will receive a personal invitation to submit a full manuscript to JTAR. Submissions will benefit from an expedited review process with a target decision time of 6 weeks.</p>
<p>This partnership reflects our commitment to translating congress findings into lasting scientific literature accessible to the global research community.</p>`,
      tags: ['publication', 'partnership', 'journal'],
      author: 'Dr. Robert Chen, Scientific Program Director',
      status: 'published',
    },
    {
      title: 'AC2025 Will Feature First-Ever AI & Longevity Workshop',
      excerpt: 'A new dedicated workshop track on artificial intelligence applications in aging research will make its debut at this year\'s congress.',
      content: `<p>Responding to the rapidly growing intersection of artificial intelligence and aging science, AC2025 will introduce a dedicated AI & Big Data in Aging Research workshop track for the first time.</p>
<p>The workshop, scheduled for Day 1 (October 15th, 14:00–15:00), will cover:</p>
<ul>
  <li>Machine learning approaches to biological age prediction</li>
  <li>Deep learning for drug repurposing in aging diseases</li>
  <li>Wearable technology and digital biomarkers of aging</li>
  <li>Large-scale genomic data analysis in longevity cohorts</li>
</ul>
<p>The workshop will be led by Dr. Anne Brunet (Stanford) and will include a practical demonstration session.</p>`,
      tags: ['workshop', 'AI', 'program'],
      author: 'Aging congress Team',
      status: 'published',
    },
  ];

  for (const a of articles) {
    await NewsArticle.create(a);
  }
  log(`${articles.length} news articles created`);
}

// ─────────────────────────────────────────────
// 15. REPORTS
// ─────────────────────────────────────────────
async function seedReports() {
  section('Seeding reports...');
  await Report.insertMany([
    {
      title: 'AC2024 congress Report',
      description: 'Full post-congress report for the 6th International Aging congress held in Vienna, Austria. Includes session summaries, attendance statistics, and key scientific findings.',
      fileUrl: 'https://storage.googleapis.com/aging-congress/reports/ac2024-congress-report.pdf',
      isPublished: true,
      displayOrder: 1,
    },
    {
      title: 'AC2023 Proceedings Senescence & Disease',
      description: 'Published proceedings from the 5th International Aging congress, featuring 112 peer-reviewed abstracts from our Boston edition focused on cellular senescence.',
      fileUrl: 'https://storage.googleapis.com/aging-congress/reports/ac2023-proceedings.pdf',
      isPublished: true,
      displayOrder: 2,
    },
    {
      title: 'Global Aging Research Impact Report 2024',
      description: 'A landscape analysis of aging research funding, publication trends, and clinical trial activity across 30 countries, commissioned by the Aging congress network.',
      fileUrl: 'https://storage.googleapis.com/aging-congress/reports/global-aging-impact-2024.pdf',
      isPublished: true,
      displayOrder: 3,
    },
  ]);
  log('3 reports created');
}

// ─────────────────────────────────────────────
// 16. DOWNLOADS
// ─────────────────────────────────────────────
async function seedDownloads() {
  section('Seeding downloads...');
  await Download.insertMany([
    {
      title: 'Abstract Submission Template (Word)',
      type: 'template',
      fileUrl: 'https://storage.googleapis.com/aging-congress/downloads/abstract-template.docx',
      isActive: true,
      displayOrder: 1,
    },
    {
      title: 'AC2025 Poster Template (PowerPoint)',
      type: 'template',
      fileUrl: 'https://storage.googleapis.com/aging-congress/downloads/poster-template.pptx',
      isActive: true,
      displayOrder: 2,
    },
    {
      title: 'AC2025 congress Flyer',
      type: 'flyer',
      fileUrl: 'https://storage.googleapis.com/aging-congress/downloads/ac2025-flyer.pdf',
      isActive: true,
      displayOrder: 3,
    },
    {
      title: 'Sponsorship Prospectus 2025',
      type: 'pdf',
      fileUrl: 'https://storage.googleapis.com/aging-congress/downloads/sponsorship-prospectus-2025.pdf',
      isActive: true,
      displayOrder: 4,
    },
    {
      title: 'Presentation Guidelines PDF',
      type: 'pdf',
      fileUrl: 'https://storage.googleapis.com/aging-congress/downloads/presentation-guidelines.pdf',
      isActive: true,
      displayOrder: 5,
    },
  ]);
  log('5 downloads created');
}

// ─────────────────────────────────────────────
// 17. BROCHURE
// ─────────────────────────────────────────────
async function seedBrochure(edition) {
  section('Seeding brochure...');
  await Brochure.create({
    title: 'Aging congress 2025 Official Brochure',
    fileUrl: 'https://storage.googleapis.com/aging-congress/brochures/ac2025-brochure.pdf',
    edition: edition._id,
  });
  log('Brochure created');
}

// ─────────────────────────────────────────────
// 18. TESTIMONIALS
// ─────────────────────────────────────────────
async function seedTestimonials() {
  section('Seeding testimonials...');
  await Testimonial.insertMany([
    {
      name: 'Dr. Yuki Hashimoto',
      designation: 'Associate Professor of Gerontology',
      country: 'Japan',
      message: 'The Aging congress is the most intellectually stimulating congress I attend each year. The quality of science, the caliber of speakers, and the opportunities for genuine collaboration are unmatched. My lab has formed three international collaborations directly from networking at this event.',
      rating: 5,
      displayOrder: 1,
    },
    {
      name: 'Prof. Marie Dubois',
      designation: 'INSERM Research Director',
      country: 'France',
      message: 'What sets this congress apart is the translation focus. It bridges the gap between bench and bedside better than any other aging congress. The plenary sessions are always timely and the scientific rigor of the abstract selection is very high.',
      rating: 5,
      displayOrder: 2,
    },
    {
      name: 'Dr. Amara Williams',
      designation: 'Geriatrician & Clinical Researcher',
      country: 'UK',
      message: 'As a clinician, I particularly value how this congress connects me with basic scientists. The workshops are especially useful practical, hands-on, and immediately applicable to my research. I have attended every year since 2019.',
      rating: 5,
      displayOrder: 3,
    },
    {
      name: 'Mr. Carlos Mendez',
      designation: 'PhD Student, Aging Biology',
      country: 'Spain',
      message: 'The student registration rate is very reasonable. The poster sessions are incredibly well-organised and I received valuable feedback on my work from senior scientists I had only read about before. Highly recommended for early-career researchers.',
      rating: 5,
      displayOrder: 4,
    },
    {
      name: 'Dr. Ravi Patel',
      designation: 'Director, Longevity Research',
      country: 'India',
      message: 'The international diversity of this congress is exceptional. I connected with researchers from 30 different countries. The virtual attendance option also made it possible for colleagues from my institution who could not travel to still participate meaningfully.',
      rating: 4,
      displayOrder: 5,
    },
    {
      name: 'Prof. Ingrid Svensson',
      designation: 'Professor of Cell Biology',
      country: 'Sweden',
      message: 'The scientific program committee does an outstanding job curating a program that covers both established topics and cutting-edge emerging areas. This year\'s addition of the AI workshop was very timely and extremely well attended.',
      rating: 5,
      displayOrder: 6,
    },
    {
      name: 'Dr. Fatima Al-Rashid',
      designation: 'Consultant Geriatrician',
      country: 'UAE',
      message: 'The congress venue, organisation, and social program were all superb. Beyond the science, the networking opportunities during the reception and poster sessions led to a collaboration that resulted in a co-authored publication. Cannot recommend highly enough.',
      rating: 5,
      displayOrder: 7,
    },
  ]);
  log('7 testimonials created');
}

// ─────────────────────────────────────────────
// 19. FAQ TOPICS
// ─────────────────────────────────────────────
async function seedFAQTopics() {
  section('Seeding FAQ topics...');
  const topics = await FAQTopic.insertMany([
    { name: 'About the congress',           subtitle: 'General information about the event.',            icon: 'info',        displayOrder: 1, isActive: true },
    { name: 'Abstract Submission',            subtitle: 'Submitting and presenting your research.',        icon: 'file-text',   displayOrder: 2, isActive: true },
    { name: 'Registration & Pricing',         subtitle: 'Fees, discounts, and cancellation policy.',        icon: 'credit-card', displayOrder: 3, isActive: true },
    { name: 'Attending & Virtual Access',     subtitle: 'In-person and virtual attendance options.',        icon: 'video',       displayOrder: 4, isActive: true },
    { name: 'Sponsorship & Exhibits',         subtitle: 'Partnering with the Aging congress.',              icon: 'users',       displayOrder: 5, isActive: true },
  ]);
  log(`${topics.length} FAQ topics created`);
  return topics;
}

// ─────────────────────────────────────────────
// 20. FAQs
// ─────────────────────────────────────────────
async function seedFAQs(topics) {
  section('Seeding FAQs...');
  const [about, abstract, pricing, attending, sponsorship] = topics;
  await FAQ.insertMany([
    {
      topic: about._id,
      question: 'What is the Aging congress?',
      answer: 'The Aging congress is an annual international scientific congress dedicated to advancing the understanding of biological aging, geroscience, and longevity medicine. It brings together researchers, clinicians, and policymakers from over 45 countries.',
      displayOrder: 1,
    },
    {
      topic: abstract._id,
      question: 'Who can submit an abstract?',
      answer: 'Any researcher including graduate students, postdoctoral fellows, and faculty may submit an abstract. Work must be original and not previously published in full. Each corresponding author may submit up to 2 abstracts.',
      displayOrder: 2,
    },
    {
      topic: abstract._id,
      question: 'What are the abstract submission requirements?',
      answer: 'Abstracts must be 250–400 words, written in English, and follow the IMRaD structure (Introduction, Methods, Results, and Discussion/Conclusion). Files must be submitted as PDF or Word documents (max 20MB). No tables or figures in the abstract body.',
      displayOrder: 3,
    },
    {
      topic: abstract._id,
      question: 'What presentation formats are available?',
      answer: 'We offer four formats: Oral In-Person (15 min + 5 min Q&A), Poster In-Person (printed A0 poster), Virtual Oral (12 min pre-recorded video + live Q&A), and Virtual Poster. You select your preferred format during submission.',
      displayOrder: 4,
    },
    {
      topic: abstract._id,
      question: 'When will I receive notification of acceptance?',
      answer: 'All submitters will receive an acceptance or rejection notification by August 15th, 2025. Notifications are sent to the corresponding author\'s email address provided during submission.',
      displayOrder: 5,
    },
    {
      topic: pricing._id,
      question: 'Is there a student discount?',
      answer: 'Yes. A student registration category is available at a significantly reduced rate ($150 early bird). Proof of current enrollment (valid student ID or enrollment letter) must be uploaded during registration.',
      displayOrder: 6,
    },
    {
      topic: attending._id,
      question: 'Can I attend virtually?',
      answer: 'Yes. All plenary sessions, keynote addresses, and selected scientific sessions will be live-streamed. Virtual registrants receive access to the live stream, recordings (for 30 days post-congress), and the digital proceedings.',
      displayOrder: 7,
    },
    {
      topic: pricing._id,
      question: 'What is the cancellation and refund policy?',
      answer: 'Cancellations received more than 30 days before the congress start date will receive a full refund minus a $50 processing fee. Cancellations within 30 days of the congress are non-refundable. Substitutions are permitted up to 7 days before the event.',
      displayOrder: 8,
    },
    {
      topic: pricing._id,
      question: 'Are visa invitation letters provided?',
      answer: 'Yes. After completing registration, you may request an official visa invitation letter from your registration confirmation page. Letters are issued within 3–5 business days and are sent to the email address on file.',
      displayOrder: 9,
    },
    {
      topic: sponsorship._id,
      question: 'How do I apply for sponsorship or exhibition space?',
      answer: 'Please visit our Sponsorship page to review tier options and submit an inquiry. Our partnerships team will respond within 3 business days. Exhibition space is allocated on a first-come, first-served basis.',
      displayOrder: 10,
    },
  ]);
  log('10 FAQs created (linked to 5 topics)');
}

// ─────────────────────────────────────────────
// 21. ABSTRACT SUBMISSIONS
// ─────────────────────────────────────────────
async function seedAbstracts(edition, sessions) {
  section('Seeding abstract submissions...');
  const [molecular, senolytics, neuro, cardio, metabolic, oncology, frailty, ai] = sessions;

  await Abstract.insertMany([
    { edition: edition._id, firstName: 'Mei',      lastName: 'Zhang',      email: 'mei.zhang@example.edu',      phone: '+86 138 0013 8000', country: 'China',       organization: 'Peking University',            presentationType: 'oral_inperson',   topic: molecular._id,  abstractTitle: 'Telomerase Reactivation Reverses Senescence Markers in Aged Fibroblasts', abstractText: 'This study examines the effects of controlled telomerase reactivation on senescence-associated markers in primary human fibroblasts derived from aged donors, demonstrating measurable reductions in p16INK4a expression and improved proliferative capacity.', keywords: 'telomerase, senescence, fibroblasts', coAuthors: 'Li Wei, Chen Yu', status: 'approved',    submittedAt: new Date('2025-05-12') },
    { edition: edition._id, firstName: 'Daniel',   lastName: 'Okafor',     email: 'd.okafor@example.edu',       phone: '+234 803 555 0192', country: 'Nigeria',     organization: 'University of Lagos',          presentationType: 'poster_inperson', topic: senolytics._id, abstractTitle: 'Dasatinib and Quercetin Combination Therapy in a Murine Model of Age-Related Frailty', abstractText: 'We evaluated the senolytic combination of dasatinib and quercetin in aged mice, observing significant improvements in grip strength, gait speed, and reductions in circulating senescence-associated secretory phenotype (SASP) factors.', keywords: 'senolytics, frailty, SASP', coAuthors: 'Adaeze Nwosu', status: 'approved',   submittedAt: new Date('2025-05-18') },
    { edition: edition._id, firstName: 'Sophia',   lastName: 'Mueller',    email: 'sophia.mueller@example.edu', phone: '+49 30 1234 5678',  country: 'Germany',     organization: 'Charité Berlin',               presentationType: 'oral_virtual',    topic: neuro._id,      abstractTitle: 'Tau Propagation Dynamics Across Cortical Regions in Early-Stage Alzheimer\'s Disease', abstractText: 'Using longitudinal PET imaging, we mapped the spread of tau pathology across cortical networks in a cohort of 84 patients with early-stage Alzheimer\'s disease, identifying novel predictive biomarkers of progression rate.', keywords: 'tau, Alzheimer\'s, PET imaging', coAuthors: 'Hans Richter, Anna Fischer', status: 'under_review', submittedAt: new Date('2025-06-02') },
    { edition: edition._id, firstName: 'Carlos',   lastName: 'Reyes',      email: 'carlos.reyes@example.edu',   phone: '+52 55 1234 5678',  country: 'Mexico',      organization: 'UNAM',                          presentationType: 'poster_virtual',  topic: cardio._id,     abstractTitle: 'Arterial Stiffness as a Predictor of Cardiovascular Events in Octogenarians', abstractText: 'A prospective cohort study of 312 octogenarians examining pulse wave velocity as a predictive marker for major adverse cardiovascular events over a 5-year follow-up period.', keywords: 'arterial stiffness, cardiovascular risk, octogenarians', coAuthors: '', status: 'pending', submittedAt: new Date('2025-06-20') },
    { edition: edition._id, firstName: 'Priya',    lastName: 'Sharma',     email: 'priya.sharma@example.edu',   phone: '+91 98765 43210',   country: 'India',       organization: 'AIIMS New Delhi',              presentationType: 'oral_inperson',   topic: metabolic._id,  abstractTitle: 'Caloric Restriction Mimetics and AMPK Activation in Skeletal Muscle Aging', abstractText: 'We investigated the effects of a novel AMPK-activating compound on mitochondrial biogenesis and insulin sensitivity in skeletal muscle biopsies from healthy older adults undergoing a 12-week intervention.', keywords: 'AMPK, caloric restriction, muscle aging', coAuthors: 'Rajesh Kumar', status: 'approved', submittedAt: new Date('2025-05-25') },
    { edition: edition._id, firstName: 'Olumide',  lastName: 'Adeyemi',    email: 'o.adeyemi@example.edu',      phone: '+234 802 555 0147', country: 'Nigeria',     organization: 'University of Ibadan',         presentationType: 'poster_inperson', topic: oncology._id,   abstractTitle: 'Immunosenescence and Response to Checkpoint Inhibitor Therapy in Elderly Cancer Patients', abstractText: 'Retrospective analysis of 156 elderly patients receiving PD-1/PD-L1 checkpoint inhibitors, correlating markers of immunosenescence with treatment response and progression-free survival.', keywords: 'immunosenescence, checkpoint inhibitors, geriatric oncology', coAuthors: 'Folake Bello', status: 'rejected', adminNotes: 'Sample size too small for the claimed statistical power; encourage resubmission with expanded cohort.', submittedAt: new Date('2025-06-10') },
    { edition: edition._id, firstName: 'Isabella', lastName: 'Conti',      email: 'isabella.conti@example.edu', phone: '+39 06 1234 5678',  country: 'Italy',       organization: 'Sapienza University of Rome',  presentationType: 'oral_virtual',    topic: frailty._id,    abstractTitle: 'Resistance Training Protocols for Sarcopenia Reversal in Community-Dwelling Older Adults', abstractText: 'A randomized controlled trial comparing two resistance training protocols in 210 community-dwelling adults aged 70+, measuring changes in appendicular lean mass, gait speed, and SPPB scores.', keywords: 'sarcopenia, resistance training, frailty', coAuthors: 'Marco Bianchi, Giulia Russo', status: 'approved', submittedAt: new Date('2025-05-30') },
    { edition: edition._id, firstName: 'Wei',      lastName: 'Tan',        email: 'wei.tan@example.edu',        phone: '+65 6123 4567',     country: 'Singapore',   organization: 'National University of Singapore', presentationType: 'oral_inperson', topic: ai._id,        abstractTitle: 'Deep Learning-Based Biological Age Prediction from Retinal Fundus Images', abstractText: 'We trained a convolutional neural network on 45,000 retinal fundus images to predict biological age, achieving a mean absolute error of 3.2 years and identifying accelerated aging in diabetic subgroups.', keywords: 'deep learning, biological age, retinal imaging', coAuthors: 'Hui Ling Koh', status: 'approved', submittedAt: new Date('2025-06-05') },
    { edition: edition._id, firstName: 'Amina',    lastName: 'Diallo',     email: 'amina.diallo@example.edu',   phone: '+221 77 123 4567',  country: 'Senegal',     organization: 'Cheikh Anta Diop University',  presentationType: 'poster_virtual',  topic: molecular._id,  abstractTitle: 'Epigenetic Clock Acceleration Associated with Chronic Psychosocial Stress in West African Cohorts', abstractText: 'Using the GrimAge epigenetic clock, we assessed biological age acceleration in a cohort of 198 adults exposed to varying levels of chronic psychosocial stress, finding significant associations with cortisol dysregulation.', keywords: 'epigenetic clock, stress, GrimAge', coAuthors: 'Fatou Ndiaye', status: 'under_review', submittedAt: new Date('2025-06-25') },
    { edition: edition._id, firstName: 'Robert',   lastName: 'Hayes',      email: 'robert.hayes@example.edu',   phone: '+1 617 555 0134',   country: 'USA',         organization: 'Boston University',            presentationType: 'oral_inperson',   topic: metabolic._id,  abstractTitle: 'NAD+ Precursor Supplementation and Mitochondrial Function in Aged Human Skeletal Muscle', abstractText: 'A double-blind placebo-controlled trial of nicotinamide riboside supplementation in 96 older adults, assessing changes in mitochondrial respiratory capacity via high-resolution respirometry.', keywords: 'NAD+, mitochondria, nicotinamide riboside', coAuthors: 'Jennifer Walsh', status: 'pending', submittedAt: new Date('2025-06-28') },
    { edition: edition._id, firstName: 'Hana',     lastName: 'Kobayashi',  email: 'hana.kobayashi@example.edu', phone: '+81 3 1234 5678',   country: 'Japan',       organization: 'University of Tokyo',          presentationType: 'poster_inperson', topic: neuro._id,      abstractTitle: 'Gut Microbiome Composition and Cognitive Decline Trajectories in a Longitudinal Japanese Cohort', abstractText: 'We characterized gut microbiome diversity in 267 participants over a 6-year longitudinal study, identifying specific taxa associated with slower rates of cognitive decline.', keywords: 'gut microbiome, cognitive decline, longitudinal study', coAuthors: 'Takeshi Yamamoto', status: 'approved', submittedAt: new Date('2025-06-08') },
    { edition: edition._id, firstName: 'Emma',     lastName: 'Johansson',  email: 'emma.johansson@example.edu', phone: '+46 8 123 456',     country: 'Sweden',      organization: 'Karolinska Institute',         presentationType: 'oral_virtual',    topic: cardio._id,     abstractTitle: 'Sex Differences in Vascular Aging Trajectories: A 20-Year Population Cohort Analysis', abstractText: 'Analysis of vascular aging biomarkers across sex in a 20-year population-based cohort of 4,200 participants, revealing divergent trajectories in arterial elasticity post-menopause.', keywords: 'vascular aging, sex differences, cohort study', coAuthors: 'Erik Lindgren', status: 'under_review', submittedAt: new Date('2025-07-01') },
  ]);
  log('12 abstract submissions created (mixed statuses)');
}

// ─────────────────────────────────────────────
// 22. REGISTRATIONS
// ─────────────────────────────────────────────
async function seedRegistrations(edition, pricingTiers) {
  section('Seeding registrations...');
  const earlyBird = pricingTiers.find((t) => t.name === 'early_bird');

  await Registration.insertMany([
    { edition: edition._id, firstName: 'Grace',    lastName: 'Kim',        email: 'grace.kim@example.edu',        phone: '+82 2 1234 5678',   country: 'South Korea', organization: 'Seoul National University',    category: 'oral_inperson',      attendanceMode: 'in_person', pricingTier: earlyBird._id, amount: earlyBird.prices.oral_inperson,      paymentStatus: 'confirmed', transactionId: 'TXN-84021', registeredAt: new Date('2025-05-14') },
    { edition: edition._id, firstName: 'Thabo',    lastName: 'Nkosi',      email: 'thabo.nkosi@example.edu',      phone: '+27 11 123 4567',   country: 'South Africa', organization: 'University of Cape Town',     category: 'poster_inperson',    attendanceMode: 'in_person', pricingTier: earlyBird._id, amount: earlyBird.prices.poster_inperson,    paymentStatus: 'confirmed', transactionId: 'TXN-84055', registeredAt: new Date('2025-05-20') },
    { edition: edition._id, firstName: 'Laura',    lastName: 'Bennett',    email: 'laura.bennett@example.com',    phone: '+1 415 555 0110',   country: 'USA',          organization: 'Independent Researcher',      category: 'listener_inperson',  attendanceMode: 'in_person', pricingTier: earlyBird._id, amount: earlyBird.prices.listener_inperson,  paymentStatus: 'confirmed', transactionId: 'TXN-84102', registeredAt: new Date('2025-06-01') },
    { edition: edition._id, firstName: 'Yusuf',    lastName: 'Demir',      email: 'yusuf.demir@example.edu',      phone: '+90 212 123 4567',  country: 'Turkey',       organization: 'Istanbul University',         category: 'oral_virtual',       attendanceMode: 'virtual',   pricingTier: earlyBird._id, amount: earlyBird.prices.oral_virtual,       paymentStatus: 'pending',   registeredAt: new Date('2025-06-10') },
    { edition: edition._id, firstName: 'Camille',  lastName: 'Laurent',    email: 'camille.laurent@example.edu',  phone: '+33 1 23 45 67 89',  country: 'France',       organization: 'Sorbonne Université',         category: 'poster_virtual',     attendanceMode: 'virtual',   pricingTier: earlyBird._id, amount: earlyBird.prices.poster_virtual,     paymentStatus: 'confirmed', transactionId: 'TXN-84167', registeredAt: new Date('2025-06-12') },
    { edition: edition._id, firstName: 'Arjun',    lastName: 'Mehta',      email: 'arjun.mehta@example.com',      phone: '+91 22 1234 5678',  country: 'India',        organization: 'Tata Consultancy Services',   category: 'listener_virtual',   attendanceMode: 'virtual',   pricingTier: earlyBird._id, amount: earlyBird.prices.listener_virtual,   paymentStatus: 'confirmed', transactionId: 'TXN-84203', registeredAt: new Date('2025-06-15') },
    { edition: edition._id, firstName: 'Zoe',      lastName: 'Papadopoulos', email: 'zoe.papadopoulos@example.edu', phone: '+30 21 0123 4567', country: 'Greece',      organization: 'National and Kapodistrian University of Athens', category: 'student', attendanceMode: 'in_person', pricingTier: earlyBird._id, amount: earlyBird.prices.student, paymentStatus: 'confirmed', transactionId: 'TXN-84240', registeredAt: new Date('2025-06-18') },
    { edition: edition._id, firstName: 'Miguel',   lastName: 'Santos',     email: 'miguel.santos@example.edu',    phone: '+351 21 123 4567',  country: 'Portugal',     organization: 'University of Lisbon',        category: 'student',            attendanceMode: 'virtual',   pricingTier: earlyBird._id, amount: earlyBird.prices.student,            paymentStatus: 'pending',   registeredAt: new Date('2025-06-22') },
    { edition: edition._id, firstName: 'Aisha',    lastName: 'Rahman',     email: 'aisha.rahman@example.edu',     phone: '+880 2 123 4567',   country: 'Bangladesh',   organization: 'University of Dhaka',         category: 'oral_inperson',      attendanceMode: 'in_person', pricingTier: earlyBird._id, amount: earlyBird.prices.oral_inperson,      paymentStatus: 'cancelled', notes: 'Attendee requested cancellation due to travel restrictions.', registeredAt: new Date('2025-05-28') },
    { edition: edition._id, firstName: 'Noah',     lastName: 'Andersen',   email: 'noah.andersen@example.edu',    phone: '+47 22 12 34 56',   country: 'Norway',       organization: 'University of Oslo',          category: 'poster_inperson',    attendanceMode: 'in_person', pricingTier: earlyBird._id, amount: earlyBird.prices.poster_inperson,    paymentStatus: 'confirmed', transactionId: 'TXN-84298', registeredAt: new Date('2025-07-02') },
  ]);
  log('10 registrations created (mixed payment statuses)');
}

// ─────────────────────────────────────────────
// 23. CONTACT MESSAGES
// ─────────────────────────────────────────────
async function seedContactMessages() {
  section('Seeding contact messages...');
  await ContactMessage.insertMany([
    { name: 'Helena Brandt',   email: 'helena.brandt@example.com',   phone: '+49 89 123 4567',  subject: 'Invoice request for registration', message: 'Hello, could you please send an official invoice for my registration payment? I need it for my institution\'s reimbursement process. Thank you.', isRead: true,  submittedAt: new Date('2025-06-05') },
    { name: 'Tomás Villanueva', email: 'tomas.villanueva@example.com', phone: '+34 91 123 4567', subject: 'Group registration discount inquiry', message: 'We have a group of 6 researchers from our department who would like to attend. Do you offer any group discounts for registrations of 5 or more?', isRead: true,  submittedAt: new Date('2025-06-10') },
    { name: 'Ngozi Eze',        email: 'ngozi.eze@example.com',       phone: '+234 1 234 5678',  subject: 'Accessibility accommodations',    message: 'I use a wheelchair and wanted to confirm the venue is fully accessible, including the poster session hall and workshop rooms. Please advise.', isRead: false, submittedAt: new Date('2025-06-14') },
    { name: 'Owen Fitzgerald',  email: 'owen.fitzgerald@example.com', phone: '+353 1 234 5678',  subject: 'Press / media accreditation',     message: 'I am a science journalist covering longevity research. Is press accreditation available for the congress, and what is the process to apply?', isRead: false, submittedAt: new Date('2025-06-19') },
    { name: 'Ingrid Larsen',    email: 'ingrid.larsen@example.com',   phone: '+45 33 12 34 56',  subject: 'Hotel recommendations near venue', message: 'Could you recommend hotels within walking distance of the Boston Convention & Exhibition Center? Preferably in a moderate price range.', isRead: true,  submittedAt: new Date('2025-06-24') },
    { name: 'Rahul Verma',      email: 'rahul.verma@example.com',     phone: '+91 11 2345 6789', subject: 'Abstract withdrawal request',     message: 'I need to withdraw my accepted abstract (submitted under my email) due to unforeseen circumstances. Please confirm once processed.', isRead: false, submittedAt: new Date('2025-07-01') },
    { name: 'Beatriz Nunes',    email: 'beatriz.nunes@example.com',   phone: '+55 11 2345 6789', subject: 'Dietary requirements for gala dinner', message: 'I have a severe nut allergy. Could you confirm that this can be accommodated at the welcome reception and gala dinner?', isRead: false, submittedAt: new Date('2025-07-05') },
    { name: 'Adrian Kowalski',  email: 'adrian.kowalski@example.com', phone: '+48 22 123 45 67', subject: 'Certificate of attendance format', message: 'Will the digital certificate of attendance include CME/CPD credit hours? My institution requires this for professional development records.', isRead: false, submittedAt: new Date('2025-07-10') },
  ]);
  log('8 contact messages created (mixed read status)');
}

// ─────────────────────────────────────────────
// 24. SUPPORT TICKETS
// ─────────────────────────────────────────────
async function seedSupportTickets() {
  section('Seeding support tickets...');
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

// ─────────────────────────────────────────────
// 25. SPEAKER APPLICATIONS
// ─────────────────────────────────────────────
async function seedSpeakerApplications(edition) {
  section('Seeding speaker applications...');
  await SpeakerApplication.insertMany([
    { edition: edition._id, name: 'Dr. Henrik Lindqvist', email: 'henrik.lindqvist@example.edu', phone: '+46 8 765 4321',  country: 'Sweden',  organization: 'Uppsala University',        designation: 'Associate Professor of Molecular Biology', expertise: 'Cellular senescence, SASP biology', bio: 'Dr. Lindqvist leads a research group focused on the secretory phenotype of senescent cells and its role in age-related inflammation.', message: 'I would be honoured to present our recent findings on SASP modulation via novel small-molecule inhibitors.', status: 'shortlisted', submittedAt: new Date('2025-04-10') },
    { edition: edition._id, name: 'Dr. Chidinma Eze',      email: 'chidinma.eze@example.edu',     phone: '+234 1 987 6543', country: 'Nigeria', organization: 'University of Nigeria',      designation: 'Senior Lecturer in Gerontology',           expertise: 'Frailty assessment in African populations', bio: 'Dr. Eze has conducted extensive fieldwork on frailty prevalence and risk factors across West African aging cohorts.', message: 'My talk would present the first large-scale frailty prevalence data from a Sub-Saharan African population.', status: 'approved', submittedAt: new Date('2025-04-15') },
    { edition: edition._id, name: 'Prof. Isabelle Fontaine', email: 'isabelle.fontaine@example.edu', phone: '+33 4 12 34 56 78', country: 'France', organization: 'Université de Lyon',       designation: 'Professor of Neuroscience',                expertise: 'Neuroinflammation and cognitive aging',     bio: 'Prof. Fontaine studies the role of microglial activation in age-related cognitive decline using advanced imaging techniques.', message: 'I would like to propose a talk on our new PET tracer for imaging neuroinflammation in vivo.', status: 'pending', submittedAt: new Date('2025-05-02') },
    { edition: edition._id, name: 'Dr. Sanjay Gupta',      email: 'sanjay.gupta@example.edu',     phone: '+91 80 1234 5678', country: 'India',   organization: 'Indian Institute of Science', designation: 'Assistant Professor',                      expertise: 'Mitochondrial dysfunction in aging',         bio: 'Dr. Gupta\'s lab investigates mitophagy pathways and their decline with age using C. elegans and mouse models.', message: 'I am interested in presenting a poster or short talk on our mitophagy screening platform.', status: 'pending', submittedAt: new Date('2025-05-20') },
    { edition: edition._id, name: 'Dr. Rebecca Stone',     email: 'rebecca.stone@example.edu',    phone: '+1 212 555 0198',  country: 'USA',     organization: 'Columbia University',        designation: 'Assistant Professor of Medicine',          expertise: 'Clinical trials in geroscience-guided therapeutics', bio: 'Dr. Stone is the lead investigator on two ongoing Phase II trials of geroprotective compounds.', message: 'I would like to share interim results from our metformin-rapamycin combination trial.', status: 'rejected', submittedAt: new Date('2025-04-28') },
    { edition: edition._id, name: 'Dr. Pieter van der Berg', email: 'pieter.vanderberg@example.edu', phone: '+31 20 123 4567', country: 'Netherlands', organization: 'Leiden University Medical Center', designation: 'Associate Professor of Epidemiology', expertise: 'Longevity genetics and population studies', bio: 'Dr. van der Berg co-directs the Leiden Longevity Study, one of Europe\'s largest family-based longevity cohorts.', message: 'I propose a plenary talk summarizing 20 years of findings from the Leiden Longevity Study.', status: 'shortlisted', submittedAt: new Date('2025-05-08') },
  ]);
  log('6 speaker applications created (mixed statuses)');
}

// ─────────────────────────────────────────────
// 26. SPONSORSHIP INQUIRIES
// ─────────────────────────────────────────────
async function seedSponsorshipInquiries() {
  section('Seeding sponsorship inquiries...');
  await SponsorshipInquiry.insertMany([
    { organizationName: 'Longevity Biotech Inc.',       contactPerson: 'Michael Torres',   email: 'michael.torres@longevitybiotech.example.com', phone: '+1 650 555 0142', country: 'USA',        website: 'https://longevitybiotech.example.com', sponsorshipInterest: 'Gold Tier Sponsorship', message: 'We are interested in exhibiting our senolytic drug pipeline and would like to discuss Gold tier benefits, including speaking slots.', status: 'follow_up', submittedAt: new Date('2025-05-05') },
    { organizationName: 'GeroDx Diagnostics',           contactPerson: 'Sarah Whitfield',  email: 'sarah.whitfield@gerodx.example.com',           phone: '+1 415 555 0187', country: 'USA',        website: 'https://gerodx.example.com',           sponsorshipInterest: 'Exhibition Booth',       message: 'We would like a standard exhibition booth to showcase our epigenetic age testing kits to congress attendees.', status: 'closed',    submittedAt: new Date('2025-05-12') },
    { organizationName: 'NutraLongevity Labs',          contactPerson: 'Anke Schmidt',     email: 'anke.schmidt@nutralongevity.example.com',       phone: '+49 40 123 4567', country: 'Germany',    website: 'https://nutralongevity.example.com',   sponsorshipInterest: 'Silver Tier Sponsorship', message: 'Interested in Silver tier sponsorship including branded materials in delegate bags. Please send the full prospectus.', status: 'new',       submittedAt: new Date('2025-06-01') },
    { organizationName: 'Pacific Rim Health Ventures',  contactPerson: 'Jonathan Lee',     email: 'jonathan.lee@pacificrimhealth.example.com',     phone: '+65 6789 0123',  country: 'Singapore',  website: 'https://pacificrimhealth.example.com', sponsorshipInterest: 'Media Partnership',       message: 'We publish a healthy-aging investment newsletter and would like to discuss a media partnership in exchange for coverage.', status: 'read',       submittedAt: new Date('2025-06-09') },
    { organizationName: 'ElderCare Robotics',           contactPerson: 'Priyanka Desai',   email: 'priyanka.desai@eldercarerobotics.example.com',  phone: '+91 22 6789 0123', country: 'India',      website: 'https://eldercarerobotics.example.com', sponsorshipInterest: 'Platinum Tier Sponsorship', message: 'Our assistive robotics company would like to explore Platinum sponsorship, including a live product demo session.', status: 'new', submittedAt: new Date('2025-06-15') },
  ]);
  log('5 sponsorship inquiries created (mixed statuses)');
}

// ─────────────────────────────────────────────
// 27. NEWSLETTER SUBSCRIBERS
// ─────────────────────────────────────────────
async function seedNewsletterSubscribers() {
  section('Seeding newsletter subscribers...');
  await NewsletterSubscriber.insertMany([
    { email: 'subscriber1@example.com',  subscribedAt: new Date('2025-03-05') },
    { email: 'subscriber2@example.com',  subscribedAt: new Date('2025-03-18') },
    { email: 'subscriber3@example.com',  subscribedAt: new Date('2025-04-02') },
    { email: 'subscriber4@example.com',  subscribedAt: new Date('2025-04-20') },
    { email: 'subscriber5@example.com',  subscribedAt: new Date('2025-05-11') },
    { email: 'subscriber6@example.com',  subscribedAt: new Date('2025-05-29') },
    { email: 'subscriber7@example.com',  subscribedAt: new Date('2025-06-14') },
    { email: 'subscriber8@example.com',  subscribedAt: new Date('2025-07-02') },
  ]);
  log('8 newsletter subscribers created');
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
async function main() {
  console.log('\n══════════════════════════════════════════');
  console.log('  Aging congress Database Seed Script  ');
  console.log('══════════════════════════════════════════\n');

  if (!process.env.MONGODB_URI) {
    console.error('ERROR: MONGODB_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***@'));

  // Warn if data exists
  const existingEditions = await Edition.countDocuments();
  if (existingEditions > 0 && !FORCE) {
    console.log(`\nWARNING: Database already has data (${existingEditions} edition(s) found).`);
    console.log('Run with --force to clear and re-seed: node scripts/seed.js --force\n');
    process.exit(0);
  }

  await clearAll();

  await seedAdmins();
  await seedSiteSettings();
  await seedStaticPages();

  const edition  = await seedEdition();
  const sessions = await seedSessions(edition);
  const speakers = await seedSpeakers(edition);

  await seedCommittee();
  await seedOrganizers();
  await seedVenue(edition);
  await seedImportantDates(edition);
  await seedProgram(edition, speakers);
  const pricingTiers = await seedPricing(edition);
  await seedPartners();
  await seedNews();
  await seedReports();
  await seedDownloads();
  await seedBrochure(edition);
  await seedTestimonials();

  const topics = await seedFAQTopics();
  await seedFAQs(topics);

  await seedAbstracts(edition, sessions);
  await seedRegistrations(edition, pricingTiers);
  await seedContactMessages();
  await seedSupportTickets();
  await seedSpeakerApplications(edition);
  await seedSponsorshipInquiries();
  await seedNewsletterSubscribers();

  console.log('\n══════════════════════════════════════════');
  console.log('  Seed complete!');
  console.log('──────────────────────────────────────────');
  console.log('  Admin login:');
  console.log('    Email:    admin@agingcongress.com');
  console.log('    Password: Admin@123456');
  console.log('──────────────────────────────────────────');
  console.log('  Editor login:');
  console.log('    Email:    editor@agingcongress.com');
  console.log('    Password: Editor@123456');
  console.log('══════════════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
