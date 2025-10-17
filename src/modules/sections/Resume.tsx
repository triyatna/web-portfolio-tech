import React from "react";

type Item = { title?: string; org?: string; period?: string; details?: string };
type ResumeData = {
  education: Array<Item>;
  experience: Array<Item>;
  skills: string[];
};

export const Resume: React.FC<{ resume: ResumeData }> = ({ resume }) => {
  const hasSkills = Array.isArray(resume.skills) && resume.skills.length > 0;
  const hasExp = Array.isArray(resume.experience) && resume.experience.length > 0;
  const hasEdu = Array.isArray(resume.education) && resume.education.length > 0;

  const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="rounded-lg border border-subtle bg-surface px-2.5 py-1 text-sm leading-6 shadow-sm hover:shadow-md transition">
      {children}
    </span>
  );

  const Timeline: React.FC<{ items: Item[]; emptyText: string; labelId: string }> = ({
    items,
    emptyText,
    labelId,
  }) => {
    if (!items?.length) {
      return <p className="text-muted">{emptyText}</p>;
    }

    return (
      <ul role="list" aria-labelledby={labelId} className="relative ml-3 border-l border-subtle">
        {items.map((e, i) => (
          <li key={i} className="relative pl-6 py-4">
            <span
              aria-hidden="true"
              className="absolute left-[-7px] top-5 h-2.5 w-2.5 rounded-full bg-[color:var(--accent)] ring-2 ring-[color:var(--bg)]"
            />
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <h4 className="font-semibold">{e.title || "—"}</h4>
              {e.org && <span className="text-muted">— {e.org}</span>}
            </div>
            {(e.period || e.details) && (
              <div className="mt-1 text-sm">
                {e.period && (
                  <span className="mr-2 rounded-md border border-subtle bg-[color:var(--bg)] px-2 py-0.5 font-mono text-xs">
                    {e.period}
                  </span>
                )}
                {e.details && (
                  <p className="mt-2 leading-relaxed text-[color:var(--text)]/90">{e.details}</p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold mb-2">Resume</h2>
      <div className="rounded-2xl border border-subtle bg-[color:var(--bg)]/55 backdrop-blur-xl shadow-lg p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold">Skills</h3>
          {hasSkills && <span className="text-xs text-muted">{resume.skills.length} skills</span>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {hasSkills ? (
            resume.skills.map((s, i) => <Chip key={i}>{s}</Chip>)
          ) : (
            <span className="text-muted">No skills added.</span>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-subtle bg-[color:var(--bg)]/55 backdrop-blur-xl shadow-lg p-6 sm:p-8">
          <h3 id="resume-experience" className="text-lg font-semibold">
            Experience
          </h3>
          <div className="mt-4">
            <Timeline
              items={resume.experience}
              emptyText="No experience added."
              labelId="resume-experience"
            />
          </div>
        </article>

        <article className="rounded-2xl border border-subtle bg-[color:var(--bg)]/55 backdrop-blur-xl shadow-lg p-6 sm:p-8">
          <h3 id="resume-education" className="text-lg font-semibold">
            Education
          </h3>
          <div className="mt-4">
            <Timeline
              items={resume.education}
              emptyText="No education added."
              labelId="resume-education"
            />
          </div>
        </article>
      </div>

      <style>{`
        article::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 1rem;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
        }
      `}</style>
    </section>
  );
};
