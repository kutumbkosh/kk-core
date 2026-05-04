// Shared relationship options used by the Nominee form and Trusted Contact form.
// Kept here (not in a page file) because Next.js App Router forbids arbitrary
// named exports from page.tsx files.

export const RELATIONSHIP_OPTIONS = [
  { value: "spouse",      label: "Spouse",      desc: "Husband or wife" },
  { value: "child",       label: "Child",        desc: "Son or daughter" },
  { value: "parent",      label: "Parent",       desc: "Father or mother" },
  { value: "sibling",     label: "Sibling",      desc: "Brother or sister" },
  { value: "grandchild",  label: "Grandchild",   desc: "Grandson or granddaughter" },
  { value: "grandparent", label: "Grandparent",  desc: "Grandfather or grandmother" },
  { value: "in_law",      label: "In-law",       desc: "Parent-in-law, sibling-in-law" },
  { value: "other",       label: "Other",        desc: "Any other relation" },
];
