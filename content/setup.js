/* SETUP — the opening state. Change a number here and the game starts differently. */
const SETUP = {
  startDate: "2287-04-11", session: 4, sitting: 1,
  pm: "flash", playerParty: "cu",
  coalition: ["cu","psa","rv"],
  confidenceSupply: ["upl","geo"],
  scalars: { party_loyalty:38, public_standing:44, consumables:71,
             thermal_margin:17, treasury:52 },
  law: { divergence_threshold_hours:168, civic_clock_minimum:0,
         suspension_debt_accrual:true, substrate_public_share:0.35, shed_order_authority:"engineering_authority",
         tier_ratio_district:140, tier_ratio_list:100, threshold_pct:4,
         /* Bible 4.10: the divisor is a bill, not a constant. D'Hondt favours
            large parties, Sainte-Lague small ones, and the two tiers are two
            separate fights. Values: "dhondt" | "sainte_lague". */
         district_divisor:"dhondt", list_divisor:"dhondt" },
  slotsPerSession: 6,
  /* opening ledger. Positive means they owe you. */
  capital: { psa: 2, rv: -3, upl: 0, geo: 1 },
  president: { id:"tenaya", relationship:22,
               powers:["dissolution","formation","referral","appointments"] },
  thresholds: { leadershipChallenge: 15 }
};
