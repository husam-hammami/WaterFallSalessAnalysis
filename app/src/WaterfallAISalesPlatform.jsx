import { useState, useMemo } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area, Treemap } from "recharts";

// ==================== DATA ====================
const yearlyData = [
  { year: "2020", revenue: 22092317, orders: 200, avgOrder: 110462 },
  { year: "2021", revenue: 18899510, orders: 197, avgOrder: 95936 },
  { year: "2022", revenue: 26128963, orders: 248, avgOrder: 105360 },
  { year: "2023", revenue: 30369578, orders: 252, avgOrder: 120514 },
  { year: "2024", revenue: 33999634, orders: 284, avgOrder: 119717 },
  { year: "2025", revenue: 34491125, orders: 253, avgOrder: 136327 },
  { year: "2026*", revenue: 7146106, orders: 48, avgOrder: 148877 },
];

const countryData = [
  { name: "UAE", revenue: 61041864, orders: 608, pct: 34.8 },
  { name: "Saudi Arabia", revenue: 54097950, orders: 420, pct: 30.9 },
  { name: "Colombia", revenue: 19418528, orders: 171, pct: 11.1 },
  { name: "Turkey", revenue: 8736135, orders: 62, pct: 5.0 },
  { name: "Malaysia", revenue: 6345615, orders: 35, pct: 3.6 },
  { name: "Thailand", revenue: 5827956, orders: 47, pct: 3.3 },
  { name: "Indonesia", revenue: 5712717, orders: 35, pct: 3.3 },
  { name: "Palestine", revenue: 2812046, orders: 31, pct: 1.6 },
  { name: "Pakistan", revenue: 1959721, orders: 16, pct: 1.1 },
  { name: "Others", revenue: 5363401, orders: 53, pct: 3.1 },
];

const productData = [
  { name: "Horizontal Split Case", revenue: 103223047, orders: 564, pct: 58.9, color: "#2563eb" },
  { name: "End Suction", revenue: 44236859, orders: 582, pct: 25.2, color: "#7c3aed" },
  { name: "Vertical Turbine", revenue: 21046444, orders: 115, pct: 12.0, color: "#0891b2" },
  { name: "Other Pumps", revenue: 2831347, orders: 19, pct: 1.6, color: "#059669" },
  { name: "Service", revenue: 912488, orders: 19, pct: 0.5, color: "#d97706" },
  { name: "Accessories", revenue: 195663, orders: 28, pct: 0.1, color: "#dc2626" },
];

const capacityData = [
  { range: "≤500 GPM", revenue: 34860369, orders: 491, avgPrice: 70998 },
  { range: "501-1000", revenue: 61195161, orders: 449, avgPrice: 136292 },
  { range: "1001-1500", revenue: 32762775, orders: 186, avgPrice: 176144 },
  { range: "1501-2000", revenue: 19816179, orders: 84, avgPrice: 235907 },
  { range: "2001+", revenue: 21870890, orders: 68, avgPrice: 321631 },
];

const topCustomers = [
  { name: "MODERN PUMPS CO.", revenue: 27522375, orders: 229, country: "KSA" },
  { name: "ARABIAN PUMPS", revenue: 24807643, orders: 187, country: "KSA" },
  { name: "SKYFIRE PROTECTION", revenue: 19618623, orders: 178, country: "Colombia" },
  { name: "AYSO TEKNIK", revenue: 8903213, orders: 63, country: "Turkey" },
  { name: "AL ARABIA SAFETY", revenue: 5857894, orders: 57, country: "UAE" },
  { name: "P.K.C. PUMPS", revenue: 5827956, orders: 47, country: "Thailand" },
  { name: "PT AXIA MULTI", revenue: 4005914, orders: 23, country: "Indonesia" },
  { name: "ETA HARVEST", revenue: 3834834, orders: 26, country: "Malaysia" },
  { name: "BK GULF", revenue: 3754222, orders: 23, country: "UAE" },
  { name: "TARH VA TADBIR", revenue: 3229430, orders: 74, country: "Iran" },
];

const ksaProjects = [
  { name: "BSSJV - KSAB", value: 2873000, sector: "Government" },
  { name: "SIE-MOI", value: 2585000, sector: "Government" },
  { name: "GOSI Building", value: 1693000, sector: "Government" },
  { name: "Stock Orders", value: 2767500, sector: "Inventory" },
  { name: "Southern Region Warehouses", value: 1410000, sector: "Military" },
  { name: "HCIS Water Stations Dammam", value: 1041000, sector: "Infrastructure" },
  { name: "Dammam Sea Port", value: 1000000, sector: "Infrastructure" },
  { name: "RED SEA Project", value: 900000, sector: "Mega Project" },
  { name: "UNECO Company", value: 810000, sector: "Industrial" },
  { name: "State Security Building", value: 692000, sector: "Government" },
  { name: "Ar Rass 2 PV Plant", value: 660000, sector: "Energy" },
  { name: "Qiddiya Gas Farm", value: 616000, sector: "Mega Project" },
  { name: "Taiba Towers Makkah", value: 525000, sector: "Commercial" },
];

const swotData = {
  strengths: [
    { text: "Strong KSA distributor network generating AED 52.3M", score: 96, confidence: "high", source: "Sales Data",
      proof: "Modern Pumps: AED 27.5M (229 orders) + Arabian Pumps: AED 24.8M (187 orders) = AED 52.3M across 416 orders. Two established, high-performing distribution partners." },
    { text: "Proven mega-project track record across 13+ named KSA projects", score: 92, confidence: "high", source: "Sales Data",
      proof: "Completed projects include: BSSJV-KSAB (AED 2.87M), SIE-MOI (AED 2.59M), GOSI Building (AED 1.69M), RED SEA Project (AED 900K), Qiddiya Gas Farm (AED 616K), Dammam Sea Port (AED 1M), and 7 more." },
    { text: "Consistent revenue growth — 56% increase over 5 years", score: 90, confidence: "high", source: "Sales Data",
      proof: "Revenue trend: AED 22.1M (2020) → AED 18.9M (2021) → AED 26.1M (2022) → AED 30.4M (2023) → AED 34.0M (2024) → AED 34.5M (2025). CAGR of ~9.3% from 2020-2025." },
    { text: "Dominant in Horizontal Split Case — 58.9% of total revenue", score: 94, confidence: "high", source: "Sales Data",
      proof: "HSC: AED 103.2M across 564 orders (58.9% of revenue). End Suction: AED 44.2M (25.2%). Vertical Turbine: AED 21.0M (12.0%). Clear market positioning in core product." },
    { text: "KSA average order value 10% above global average", score: 88, confidence: "high", source: "Sales Data",
      proof: "KSA average order: AED 129K vs Global average: AED 117K. Premium positioning validated — KSA customers pay more per order, indicating strong value perception." },
  ],
  weaknesses: [
    { text: "96.7% of KSA revenue depends on just 2 distributors", score: 97, confidence: "high", source: "Sales Data",
      proof: "Modern Pumps (AED 27.5M) + Arabian Pumps (AED 24.8M) = AED 52.3M out of AED 54.1M total KSA revenue. That's 96.7%. Losing either partner would eliminate ~50% of KSA business overnight." },
    { text: "KSA is #2 market behind UAE despite larger construction sector", score: 88, confidence: "high", source: "Sales Data",
      proof: "UAE: AED 61.0M (608 orders, 34.8%) vs KSA: AED 54.1M (420 orders, 30.9%). Gap of AED 6.9M. UAE has fewer mega-projects yet generates 12.8% more revenue." },
    { text: "Only 2 KSA customers in top 10 — minimal diversification", score: 85, confidence: "high", source: "Sales Data",
      proof: "Top 10 customers: only Modern Pumps (#1) and Arabian Pumps (#2) are KSA-based. Compare to UAE with 2 entries (Al Arabia Safety, BK Gulf) but much lower individual dependency." },
    { text: "2025 order volume declined 11% while revenue was flat", score: 82, confidence: "high", source: "Sales Data",
      proof: "2024: 284 orders → 2025: 253 orders (-10.9%), but revenue only grew 1.4% (AED 34.0M → AED 34.5M). Fewer but larger orders = higher risk per lost deal." },
  ],
  opportunities: [
    { text: "Existing KSA project pipeline worth AED 17.6M+ across key sectors", score: 95, confidence: "high", source: "Sales Data",
      proof: "Active KSA projects total AED 17.6M+: Government (AED 8.0M across 4 projects), Infrastructure (AED 2.0M), Mega Projects (AED 1.5M — Red Sea + Qiddiya), Military (AED 1.4M), Energy (AED 660K), Commercial (AED 525K)." },
    { text: "Vertical Turbine segment has high growth potential — only 12% of revenue", score: 90, confidence: "high", source: "Sales Data",
      proof: "VT: AED 21.0M (115 orders, 12.0% of revenue). Average VT order value is AED 183K — highest of any pump type. Only 115 orders vs 564 for HSC suggests significant room to grow." },
    { text: "501-1000 GPM is the volume sweet spot — AED 61.2M in revenue", score: 88, confidence: "high", source: "Sales Data",
      proof: "501-1000 GPM range: AED 61.2M revenue, 449 orders, avg price AED 136K. This is the single largest capacity segment. Stocking these configs would accelerate KSA delivery." },
    { text: "Colombia model proves rapid market entry is replicable", score: 86, confidence: "high", source: "Sales Data",
      proof: "Colombia: AED 19.4M revenue (171 orders, 11.1% of total) through a single distributor (Skyfire Protection: AED 19.6M). Proves that one strong partner can build a major market." },
  ],
  threats: [
    { text: "Revenue stagnation risk — 2025 growth slowed to 1.4%", score: 85, confidence: "high", source: "Sales Data",
      proof: "Year-over-year growth: 2022 +38.3%, 2023 +16.2%, 2024 +11.9%, 2025 +1.4%. Clear deceleration trend. If the pattern continues, 2026 could see flat or negative growth." },
    { text: "Single-distributor market dependency beyond KSA", score: 82, confidence: "high", source: "Sales Data",
      proof: "Colombia: 100% through Skyfire (AED 19.6M). Turkey: 100% through Ayso Teknik (AED 8.9M). Thailand: 100% through P.K.C. Pumps (AED 5.8M). Pattern of single-partner markets creates systemic risk." },
    { text: "2021 revenue crash shows vulnerability to market shocks", score: 78, confidence: "high", source: "Sales Data",
      proof: "2020: AED 22.1M → 2021: AED 18.9M (-14.4% drop). Order count also fell from 200 to 197. This proves the business can experience sharp downturns, likely from external factors (COVID, project delays)." },
    { text: "Top 10 customers account for disproportionate revenue concentration", score: 80, confidence: "high", source: "Sales Data",
      proof: "Top 10 customers: AED 107.4M total. Modern Pumps alone = AED 27.5M (15.7% of all revenue). Top 3 = AED 71.9M (41% of total). Losing any top customer would significantly impact business." },
  ],
};

const aiInsights = [
  {
    id: 1,
    category: "Revenue Alert",
    priority: "critical",
    icon: "📈",
    title: "KSA Revenue Concentration Risk",
    insight: "96% of KSA revenue comes from just 2 distributors: Modern Pumps (AED 27.5M) and Arabian Pumps (AED 24.8M). If either relationship deteriorates, half the KSA business is at risk.",
    action: "Diversify by onboarding 2-3 additional KSA distributors in 2026. Target: reduce top-2 dependency to below 75% by end of 2027.",
    impact: "Risk Mitigation: AED 26M+ protected",
  },
  {
    id: 2,
    category: "Growth Opportunity",
    priority: "high",
    icon: "🚀",
    title: "KSA Should Be #1 Market, Not #2",
    insight: "UAE leads with AED 61M vs KSA at AED 54M. Yet KSA's construction market is 4x larger and Vision 2030 is driving $1.1T in projects. KSA is severely underperforming relative to market potential.",
    action: "Set a goal to surpass UAE revenue in KSA within 18 months. Open a local KSA stock warehouse, add 1 technical sales engineer on the ground.",
    impact: "Revenue Potential: AED 30-40M additional",
  },
  {
    id: 3,
    category: "Product Strategy",
    priority: "high",
    icon: "🔧",
    title: "Horizontal Split Case Dominates — But VT is Underserved",
    insight: "HSC generates 59% of revenue (AED 103M) across 564 orders. VT only accounts for 12% (AED 21M) but is the fastest growing segment for high-rise and mega-project applications in KSA.",
    action: "Invest in VT product line expansion, especially high-pressure models (>15 Bar) for high-rise projects like NEOM towers and Riyadh skyscrapers.",
    impact: "Revenue Potential: AED 8-12M in VT growth",
  },
  {
    id: 4,
    category: "Market Intelligence",
    priority: "medium",
    icon: "🌍",
    title: "Colombia: Hidden Growth Engine",
    insight: "Colombia is the 3rd largest market (AED 19.4M, 11.1%) through a single distributor (Skyfire). This suggests untapped Latin American potential.",
    action: "Replicate the Skyfire model in Mexico, Brazil, and Chile. Brazil already shows AED 1.7M — significant room to grow with a dedicated distributor.",
    impact: "Revenue Potential: AED 10-15M LATAM expansion",
  },
  {
    id: 5,
    category: "Pricing Intelligence",
    priority: "high",
    icon: "💰",
    title: "Average Order Value Trending Up — Protect the Margin",
    insight: "AOV has grown from AED 110K (2020) to AED 149K (2026 pace), a 35% increase. This signals successful upselling of complete packages (E+D+J) vs. individual components.",
    action: "Formalize the full-package strategy: incentivize distributors to sell E+D+J packages instead of standalone pumps. Create tiered pricing that makes packages 10-15% more attractive than à la carte.",
    impact: "Margin Improvement: 5-8% GP uplift",
  },
  {
    id: 6,
    category: "Mega Projects",
    priority: "critical",
    icon: "🏗️",
    title: "Mega-Project Pipeline — Act Now or Miss the Window",
    insight: "Red Sea, Qiddiya, NEOM are already active (AED 1.5M+ secured). But the real wave is coming: $500B+ in projects entering MEP phase 2026-2028. Current coverage is minimal.",
    action: "Establish a dedicated Mega-Projects Task Force. Pre-qualify with Tier-1 EPC contractors (Samsung C&T, Bechtel, Fluor). Stock high-demand SKUs (1000-2000 GPM HS sets) locally.",
    impact: "Revenue Potential: AED 50-80M over 3 years",
  },
  {
    id: 7,
    category: "Operational",
    priority: "medium",
    icon: "📦",
    title: "Invoice Gap: AED 15.8M Pending",
    insight: "AED 15.8M in orders are in 'To Invoice' status — representing potential cash flow delays and delivery backlogs. 88 orders awaiting invoicing.",
    action: "Implement weekly billing reconciliation. Flag orders >30 days in 'To Invoice' status for expedited processing.",
    impact: "Cash Flow: AED 15.8M acceleration",
  },
  {
    id: 8,
    category: "Competitive",
    priority: "high",
    icon: "⚔️",
    title: "UL/FM Certification Is Your Moat — Defend It",
    insight: "KSA Civil Defense increasingly mandates UL/FM certification for fire pumps. This is Waterfall's strongest competitive advantage against Chinese manufacturers who typically lack these certifications.",
    action: "Create marketing materials highlighting UL/FM compliance. Run technical seminars with KSA Civil Defense departments. Position Waterfall as the compliance-safe choice.",
    impact: "Market Share: Protect AED 54M KSA base + grow",
  },
];

const marketData = {
  ksaFirePumpMarket: "$44.3M by 2032 (3.9% CAGR)",
  ksaPumpMarket: "$964.7M in 2025 → $1.56B by 2033",
  vision2030Pipeline: "$1.1 Trillion+ in projects",
  neomBudget: "$100 Billion dedicated",
  fireProtectionGrowth: "7.2% CAGR to 2035",
};

// ==================== COMPONENTS ====================
const COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981"];

const formatAED = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
};

const KPICard = ({ title, value, subtitle, trend }) => (
  <div style={{ background: "white", borderRadius: 8, padding: "18px 22px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", border: "1px solid #e5e7eb", flex: 1, minWidth: 200 }}>
    <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 500, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{value}</div>
    {subtitle && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{subtitle}</div>}
    {trend && (
      <div style={{ marginTop: 8, fontSize: 12, color: trend.startsWith("+") || trend.startsWith("↑") ? "#059669" : trend.startsWith("-") || trend.startsWith("↓") ? "#dc2626" : "#6b7280", fontWeight: 600 }}>
        {trend}
      </div>
    )}
  </div>
);

const InsightCard = ({ insight }) => {
  const [expanded, setExpanded] = useState(false);
  const priorityConfig = {
    critical: { color: "#dc2626", border: "#fecaca", bg: "#fef2f2", label: "Critical" },
    high: { color: "#b45309", border: "#fde68a", bg: "#fffbeb", label: "High" },
    medium: { color: "#1d4ed8", border: "#bfdbfe", bg: "#eff6ff", label: "Medium" },
  };
  const config = priorityConfig[insight.priority];

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        background: "white",
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.2s",
        boxShadow: expanded ? "0 2px 12px rgba(0,0,0,0.08)" : "0 1px 2px rgba(0,0,0,0.04)",
        border: "1px solid #e5e7eb",
        borderLeft: `3px solid ${config.color}`,
      }}
    >
      <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: config.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{insight.category}</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#d1d5db" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: config.color }}>{config.label}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>{insight.title}</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0, marginLeft: 12, transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none" }}>
          <path d="M4 6l4 4 4-4" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {expanded && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid #f3f4f6" }}>
          <div style={{ paddingTop: 14 }}>
            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, marginBottom: 14 }}>{insight.insight}</div>
            <div style={{ background: "#f9fafb", borderRadius: 6, padding: "12px 14px", marginBottom: 12, border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Recommended Action</div>
              <div style={{ fontSize: 13, color: "#111827", lineHeight: 1.6 }}>{insight.action}</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: config.color }}>Impact: {insight.impact}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const SWOTQuadrant = ({ title, items, borderColor, accentLight, expandedItems, onToggle }) => (
  <div style={{ background: "white", borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", border: "1px solid #e5e7eb", borderTop: `3px solid ${borderColor}` }}>
    <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#111827", textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</span>
      <span style={{ fontSize: 11, color: "#6b7280" }}>{items.length} items</span>
    </div>
    <div style={{ padding: "4px 18px 12px" }}>
      {items.map((item, i) => {
        const isExpanded = expandedItems?.has(`${title}-${i}`);
        return (
          <div key={i} style={{ padding: "10px 0", borderBottom: i < items.length - 1 ? "1px solid #f3f4f6" : "none" }}>
            <div
              onClick={() => onToggle(`${title}-${i}`)}
              style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, flex: 1, paddingRight: 12 }}>
                <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0, marginTop: 3, transition: "transform 0.2s", transform: isExpanded ? "rotate(90deg)" : "none" }}>
                  <path d="M4 2l4 4-4 4" stroke={borderColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{item.text}</div>
              </div>
            </div>
            {isExpanded && (
              <div style={{ background: "#f9fafb", borderRadius: 6, padding: "12px 14px", border: "1px solid #e5e7eb", marginTop: 8, marginLeft: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Evidence</div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{item.proof}</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>Source: {item.source}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div style={{ fontWeight: 600, color: "#111827", marginBottom: 6, fontSize: 13 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, color: p.color, marginBottom: 2 }}>
          {p.name}: {typeof p.value === "number" && p.value > 10000 ? `AED ${formatAED(p.value)}` : p.value?.toLocaleString()}
        </div>
      ))}
    </div>
  );
};

// ==================== MAIN APP ====================
export default function WaterfallAISalesPlatform() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedYear, setSelectedYear] = useState("all");
  const [expandedSwot, setExpandedSwot] = useState(new Set());

  const toggleSwotItem = (key) => {
    setExpandedSwot(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "ksa", label: "KSA Deep Dive" },
    { id: "products", label: "Products" },
    { id: "customers", label: "Customers" },
    { id: "insights", label: "AI Insights" },
    { id: "market", label: "Market Intel" },
    { id: "swot", label: "SWOT" },
  ];

  const totalRevenue = 175315933;
  const ksaRevenue = 54097950;
  const ksaPct = ((ksaRevenue / totalRevenue) * 100).toFixed(1);
  const yoyGrowth = (((34491125 - 33999634) / 33999634) * 100).toFixed(1);
  const cagr2020_2025 = ((Math.pow(34491125 / 22092317, 1 / 5) - 1) * 100).toFixed(1);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#0f172a", color: "white", padding: "20px 32px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <img src="/waterfall-logo.svg" alt="Waterfall Pumps" style={{ height: 36, width: "auto", filter: "brightness(0) invert(1)" }} />
            <div style={{ borderLeft: "1px solid #334155", paddingLeft: 14 }}>
              <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>Sales Intelligence Platform</h1>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>1,498 orders · 164 customers · 33 countries · 2020–2026</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontSize: 11, color: "#64748b" }}>Live · Rev 3</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #1e293b" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 20px",
                borderRadius: 0,
                border: "none",
                borderBottom: activeTab === tab.id ? "2px solid white" : "2px solid transparent",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: "nowrap",
                background: "transparent",
                color: activeTab === tab.id ? "white" : "#64748b",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
        {/* ========== OVERVIEW TAB ========== */}
        {activeTab === "overview" && (
          <div>
            {/* KPI Row */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              <KPICard title="Total Revenue" value={`AED ${formatAED(totalRevenue)}`} subtitle="All markets, 2020-2026" trend={`+${cagr2020_2025}% CAGR`} />
              <KPICard title="KSA Revenue" value={`AED ${formatAED(ksaRevenue)}`} subtitle={`${ksaPct}% of total`} trend="2nd largest market" />
              <KPICard title="Total Orders" value="1,498" subtitle="164 unique customers" trend="+42% since 2020" />
              <KPICard title="Avg Order Value" value="AED 117K" subtitle="2026 pace: AED 149K" trend={`+35% from 2020`} />
            </div>

            {/* Revenue Trend + Country Split */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Revenue & Order Trend</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>Year-over-year performance (AED) · *2026 is partial year</div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={yearlyData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => formatAED(v)} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (AED)" stroke="#2563eb" fill="url(#revGrad)" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line yAxisId="right" type="monotone" dataKey="orders" name="Orders" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Revenue by Market</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>Top 10 countries</div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={countryData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={2}>
                      {countryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => `AED ${formatAED(v)}`} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product Mix + Capacity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Product Mix</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>Revenue share by product type</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={productData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatAED(v)} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `AED ${formatAED(v)}`} />
                    <Bar dataKey="revenue" name="Revenue (AED)" radius={[0, 6, 6, 0]}>
                      {productData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Pump Capacity Distribution</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>Revenue and volume by GPM range</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={capacityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatAED(v)} />
                    <Tooltip formatter={(v) => typeof v === "number" && v > 1000 ? `AED ${formatAED(v)}` : v} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="revenue" name="Revenue (AED)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ========== KSA DEEP DIVE ========== */}
        {activeTab === "ksa" && (
          <div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              <KPICard title="KSA Total Revenue" value="AED 54.1M" subtitle="420 orders" trend={`${ksaPct}% of global`} />
              <KPICard title="KSA Avg Order" value="AED 129K" subtitle="Above global avg of 117K" trend="+10% vs global" />
              <KPICard title="KSA Customers" value="7" subtitle="Active distributors/direct" trend="Concentration risk: HIGH" />
              <KPICard title="Project Portfolio" value="60+" subtitle="Major KSA projects completed" trend="Mega-projects active" />
            </div>

            {/* KSA Customer Concentration */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>KSA Customer Concentration</div>
                <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 600, marginBottom: 16 }}>WARNING: 96.4% revenue from 2 customers</div>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Modern Pumps", value: 27522375 },
                        { name: "Arabian Pumps", value: 24792693 },
                        { name: "Others (5)", value: 1782882 },
                      ]}
                      dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} innerRadius={55} paddingAngle={3}
                    >
                      <Cell fill="#dc2626" />
                      <Cell fill="#f97316" />
                      <Cell fill="#22c55e" />
                    </Pie>
                    <Tooltip formatter={(v) => `AED ${formatAED(v)}`} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Top KSA Projects by Value</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>Major project wins in the Kingdom</div>
                <div style={{ maxHeight: 260, overflowY: "auto" }}>
                  {ksaProjects.map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{p.sector}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>AED {formatAED(p.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KSA Reference Projects from PDF */}
            <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>KSA Project Reference Portfolio (from Project List)</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>60+ landmark projects across the Kingdom — key references for future bids</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {[
                  { name: "King Salman Air Base", cap: "2500-3000 GPM", sector: "Military" },
                  { name: "NEOM Hampton Inn Hotel", cap: "1000 GPM", sector: "Mega Project" },
                  { name: "NEOM Oxagon Warehouse", cap: "2500 GPM", sector: "Mega Project" },
                  { name: "Red Sea Aramco Camp", cap: "1500 GPM", sector: "Mega Project" },
                  { name: "Qiddiya Gas Farm", cap: "1500 GPM VT", sector: "Entertainment" },
                  { name: "Riyadh Boulevard", cap: "1500 GPM", sector: "Entertainment" },
                  { name: "Two Holy Mosques", cap: "750 GPM", sector: "Religious" },
                  { name: "Saudi Aramco ADCO", cap: "2000 GPM", sector: "Oil & Gas" },
                  { name: "Dammam Sea Port Terminal", cap: "2000 GPM", sector: "Infrastructure" },
                  { name: "SEC (Electricity Co.)", cap: "2000 GPM", sector: "Utilities" },
                  { name: "Al Faisaliah Tower", cap: "1000 GPM", sector: "Commercial" },
                  { name: "Golden Gate Tower", cap: "1000 GPM @20Bar", sector: "Commercial" },
                  { name: "Medtown Hospital", cap: "1000 GPM @21Bar", sector: "Healthcare" },
                  { name: "Diriyah Gate (DGDA)", cap: "1500 GPM", sector: "Heritage" },
                  { name: "Royal Saudi Naval Forces", cap: "750 GPM", sector: "Military" },
                  { name: "Al Othaim Park & Warehouse", cap: "2000-3500 GPM", sector: "Commercial" },
                ].map((p, i) => (
                  <div key={i} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{p.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 500 }}>{p.cap}</span>
                      <span style={{ fontSize: 10, background: "#dbeafe", color: "#1d4ed8", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{p.sector}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== PRODUCTS TAB ========== */}
        {activeTab === "products" && (
          <div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              <KPICard title="HSC Revenue" value="AED 103.2M" subtitle="564 orders · 59% of total" trend="Dominant product line" />
              <KPICard title="End Suction" value="AED 44.2M" subtitle="582 orders · 25% of total" trend="Highest order volume" />
              <KPICard title="Vertical Turbine" value="AED 21.0M" subtitle="115 orders · 12% of total" trend="↑ Growing demand" />
              <KPICard title="Avg HSC Order" value="AED 183K" subtitle="vs ES: AED 76K" trend="2.4x higher than ES" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Revenue vs Volume by Product</div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productData.slice(0, 3)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => formatAED(v)} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar yAxisId="left" dataKey="revenue" name="Revenue (AED)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar yAxisId="right" dataKey="orders" name="Orders" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Average Price by Capacity</div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={capacityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatAED(v)} />
                    <Tooltip formatter={(v) => `AED ${v.toLocaleString()}`} />
                    <Bar dataKey="avgPrice" name="Avg Order Value (AED)" fill="#0891b2" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product Insights */}
            <div style={{ background: "linear-gradient(135deg, #eff6ff, #f5f3ff)", borderRadius: 12, padding: 20, border: "1px solid #c7d2fe" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Product Strategy Recommendations</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { title: "HSC Dominance", text: "HSC generates 59% of revenue at AED 183K avg order — 2.4x higher than End Suction. Protect this line aggressively. Push complete E+D+J packages to maintain premium pricing." },
                  { title: "End Suction Volume Play", text: "ES has the highest order count (582) but lowest avg value (AED 76K). Consider ES as the market entry product and upsell to HSC for larger projects." },
                  { title: "VT Growth Opportunity", text: "Vertical Turbine shows only 115 orders but is critical for high-rise projects (20+ Bar). With KSA building 1000+ towers, VT demand will surge. Expand VT lineup urgently." },
                  { title: "Capacity Sweet Spot", text: "501-1000 GPM is the volume king (449 orders, AED 61M). Stock these configurations locally in KSA for fastest delivery and competitive advantage." },
                ].map((item, i) => (
                  <div key={i} style={{ background: "white", borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a8a", marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{item.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== CUSTOMERS TAB ========== */}
        {activeTab === "customers" && (
          <div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              <KPICard title="Total Customers" value="164" subtitle="Across 33 countries" trend="Growing network" />
              <KPICard title="Top 3 Concentration" value="41%" subtitle="AED 72M from top 3" trend="Moderate risk" />
              <KPICard title="Avg Revenue/Customer" value="AED 1.07M" subtitle="Lifetime value" trend="Top customer: AED 27.5M" />
              <KPICard title="Repeat Rate" value="HIGH" subtitle="Top 10 are all repeat buyers" trend="Strong loyalty" />
            </div>

            <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb", marginBottom: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Top 10 Customers — Revenue & Volume</div>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topCustomers} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatAED(v)} />
                  <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="revenue" name="Revenue (AED)" fill="#2563eb" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Table */}
            <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Customer Performance Matrix</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Rank", "Customer", "Country", "Revenue (AED)", "Orders", "Avg Order", "Rev Share"].map((h) => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((c, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 700, color: "#6b7280" }}>#{i + 1}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#111827" }}>{c.name}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{c.country}</span>
                        </td>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#2563eb" }}>AED {formatAED(c.revenue)}</td>
                        <td style={{ padding: "10px 12px" }}>{c.orders}</td>
                        <td style={{ padding: "10px 12px" }}>AED {formatAED(Math.round(c.revenue / c.orders))}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 60, height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ width: `${(c.revenue / totalRevenue) * 100}%`, height: "100%", background: "#2563eb", borderRadius: 3 }}></div>
                            </div>
                            <span style={{ fontSize: 11, color: "#6b7280" }}>{((c.revenue / totalRevenue) * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========== AI INSIGHTS TAB ========== */}
        {activeTab === "insights" && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Strategic Insights</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>8 data-driven recommendations. Click any card to expand.</div>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {[
                  { label: "Critical", count: aiInsights.filter(i => i.priority === "critical").length, color: "#dc2626" },
                  { label: "High", count: aiInsights.filter(i => i.priority === "high").length, color: "#b45309" },
                  { label: "Medium", count: aiInsights.filter(i => i.priority === "medium").length, color: "#1d4ed8" },
                ].map((s, i) => (
                  <span key={i} style={{ fontSize: 12, color: "#6b7280" }}>{s.label}: <strong style={{ color: s.color }}>{s.count}</strong></span>
                ))}
              </div>
            </div>

            {/* All insights in a single-column flow */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
              {aiInsights.map((i, idx) => <InsightCard key={i.id} insight={i} index={idx} />)}
            </div>

            {/* Revenue Opportunity Summary */}
            <div style={{ background: "white", borderRadius: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", border: "1px solid #e5e7eb" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Total Addressable Opportunity</div>
                <span style={{ fontSize: 11, color: "#6b7280" }}>3-Year Horizon</span>
              </div>
              <div style={{ padding: "12px 20px 20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    { label: "KSA Market Expansion", value: "AED 30-40M" },
                    { label: "Mega-Projects Pipeline", value: "AED 50-80M" },
                    { label: "VT Product Growth", value: "AED 8-12M" },
                    { label: "LATAM Expansion", value: "AED 10-15M" },
                    { label: "Margin Improvement", value: "5-8% GP uplift" },
                    { label: "Cash Flow Acceleration", value: "AED 15.8M" },
                  ].map((item, i) => (
                    <div key={i} style={{ background: "#f9fafb", borderRadius: 6, padding: "12px 14px", border: "1px solid #e5e7eb" }}>
                      <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, background: "#0f172a", borderRadius: 6, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8" }}>Combined Revenue Potential</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "white" }}>AED 100-150M+</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== MARKET INTEL TAB ========== */}
        {activeTab === "market" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>KSA Market Intelligence</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>Market data from Grand View Research, IMARC, Astute Analytica, and Vision 2030 project tracking</div>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              <KPICard title="KSA Fire Pump Market" value="$110.4M" subtitle="by 2032 (Astute Analytica)" trend="3.9% CAGR" />
              <KPICard title="KSA Pumps Market" value="$964.7M" subtitle="2025 (Grand View Research)" trend="6.4% CAGR → $1.56B by 2033" />
              <KPICard title="Vision 2030 Pipeline" value="$1.1T+" subtitle="Total project value" trend="Unprecedented scale" />
              <KPICard title="NEOM Budget" value="$100B" subtitle="Single mega-project" trend="Fire systems: critical" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Market Sizing */}
              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>KSA Pump Market Sizing</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { segment: "Industrial Pumps", current: 964.7, projected: 1559.4 },
                    { segment: "Water Pumps", current: 558.6, projected: 901.3 },
                    { segment: "Fire Pumps", current: 55, projected: 110.4 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="segment" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} label={{ value: "USD Millions", angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="current" name="2025 (USD M)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="projected" name="2032-33 (USD M)" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Growth Drivers */}
              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Key Growth Drivers</div>
                {[
                  { driver: "Vision 2030 Mega-Projects", impact: 98, detail: "NEOM, The Line, Red Sea, Qiddiya — $500B+ entering MEP phase" },
                  { driver: "Civil Defense Mandate Tightening", impact: 92, detail: "UL/FM certification increasingly required — Waterfall advantage" },
                  { driver: "Data Center Boom", impact: 85, detail: "KSA targeting 300MW+ data center capacity by 2030" },
                  { driver: "Oil & Gas Expansion", impact: 80, detail: "Aramco refinery upgrades + new petrochemical complexes" },
                  { driver: "Tourism Infrastructure", impact: 78, detail: "Target: 100M visitors by 2030 — hotels, resorts, entertainment" },
                  { driver: "Desalination & Water", impact: 75, detail: "60+ water projects worth $9.3B announced" },
                ].map((d, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{d.driver}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>{d.impact}/100</span>
                    </div>
                    <div style={{ width: "100%", height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden", marginBottom: 2 }}>
                      <div style={{ width: `${d.impact}%`, height: "100%", background: `linear-gradient(90deg, #2563eb, #7c3aed)`, borderRadius: 3 }}></div>
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{d.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitive Landscape */}
            <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Competitive Landscape — Fire Pumps in KSA</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {[
                  { name: "Waterfall Pumps", type: "YOU", strength: "UL/FM, full packages, 60Hz", threat: "LOW" },
                  { name: "Grundfos", type: "Global Leader", strength: "Brand, distribution, service", threat: "HIGH" },
                  { name: "Xylem/Lowara", type: "Global Leader", strength: "Wide portfolio, IoT", threat: "HIGH" },
                  { name: "KSB", type: "European", strength: "Engineering reputation", threat: "MEDIUM" },
                  { name: "Patterson Pump", type: "US Specialist", strength: "Fire pump focus, UL/FM", threat: "HIGH" },
                  { name: "Peerless Pump", type: "US (Grundfos)", strength: "Legacy brand, UL/FM", threat: "MEDIUM" },
                  { name: "Chinese Brands", type: "Low-Cost", strength: "Price (30-40% lower)", threat: "HIGH" },
                  { name: "Flowserve", type: "Global", strength: "Industrial, oil & gas", threat: "MEDIUM" },
                ].map((c, i) => (
                  <div key={i} style={{
                    background: c.type === "YOU" ? "#eff6ff" : "#f8fafc",
                    borderRadius: 8, padding: 12,
                    border: c.type === "YOU" ? "2px solid #2563eb" : "1px solid #e5e7eb"
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: c.type === "YOU" ? "#2563eb" : "#111827" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{c.type}</div>
                    <div style={{ fontSize: 11, color: "#374151", marginTop: 6 }}>{c.strength}</div>
                    <div style={{
                      marginTop: 6, fontSize: 10, fontWeight: 700, display: "inline-block", padding: "2px 6px", borderRadius: 4,
                      background: c.threat === "HIGH" ? "#fef2f2" : c.threat === "MEDIUM" ? "#fffbeb" : "#ecfdf5",
                      color: c.threat === "HIGH" ? "#dc2626" : c.threat === "MEDIUM" ? "#d97706" : "#059669",
                    }}>
                      {c.type === "YOU" ? "YOUR POSITION" : `Threat: ${c.threat}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========== SWOT TAB ========== */}
        {activeTab === "swot" && (
          <div>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 4 }}>SWOT Analysis</div>
              <div style={{ fontSize: 13, color: "#6b7280" }}>KSA market assessment backed by sales data. Click any item to view evidence.</div>
            </div>

            {/* SWOT Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <SWOTQuadrant title="Strengths" items={swotData.strengths} borderColor="#059669" expandedItems={expandedSwot} onToggle={toggleSwotItem} />
              <SWOTQuadrant title="Weaknesses" items={swotData.weaknesses} borderColor="#dc2626" expandedItems={expandedSwot} onToggle={toggleSwotItem} />
              <SWOTQuadrant title="Opportunities" items={swotData.opportunities} borderColor="#2563eb" expandedItems={expandedSwot} onToggle={toggleSwotItem} />
              <SWOTQuadrant title="Threats" items={swotData.threats} borderColor="#d97706" expandedItems={expandedSwot} onToggle={toggleSwotItem} />
            </div>

            {/* Strategic Priorities */}
            <div style={{ background: "white", borderRadius: 8, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", border: "1px solid #e5e7eb", marginTop: 24 }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Strategic Priorities</div>
                <span style={{ fontSize: 11, color: "#6b7280" }}>2026–2027</span>
              </div>
              <div style={{ padding: "4px 20px 12px" }}>
                {[
                  { num: 1, title: "Diversify KSA Distribution — Reduce 96% Concentration Risk", timeline: "Q2 2026", owner: "Sales Director", kpi: "Onboard 2+ new KSA distributors, reduce top-2 dependency to <80%", urgency: "critical" },
                  { num: 2, title: "Establish KSA Local Stock Warehouse", timeline: "Q3 2026", owner: "Operations", kpi: "Stock top 10 SKUs (500-1500 GPM HS), reduce KSA lead time by 40%", urgency: "high" },
                  { num: 3, title: "Mega-Project Task Force — NEOM/Red Sea/Qiddiya", timeline: "Q1 2026", owner: "VP Sales", kpi: "Pre-qualify with 5+ Tier-1 EPCs, secure AED 15M+ in mega-project orders", urgency: "high" },
                  { num: 4, title: "Expand Vertical Turbine Product Line", timeline: "Q2 2026", owner: "Product Engineering", kpi: "Launch 3+ new VT models (>15 Bar), grow VT revenue by 50%", urgency: "medium" },
                  { num: 5, title: "Replicate Colombia Success in LATAM", timeline: "Q4 2026", owner: "International Sales", kpi: "Sign distributors in Mexico & Brazil, target AED 5M year-1 revenue", urgency: "medium" },
                ].map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 4 ? "1px solid #f3f4f6" : "none", alignItems: "flex-start" }}>
                    <div style={{ width: 24, height: 24, borderRadius: 4, background: "#f1f5f9", color: "#374151", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #e2e8f0" }}>{p.num}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{p.title}</div>
                      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#6b7280" }}>
                        <span>{p.timeline}</span>
                        <span style={{ color: "#d1d5db" }}>|</span>
                        <span>{p.owner}</span>
                        <span style={{ color: "#d1d5db" }}>|</span>
                        <span style={{ color: p.urgency === "critical" ? "#dc2626" : p.urgency === "high" ? "#b45309" : "#6b7280", fontWeight: 500 }}>{p.urgency}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#374151", marginTop: 4 }}>KPI: {p.kpi}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: "#0f172a", color: "#64748b", padding: "16px 32px", textAlign: "center", fontSize: 11 }}>
        Waterfall Pumps AI Sales Intelligence Platform · Data source: Sales Report KSA 2025 Rev 3 · 1,498 orders · 164 customers · 33 countries · Market data from Grand View Research, IMARC, Allied Market Research, Astute Analytica
      </div>
    </div>
  );
}
