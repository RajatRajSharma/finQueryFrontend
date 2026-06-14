import "./Contact.css";

function Contact() {
  return (
    <section id="contact" className="section contact">
      <div className="container contact__inner">
        <h2 className="section-title">Contact the creator</h2>
        <p className="section-subtitle">
          Have feedback, a bug, or an idea? I'd genuinely like to hear it.
        </p>
        <a
          className="btn btn-primary contact__btn"
          href="mailto:neeraj.kumar@dynamatix.com?subject=FinQuery%20feedback"
        >
          ✉️ Send feedback
        </a>
      </div>
    </section>
  );
}

export default Contact;
