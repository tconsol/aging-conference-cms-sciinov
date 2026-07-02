import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHero from '../components/ui/PageHero';
import Spinner from '../components/ui/Spinner';
import { peopleAPI } from '../api/people';

/* ── Futuristic card same teal/white/slate palette ── */
function MemberCard({ member, index, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const initials = member.fullName
    ? member.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')
    : 'M';

  return (
    /* drop-shadow wrapper so glow works around clip-path */
    <div
      style={{
        filter: hovered
          ? 'drop-shadow(0 0 12px rgba(13,148,136,0.35)) drop-shadow(0 4px 16px rgba(13,148,136,0.15))'
          : 'drop-shadow(0 1px 3px rgba(0,0,0,0.06))',
        transition: 'filter 0.25s ease, transform 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onSelect(member._id)}
        style={{
          position: 'relative',
          background: '#ffffff',
          /* top-right corner cut */
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)',
          border: `1px solid ${hovered ? '#14b8a6' : '#e2e8f0'}`,
          padding: '22px 16px 18px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.25s ease',
          overflow: 'visible',
        }}
      >

        {/* ── Top scan-line ── */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 2,
          background: hovered
            ? 'linear-gradient(90deg, transparent 0%, #0d9488 40%, #14b8a6 60%, transparent 100%)'
            : 'transparent',
          transition: 'background 0.3s ease',
        }} />

        {/* ── Corner triangle accent ── */}
        <div style={{
          position: 'absolute',
          top: -1, right: -1,
          width: 20, height: 20,
          background: hovered ? '#0d9488' : '#e2e8f0',
          clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
          transition: 'background 0.25s ease',
        }} />

        {/* ── Index number ── */}
        <span style={{
          position: 'absolute',
          top: 8, left: 10,
          fontSize: 9,
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '0.1em',
          color: hovered ? '#0d9488' : '#cbd5e1',
          transition: 'color 0.25s ease',
        }}>
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* ── Hexagonal avatar ── */}
        <div style={{ marginBottom: 12, marginTop: 10 }}>
          {member.photo ? (
            <div style={{
              width: 66, height: 66,
              clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
              overflow: 'hidden',
            }}>
              <img
                src={member.photo}
                alt={member.fullName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          ) : (
            <div style={{
              width: 66, height: 66,
              clipPath: 'polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)',
              background: hovered
                ? 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)'
                : '#f0fdf9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.25s ease',
            }}>
              <span style={{
                fontSize: 21,
                fontWeight: 800,
                color: '#0f766e',
                letterSpacing: '-0.03em',
              }}>{initials}</span>
            </div>
          )}
        </div>

        {/* ── Name ── */}
        <h3 style={{
          fontSize: 13,
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: 3,
          lineHeight: 1.3,
        }}>
          {member.fullName || 'Committee Member'}
        </h3>

        {/* ── Title ── */}
        {member.designation && (
          <p style={{ fontSize: 11, color: '#64748b', marginBottom: 2, lineHeight: 1.4 }}>
            {member.designation}
          </p>
        )}

        {/* ── Institution ── */}
        {member.organization && (
          <p style={{ fontSize: 11, color: '#0d9488', fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>
            {member.organization}
          </p>
        )}

        {/* ── Country chip ── */}
        {member.country && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 9,
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: hovered ? '#0f766e' : '#94a3b8',
            background: hovered ? '#f0fdf9' : '#f8fafc',
            border: `1px solid ${hovered ? '#99f6e4' : '#e2e8f0'}`,
            padding: '2px 8px',
            transition: 'all 0.25s ease',
          }}>
            <span style={{
              width: 4, height: 4, borderRadius: '50%',
              background: hovered ? '#14b8a6' : '#94a3b8',
              display: 'inline-block',
              transition: 'background 0.25s ease',
            }} />
            {member.country}
          </span>
        )}

        {/* ── Bottom teal bar ── */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 2,
          background: hovered
            ? 'linear-gradient(90deg, #0d9488, #14b8a6, #2dd4bf, #14b8a6, #0d9488)'
            : 'transparent',
          transition: 'background 0.3s ease',
        }} />
      </div>
    </div>
  );
}

/* ── Role group with circuit-style header ── */
function RoleGroup({ role, members, onSelect }) {
  return (
    <div style={{ marginBottom: 52 }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
      }}>
        {/* Left accent */}
        <div style={{ width: 3, height: 20, background: '#0d9488', flexShrink: 0 }} />

        {/* Role label */}
        <span style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#0f172a',
          fontFamily: 'monospace',
        }}>
          {role}
        </span>

        {/* Circuit dots separator */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
          <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, #e2e8f0, transparent)' }} />
          {[0,1,2].map((i) => (
            <div key={i} style={{
              width: 4, height: 4, borderRadius: '50%',
              background: i === 1 ? '#14b8a6' : '#cbd5e1',
              flexShrink: 0,
            }} />
          ))}
        </div>

        {/* Count badge */}
        <span style={{
          fontSize: 9,
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: '#0d9488',
          background: '#f0fdf9',
          border: '1px solid #99f6e4',
          padding: '2px 8px',
          whiteSpace: 'nowrap',
        }}>
          {String(members.length).padStart(2, '0')} nodes
        </span>
      </div>

      {/* Cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
        gap: 16,
      }}>
        {members.map((m, i) => (
          <MemberCard key={m._id} member={m} index={i} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

export default function Committee() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    peopleAPI.getCommittee()
      .then((res) => {
        const data = res.data?.data ?? res.data ?? [];
        setMembers(Array.isArray(data) ? data : []);
      })
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, []);

  const groups = members.reduce((acc, m) => {
    const role = m.role || m.category || 'Committee';
    if (!acc[role]) acc[role] = [];
    acc[role].push(m);
    return acc;
  }, {});

  return (
    <div>
      <PageHero
        title="Scientific Committee"
        subtitle="Distinguished scientists and experts guiding the congress's scientific program."
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Committee' }]}
      />

      {/* Subtle dot-grid bg */}
      <section style={{
        background: '#f8fafc',
        backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        padding: '56px 0 72px',
      }}>
        <div className="container-custom">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <Spinner size="lg" />
            </div>
          ) : members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}>
                <div style={{ width: 32, height: 1, background: '#14b8a6' }} />
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#14b8a6' }} />
                <div style={{ width: 32, height: 1, background: '#14b8a6' }} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                Committee Forthcoming
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', maxWidth: 380, margin: '0 auto', fontFamily: 'monospace' }}>
                // members will be announced prior to congress
              </p>
            </div>
          ) : (
            <div>
              {Object.entries(groups).map(([role, group]) => (
                <RoleGroup key={role} role={role} members={group} onSelect={(id) => navigate(`/committee/${id}`)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
