import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, ExternalLink, Building } from 'lucide-react';
import PageHero from '../components/ui/PageHero';
import SectionHeader from '../components/ui/SectionHeader';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { congressAPI } from '../api/congress';
import { usecongress } from '../context/congressContext';

export default function Venue() {
  const { activeEdition } = usecongress();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, [activeEdition]);

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
                      <div>
                        <p className="text-slate-700 font-medium">
                          {[venue.address, venue.city, venue.state, venue.country].filter(Boolean).join(', ')}
                        </p>
                        {venue.postalCode && (
                          <p className="text-slate-500 text-sm">{venue.postalCode}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {venue.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-teal-600 shrink-0" />
                      <a href={`tel:${venue.phone}`} className="text-slate-700 hover:text-teal-700 transition-colors">
                        {venue.phone}
                      </a>
                    </div>
                  )}
                  {venue.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-teal-600 shrink-0" />
                      <a href={`mailto:${venue.email}`} className="text-slate-700 hover:text-teal-700 transition-colors">
                        {venue.email}
                      </a>
                    </div>
                  )}
                  {venue.website && (
                    <div className="flex items-center gap-3">
                      <ExternalLink size={18} className="text-teal-600 shrink-0" />
                      <a href={venue.website} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">
                        Visit venue website
                      </a>
                    </div>
                  )}
                </div>

                {venue.facilities && venue.facilities.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-3">Facilities</h4>
                    <div className="flex flex-wrap gap-2">
                      {venue.facilities.map((f) => (
                        <span key={f} className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {venue.mapUrl && (
                  <div className="mt-6">
                    <Button href={venue.mapUrl} size="lg">
                      <MapPin size={16} /> Get Directions
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {venue.image && (
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full rounded-lg object-cover shadow-md aspect-[4/3]"
                  />
                )}
                {!venue.image && (
                  <div className="w-full rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center aspect-[4/3]">
                    <Building size={64} className="text-teal-200" />
                  </div>
                )}
                {venue.mapEmbedUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-100 shadow-sm aspect-[4/3]">
                    <iframe
                      src={venue.mapEmbedUrl}
                      title="Venue Map"
                      className="w-full h-full"
                      loading="lazy"
                      allowFullScreen
                    />
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
