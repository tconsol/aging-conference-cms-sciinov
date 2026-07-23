import { useEffect, useState } from 'react';
import { MapPin, Building } from 'lucide-react';
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

  return (
    <div>
      <PageHero
        title="congress Venue"
        subtitle="Find details about the venue, location, and how to get there."
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
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <span className="inline-block text-xs font-bold tracking-widest uppercase mb-3 px-3 py-1 rounded-full bg-teal-50 text-teal-700">
                  Venue
                </span>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">{venue.name}</h2>
                <p className="text-slate-600 mb-6">{venue.description}</p>

                <div className="flex flex-col gap-3 mb-8">
                  {(venue.address || venue.city) && (
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-teal-600 shrink-0 mt-0.5" />
                      <p className="text-slate-700 font-medium">
                        {[venue.address, venue.city, venue.country].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                </div>

                {venue.mapEmbedCode && (
                  <div
                    className="rounded-lg overflow-hidden border border-slate-100 shadow-sm [&_iframe]:w-full [&_iframe]:aspect-[4/3]"
                    dangerouslySetInnerHTML={{ __html: venue.mapEmbedCode }}
                  />
                )}
              </div>

              <div className="flex flex-col gap-4">
                {venue.photos?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {venue.photos.map((photo, i) => (
                      <img
                        key={photo.publicId || i}
                        src={photo.url}
                        alt={`${venue.name} ${i + 1}`}
                        className={`w-full rounded-lg object-cover shadow-md aspect-[4/3] ${i === 0 && venue.photos.length % 2 !== 0 ? 'col-span-2' : ''}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center aspect-[4/3]">
                    <Building size={64} className="text-teal-200" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
