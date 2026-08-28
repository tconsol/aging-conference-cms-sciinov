/* node server/scripts/seedTermsPage.js */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const StaticPage = require('../models/StaticPage');

const CONTENT = `<h2>For In-Person Participants</h2>
<ul>
  <li>Access to all conference sessions, poster, and exhibition areas</li>
  <li>Conference kit including name tag, program booklet, and Abstract Book</li>
  <li>2 coffee breaks and lunch for all conference days</li>
  <li>Certificate accreditation from the Organizing Committee</li>
</ul>
<p><strong>Note:</strong> Participants registered under Listener and Accompanying categories are not allowed to present their papers in Oral or Poster sessions.</p>

<h2>For Virtual Participants</h2>
<ul>
  <li>Present at the conference virtually from home or work without attending in person</li>
  <li>Access to all presentations</li>
  <li>E-Abstract Book and Program</li>
  <li>E-Certificate for Presentation and Participation</li>
</ul>

<h2>Refund / Cancellation Policy</h2>
<ul>
  <li>All cancellations must be sent in writing via e-mail to the conference secretary.</li>
  <li>Cancellations before 90 days of the conference start date will receive a full refund, less $100 processing fee.</li>
  <li>Cancellations within 90 days of the conference start date are non-refundable, but fees may be transferred to an upcoming event.</li>
  <li>Registrations are transferable until April 14, 2027. Transfer requests after April 14, 2027 cannot be accommodated.</li>
  <li>Refunds will be processed in the second week after the conference.</li>
  <li>Refund/Cancellation Policy does not apply if the conference is postponed due to natural disasters or events beyond the organizer's control, including but not limited to: force majeure, sabotage, accidents, trade/industrial disputes, terrorism, strikes, or hostilities. In such cases, participants can transfer registration fees to future editions or related conferences.</li>
</ul>

<h2>Conference Registration – Force Majeure Policy</h2>
<p>Please note that conference registration fees are non-refundable in the event that the conference is converted from an in-person event to an online/virtual format, postponed, or cancelled due to circumstances beyond the reasonable control of the organizers. These circumstances include, but are not limited to, war, global emergencies, pandemics, natural disasters, force majeure, sabotage, accidents, trade or industrial disputes, terrorism, strikes, civil unrest, or hostilities. In such situations, participants will be offered the option to transfer their registration to a future edition of the conference or another related conference organized by us. The Refund/Cancellation Policy does not apply under these force majeure circumstances.</p>

<h2>Terms and Conditions</h2>
<ul>
  <li>By registering, participants agree to the terms and conditions.</li>
  <li>The organizers reserve the right to alter the program, date, or venue at any time without prior notice.</li>
  <li>The organization is not responsible for loss or damage resulting from substitution, alteration, postponement, or cancellation due to causes beyond control, including force majeure, natural disasters, sabotage, accidents, industrial disputes, terrorism, strikes, or hostilities.</li>
  <li>The organizers reserve the right to cancel the conference in case of unavoidable circumstances. They will have no further liability to participants.</li>
  <li>Registrations remain valid for events on new dates or future editions if the conference is postponed due to causes beyond the organizer's control.</li>
  <li>In the event of cancellation, organizers will make reasonable alternative arrangements such as posting updates on the official conference website. Participants are responsible for checking the website for updates.</li>
  <li>Organizers will not accept liability for personal injuries or loss/damage to property belonging to delegates during or as a result of the conference.</li>
</ul>`;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const result = await StaticPage.findOneAndUpdate(
    { key: 'terms' },
    { key: 'terms', title: 'Terms and Conditions', content: CONTENT },
    { upsert: true, new: true }
  );

  console.log(`✓ Terms page seeded (id: ${result._id})`);
  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
