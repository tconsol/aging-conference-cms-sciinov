import { useEffect, useState } from 'react';
import { MapPin, Building2, ChevronRight } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';

export default function Venue() {
  const { activeEdition, loading: congressLoading } = usecongress();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (congressLoading) return;
    const fetch = activeEdition?._id
      ? congressAPI.getVenueByEdition(activeEdition._id)
      : congressAPI.getVenues({ limit: 1 });
    fetch
      .then((res) => {
        const data = res.data?.data ?? res.data;
        setVenue(Array.isArray(data) ? data[0] : data);
      })
      .catch(() => setVenue(null))
      .finally(() => setLoading(false));
  }, [activeEdition, congressLoading]);

  const photos = venue?.photos ?? [];

  return (
    <div>
      <PageHero
        title="Congress Venue"
        subtitle="Find everything you need to know about where we're gathering — location, access, and facilities."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Venue' }]}
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : !venue ? (
            <div className="text-center py-20">
              <SectionHeader title="Venue To Be Announced" subtitle="The venue details for this edition will be announced soon." />
            </div>
          ) : (
            <div className="flex flex-col gap-16">

              {/* Hero: name + address + map stacked */}
              <div className="grid lg:grid-cols-5 gap-8 items-start">
                {/* Left: venue info */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] mb-3" style={{ color: 'var(--brand)' }}>
                      Venue
                    </p>
                    <h2 className="text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                      {venue.name}
                    </h2>
                  </div>

                  {venue.description && (
                    <p className="text-slate-600 leading-relaxed">{venue.description}</p>
                  )}

                  {(venue.address || venue.city) && (
                    <div
                      className="flex items-start gap-4 rounded-2xl p-5 border"
                      style={{ background: 'var(--brand-light)', borderColor: 'color-mix(in srgb, var(--brand) 20%, transparent)' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'var(--brand-dark)' }}
                      >
                        <MapPin size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm mb-0.5">Address</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {[venue.address, venue.city, venue.country].filter(Boolean).join(', ')}
                        </p>
                        {venue.city && (
                          <a
                            href={`https://www.google.com/maps/search/${encodeURIComponent([venue.name, venue.city].filter(Boolean).join(', '))}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold mt-2 transition-opacity hover:opacity-70"
                            style={{ color: 'var(--brand-dark)' }}
                          >
                            Open in Google Maps <ChevronRight size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: map embed */}
                <div className="lg:col-span-3">
                  {venue.mapEmbedCode ? (
                    <div
                      className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 [&_iframe]:w-full [&_iframe]:aspect-[16/10]"
                      dangerouslySetInnerHTML={{ __html: venue.mapEmbedCode }}
                    />
                  ) : (
                    <div
                      className="rounded-3xl aspect-[16/10] flex items-center justify-center"
                      style={{ background: 'var(--brand-light)' }}
                    >
                      <div className="text-center">
                        <Building2 size={48} style={{ color: 'var(--brand)' }} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm text-slate-400">Map coming soon</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Photos */}
              {photos.length > 0 && (
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.25em] mb-6" style={{ color: 'var(--brand)' }}>
                    Venue Gallery
                  </p>

                  {photos.length === 1 ? (
                    <img
                      src={photos[0].url}
                      alt={venue.name}
                      className="w-full rounded-3xl object-cover max-h-[480px] shadow-lg"
                    />
                  ) : photos.length === 2 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {photos.map((p, i) => (
                        <img key={p.publicId || i} src={p.url} alt={`${venue.name} ${i + 1}`}
                          className="w-full rounded-2xl object-cover aspect-[4/3] shadow-md" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {photos.map((p, i) => (
                        <img
                          key={p.publicId || i}
                          src={p.url}
                          alt={`${venue.name} ${i + 1}`}
                          className={`w-full rounded-2xl object-cover shadow-md ${
                            i === 0 ? 'col-span-2 lg:col-span-1 row-span-2 aspect-square lg:aspect-auto max-h-80 lg:max-h-none' : 'aspect-[4/3]'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* No photos placeholder */}
              {photos.length === 0 && (
                <div
                  className="rounded-3xl flex flex-col items-center justify-center py-20 border-2 border-dashed"
                  style={{ borderColor: 'color-mix(in srgb, var(--brand) 20%, transparent)', background: 'var(--brand-light)' }}
                >
                  <Building2 size={52} className="mb-4 opacity-30" style={{ color: 'var(--brand-dark)' }} />
                  <p className="text-slate-400 text-sm">Venue photos coming soon</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
