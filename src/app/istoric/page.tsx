import { redirect } from "next/navigation";

// The "istoric" dataset is currently București-specific (primarii
// Capitalei + Consiliul General, 1990→azi). The old /istoric route
// lived here as the de-facto landing for that content, while the
// newer /[judet]/istoric renders generic primarii per county.
// Collapse the duplication by permanently redirecting /istoric to
// the București-scoped page, so there's a single source of truth.
export default function IstoricRedirect(): never {
  redirect("/b/istoric");
}
