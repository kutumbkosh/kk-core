"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { validateContactName, validatePhone, validateEmail, validateRelation } from "@/lib/validations";
import FieldError from "@/components/FieldError";
import {
  UserPlus,
  ArrowRight,
  Loader2,
  SkipForward,
  AlertTriangle,
  Plus,
  X,
} from "lucide-react";

interface ContactForm {
  name: string;
  relation: string;
  phone: string;
  email: string;
}

const EMPTY_CONTACT: ContactForm = {
  name: "",
  relation: "",
  phone: "",
  email: "",
};

export default function EmergencyContactPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contacts, setContacts] = useState<ContactForm[]>([
    { ...EMPTY_CONTACT },
  ]);
  const [contactErrors, setContactErrors] = useState<Record<string, string | null>[]>([{}]);
  const [contactTouched, setContactTouched] = useState<Record<string, boolean>[]>([{}]);

  const validateContactField = (index: number, field: string, value: string) => {
    let err: string | null = null;
    switch (field) {
      case "name": err = validateContactName(value); break;
      case "relation": err = validateRelation(value); break;
      case "phone": err = validatePhone(value); break;
      case "email":
        if (value.trim()) err = validateEmail(value);
        break;
    }
    setContactErrors(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: err };
      return updated;
    });
    return err;
  };

  const handleContactBlur = (index: number, field: string, value: string) => {
    setContactTouched(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: true };
      return updated;
    });
    validateContactField(index, field, value);
  };

  const addContact = () => {
    if (contacts.length < 2) {
      setContacts([...contacts, { ...EMPTY_CONTACT }]);
      setContactErrors(prev => [...prev, {}]);
      setContactTouched(prev => [...prev, {}]);
    }
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
    setContactErrors(prev => prev.filter((_, i) => i !== index));
    setContactTouched(prev => prev.filter((_, i) => i !== index));
  };

  const updateContact = (
    index: number,
    field: keyof ContactForm,
    value: string
  ) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], [field]: value };
    setContacts(updated);
    if (contactTouched[index]?.[field]) validateContactField(index, field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all contacts that have any data
    let hasErrors = false;
    contacts.forEach((contact, index) => {
      // Only validate contacts with at least a name entered
      if (contact.name.trim()) {
        const newTouched = { name: true, relation: true, phone: true, email: true };
        setContactTouched(prev => {
          const updated = [...prev];
          updated[index] = newTouched;
          return updated;
        });
        const nameErr = validateContactField(index, "name", contact.name);
        const relErr = validateContactField(index, "relation", contact.relation);
        const phoneErr = validateContactField(index, "phone", contact.phone);
        const emailErr = contact.email.trim() ? validateContactField(index, "email", contact.email) : null;
        if (nameErr || relErr || phoneErr || emailErr) hasErrors = true;
      }
    });

    if (hasErrors) {
      setError("Please fix the errors above before continuing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // Save contacts that have at least a name
      const validContacts = contacts.filter((c) => c.name.trim());

      if (validContacts.length > 0) {
        const { error: insertError } = await supabase
          .from("trusted_contacts")
          .insert(
            validContacts.map((c) => ({
              user_id: user.id,
              contact_name: c.name.trim(),
              relation: c.relation,
              contact_phone: c.phone.trim() || null,
              contact_email: c.email.trim() || null,
              access_status: "PENDING",
            }))
          );

        if (insertError) throw insertError;
      }

      // Mark onboarding as complete
      await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
              ✓
            </div>
            <span className="text-sm text-gray-400">Your Profile</span>
          </div>
          <div className="w-8 h-px bg-green-300" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-vault-dark text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <span className="text-sm font-medium text-vault-dark">
              Emergency Contact
            </span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add a trusted contact
              </h1>
              <p className="text-sm text-gray-500">
                Someone who can access your vault in an emergency
              </p>
            </div>
          </div>

          {/* Info callout */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Your trusted contact won&apos;t get access right away. They can
              only request access, and you&apos;ll need to approve it. They
              will only see a summary of your accounts (no passwords or full
              account numbers).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {contacts.map((contact, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-xl space-y-4 relative"
              >
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}

                <h3 className="text-sm font-semibold text-gray-700">
                  Contact {index + 1}
                </h3>

                <div>
                  <label className="label">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) =>
                      updateContact(index, "name", e.target.value)
                    }
                    onBlur={() => handleContactBlur(index, "name", contact.name)}
                    placeholder="e.g., Priya Kumar"
                    className={`input-field ${contactTouched[index]?.name && contactErrors[index]?.name ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                  />
                  <FieldError error={contactTouched[index]?.name ? contactErrors[index]?.name ?? null : null} />
                </div>

                <div>
                  <label className="label">Relation <span className="text-red-500">*</span></label>
                  <select
                    value={contact.relation}
                    onChange={(e) =>
                      updateContact(index, "relation", e.target.value)
                    }
                    onBlur={() => handleContactBlur(index, "relation", contact.relation)}
                    className={`input-field ${contactTouched[index]?.relation && contactErrors[index]?.relation ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                  >
                    <option value="">Select relation</option>
                    <option value="SPOUSE">Spouse</option>
                    <option value="CHILD">Child</option>
                    <option value="PARENT">Parent</option>
                    <option value="SIBLING">Sibling</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <FieldError error={contactTouched[index]?.relation ? contactErrors[index]?.relation ?? null : null} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) =>
                        updateContact(index, "phone", e.target.value)
                      }
                      onBlur={() => handleContactBlur(index, "phone", contact.phone)}
                      placeholder="+91 98765 43210"
                      className={`input-field ${contactTouched[index]?.phone && contactErrors[index]?.phone ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                    />
                    <FieldError error={contactTouched[index]?.phone ? contactErrors[index]?.phone ?? null : null} />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) =>
                        updateContact(index, "email", e.target.value)
                      }
                      onBlur={() => handleContactBlur(index, "email", contact.email)}
                      placeholder="email@example.com"
                      className={`input-field ${contactTouched[index]?.email && contactErrors[index]?.email ? "border-red-300 focus:ring-red-500 focus:border-red-500" : ""}`}
                    />
                    <FieldError error={contactTouched[index]?.email ? contactErrors[index]?.email ?? null : null} />
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
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
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Finish setup
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
