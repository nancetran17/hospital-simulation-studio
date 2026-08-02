"use client";

import { useMemo, useState, type CSSProperties } from "react";

type LayoutId = "centralized" | "pod" | "linear";

type Space = {
  name: string;
  kind: "intake" | "care" | "diagnostic" | "support" | "exit";
  row: number;
  col: number;
  width: number;
  height: number;
  load: number;
};

type Stage = {
  name: string;
  waitShare: number;
  serviceShare: number;
};

type Department = {
  name: string;
  shortName: string;
  description: string;
  targetWait: number;
  targetUtilization: number;
  benchmarkCost: number;
  travelMinutes: number;
  turnoverWeight: number;
  spaces: Space[];
  stages: Stage[];
};

type DepartmentId = "ed" | "imaging" | "surgery" | "inpatient";

type ScenarioInputs = {
  rooms: number;
  clinicians: number;
  arrivals: number;
  serviceMinutes: number;
  turnoverMinutes: number;
  staffCost: number;
  roomCost: number;
  acuity: number;
  automation: number;
  layout: LayoutId;
};

type Weights = {
  wait: number;
  cost: number;
  efficiency: number;
};

type Simulation = {
  servers: number;
  capacityPerHour: number;
  demandPerDay: number;
  throughputPerDay: number;
  waitMinutes: number;
  serviceMinutes: number;
  lengthOfStay: number;
  utilization: number;
  costPerDay: number;
  costPerPatient: number;
  roomUtilization: number;
  staffUtilization: number;
  queueRisk: "Low" | "Moderate" | "High" | "Critical";
  score: number;
  waitScore: number;
  costScore: number;
  efficiencyScore: number;
  bottleneck: string;
};

const departments: Record<DepartmentId, Department> = {
  ed: {
    name: "Emergency department",
    shortName: "ED",
    description: "Intake, triage, exam, diagnostic support, and discharge flow.",
    targetWait: 28,
    targetUtilization: 82,
    benchmarkCost: 365,
    travelMinutes: 7,
    turnoverWeight: 0.35,
    spaces: [
      { name: "Entry", kind: "intake", row: 1, col: 1, width: 2, height: 2, load: 0.55 },
      { name: "Triage", kind: "intake", row: 1, col: 3, width: 3, height: 2, load: 0.95 },
      { name: "Exam A", kind: "care", row: 3, col: 1, width: 3, height: 3, load: 1.05 },
      { name: "Exam B", kind: "care", row: 3, col: 4, width: 3, height: 3, load: 0.9 },
      { name: "Imaging", kind: "diagnostic", row: 1, col: 7, width: 3, height: 3, load: 0.88 },
      { name: "Observation", kind: "care", row: 4, col: 7, width: 4, height: 3, load: 0.76 },
      { name: "Team hub", kind: "support", row: 6, col: 1, width: 3, height: 2, load: 0.62 },
      { name: "Discharge", kind: "exit", row: 7, col: 5, width: 4, height: 1, load: 0.42 },
    ],
    stages: [
      { name: "Arrival to triage", waitShare: 0.33, serviceShare: 0.12 },
      { name: "Room assignment", waitShare: 0.27, serviceShare: 0.18 },
      { name: "Diagnostics", waitShare: 0.22, serviceShare: 0.38 },
      { name: "Disposition", waitShare: 0.18, serviceShare: 0.32 },
    ],
  },
  imaging: {
    name: "Imaging suite",
    shortName: "IMG",
    description: "Scheduled and urgent imaging with prep, scan, read, and recovery.",
    targetWait: 18,
    targetUtilization: 78,
    benchmarkCost: 290,
    travelMinutes: 5,
    turnoverWeight: 0.45,
    spaces: [
      { name: "Check-in", kind: "intake", row: 1, col: 1, width: 3, height: 2, load: 0.56 },
      { name: "Prep", kind: "support", row: 3, col: 1, width: 3, height: 3, load: 0.78 },
      { name: "CT", kind: "diagnostic", row: 1, col: 5, width: 3, height: 3, load: 1.08 },
      { name: "MRI", kind: "diagnostic", row: 4, col: 5, width: 3, height: 3, load: 0.94 },
      { name: "Ultrasound", kind: "diagnostic", row: 1, col: 8, width: 3, height: 2, load: 0.72 },
      { name: "Read room", kind: "support", row: 3, col: 9, width: 2, height: 3, load: 0.82 },
      { name: "Recovery", kind: "care", row: 6, col: 1, width: 4, height: 2, load: 0.68 },
      { name: "Exit", kind: "exit", row: 7, col: 8, width: 3, height: 1, load: 0.36 },
    ],
    stages: [
      { name: "Check-in", waitShare: 0.22, serviceShare: 0.1 },
      { name: "Prep", waitShare: 0.22, serviceShare: 0.2 },
      { name: "Scan", waitShare: 0.38, serviceShare: 0.52 },
      { name: "Recovery", waitShare: 0.18, serviceShare: 0.18 },
    ],
  },
  surgery: {
    name: "Perioperative suite",
    shortName: "OR",
    description: "Pre-op, operating rooms, PACU, turnover, and release readiness.",
    targetWait: 42,
    targetUtilization: 74,
    benchmarkCost: 2350,
    travelMinutes: 9,
    turnoverWeight: 0.7,
    spaces: [
      { name: "Pre-op", kind: "intake", row: 1, col: 1, width: 4, height: 2, load: 0.78 },
      { name: "OR 1", kind: "care", row: 3, col: 1, width: 3, height: 3, load: 0.92 },
      { name: "OR 2", kind: "care", row: 3, col: 4, width: 3, height: 3, load: 1.08 },
      { name: "OR 3", kind: "care", row: 3, col: 7, width: 3, height: 3, load: 0.84 },
      { name: "Sterile core", kind: "support", row: 1, col: 6, width: 4, height: 2, load: 0.9 },
      { name: "PACU", kind: "care", row: 6, col: 1, width: 5, height: 2, load: 0.88 },
      { name: "Materials", kind: "support", row: 6, col: 7, width: 3, height: 2, load: 0.58 },
      { name: "Release", kind: "exit", row: 7, col: 10, width: 1, height: 1, load: 0.36 },
    ],
    stages: [
      { name: "Pre-op ready", waitShare: 0.18, serviceShare: 0.14 },
      { name: "Room turnover", waitShare: 0.34, serviceShare: 0.2 },
      { name: "Procedure", waitShare: 0.22, serviceShare: 0.48 },
      { name: "PACU release", waitShare: 0.26, serviceShare: 0.18 },
    ],
  },
  inpatient: {
    name: "Inpatient unit",
    shortName: "IP",
    description: "Bed placement, nursing coverage, diagnostics, discharge, and transport.",
    targetWait: 65,
    targetUtilization: 86,
    benchmarkCost: 820,
    travelMinutes: 11,
    turnoverWeight: 0.5,
    spaces: [
      { name: "Nurse hub", kind: "support", row: 1, col: 4, width: 3, height: 2, load: 0.78 },
      { name: "Rooms A", kind: "care", row: 1, col: 1, width: 3, height: 4, load: 0.92 },
      { name: "Rooms B", kind: "care", row: 1, col: 7, width: 3, height: 4, load: 0.98 },
      { name: "Meds", kind: "support", row: 3, col: 4, width: 3, height: 2, load: 0.76 },
      { name: "Family", kind: "support", row: 5, col: 1, width: 3, height: 2, load: 0.44 },
      { name: "Therapy", kind: "diagnostic", row: 5, col: 7, width: 3, height: 2, load: 0.68 },
      { name: "Discharge", kind: "exit", row: 7, col: 4, width: 3, height: 1, load: 0.7 },
    ],
    stages: [
      { name: "Bed request", waitShare: 0.3, serviceShare: 0.14 },
      { name: "Room ready", waitShare: 0.26, serviceShare: 0.2 },
      { name: "Care cycle", waitShare: 0.22, serviceShare: 0.42 },
      { name: "Discharge", waitShare: 0.22, serviceShare: 0.24 },
    ],
  },
};

const layoutOptions: Record<
  LayoutId,
  { name: string; travelIndex: number; handoffDelay: number; description: string }
> = {
  centralized: {
    name: "Central core",
    travelIndex: 0.88,
    handoffDelay: 2,
    description: "Shared support functions around a central team base.",
  },
  pod: {
    name: "Pod model",
    travelIndex: 0.72,
    handoffDelay: 1.2,
    description: "Smaller care teams aligned to nearby rooms and support space.",
  },
  linear: {
    name: "Linear corridor",
    travelIndex: 1.18,
    handoffDelay: 4.4,
    description: "Sequential spaces with longer walks and more handoff exposure.",
  },
};

const defaultScenarios: Record<DepartmentId, ScenarioInputs> = {
  ed: {
    rooms: 22,
    clinicians: 19,
    arrivals: 34,
    serviceMinutes: 31,
    turnoverMinutes: 9,
    staffCost: 92,
    roomCost: 265,
    acuity: 48,
    automation: 18,
    layout: "centralized",
  },
  imaging: {
    rooms: 8,
    clinicians: 11,
    arrivals: 18,
    serviceMinutes: 26,
    turnoverMinutes: 7,
    staffCost: 78,
    roomCost: 420,
    acuity: 38,
    automation: 22,
    layout: "centralized",
  },
  surgery: {
    rooms: 9,
    clinicians: 14,
    arrivals: 5.5,
    serviceMinutes: 92,
    turnoverMinutes: 28,
    staffCost: 126,
    roomCost: 1900,
    acuity: 56,
    automation: 15,
    layout: "linear",
  },
  inpatient: {
    rooms: 36,
    clinicians: 23,
    arrivals: 9,
    serviceMinutes: 142,
    turnoverMinutes: 38,
    staffCost: 84,
    roomCost: 510,
    acuity: 64,
    automation: 14,
    layout: "centralized",
  },
};

const metricDefinitions = [
  "Queue math uses an Erlang C approximation with spatial drag and turnover load.",
  "Cost includes staffing, room operating cost, and patient-level supplies.",
  "Scores balance wait time, cost per patient, utilization, and met demand.",
];

export default function Home() {
  const [departmentId, setDepartmentId] = useState<DepartmentId>("ed");
  const [inputsByDepartment, setInputsByDepartment] =
    useState<Record<DepartmentId, ScenarioInputs>>(defaultScenarios);
  const [weights, setWeights] = useState<Weights>({
    wait: 45,
    cost: 25,
    efficiency: 30,
  });
  const [runCount, setRunCount] = useState(1);

  const department = departments[departmentId];
  const inputs = inputsByDepartment[departmentId];

  const simulation = useMemo(
    () => simulate(inputs, department, weights),
    [department, inputs, weights],
  );

  const comparison = useMemo(
    () => buildComparison(inputs, department, weights),
    [department, inputs, weights],
  );

  const optimization = useMemo(
    () => optimize(inputs, department, weights),
    [department, inputs, weights],
  );

  const flowStages = useMemo(
    () => buildFlowStages(department, simulation),
    [department, simulation],
  );

  function updateInput<K extends keyof ScenarioInputs>(
    key: K,
    value: ScenarioInputs[K],
  ) {
    setInputsByDepartment((current) => ({
      ...current,
      [departmentId]: {
        ...current[departmentId],
        [key]: value,
      },
    }));
  }

  function updateWeight<K extends keyof Weights>(key: K, value: number) {
    setWeights((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function applyOptimizedScenario() {
    setInputsByDepartment((current) => ({
      ...current,
      [departmentId]: optimization.inputs,
    }));
    setRunCount((count) => count + 1);
  }

  return (
    <main className="app-shell">
      <header className="topbar" aria-label="Simulation workspace">
        <div>
          <p className="eyebrow">Hospital Simulation Studio</p>
          <h1>Space and staffing simulator</h1>
        </div>
        <div className="topbar-actions" aria-label="Scenario actions">
          <button
            className="ghost-button"
            type="button"
            onClick={() => updateInput("layout", defaultScenarios[departmentId].layout)}
          >
            Reset layout
          </button>
          <button
            className="primary-button"
            type="button"
            onClick={() => setRunCount((count) => count + 1)}
          >
            Run scenario
          </button>
        </div>
      </header>

      <section className="department-tabs" aria-label="Hospital area">
        {(Object.keys(departments) as DepartmentId[]).map((id) => (
          <button
            aria-pressed={departmentId === id}
            className="tab-button"
            key={id}
            onClick={() => setDepartmentId(id)}
            type="button"
          >
            <span>{departments[id].shortName}</span>
            {departments[id].name}
          </button>
        ))}
      </section>

      <section className="workspace-grid">
        <div className="panel scenario-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{department.shortName} model</p>
              <h2>{department.name}</h2>
            </div>
            <span className={`risk-pill ${simulation.queueRisk.toLowerCase()}`}>
              {simulation.queueRisk} queue risk
            </span>
          </div>

          <p className="department-copy">{department.description}</p>

          <div className="controls-grid">
            <SliderControl
              label="Rooms or bays"
              min={2}
              max={60}
              step={1}
              value={inputs.rooms}
              suffix=""
              onChange={(value) => updateInput("rooms", value)}
            />
            <SliderControl
              label="Clinical staff"
              min={2}
              max={70}
              step={1}
              value={inputs.clinicians}
              suffix=""
              onChange={(value) => updateInput("clinicians", value)}
            />
            <SliderControl
              label="Arrivals per hour"
              min={1}
              max={50}
              step={0.5}
              value={inputs.arrivals}
              suffix="/hr"
              onChange={(value) => updateInput("arrivals", value)}
            />
            <SliderControl
              label="Service time"
              min={8}
              max={180}
              step={1}
              value={inputs.serviceMinutes}
              suffix="min"
              onChange={(value) => updateInput("serviceMinutes", value)}
            />
            <SliderControl
              label="Turnover"
              min={2}
              max={60}
              step={1}
              value={inputs.turnoverMinutes}
              suffix="min"
              onChange={(value) => updateInput("turnoverMinutes", value)}
            />
            <SliderControl
              label="Acuity mix"
              min={10}
              max={90}
              step={1}
              value={inputs.acuity}
              suffix="%"
              onChange={(value) => updateInput("acuity", value)}
            />
            <SliderControl
              label="Staff cost"
              min={35}
              max={180}
              step={1}
              value={inputs.staffCost}
              prefix="$"
              suffix="/hr"
              onChange={(value) => updateInput("staffCost", value)}
            />
            <SliderControl
              label="Room cost"
              min={120}
              max={2400}
              step={10}
              value={inputs.roomCost}
              prefix="$"
              suffix="/day"
              onChange={(value) => updateInput("roomCost", value)}
            />
            <SliderControl
              label="Automation"
              min={0}
              max={65}
              step={1}
              value={inputs.automation}
              suffix="%"
              onChange={(value) => updateInput("automation", value)}
            />
          </div>

          <div className="layout-selector" aria-label="Layout model">
            {(Object.keys(layoutOptions) as LayoutId[]).map((layoutId) => (
              <button
                aria-pressed={inputs.layout === layoutId}
                className="layout-option"
                key={layoutId}
                onClick={() => updateInput("layout", layoutId)}
                type="button"
              >
                <strong>{layoutOptions[layoutId].name}</strong>
                <span>{layoutOptions[layoutId].description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel map-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Space heatmap</p>
              <h2>{layoutOptions[inputs.layout].name}</h2>
            </div>
            <span className="run-chip">Run {runCount}</span>
          </div>

          <div className="floorplan" aria-label={`${department.name} simulated floor plan`}>
            {department.spaces.map((space) => {
              const load = clamp(
                simulation.utilization * space.load +
                  layoutOptions[inputs.layout].handoffDelay * 4,
                18,
                99,
              );
              return (
                <div
                  className={`space-tile ${space.kind}`}
                  key={space.name}
                  style={{
                    gridColumn: `${space.col} / span ${space.width}`,
                    gridRow: `${space.row} / span ${space.height}`,
                    backgroundColor: heatColor(load, space.kind),
                    borderColor: heatBorder(load),
                  } as CSSProperties}
                >
                  <span>{space.name}</span>
                  <b>{Math.round(load)}%</b>
                </div>
              );
            })}
          </div>

          <div className="flow-list">
            {flowStages.map((stage) => (
              <div className="flow-stage" key={stage.name}>
                <div>
                  <strong>{stage.name}</strong>
                  <span>{formatNumber(stage.totalMinutes, 1)} min</span>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <span
                    className="bar-fill wait"
                    style={{ width: `${stage.waitPercent}%` }}
                  />
                  <span
                    className="bar-fill service"
                    style={{ width: `${stage.servicePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="metrics-row" aria-label="Simulation results">
        <MetricCard
          label="Average wait"
          value={`${formatNumber(simulation.waitMinutes, 1)} min`}
          detail={`Target ${department.targetWait} min`}
          tone={simulation.waitMinutes <= department.targetWait ? "good" : "watch"}
        />
        <MetricCard
          label="Throughput"
          value={`${formatNumber(simulation.throughputPerDay, 0)}/day`}
          detail={`${formatNumber(simulation.capacityPerHour, 1)} capacity/hr`}
          tone="neutral"
        />
        <MetricCard
          label="Utilization"
          value={`${formatNumber(simulation.utilization, 0)}%`}
          detail={`Goal ${department.targetUtilization}%`}
          tone={simulation.utilization < 96 ? "good" : "bad"}
        />
        <MetricCard
          label="Cost per patient"
          value={formatCurrency(simulation.costPerPatient)}
          detail={`${formatCurrency(simulation.costPerDay)}/day`}
          tone={
            simulation.costPerPatient <= department.benchmarkCost ? "good" : "watch"
          }
        />
        <MetricCard
          label="Scenario score"
          value={`${formatNumber(simulation.score, 0)}`}
          detail={simulation.bottleneck}
          tone={simulation.score > 74 ? "good" : "watch"}
        />
      </section>

      <section className="analysis-grid">
        <div className="panel objective-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Objective weights</p>
              <h2>Optimization mix</h2>
            </div>
          </div>

          <div className="weight-list">
            <SliderControl
              label="Lower wait time"
              min={0}
              max={100}
              step={1}
              value={weights.wait}
              suffix="%"
              onChange={(value) => updateWeight("wait", value)}
            />
            <SliderControl
              label="Lower cost"
              min={0}
              max={100}
              step={1}
              value={weights.cost}
              suffix="%"
              onChange={(value) => updateWeight("cost", value)}
            />
            <SliderControl
              label="Higher efficiency"
              min={0}
              max={100}
              step={1}
              value={weights.efficiency}
              suffix="%"
              onChange={(value) => updateWeight("efficiency", value)}
            />
          </div>

          <div className="recommendation">
            <p className="eyebrow">Recommended scenario</p>
            <h3>{optimization.name}</h3>
            <dl>
              <div>
                <dt>Wait change</dt>
                <dd>{formatDelta(optimization.waitDelta, "min")}</dd>
              </div>
              <div>
                <dt>Cost change</dt>
                <dd>{formatCurrencyDelta(optimization.costDelta)}</dd>
              </div>
              <div>
                <dt>Score</dt>
                <dd>{formatNumber(optimization.result.score, 0)}</dd>
              </div>
            </dl>
            <button className="primary-button wide" type="button" onClick={applyOptimizedScenario}>
              Apply recommendation
            </button>
          </div>
        </div>

        <div className="panel comparison-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Scenario comparison</p>
              <h2>Trade-off table</h2>
            </div>
          </div>

          <div className="comparison-table" role="table" aria-label="Scenario comparison">
            <div className="table-row table-head" role="row">
              <span role="columnheader">Scenario</span>
              <span role="columnheader">Wait</span>
              <span role="columnheader">Util.</span>
              <span role="columnheader">Cost</span>
              <span role="columnheader">Score</span>
            </div>
            {comparison.map((item) => (
              <div className="table-row" role="row" key={item.name}>
                <strong role="cell">{item.name}</strong>
                <span role="cell">{formatNumber(item.result.waitMinutes, 1)} min</span>
                <span role="cell">{formatNumber(item.result.utilization, 0)}%</span>
                <span role="cell">{formatCurrency(item.result.costPerPatient)}</span>
                <span role="cell">
                  <b>{formatNumber(item.result.score, 0)}</b>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel insight-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Operational readout</p>
              <h2>Capacity signals</h2>
            </div>
          </div>

          <div className="signal-stack">
            <Signal
              label="Room pressure"
              value={simulation.roomUtilization}
              detail={`${formatNumber(simulation.servers, 0)} active care positions`}
            />
            <Signal
              label="Staff pressure"
              value={simulation.staffUtilization}
              detail={`${inputs.clinicians} clinical staff scheduled`}
            />
            <Signal
              label="Met demand"
              value={(simulation.throughputPerDay / simulation.demandPerDay) * 100}
              detail={`${formatNumber(simulation.demandPerDay, 0)} daily arrivals modeled`}
            />
          </div>

          <ul className="definition-list">
            {metricDefinitions.map((definition) => (
              <li key={definition}>{definition}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  prefix = "",
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix: string;
}) {
  return (
    <label className="slider-control">
      <span>
        <strong>{label}</strong>
        <b>
          {prefix}
          {formatNumber(value, step < 1 ? 1 : 0)}
          {suffix}
        </b>
      </span>
      <input
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
    </label>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "good" | "watch" | "bad" | "neutral";
}) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function Signal({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  const boundedValue = clamp(value, 0, 100);

  return (
    <div className="signal">
      <div>
        <strong>{label}</strong>
        <span>{formatNumber(boundedValue, 0)}%</span>
      </div>
      <div className="bar-track" aria-hidden="true">
        <span className="bar-fill signal-fill" style={{ width: `${boundedValue}%` }} />
      </div>
      <p>{detail}</p>
    </div>
  );
}

function buildFlowStages(department: Department, simulation: Simulation) {
  return department.stages.map((stage) => {
    const waitMinutes = simulation.waitMinutes * stage.waitShare;
    const serviceMinutes = simulation.serviceMinutes * stage.serviceShare;
    const totalMinutes = waitMinutes + serviceMinutes;
    const denominator = Math.max(totalMinutes, 1);

    return {
      name: stage.name,
      totalMinutes,
      waitPercent: clamp((waitMinutes / denominator) * 100, 4, 96),
      servicePercent: clamp((serviceMinutes / denominator) * 100, 4, 96),
    };
  });
}

function buildComparison(
  inputs: ScenarioInputs,
  department: Department,
  weights: Weights,
) {
  const candidates = [
    { name: "Current", inputs },
    {
      name: "Fast access",
      inputs: sanitizeInputs({
        ...inputs,
        rooms: inputs.rooms + 2,
        clinicians: inputs.clinicians + 3,
        serviceMinutes: inputs.serviceMinutes - 3,
        automation: inputs.automation + 12,
        layout: "pod",
      }),
    },
    {
      name: "Lean cost",
      inputs: sanitizeInputs({
        ...inputs,
        rooms: inputs.rooms - 1,
        clinicians: inputs.clinicians - 2,
        automation: inputs.automation + 18,
        layout: "centralized",
      }),
    },
    {
      name: "Balanced pods",
      inputs: sanitizeInputs({
        ...inputs,
        rooms: inputs.rooms + 1,
        clinicians: inputs.clinicians + 1,
        turnoverMinutes: inputs.turnoverMinutes - 4,
        automation: inputs.automation + 16,
        layout: "pod",
      }),
    },
  ];

  return candidates
    .map((candidate) => ({
      ...candidate,
      result: simulate(candidate.inputs, department, weights),
    }))
    .sort((a, b) => b.result.score - a.result.score);
}

function optimize(
  inputs: ScenarioInputs,
  department: Department,
  weights: Weights,
) {
  const current = simulate(inputs, department, weights);
  const candidates: Array<{ name: string; inputs: ScenarioInputs; result: Simulation }> = [];

  for (const roomDelta of [-2, -1, 0, 1, 2, 3, 4]) {
    for (const clinicianDelta of [-3, -2, -1, 0, 1, 2, 3, 4, 5]) {
      for (const automationDelta of [0, 8, 16, 24, 32]) {
        for (const layout of Object.keys(layoutOptions) as LayoutId[]) {
          const candidateInputs = sanitizeInputs({
            ...inputs,
            rooms: inputs.rooms + roomDelta,
            clinicians: inputs.clinicians + clinicianDelta,
            automation: inputs.automation + automationDelta,
            turnoverMinutes: inputs.turnoverMinutes - (layout === "pod" ? 4 : 0),
            layout,
          });
          const result = simulate(candidateInputs, department, weights);
          candidates.push({
            name: nameRecommendation(inputs, candidateInputs),
            inputs: candidateInputs,
            result,
          });
        }
      }
    }
  }

  const best = candidates.sort((a, b) => b.result.score - a.result.score)[0];

  return {
    ...best,
    waitDelta: best.result.waitMinutes - current.waitMinutes,
    costDelta: best.result.costPerPatient - current.costPerPatient,
  };
}

function simulate(
  inputs: ScenarioInputs,
  department: Department,
  weights: Weights,
): Simulation {
  const layout = layoutOptions[inputs.layout];
  const servers = Math.max(1, Math.min(inputs.rooms, inputs.clinicians));
  const staffingRelief = 1 - clamp((inputs.clinicians - inputs.rooms) / inputs.rooms, 0, 0.45) * 0.12;
  const acuityLoad = 1 + (inputs.acuity / 100) * 0.34;
  const automationRelief = 1 - (inputs.automation / 100) * 0.22;
  const spatialLoad = department.travelMinutes * layout.travelIndex;
  const serviceMinutes = Math.max(
    4,
    (inputs.serviceMinutes * acuityLoad + inputs.turnoverMinutes * department.turnoverWeight + spatialLoad) *
      automationRelief *
      staffingRelief,
  );
  const capacityPerHour = (servers * 60) / serviceMinutes;
  const rawUtilization = (inputs.arrivals / capacityPerHour) * 100;
  const waitMinutes =
    erlangWaitMinutes(inputs.arrivals, serviceMinutes, servers) +
    spatialLoad * 0.35 +
    layout.handoffDelay;
  const demandPerDay = inputs.arrivals * 24;
  const throughputPerDay = Math.min(demandPerDay, capacityPerHour * 24 * 0.96);
  const clinicalLabor = inputs.clinicians * inputs.staffCost * 24;
  const spaceCost = inputs.rooms * inputs.roomCost;
  const supplyCost = throughputPerDay * (46 + department.benchmarkCost * 0.08 + inputs.acuity * 0.9);
  const costPerDay = clinicalLabor + spaceCost + supplyCost;
  const costPerPatient = costPerDay / Math.max(throughputPerDay, 1);
  const lengthOfStay = waitMinutes + serviceMinutes + spatialLoad;
  const roomUtilization = clamp(rawUtilization * (servers / Math.max(inputs.rooms, 1)), 0, 100);
  const staffUtilization = clamp(rawUtilization * (servers / Math.max(inputs.clinicians, 1)), 0, 100);
  const utilization = clamp(rawUtilization, 0, 140);
  const metDemand = clamp((throughputPerDay / Math.max(demandPerDay, 1)) * 100, 0, 100);
  const waitScore = clamp(100 - Math.max(0, waitMinutes - department.targetWait) * 1.8, 0, 100);
  const costScore = clamp(
    100 - Math.max(0, costPerPatient - department.benchmarkCost) * (42 / department.benchmarkCost),
    0,
    100,
  );
  const utilizationScore = clamp(
    100 - Math.abs(Math.min(utilization, 100) - department.targetUtilization) * 2.1,
    0,
    100,
  );
  const efficiencyScore = utilizationScore * 0.58 + metDemand * 0.42;
  const weightTotal = Math.max(weights.wait + weights.cost + weights.efficiency, 1);
  const score =
    (waitScore * weights.wait + costScore * weights.cost + efficiencyScore * weights.efficiency) /
    weightTotal;

  return {
    servers,
    capacityPerHour,
    demandPerDay,
    throughputPerDay,
    waitMinutes,
    serviceMinutes,
    lengthOfStay,
    utilization,
    costPerDay,
    costPerPatient,
    roomUtilization,
    staffUtilization,
    queueRisk: getQueueRisk(waitMinutes, utilization, department.targetWait),
    score,
    waitScore,
    costScore,
    efficiencyScore,
    bottleneck: getBottleneck(inputs, utilization, waitMinutes, department),
  };
}

function erlangWaitMinutes(arrivalsPerHour: number, serviceMinutes: number, servers: number) {
  const c = Math.max(1, Math.round(servers));
  const mu = 60 / Math.max(serviceMinutes, 1);
  const traffic = arrivalsPerHour / mu;
  const rho = traffic / c;

  if (rho >= 0.995) {
    return serviceMinutes * (1.35 + Math.max(0, rho - 1) * 4.8);
  }

  let term = 1;
  let sum = 1;

  for (let n = 1; n < c; n += 1) {
    term *= traffic / n;
    sum += term;
  }

  const cTerm = (term * traffic) / c;
  const delayTerm = cTerm / (1 - rho);
  const probabilityWait = delayTerm / (sum + delayTerm);
  const waitHours = probabilityWait / Math.max(c * mu - arrivalsPerHour, 0.01);

  return Math.max(0, waitHours * 60);
}

function sanitizeInputs(inputs: ScenarioInputs): ScenarioInputs {
  return {
    ...inputs,
    rooms: clamp(Math.round(inputs.rooms), 2, 60),
    clinicians: clamp(Math.round(inputs.clinicians), 2, 70),
    arrivals: clamp(Number(inputs.arrivals.toFixed(1)), 1, 50),
    serviceMinutes: clamp(Math.round(inputs.serviceMinutes), 8, 180),
    turnoverMinutes: clamp(Math.round(inputs.turnoverMinutes), 2, 60),
    staffCost: clamp(Math.round(inputs.staffCost), 35, 180),
    roomCost: clamp(Math.round(inputs.roomCost), 120, 2400),
    acuity: clamp(Math.round(inputs.acuity), 10, 90),
    automation: clamp(Math.round(inputs.automation), 0, 65),
  };
}

function nameRecommendation(current: ScenarioInputs, candidate: ScenarioInputs) {
  const roomDelta = candidate.rooms - current.rooms;
  const staffDelta = candidate.clinicians - current.clinicians;
  const automationDelta = candidate.automation - current.automation;

  if (candidate.layout === "pod" && automationDelta >= 16) {
    return "Pod + automation";
  }

  if (roomDelta > 1 && staffDelta > 1) {
    return "Capacity expansion";
  }

  if (roomDelta <= 0 && staffDelta <= 0) {
    return "Lean redesign";
  }

  return "Balanced adjustment";
}

function getQueueRisk(waitMinutes: number, utilization: number, targetWait: number) {
  if (utilization >= 112 || waitMinutes >= targetWait * 2.2) {
    return "Critical";
  }
  if (utilization >= 98 || waitMinutes >= targetWait * 1.45) {
    return "High";
  }
  if (utilization >= 88 || waitMinutes >= targetWait) {
    return "Moderate";
  }
  return "Low";
}

function getBottleneck(
  inputs: ScenarioInputs,
  utilization: number,
  waitMinutes: number,
  department: Department,
) {
  if (utilization >= 100) {
    return "Capacity constrained";
  }
  if (inputs.clinicians < inputs.rooms) {
    return "Staffing constrained";
  }
  if (waitMinutes > department.targetWait) {
    return "Queue constrained";
  }
  if (inputs.layout === "linear") {
    return "Travel constrained";
  }
  return "Within target range";
}

function formatNumber(value: number, digits: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function formatDelta(value: number, suffix: string) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, 1)} ${suffix}`;
}

function formatCurrencyDelta(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatCurrency(value)}`;
}

function heatColor(load: number, kind: Space["kind"]) {
  const normalized = clamp(load, 0, 100) / 100;
  const palette: Record<Space["kind"], [number, number, number]> = {
    intake: [235, 189, 112],
    care: [226, 133, 108],
    diagnostic: [114, 178, 176],
    support: [146, 174, 126],
    exit: [182, 205, 188],
  };
  const [r, g, b] = palette[kind];
  const mix = 0.18 + normalized * 0.54;

  return `rgb(${Math.round(255 - (255 - r) * mix)}, ${Math.round(
    255 - (255 - g) * mix,
  )}, ${Math.round(255 - (255 - b) * mix)})`;
}

function heatBorder(load: number) {
  if (load > 92) {
    return "#b85543";
  }

  if (load > 78) {
    return "#a87923";
  }

  return "rgba(23, 32, 28, 0.14)";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
