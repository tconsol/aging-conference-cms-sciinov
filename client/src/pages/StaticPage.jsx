import { useEffect, useState } from 'react';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import { contentAPI } from '../api/content';

const PAGE_TITLES = {
  guidelines: 'Submission Guidelines',
  publication: 'Publication Policy',
  terms: 'Terms & Conditions',
};

const PAGE_SUBTITLES = {
  guidelines: 'Rules and guidelines for abstract and paper submissions.',
  publication: 'Our policies regarding publication rights and open access.',
  terms: 'Terms and conditions governing participation in the congress.',
};

const FALLBACK_CONTENT = {
  guidelines: `
    <h2>Abstract Submission Guidelines</h2>
    <p>All abstracts must be submitted electronically through the congress submission portal. Late submissions will not be accepted.</p>
    <h3>Formatting Requirements</h3>
    <ul>
      <li>Abstracts must be 250â€“400 words</li>
      <li>Written in English</li>
      <li>Structured format: Background, Methods, Results, Conclusion</li>
      <li>No tables, figures, or references in abstract text</li>
      <li>Standard font (Times New Roman or Arial, 12pt)</li>
    </ul>
    <h3>Review Process</h3>
    <p>All abstracts undergo double-blind peer review by the Scientific Committee. Authors will be notified of acceptance within 4 weeks of the submission deadline.</p>
  `,
  publication: `
    <h2>Publication Policy</h2>
    <p>Accepted abstracts will be published in the official congress Proceedings, which will be made available to all registered attendees.</p>
    <h3>Open Access</h3>
    <p>All congress proceedings are published under a Creative Commons Attribution license (CC BY 4.0), allowing free access and reuse with attribution.</p>
    <h3>Author Rights</h3>
    <p>Authors retain copyright of their submitted work. By submitting to the congress, authors grant the organizing committee the right to publish their abstract in the proceedings.</p>
  `,
  terms: `
    <h2>Terms & Conditions</h2>
    <p>By registering for the Aging congress, participants agree to the following terms:</p>
    <h3>Registration</h3>
    <ul>
      <li>Registration fees are non-refundable after the cancellation deadline</li>
      <li>Registrations are non-transferable without prior approval</li>
      <li>The organizers reserve the right to cancel or modify the congress</li>
    </ul>
    <h3>Code of Conduct</h3>
    <p>All participants are expected to behave professionally and respectfully. Harassment of any kind will not be tolerated.</p>
    <h3>Liability</h3>
    <p>The organizing committee is not liable for personal injury, loss, or damage to property during the congress.</p>
  `,
};

export default function StaticPage({ pageKey }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentAPI.getPage(pageKey)
      .then((res) => setPage(res.data?.data ?? res.data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [pageKey]);

  const title = page?.title || PAGE_TITLES[pageKey] || 'Page';
  const subtitle = page?.subtitle || PAGE_SUBTITLES[pageKey] || '';
  const content = page?.content || FALLBACK_CONTENT[pageKey] || '';

  return (
    <div>
      <PageHero
        title={title}
        subtitle={subtitle}
        breadcrumb={[{ label: 'Home', href: '/' }, { label: title }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div
                className="prose prose-slate prose-lg max-w-none
                  prose-headings:text-slate-900
                  prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
                  prose-h3:text-lg prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-slate-600 prose-p:leading-relaxed
                  prose-li:text-slate-600
                  prose-a:text-teal-700 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
