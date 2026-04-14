import Header from "./sections/Header";
import Section from "./sections/Section";

export default function ResumeRenderer({ templateId, data, full = false }) {
  const {
    fullName,
    emailAddress,
    phone,
    linkedinUrl,
    githubUrl,
    summary,
    firstExperience,
    firstEducation,
    firstCertification,
    parsedSkills,
  } = data;

  const hasExperience =
    firstExperience?.role ||
    firstExperience?.company ||
    firstExperience?.startDate ||
    firstExperience?.endDate ||
    firstExperience?.highlights;
  const hasEducation = firstEducation?.university || firstEducation?.branch || firstEducation?.cpi;
  const hasCertification = firstCertification?.issuer || firstCertification?.description;
  const hasSummary = Boolean(summary && summary.trim());
  const hasSkills = parsedSkills.length > 0;

  return (
    <div className={`resume-preview template-${templateId}${full ? " full" : ""}`}>
      <Header
        fullName={fullName}
        emailAddress={emailAddress}
        phone={phone}
        linkedinUrl={linkedinUrl}
        githubUrl={githubUrl}
      />

      <Section title="Summary">{hasSummary ? <p>{summary}</p> : null}</Section>

      <Section title="Experience">
        {hasExperience ? (
          <>
            <p className="rp-title">
              {firstExperience.role || "Role"} — {firstExperience.company || "Company"}
            </p>
            <p className="rp-muted">
              {firstExperience.startDate || "Start"} to {firstExperience.endDate || "End"}
            </p>
            <p>{firstExperience.highlights || "Experience highlights"}</p>
          </>
        ) : null}
      </Section>

      {hasEducation || hasSkills ? (
        <section className="rp-two">
          <Section title="Education">
            {hasEducation ? (
              <>
                <p className="rp-title">{firstEducation.university || "University Name"}</p>
                <p className="rp-muted">
                  {firstEducation.branch || "Branch"} {firstEducation.cpi ? `• CPI ${firstEducation.cpi}` : ""}
                </p>
              </>
            ) : null}
          </Section>
          <Section title="Skills">
            {hasSkills ? (
              <div className="rp-skills">
                {parsedSkills.slice(0, 12).map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            ) : null}
          </Section>
        </section>
      ) : null}

      <Section title="Certification">
        {hasCertification ? (
          <>
            <p className="rp-title">{firstCertification.issuer || "Issuer"}</p>
            <p>{firstCertification.description || "Certification details"}</p>
          </>
        ) : null}
      </Section>

      {!hasSummary && !hasExperience && !hasEducation && !hasSkills && !hasCertification ? (
        <Section title="Preview">
          <p>Fill the editor fields to generate your live template preview.</p>
        </Section>
      ) : null}
    </div>
  );
}
