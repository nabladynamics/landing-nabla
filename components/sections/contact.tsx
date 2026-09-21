"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { CTA } from "@/components/ui/cta";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { submitContact, type ContactPayload } from "@/lib/submit-contact";
import { container, site } from "@/lib/site";

type FieldErrors = Partial<Record<keyof ContactPayload, string>>;
type Status = "idle" | "submitting" | "success" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full rounded-ctl border border-line-strong bg-white px-4 py-3 text-base text-frost placeholder:text-fog transition-colors focus:border-volt focus:outline-none focus:ring-2 focus:ring-volt/10 aria-[invalid=true]:border-red-600";

const labelClass =
  "mb-2 block text-sm font-medium text-frost";

const emptyForm: ContactPayload = { name: "", email: "", company: "", message: "" };

const talkAbout = [
  "Early access for teams with geometries that are hard to mesh",
  "Benchmark cases you would like to see run",
  "Research and industry partnerships",
];

function validate(values: ContactPayload): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = "Please tell us your name.";
  if (!values.email.trim()) {
    errors.email = "Please add an email address.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "That email address doesn't look valid.";
  }
  if (!values.message.trim()) {
    errors.message = "Please add a short message.";
  }
  return errors;
}

export function Contact({ standalone = false }: { standalone?: boolean }) {
  const [values, setValues] = useState<ContactPayload>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  const setField = (field: keyof ContactPayload) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    setStatus("submitting");
    try {
      await submitContact(values);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setValues(emptyForm);
    setErrors({});
    setStatus("idle");
  };

  return (
    <section
      id="contact"
      className={
        standalone
          ? "pb-24 pt-36 sm:pt-40 md:pb-32"
          : "border-t border-line bg-raise/50 py-24 md:py-32"
      }
    >
      <div className={container}>
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <SectionHeading
              title="Tell us about your simulation workloads."
              lede="We are talking to engineering teams tired of meshing, simulation companies, researchers and investors interested in the next generation of CFD. If that is you, we would like to hear what you are running today."
            />
            <Reveal delay={0.15}>
              <ul className="mt-9 space-y-3 text-[15px] leading-relaxed text-fog">
                {talkAbout.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-volt"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap gap-4">
                <CTA href={site.calendly}>
                  Book a conversation
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </CTA>
                <CTA href="#contact-form" variant="secondary" className="lg:hidden">
                  Send a message
                </CTA>
              </div>
              <p className="mt-10 text-sm text-fog">{site.locations}</p>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <div className="rounded-card border border-line bg-white p-6 shadow-[0_12px_48px_rgba(24,35,49,0.05)] sm:p-8 lg:p-10">
              {status === "success" ? (
                <div
                  className="flex min-h-[420px] flex-col items-center justify-center text-center"
                  role="status"
                >
                  <CheckCircle2
                    className="h-10 w-10 text-volt"
                    aria-hidden="true"
                  />
                  <h3 className="mt-5 font-display text-xl font-semibold text-frost">
                    Message received.
                  </h3>
                  <p className="mt-2 max-w-sm text-base leading-relaxed text-fog">
                    Thanks for reaching out. We’ll get back to you shortly. If
                    it’s time-sensitive, book a slot directly on our calendar.
                  </p>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-7 rounded-ctl border border-line-strong px-4 py-2.5 text-sm font-medium text-frost transition-colors hover:border-volt/70 hover:bg-volt/5"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form id="contact-form" onSubmit={onSubmit} noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className={labelClass}>
                        Name *
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        className={inputClass}
                        placeholder="Ada Lovelace"
                        value={values.name}
                        onChange={(e) => setField("name")(e.target.value)}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "error-name" : undefined}
                      />
                      {errors.name ? (
                        <p id="error-name" className="mt-1.5 text-sm text-red-700">
                          {errors.name}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label htmlFor="contact-email" className={labelClass}>
                        Email *
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={inputClass}
                        placeholder="you@company.com"
                        value={values.email}
                        onChange={(e) => setField("email")(e.target.value)}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? "error-email" : undefined}
                      />
                      {errors.email ? (
                        <p id="error-email" className="mt-1.5 text-sm text-red-700">
                          {errors.email}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5">
                    <label htmlFor="contact-company" className={labelClass}>
                      Company
                    </label>
                    <input
                      id="contact-company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      className={inputClass}
                      placeholder="Where you work"
                      value={values.company}
                      onChange={(e) => setField("company")(e.target.value)}
                    />
                  </div>

                  <div className="mt-5">
                    <label htmlFor="contact-message" className={labelClass}>
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      className={`${inputClass} resize-y`}
                      placeholder="Tell us about your simulation workloads, or what you'd like to explore together."
                      value={values.message}
                      onChange={(e) => setField("message")(e.target.value)}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={
                        errors.message ? "error-message" : undefined
                      }
                    />
                    {errors.message ? (
                      <p id="error-message" className="mt-1.5 text-sm text-red-700">
                        {errors.message}
                      </p>
                    ) : null}
                  </div>

                  <div aria-live="polite">
                    {status === "error" ? (
                      <div className="mt-5 flex items-start gap-3 rounded-ctl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        <AlertCircle
                          className="mt-0.5 h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                        Something went wrong while sending your message. Please
                        try again, or book a call instead.
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-ctl bg-cta px-5 py-3.5 text-base font-medium text-white transition-colors hover:bg-cta-bright disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        Sending…
                      </>
                    ) : (
                      "Send message"
                    )}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
