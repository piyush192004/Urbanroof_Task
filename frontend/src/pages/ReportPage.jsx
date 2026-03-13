import React, { useState, useRef } from "react";
import SeverityBadge from "../components/SeverityBadge";
import "./ReportPage.css";

const Section = ({ id, title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="report-section" id={id}>
      <button className="section-header" onClick={() => setOpen((o) => !o)}>
        <span className="section-icon">{icon}</span>
        <span className="section-title">{title}</span>
        <span className={`section-chevron ${open ? "open" : ""}`}>›</span>
      </button>
      {open && <div className="section-body">{children}</div>}
    </section>
  );
};

export default function ReportPage({ ddr, onReset }) {
  const printRef = useRef();

  if (!ddr || Object.keys(ddr).length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#e05" }}>
        <h2>No report data received.</h2>
        <button onClick={onReset}>← Go Back</button>
      </div>
    );
  }

  const {
    property_summary: ps = {},
    area_observations: areas = [],
    probable_root_causes: causes = [],
    severity_assessment: severity = {},
    recommended_actions: actions = [],
    further_possibilities_if_delayed: delayed = [],
    summary_table: summaryTable = [],
    tools_used: tools = [],
    additional_notes: notes = "",
    missing_or_unclear_information: missing = [],
    conflicts_detected: conflicts = [],
  } = ddr;

  const navItems = [
    { id: "summary", label: "Property Info" },
    { id: "observations", label: "Observations" },
    { id: "summary-table", label: "Summary Table" },
    { id: "root-causes", label: "Root Causes" },
    { id: "severity", label: "Severity" },
    { id: "actions", label: "Actions" },
    { id: "delayed", label: "Delayed Risks" },
    { id: "notes", label: "Notes" },
  ];

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const priorityOrder = {
    Immediate: 0,
    "Short-term": 1,
    "Short-term (within 3 months)": 1,
    "Long-term": 2,
    "Long-term (within 6 months)": 2,
  };
  const sortedActions = [...actions].sort(
    (a, b) =>
      (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
  );

  return (
    <div className="report-root" ref={printRef}>
      <div className="report-topbar no-print">
        <button className="back-btn" onClick={onReset}>
          ← New Report
        </button>
        <div className="topbar-nav">
          {navItems.map((n) => (
            <button
              key={n.id}
              className="nav-pill"
              onClick={() => scrollTo(n.id)}
            >
              {n.label}
            </button>
          ))}
        </div>
        <button className="print-btn" onClick={() => window.print()}>
          🖨 Print / PDF
        </button>
      </div>

      <div className="report-content">
        <div className="report-hero">
          <div className="hero-badge">DETAILED DIAGNOSTIC REPORT</div>
          <h1 className="hero-title">Property Inspection Analysis</h1>
          <p className="hero-address">
            {ps.property_address || "Property Address Not Specified"}
          </p>
          <div className="hero-meta">
            <span>📅 {ps.inspection_date || "N/A"}</span>
            <span>👤 {ps.inspected_by || "N/A"}</span>
            <span>🏢 {ps.structure_type || "N/A"}</span>
            <span>🏗️ Floors: {ps.floors || "N/A"}</span>
          </div>
          <div className="hero-score-row">
            <div className="score-block">
              <div className="score-value">
                {ps.overall_health_score_percent || "N/A"}
              </div>
              <div className="score-label">Health Score</div>
            </div>
            <div className="score-block">
              <div className="score-value areas">{areas.length}</div>
              <div className="score-label">Areas Assessed</div>
            </div>
            <div className="score-block">
              <SeverityBadge level={severity.overall_severity} large />
              <div className="score-label">Overall Severity</div>
            </div>
            <div className="score-block">
              <div className="score-value">{actions.length}</div>
              <div className="score-label">Action Items</div>
            </div>
          </div>
        </div>

        <Section id="summary" title="Property & Inspection Details" icon="🏠">
          <div className="info-grid">
            {[
              ["Property Address", ps.property_address],
              ["Structure Type", ps.structure_type],
              ["Total Floors", ps.floors],
              ["Year of Construction", ps.year_of_construction],
              [
                "Building Age",
                ps.age_of_building_years
                  ? `${ps.age_of_building_years} years`
                  : null,
              ],
              ["Inspection Date", ps.inspection_date],
              ["Report Date", ps.report_date],
              ["Inspected By", ps.inspected_by],
              ["Brief of Enquiry", ps.brief_of_enquiry],
              ["Previous Audit Done", ps.previous_audit_done],
              ["Previous Repairs", ps.previous_repairs],
              ["Health Score", ps.overall_health_score_percent],
            ].map(([k, v]) => (
              <div className="info-cell" key={k}>
                <div className="info-key">{k}</div>
                <div className="info-val">{v || "N/A"}</div>
              </div>
            ))}
          </div>
          {tools.length > 0 && (
            <div className="tools-row">
              <span className="tools-label">🔧 Tools Used:</span>
              {tools.map((t) => (
                <span key={t} className="tool-tag">
                  {t}
                </span>
              ))}
            </div>
          )}
          {conflicts.length > 0 && (
            <div className="conflict-banner">
              <div className="conflict-title">⚠️ Data Conflicts Detected</div>
              {conflicts.map((c, i) => (
                <div className="conflict-item" key={i}>
                  {typeof c === "string" ? c : JSON.stringify(c)}
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section id="observations" title="Area-wise Observations" icon="🔍">
          <div className="areas-list">
            {areas.map((area, i) => {
              const neg = area.impacted_area_negative_side || {};
              const pos = area.exposed_area_positive_side || {};
              return (
                <div className="area-card" key={i}>
                  <div className="area-card-header">
                    <div className="area-point-badge">
                      Point {area.point_no}
                    </div>
                    <h3 className="area-name">{neg.location || "N/A"}</h3>
                    <div className="area-issue-type">
                      {neg.leakage_type} · {neg.leakage_season}
                    </div>
                  </div>
                  <div className="area-card-body">
                    <div className="obs-grid">
                      <div className="obs-col neg">
                        <div className="obs-col-label">
                          <span className="obs-dot neg-dot" /> Impacted Area
                          (Negative Side)
                        </div>
                        <p className="obs-observation">{neg.observation}</p>
                        {neg.thermal_image_ref && (
                          <div className="thermal-mini">
                            <div className="thermal-row">
                              <span className="t-label">📸 Ref:</span>
                              <span className="t-val">
                                {neg.thermal_image_ref}
                              </span>
                            </div>
                            <div className="thermal-row">
                              <span className="t-label">🌡️</span>
                              <span className="t-val hot">
                                {neg.thermal_hotspot_temp_c}°C
                              </span>
                              <span className="t-sep">↔</span>
                              <span className="t-val cold">
                                {neg.thermal_coldspot_temp_c}°C
                              </span>
                              <span className="t-val delta">
                                Δ{neg.thermal_delta_c}°C
                              </span>
                            </div>
                            <p className="thermal-interpretation">
                              {neg.thermal_interpretation}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="obs-col pos">
                        <div className="obs-col-label">
                          <span className="obs-dot pos-dot" /> Source Area
                          (Positive Side)
                        </div>
                        <p className="obs-location-sub">{pos.location}</p>
                        <p className="obs-observation">{pos.observation}</p>
                        <div className="defect-tag">{pos.defect_type}</div>
                        {pos.water_travel_mechanism && (
                          <div className="mechanism-box">
                            <span className="mech-label">
                              💧 Water Travel Mechanism:
                            </span>
                            <p>{pos.water_travel_mechanism}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <Section
          id="summary-table"
          title="Negative ↔ Positive Side Summary Table"
          icon="📋"
        >
          <div className="severity-table-wrap">
            <table className="severity-table">
              <thead>
                <tr>
                  <th>Pt.</th>
                  <th>Impacted Area (−ve Side)</th>
                  <th>Pt.</th>
                  <th>Exposed / Source Area (+ve Side)</th>
                </tr>
              </thead>
              <tbody>
                {summaryTable.map((row, i) => (
                  <tr key={i}>
                    <td className="td-pt">{row.point_no_negative}</td>
                    <td className="td-neg">{row.impacted_area_negative}</td>
                    <td className="td-pt">{row.point_no_positive}</td>
                    <td className="td-pos">{row.exposed_area_positive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="root-causes" title="Probable Root Causes" icon="🔬">
          <div className="causes-list">
            {causes.map((c, i) => (
              <div className="cause-item" key={i}>
                <div className="cause-num">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="cause-content">
                  <div className="cause-issue">
                    {c.title}
                    {c.classification && (
                      <span
                        className={`cause-class class-${c.classification.toLowerCase()}`}
                      >
                        {c.classification}
                      </span>
                    )}
                  </div>
                  <p className="cause-explanation">{c.detailed_explanation}</p>
                  <div className="cause-zones">
                    {(c.affected_negative_zones || []).length > 0 && (
                      <div className="zone-group">
                        <span className="zone-label neg-label">
                          − Impacted Zones:
                        </span>
                        {c.affected_negative_zones.map((z) => (
                          <span key={z} className="zone-tag neg-tag">
                            {z}
                          </span>
                        ))}
                      </div>
                    )}
                    {(c.affected_positive_zones || []).length > 0 && (
                      <div className="zone-group">
                        <span className="zone-label pos-label">
                          + Source Zones:
                        </span>
                        {c.affected_positive_zones.map((z) => (
                          <span key={z} className="zone-tag pos-tag">
                            {z}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="severity" title="Severity Assessment" icon="⚠️">
          <div className="severity-overview">
            <SeverityBadge level={severity.overall_severity} large />
            <span className="sev-overall-label">
              Overall: {severity.overall_severity}
            </span>
          </div>
          <div className="severity-table-wrap">
            <table className="severity-table">
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Severity</th>
                  <th>Rationale</th>
                </tr>
              </thead>
              <tbody>
                {(severity.severity_items || []).map((item, i) => (
                  <tr key={i}>
                    <td className="td-area">{item.area}</td>
                    <td>
                      <SeverityBadge level={item.severity_level} />
                    </td>
                    <td className="td-reasoning">{item.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          id="actions"
          title="Recommended Actions & Treatments"
          icon="🛠️"
        >
          <div className="actions-list">
            {sortedActions.map((action, i) => (
              <div
                className={`action-item priority-${(action.priority || "")
                  .toLowerCase()
                  .replace(/[\s()]/g, "")
                  .replace(/-/g, "")}`}
                key={i}
              >
                <div className="action-header">
                  <div className="action-priority-tag">{action.priority}</div>
                  <div className="action-title">
                    {action.action_id}. {action.title}
                  </div>
                </div>
                {(action.applicable_areas || []).length > 0 && (
                  <div className="action-areas">
                    {action.applicable_areas.map((a) => (
                      <span key={a} className="area-tag">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
                {(action.detailed_treatment_steps || []).length > 0 && (
                  <div className="treatment-steps">
                    <div className="steps-label">Treatment Steps:</div>
                    <ol className="steps-list">
                      {action.detailed_treatment_steps.map((step, j) => (
                        <li key={j}>{step.replace(/^\d+\.\s*/, "")}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {(action.materials_required || []).length > 0 && (
                  <div className="materials-row">
                    <span className="mat-label">🧪 Materials:</span>
                    {action.materials_required.map((m) => (
                      <span key={m} className="mat-tag">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
                {action.estimated_cure_time && (
                  <div className="cure-time">
                    ⏱ Cure Time: {action.estimated_cure_time}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section id="delayed" title="Risks if Action is Delayed" icon="⏳">
          <div className="delayed-list">
            {delayed.length > 0 ? (
              delayed.map((d, i) => (
                <div className="delayed-item" key={i}>
                  <div className="delayed-header">
                    <span className="delayed-area">{d.area}</span>
                    {d.timeline && (
                      <span className="delayed-timeline">
                        ⚠️ Within {d.timeline}
                      </span>
                    )}
                  </div>
                  <p className="delayed-consequence">{d.consequence}</p>
                </div>
              ))
            ) : (
              <p className="empty-state">
                No delayed risk information available.
              </p>
            )}
          </div>
        </Section>

        <Section
          id="notes"
          title="Notes & Missing Information"
          icon="📝"
          defaultOpen={false}
        >
          {notes && (
            <div className="notes-box">
              <div className="notes-title">Additional Notes</div>
              <p>{notes}</p>
            </div>
          )}
          {missing.length > 0 && (
            <div className="missing-list">
              <div className="notes-title">Missing or Unclear Information</div>
              {missing.map((m, i) => (
                <div className="missing-item" key={i}>
                  <span className="missing-dot">•</span>
                  {typeof m === "string" ? m : m.note || JSON.stringify(m)}
                </div>
              ))}
            </div>
          )}
        </Section>

        <footer className="report-footer">
          <p>
            Generated by DDR AI System · UrbanRoof Private Limited ·{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <p className="footer-disclaimer">
            This report is generated from submitted inspection and thermal data
            only. No facts have been invented. Consult a licensed structural
            engineer for remediation decisions.
          </p>
        </footer>
      </div>
    </div>
  );
}
