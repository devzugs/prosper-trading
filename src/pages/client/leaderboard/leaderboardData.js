// ─── Leaderboard mock data ────────────────────────────────────────────────────
// Each investor has profits for all-time, 30d, and 7d windows

const PLANS = ["Starter", "Growth", "Elite"];

const FIRST_NAMES = [
  "James","Sophia","Liam","Emma","Noah","Olivia","Ethan","Ava","Mason","Isabella",
  "Logan","Mia","Lucas","Charlotte","Oliver","Amelia","Aiden","Harper","Jackson","Evelyn",
  "Sebastian","Abigail","Mateo","Emily","Jack","Elizabeth","Owen","Sofia","Theodore","Avery",
  "Henry","Ella","Elijah","Madison","Samuel","Scarlett","Benjamin","Victoria","Ryan","Aria",
  "Alexander","Grace","William","Chloe","Daniel","Penelope","Michael","Riley","David","Zoey",
  "Joseph","Nora","Charles","Lily","Thomas","Eleanor","Christopher","Hannah","Andrew","Lillian",
  "Joshua","Natalie","Isaiah","Addison","Nathan","Luna","Dylan","Camila","Caleb","Hazel",
  "Ryan","Savannah","Adrian","Audrey","Eli","Brooklyn","Wyatt","Bella","Aaron","Claire",
  "Leonardo","Skylar","Jonathan","Lucy","Nolan","Paisley","Lincoln","Everly","Cameron","Anna",
  "Miles","Caroline","Dominic","Genesis","Julian","Nova","Ezra","Emilia","Grayson","Maya",
];

const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Moore",
  "Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Young","Walker",
  "Hall","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green",
  "Adams","Nelson","Baker","Carter","Mitchell","Perez","Roberts","Turner","Phillips","Campbell",
  "Parker","Evans","Edwards","Collins","Stewart","Sanchez","Morris","Rogers","Reed","Cook",
  "Morgan","Bell","Murphy","Bailey","Rivera","Cooper","Richardson","Cox","Howard","Ward",
  "Peterson","Gray","Ramirez","James","Watson","Brooks","Kelly","Sanders","Price","Bennett",
  "Wood","Barnes","Ross","Henderson","Coleman","Jenkins","Perry","Powell","Long","Patterson",
  "Hughes","Flores","Washington","Butler","Simmons","Foster","Gonzales","Bryant","Alexander","Russell",
  "Griffin","Diaz","Hayes","Myers","Ford","Hamilton","Graham","Sullivan","Wallace","Woods",
];

const COUNTRIES = [
  "🇺🇸 United States","🇬🇧 United Kingdom","🇩🇪 Germany","🇨🇦 Canada","🇦🇺 Australia",
  "🇸🇬 Singapore","🇯🇵 Japan","🇫🇷 France","🇳🇱 Netherlands","🇨🇭 Switzerland",
  "🇦🇪 UAE","🇸🇪 Sweden","🇳🇴 Norway","🇧🇷 Brazil","🇿🇦 South Africa",
  "🇰🇷 South Korea","🇮🇳 India","🇲🇽 Mexico","🇮🇹 Italy","🇪🇸 Spain",
];

// Seeded random so data is deterministic
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateInvestors() {
  const rand = mulberry32(42);
  const investors = [];

  for (let i = 0; i < 100; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName  = LAST_NAMES[i % LAST_NAMES.length];
    const plan      = PLANS[Math.floor(rand() * PLANS.length)];

    // Scale profits loosely by plan
    const planMultiplier = plan === "Elite" ? 3 : plan === "Growth" ? 1.8 : 1;

    const allTimeProfit = Math.round((rand() * 180000 + 4000) * planMultiplier);
    const thirtyDayProfit = Math.round(allTimeProfit * (rand() * 0.18 + 0.04));
    const sevenDayProfit  = Math.round(thirtyDayProfit * (rand() * 0.45 + 0.08));

    // ROI % is relative to a hypothetical invested capital
    const invested      = Math.round(allTimeProfit / (rand() * 0.6 + 0.08));
    const allTimeRoi    = +((allTimeProfit / invested) * 100).toFixed(1);
    const thirtyDayRoi  = +((thirtyDayProfit / invested) * 100).toFixed(2);
    const sevenDayRoi   = +((sevenDayProfit  / invested) * 100).toFixed(2);

    investors.push({
      id: i + 1,
      name: `${firstName} ${lastName}`,
      initials: `${firstName[0]}${lastName[0]}`,
      country: COUNTRIES[Math.floor(rand() * COUNTRIES.length)],
      plan,
      invested,
      profits: {
        allTime:   allTimeProfit,
        thirtyDay: thirtyDayProfit,
        sevenDay:  sevenDayProfit,
      },
      roi: {
        allTime:   allTimeRoi,
        thirtyDay: thirtyDayRoi,
        sevenDay:  sevenDayRoi,
      },
      joinedMonthsAgo: Math.floor(rand() * 48) + 1,
    });
  }

  return investors;
}

export const INVESTORS = generateInvestors();

export const PLAN_META = {
  Starter: { color: "text-text-light",  bg: "bg-surface",         border: "border-border"         },
  Growth:  { color: "text-accent",      bg: "bg-accent/10",       border: "border-accent/30"      },
  Elite:   { color: "text-warning",     bg: "bg-warning/10",      border: "border-warning/30"     },
};

export const PERIOD_OPTIONS = [
  { key: "allTime",   label: "All Time" },
  { key: "thirtyDay", label: "30 Days"  },
  { key: "sevenDay",  label: "7 Days"   },
];

export const RANK_STYLES = {
  1: { badge: "bg-warning/20 text-warning border border-warning/40",  icon: "🥇" },
  2: { badge: "bg-slate-400/15 text-slate-300 border border-slate-400/30", icon: "🥈" },
  3: { badge: "bg-amber-700/15 text-amber-500 border border-amber-700/30", icon: "🥉" },
};