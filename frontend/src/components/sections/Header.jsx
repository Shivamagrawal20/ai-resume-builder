export default function Header({ fullName, emailAddress, phone, linkedinUrl, githubUrl }) {
  return (
    <header className="rp-header">
      <h3>{fullName || "Your Name"}</h3>
      <p>
        {emailAddress || "email@example.com"} {phone ? `• ${phone}` : ""}
      </p>
      <p>
        {linkedinUrl || githubUrl
          ? `${linkedinUrl || ""} ${linkedinUrl && githubUrl ? "•" : ""} ${githubUrl || ""}`
          : "LinkedIn • GitHub"}
      </p>
    </header>
  );
}
