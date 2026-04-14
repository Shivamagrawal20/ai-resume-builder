function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3);
}

function uniqueWords(words) {
  return [...new Set(words)];
}

function countQuantifiedAchievements(lines) {
  const quantifiedPattern = /\b\d+(\.\d+)?%?\b|\b(k|m|b)\b/i;
  return lines.filter((line) => quantifiedPattern.test(line)).length;
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function linesFromRawHtml(rawHtml) {
  const plain = stripHtml(rawHtml);
  if (!plain) return [];
  return plain
    .split(/\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

function extractContactHintsFromText(text) {
  const t = String(text || "");
  const email = t.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const phone = t.match(/\+?\d[\d\s().-]{8,}\d/);
  const linkedin = t.match(/linkedin\.com\/[A-Za-z0-9\-_/]+/i);
  return {
    email: email ? email[0] : "",
    phone: phone ? phone[0].trim() : "",
    linkedin: linkedin ? linkedin[0] : "",
  };
}

function inferCompletenessFromPlain(plain, structured) {
  const p = plain.toLowerCase();
  const hasSummary =
    Boolean(String(structured?.summary || "").trim()) ||
    /summary|professional profile|about me|objective/.test(p) ||
    plain.length > 400;
  const hasExperience =
    (Array.isArray(structured?.experiences) && structured.experiences.length > 0) ||
    /experience|employment|work history|professional experience/.test(p);
  const hasEducation =
    (Array.isArray(structured?.educations) && structured.educations.length > 0) ||
    /education|university|degree|bachelor|master|b\.?tech|b\.?a\.?/.test(p);
  const hasSkills =
    Boolean(String(structured?.skillsText || "").trim()) ||
    /skills|technical skills|competencies|technologies|tools/.test(p);
  return { hasSummary, hasExperience, hasEducation, hasSkills };
}

function extractTextLines(content) {
  const summary = String(content?.summary || "");
  const experiences = Array.isArray(content?.experiences) ? content.experiences : [];
  const skillsText = String(content?.skillsText || "");
  const education = Array.isArray(content?.educations) ? content.educations : [];

  const lines = [];
  if (summary) lines.push(summary);
  experiences.forEach((exp) => {
    lines.push(String(exp?.title || ""));
    lines.push(String(exp?.company || ""));
    lines.push(String(exp?.desc || ""));
  });
  if (skillsText) lines.push(skillsText);
  education.forEach((edu) => {
    lines.push(String(edu?.degree || ""));
    lines.push(String(edu?.institution || ""));
  });

  const rawHtml = String(content?.rawHtml || "");
  if (rawHtml.trim()) {
    linesFromRawHtml(rawHtml).forEach((line) => lines.push(line));
  }

  return lines.filter(Boolean);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function scoreResumeForAts({ content, jobDescription = "" }) {
  const safeContent = content && typeof content === "object" ? content : {};
  const lines = extractTextLines(safeContent);
  const resumeText = lines.join(" ");
  const resumeWords = uniqueWords(tokenize(resumeText));
  const jdWords = uniqueWords(tokenize(jobDescription));

  const plainFromRaw = stripHtml(safeContent?.rawHtml || "");
  const inferred = inferCompletenessFromPlain(plainFromRaw, safeContent);
  const hasSummary = inferred.hasSummary;
  const hasExperience = inferred.hasExperience;
  const hasEducation = inferred.hasEducation;
  const hasSkills = inferred.hasSkills;

  const completenessHits = [hasSummary, hasExperience, hasEducation, hasSkills].filter(Boolean).length;
  const completenessScore = (completenessHits / 4) * 20;

  const quantifiedCount = countQuantifiedAchievements(lines);
  const quantifiedScore = clamp(quantifiedCount * 5, 0, 15);

  const headerContact = safeContent?.header || {};
  const hints = extractContactHintsFromText(plainFromRaw || resumeText);
  const contact = {
    email: String(headerContact?.email || hints.email || "").trim(),
    phone: String(headerContact?.phone || hints.phone || "").trim(),
    linkedin: String(headerContact?.linkedin || hints.linkedin || "").trim(),
  };
  const hasEmail = Boolean(contact.email);
  const hasPhone = Boolean(contact.phone);
  const hasLinkedin = Boolean(contact.linkedin);
  const basicsScore = ([hasEmail, hasPhone, hasLinkedin].filter(Boolean).length / 3) * 10;

  const avgLineLength = lines.length
    ? lines.reduce((sum, line) => sum + String(line).length, 0) / lines.length
    : 0;
  const readabilityScore = clamp(15 - Math.max(0, (avgLineLength - 120) / 12), 0, 15);

  let keywordScore = 20;
  let keywordMatchPct = null;
  let missingKeywords = [];
  /** @type {{ found: string[]; partial: string[]; missing: string[] }} */
  let keywordBank = { found: [], partial: [], missing: [] };
  const resumeLower = resumeText.toLowerCase();

  function isPartialMatch(jw) {
    if (resumeLower.includes(jw)) return true;
    for (const rw of resumeWords) {
      if (rw.length < 4) continue;
      if (rw.includes(jw) || jw.includes(rw)) return true;
    }
    return false;
  }

  if (jdWords.length > 0) {
    const jdStop = new Set([
      "need", "that", "this", "with", "from", "have", "will", "your", "their", "were", "been", "being",
      "must", "shall", "should", "about", "under", "over", "into", "such", "only", "some", "more", "most",
      "than", "also", "when", "what", "where", "able", "each", "make", "made", "many", "much", "very",
    ]);
    const importantKeywords = jdWords.filter((w) => w.length >= 4 && !jdStop.has(w)).slice(0, 40);
    if (importantKeywords.length > 0) {
      const matched = importantKeywords.filter((w) => resumeWords.includes(w));
      const ratio = matched.length / importantKeywords.length;
      keywordScore = ratio * 40;
      keywordMatchPct = Math.round(ratio * 100);
      missingKeywords = importantKeywords.filter((w) => !resumeWords.includes(w)).slice(0, 8);

      const seen = new Set();
      for (const kw of importantKeywords) {
        if (seen.has(kw)) continue;
        seen.add(kw);
        if (resumeWords.includes(kw)) {
          keywordBank.found.push(kw);
        } else if (isPartialMatch(kw)) {
          keywordBank.partial.push(kw);
        } else {
          keywordBank.missing.push(kw);
        }
      }
    }
  }

  const total = Math.round(
    clamp(keywordScore + completenessScore + quantifiedScore + readabilityScore + basicsScore, 0, 100)
  );

  const suggestions = [];
  if (!hasSummary) {
    suggestions.push({
      type: "missing_summary",
      message: "Add a 2-3 line professional summary tailored to your target role.",
      example:
        "Results-driven full-stack developer with 2+ years of experience building scalable web apps and improving API performance by 35%.",
      targetField: "summary",
    });
  }
  if (quantifiedCount < 2) {
    suggestions.push({
      type: "add_metrics",
      message: "Use measurable impact in experience bullets (%, time saved, revenue, users).",
      example:
        "Improved API response time by 35% and reduced deployment failures by 22% through CI/CD automation.",
      targetField: "experience",
    });
  }
  if (missingKeywords.length > 0) {
    suggestions.push({
      type: "keywords",
      message: `Add more job-relevant keywords: ${missingKeywords.join(", ")}.`,
      example: `Experienced with ${missingKeywords.slice(0, 4).join(", ")} in production workflows.`,
      targetField: "summary",
    });
  }
  if (!hasLinkedin) {
    suggestions.push({
      type: "contact",
      message: "Add LinkedIn profile for stronger recruiter trust.",
      example: "linkedin.com/in/your-profile",
      targetField: "header.linkedin",
    });
  }

  return {
    score: total,
    breakdown: {
      keywords: Math.round(keywordScore),
      completeness: Math.round(completenessScore),
      quantifiedImpact: Math.round(quantifiedScore),
      readability: Math.round(readabilityScore),
      basics: Math.round(basicsScore),
    },
    keywordMatchPct,
    missingKeywords,
    keywordBank,
    targetRoleHint: (() => {
      const jd = String(jobDescription || "").trim();
      if (!jd) return "";
      const line = jd.split(/[\r\n]+/)[0].trim();
      return line.length > 60 ? line.slice(0, 57) + "…" : line;
    })(),
    suggestions: suggestions.slice(0, 5),
  };
}

