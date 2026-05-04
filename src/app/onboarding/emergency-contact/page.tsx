"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  validateContactName,
  validateMobileRequired,
  validateEmail,
  validateRelationshipDropdown,
} from "@/lib/validations";
import { RELATIONSHIP_OPTIONS } from "@/lib/relationship-options";
import FieldError from "@/components/FieldError";
import {
  UserPlus,
  ArrowRight,
  Loader2,
  SkipForward,
  AlertTriangle,
  Plus,
  X,
  Phone,
  Mail,
} from "lucide-react";

interface ContactForm {
  name: string;
  relation: string;
  otherRelation: string;
  phone: string;
  email: string;
}

const EMPTY_CONTACT: ContactForm = {
  name: "",
  relation: "",
  otherRelation: "",
  phone: "",
  email: "",
};

export default function EmergencyContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contacts, setContacts] = useState<ContactForm[]>([{ ...EMPTY_CONTACT }]);
  const [contactErrors, setContactErrors] = useState<Record<string, string | null>[]>([{}]);
  const [contactTouched, setContactTouched] = useState<Record<string, boolean>[]>([{}]);

  const validateContactField = (index: number, field: string, value: string): string | null => {
    let err: string | null = null;
    switch (field) {
      case "name":         err = validateContactName(value); break;
      case "relation":     err = validateRelationshipDropdown(value); break;
      case "otherRelation":
        if (!value.trim()) err = "Please specify the relationship";
        break;
      // Both phone and email are hard mandatory for trusted contacts
      case "phone":        err = validateMobileRequired(value); break;
      case "email":        err = validateEmail(value); break;
    }
    setContactErrors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: err };
      return updated;
    });
    return err;
  };

  const handleContactBlur = (index: number, field: string, value: string) => {
    setContactTouched((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: true };
      return updated;
    });
    validateContactField(index, field, value);
  };

  const addContact = () => {
    if (contacts.length < 2) {
      setContacts([...contacts, { ...EMPTY_CONTACT }]);
      setContactErrors((prev) => [...prev, {}]);
      setContactTouched((prev) => [...prev, {}]);
    }
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
    setContactErrors((prev) => prev.filter((_, i) => i !== index));
    setContactTouched((prev) => prev.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: keyof ContactForm, value: string) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
    if (contactTouched[index]?.[field]) validateContactField(index, field, value);
    // Clear form-level error whenever the user edits any field
    setError("");
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      await supabase.from("profiles").update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasErrors = false;
    contacts.forEach((contact, index) => {
      if (contact.name.trim()) {
        const allTouched: Record<string, boolean> = {
          name: true,
          relation: true,
          phone: true,
          email: true,
        };
        if (contact.relation === "other") allTouched.otherRelation = true;
        setContactTouched((prev) => {
          const updated = [...prev];
          updated[index] = allTouched;
          return updated;
        });
        const nameErr        = validateContactField(index, "name", contact.name);
        const relErr         = validateContactField(index, "relation", contact.relation);
        const otherRelErr    = contact.relation === "other"
          ? validateContactField(index, "otherRelation", contact.otherRelation)
          : null;
        const phoneErr       = validateContactField(index, "phone", contact.phone);
        const emailErr       = validateContactField(index, "email", contact.email);
        if (nameErr || relErr || otherRelErr || phoneErr || emailErr) hasErrors = true;
      }
    });

    if (hasErrors) {
      setError("Please fix the errors above before continuing.");
      return;
    }

    const validContacts = contacts.filter((c) => c.name.trim());

    // If no contacts were started at all, treat the same as "Skip for now"
    if (validContacts.length === 0) {
      handleSkip();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error: insertError } = await supabase.from("trusted_contacts").insert(
        validContacts.map((c) => ({
          user_id: user.id,
          contact_name: c.name.trim(),
          relation: c.relation,
          relation_other: c.relation === "other" ? c.otherRelation.trim() || null : null,
          contact_phone: c.phone.trim(),
          contact_email: c.email.trim(),
          access_status: "PENDING",
        }))
      );
      if (insertError) throw insertError;

      // Mark onboarding as complete
      await supabase.from("profiles").update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      }).eq("id", user.id);

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
            <span className="text-sm text-gray-400">Your Profile</span>
          </div>
          <div className="w-8 h-px bg-green-300" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-vault-dark text-white flex items-center justify-center text-sm font-bold">2</div>
            <span className="text-sm font-medium text-vault-dark">Emergency Contact</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add a trusted contact</h1>
              <p className="text-sm text-gray-500">Someone who can access your vault in an emergency</p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Your trusted contact won&apos;t get access right away. They can only request access, and you&apos;ll need to approve it.
              They will only see a summary of your accounts — no passwords or full account numbers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {contacts.map((contact, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-xl space-y-4 relative">
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}

                <h3 className="text-sm font-semibold text-gray-700">Contact {index + 1}</h3>

                {/* Name */}
                <div>
                  <label className="label">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => updateContact(index, "name", e.target.value)}
                    onBlur={() => handleContactBlur(index, "name", contact.name)}
                    placeholder="e.g., Priya Kumar"
                    className={`input-field ${contactTouched[index]?.name && contactErrors[index]?.name ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                  />
                  <FieldError error={contactTouched[index]?.name ? contactErrors[index]?.name ?? null : null} />
                </div>

                {/* Relationship */}
                <div>
                  <label className="label">Relationship <span className="text-red-500">*</span></label>
                  <select
                    value={contact.relation}
                    onChange={(e) => updateContact(index, "relation", e.target.value)}
                    onBlur={() => handleContactBlur(index, "relation", contact.relation)}
                    className={`input-field ${contactTouched[index]?.relation && contactErrors[index]?.relation ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                  >
                    <option value="">Select relationship</option>
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <FieldError error={contactTouched[index]?.relation ? contactErrors[index]?.relation ?? null : null} />

                  {/* "Other" specify input */}
                  {contact.relation === "other" && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={contact.otherRelation}
                        onChange={(e) => updateContact(index, "otherRelation", e.target.value)}
                        onBlur={() => handleContactBlur(index, "otherRelation", contact.otherRelation)}
                        placeholder="e.g. Cousin, Uncle, Friend"
                        className={`input-field ${contactTouched[index]?.otherRelation && contactErrors[index]?.otherRelation ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                      />
                      <FieldError error={contactTouched[index]?.otherRelation ? contactErrors[index]?.otherRelation ?? null : null} />
                    </div>
                  )}
                </div>

                {/* Mobile + Email — both mandatory */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-800 mb-3">
                    We collect both mobile and email so your trusted contact can always be reached in an emergency.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="label">Mobile Number <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={contact.phone}
                          onChange={(e) => updateContact(index, "phone", e.target.value)}
                          onBlur={() => handleContactBlur(index, "phone", contact.phone)}
                          placeholder="98765 43210"
                          className={`input-field pl-9 ${contactTouched[index]?.phone && contactErrors[index]?.phone ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                        />
                      </div>
                      <FieldError error={contactTouched[index]?.phone ? contactErrors[index]?.phone ?? null : null} />
                    </div>
                    <div>
                      <label className="label">Email Address <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContact(index, "email", e.target.value)}
                          onBlur={() => handleContactBlur(index, "email", contact.email)}
                          placeholder="priya@example.com"
                          className={`input-field pl-9 ${contactTouched[index]?.email && contactErrors[index]?.email ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                        />
                      </div>
                      <FieldError error={contactTouched[index]?.email ? contactErrors[index]?.email ?? null : null} />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {contacts.length < 2 && (
              <button
                type="button"
                onClick={addContact}
                className="flex items-center gap-2 text-sm text-vault-accent font-medium hover:text-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add another contact (max 2)
              </button>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSkip}
                disabled={loading}
                className="btn-ghost flex-1"
              >
                <SkipForward className="w-4 h-4 mr-1.5" />
                Skip for now
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                ) : (
                  <>Finish setup <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
