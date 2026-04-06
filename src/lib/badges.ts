/**
 * Civic badges based on user activity.
 * Calculated dynamically from DB counts — no stored score field needed.
 */

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  threshold: number; // minimum count to earn
}

export const BADGES = {
  sesizari: [
    { id: "first-sesizare", name: "Prima sesizare", icon: "🌱", description: "Ai depus prima sesizare", threshold: 1 },
    { id: "active-citizen", name: "Cetățean activ", icon: "🌿", description: "5 sesizări depuse", threshold: 5 },
    { id: "civic-leader", name: "Civic Leader", icon: "🌳", description: "20 sesizări depuse", threshold: 20 },
    { id: "hero-bucharest", name: "Hero București", icon: "🏆", description: "50 sesizări depuse", threshold: 50 },
  ],
  votes: [
    { id: "first-vote", name: "Prima voce", icon: "👍", description: "Ai votat prima sesizare", threshold: 1 },
    { id: "regular-voter", name: "Votant fidel", icon: "🗳️", description: "50 voturi date", threshold: 50 },
  ],
  comments: [
    { id: "first-comment", name: "Primul comentariu", icon: "💬", description: "Ai lăsat un comentariu", threshold: 1 },
    { id: "active-commenter", name: "Vocea comunității", icon: "📢", description: "20 comentarii", threshold: 20 },
  ],
  verifications: [
    { id: "first-verify", name: "Verificator", icon: "✅", description: "Ai verificat o rezolvare", threshold: 1 },
    { id: "trusted-verifier", name: "Verificator de încredere", icon: "🛡️", description: "10 verificări", threshold: 10 },
  ],
  resolved: [
    { id: "first-resolved", name: "Problemă rezolvată!", icon: "🎉", description: "O sesizare de-a ta a fost rezolvată", threshold: 1 },
    { id: "impact-maker", name: "Impact real", icon: "⭐", description: "5 sesizări rezolvate", threshold: 5 },
  ],
};

export interface UserBadges {
  earned: { badge: Badge; count: number }[];
  next: { badge: Badge; current: number; remaining: number }[];
}

export function computeBadges(counts: {
  sesizari: number;
  votes: number;
  comments: number;
  verifications: number;
  resolved: number;
}): UserBadges {
  const earned: UserBadges["earned"] = [];
  const next: UserBadges["next"] = [];

  const checkCategory = (category: Badge[], count: number) => {
    for (const badge of category) {
      if (count >= badge.threshold) {
        earned.push({ badge, count });
      } else {
        next.push({ badge, current: count, remaining: badge.threshold - count });
        break; // only show next unearned badge per category
      }
    }
  };

  checkCategory(BADGES.sesizari, counts.sesizari);
  checkCategory(BADGES.votes, counts.votes);
  checkCategory(BADGES.comments, counts.comments);
  checkCategory(BADGES.verifications, counts.verifications);
  checkCategory(BADGES.resolved, counts.resolved);

  return { earned, next };
}
