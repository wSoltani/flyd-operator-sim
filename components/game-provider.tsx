"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";

export interface Worker {
  id: string;
  name: string;
  status: "healthy" | "degraded" | "critical" | "offline";
  cpu: number;
  memory: number;
  disk: number;
  flydStatus: "running" | "stalled" | "restarting";
  containerdHealth: "healthy" | "degraded" | "failed";
  networkStatus: "connected" | "degraded" | "disconnected";
  activeMachines: number;
  activeFSMs: FSMOperation[];
  restartStartTime?: number;
  baseStats: { cpu: number; memory: number; disk: number };
}

export interface FSMOperation {
  id: string;
  type: "machine_creation" | "migration" | "boot" | "cleanup";
  state: string;
  progress: number;
  machineId: string;
  startTime: number;
}

export interface Incident {
  id: string;
  type:
    | "flyd_stalled"
    | "migration_stuck"
    | "network_partition"
    | "storage_corruption"
    | "containerd_sync"
    | "memory_leak"
    | "disk_io_bottleneck"
    | "kernel_panic"
    | "network_congestion"
    | "dns_failure"
    | "config_corruption"
    | "hardware_degradation"
    | "storage_spreading"
    | "network_hardware_failure";
  severity: "low" | "medium" | "high" | "critical";
  workerId?: string;
  title: string;
  description: string;
  timestamp: number;
  resolved: boolean;
  autoResolveTime?: number;
  isFirstTime?: boolean;
  investigated?: boolean;
  logViewed?: boolean;
  uptime_impact?: number;
  requires_drain?: boolean;
}

export interface ActionFeedback {
  type: "investigation" | "action" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: number;
}

export interface GameState {
  day: number;
  timeInDay: number;
  gameSpeed: number;
  paused: boolean;
  workers: Worker[];
  incidents: Incident[];
  score: {
    uptime: number;
    successfulMigrations: number;
    failedMigrations: number;
    incidentResolutionTime: number;
    riskyActions: number;
  };
  tutorialStep: number;
  showTutorial: boolean;
  selectedWorker: string | null;
  selectedIncident: string | null;
  gameStarted: boolean;
  gameEnded: boolean;
  finalScore?: string;
  showHelp: boolean;
  actionFeedback: ActionFeedback | null;
  seenIncidentTypes: string[];
}

type GameAction =
  | { type: "START_GAME" }
  | { type: "PAUSE_GAME" }
  | { type: "RESUME_GAME" }
  | { type: "TICK" }
  | { type: "SELECT_WORKER"; workerId: string | null }
  | { type: "SELECT_INCIDENT"; incidentId: string | null }
  | { type: "RESTART_FLYD"; workerId: string }
  | { type: "DRAIN_WORKER"; workerId: string }
  | { type: "CHECK_CONTAINERD"; workerId: string }
  | { type: "INSPECT_LVM"; workerId: string }
  | { type: "INVESTIGATE_INCIDENT"; incidentId: string }
  | { type: "VIEW_FLYD_LOGS"; incidentId: string }
  | { type: "FORCE_FSM_TRANSITION"; incidentId: string }
  | { type: "QUICK_FIX_INCIDENT"; incidentId: string }
  | { type: "NEXT_TUTORIAL_STEP" }
  | { type: "SKIP_TUTORIAL" }
  | { type: "ADD_INCIDENT"; incident: Incident; seenIncidentTypes?: string[] }
  | { type: "UPDATE_WORKER"; workerId: string; updates: Partial<Worker> }
  | { type: "SHOW_HELP" }
  | { type: "HIDE_HELP" }
  | { type: "CLEAR_FEEDBACK" }
  | { type: "MARK_INCIDENT_TYPE_SEEN"; incidentType: string };

// Sound effect function
const playIncidentSound = () => {
  try {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log("Audio not supported");
  }
};

const initialState: GameState = {
  day: 1,
  timeInDay: 0,
  gameSpeed: 1,
  paused: false,
  workers: [
    {
      id: "worker-1",
      name: "fly-worker-ord-01",
      status: "healthy",
      cpu: 45,
      memory: 62,
      disk: 78,
      flydStatus: "running",
      containerdHealth: "healthy",
      networkStatus: "connected",
      activeMachines: 12,
      activeFSMs: [],
      baseStats: { cpu: 45, memory: 62, disk: 78 },
    },
  ],
  incidents: [],
  score: {
    uptime: 100,
    successfulMigrations: 0,
    failedMigrations: 0,
    incidentResolutionTime: 0,
    riskyActions: 0,
  },
  tutorialStep: 0,
  showTutorial: true,
  selectedWorker: null,
  selectedIncident: null,
  gameStarted: false,
  gameEnded: false,
  showHelp: false,
  actionFeedback: null,
  seenIncidentTypes: [],
};

function calculateDynamicStats(
  worker: Worker,
  incidents: Incident[]
): { cpu: number; memory: number; disk: number } {
  let { cpu, memory, disk } = worker.baseStats;

  // Add random fluctuation (±5%)
  const fluctuation = () => (Math.random() - 0.5) * 10;
  cpu += fluctuation();
  memory += fluctuation();
  disk += fluctuation();

  // Apply incident effects
  const workerIncidents = incidents.filter(
    (i) => i.workerId === worker.id && !i.resolved
  );

  workerIncidents.forEach((incident) => {
    switch (incident.type) {
      case "flyd_stalled":
        cpu += 25; // High CPU when FSM operations back up
        memory += 15;
        break;
      case "migration_stuck":
        cpu += 20;
        memory += 30; // High memory during migration
        break;
      case "containerd_sync":
        cpu += 15;
        memory += 20;
        break;
      case "network_partition":
        cpu += 10; // Lower impact
        break;
      case "storage_corruption":
        disk += 20; // Disk issues
        cpu += 10;
        break;
      case "memory_leak":
        memory += 35; // Severe memory pressure
        cpu += 10;
        break;
      case "disk_io_bottleneck":
        cpu += 15;
        disk += 25; // High disk usage
        break;
      case "kernel_panic":
        cpu += 30;
        memory += 20;
        break;
      case "network_congestion":
        cpu += 15; // CPU increases due to retries
        break;
      case "dns_failure":
        cpu += 5; // Minor impact
        break;
      case "config_corruption":
        cpu += 20;
        memory += 10;
        break;
      case "hardware_degradation":
        cpu += 20;
        memory += 10;
        disk += 10;
        break;
      case "storage_spreading":
        disk += 30;
        cpu += 15;
        break;
      case "network_hardware_failure":
        cpu += 15;
        break;
    }
  });

  // Apply FSM operation effects
  worker.activeFSMs.forEach((fsm) => {
    if (fsm.type === "migration") {
      cpu += 15;
      memory += 25;
      if (fsm.state === "hydrating") {
        cpu += 10; // Extra load during hydration
        memory += 15;
      }
    }
  });

  // Apply flyd status effects
  if (worker.flydStatus === "restarting") {
    cpu += 30; // High CPU during restart
    memory += 20;
  } else if (worker.flydStatus === "stalled") {
    cpu += 40; // Very high CPU when stalled
    memory += 25;
  }

  // Clamp values and round to 1 decimal place
  return {
    cpu: Math.round(Math.max(5, Math.min(100, cpu)) * 10) / 10,
    memory: Math.round(Math.max(10, Math.min(100, memory)) * 10) / 10,
    disk:
      Math.round(Math.max(worker.baseStats.disk, Math.min(100, disk)) * 10) /
      10,
  };
}

// Reduced restart time to 3 seconds for better gameplay
const RESTART_TIME = 3000;

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...state,
        gameStarted: true,
        paused: false,
        selectedWorker: state.workers.length > 0 ? state.workers[0].id : null,
      };

    case "PAUSE_GAME":
      return { ...state, paused: true };

    case "RESUME_GAME":
      return { ...state, paused: false };

    case "TICK":
      if (state.paused || !state.gameStarted) return state;

      // Calculate uptime impact from active incidents
      const activeIncidents = state.incidents.filter((i) => !i.resolved);
      const totalUptimeImpact = activeIncidents.reduce((total, incident) => {
        return total + (incident.uptime_impact || 0);
      }, 0);

      // Apply uptime impact (max 50% impact to prevent going negative)
      const uptimeReduction = Math.min(totalUptimeImpact, 50);
      const currentUptime = Math.max(0, 100 - uptimeReduction);

      // Update score with current uptime
      const newScore = {
        ...state.score,
        uptime: currentUptime,
      };

      const newTimeInDay = state.timeInDay + 1;
      const newDay = newTimeInDay >= 300 ? state.day + 1 : state.day;
      const resetTime = newTimeInDay >= 300 ? 0 : newTimeInDay;

      // Add a new worker at the start of a new day, up to 4 workers
      let newWorkers = state.workers;
      if (newDay > state.day && state.workers.length < 4) {
        const nextWorkerNum = state.workers.length + 1;
        newWorkers = [
          ...state.workers,
          {
            id: `worker-${nextWorkerNum}`,
            name: `fly-worker-ord-0${nextWorkerNum}`,
            status: "healthy",
            cpu: state.workers[0].baseStats.cpu,
            memory: state.workers[0].baseStats.memory,
            disk: state.workers[0].baseStats.disk,
            flydStatus: "running",
            containerdHealth: "healthy",
            networkStatus: "connected",
            activeMachines: 12,
            activeFSMs: [],
            baseStats: { ...state.workers[0].baseStats },
          },
        ];
      }

      // Update workers with dynamic stats and progression
      const updatedWorkers = newWorkers.map((worker) => {
        let updatedWorker = { ...worker };

        // Handle flyd restart progression - now only 15 seconds
        if (worker.flydStatus === "restarting" && worker.restartStartTime) {
          const restartDuration = Date.now() - worker.restartStartTime;
          if (restartDuration > RESTART_TIME) {
            updatedWorker = {
              ...updatedWorker,
              flydStatus: "running",
              restartStartTime: undefined,
              containerdHealth: "healthy",
            };
          }
        }

        // Progress FSM operations
        const updatedFSMs = worker.activeFSMs.map((fsm) => {
          const elapsed = Date.now() - fsm.startTime;
          let newState = fsm.state;
          let newProgress = fsm.progress;

          if (fsm.type === "migration") {
            if (elapsed < 1000) {
              newState = "pending";
              newProgress = 0;
            } else if (elapsed < 2000) {
              newState = "cloning";
              newProgress = Math.min(30, ((elapsed - 1000) / 1000) * 30);
            } else if (elapsed < 3500) {
              newState = "hydrating";
              newProgress = Math.min(80, 30 + ((elapsed - 2000) / 1500) * 50);
            } else if (elapsed < 4500) {
              newState = "booting_new";
              newProgress = Math.min(95, 80 + ((elapsed - 3500) / 1000) * 15);
            } else if (elapsed < 5000) {
              newState = "running_new";
              newProgress = Math.min(99, 95 + ((elapsed - 4500) / 500) * 4);
            } else {
              newState = "cleanup_old";
              newProgress = 100;
            }
          }

          // Round progress to 1 decimal place
          return {
            ...fsm,
            state: newState,
            progress: Math.round(newProgress * 10) / 10,
          };
        });

        const activeFSMs = updatedFSMs.filter((fsm) => fsm.progress < 100);

        if (
          worker.status === "degraded" &&
          activeFSMs.length === 0 &&
          updatedFSMs.some((fsm) => fsm.progress === 100)
        ) {
          updatedWorker.status = "healthy";
        }

        updatedWorker.activeFSMs = activeFSMs;

        // Update dynamic stats
        const dynamicStats = calculateDynamicStats(
          updatedWorker,
          state.incidents
        );
        updatedWorker.cpu = dynamicStats.cpu;
        updatedWorker.memory = dynamicStats.memory;
        updatedWorker.disk = dynamicStats.disk;

        return updatedWorker;
      });

      // Auto-resolve incidents based on worker state - but only after some time has passed
      const updatedIncidents = state.incidents.map((incident) => {
        if (incident.resolved) return incident;

        const affectedWorker = updatedWorkers.find(
          (w) => w.id === incident.workerId
        );
        if (!affectedWorker) return incident;

        // Only auto-resolve incidents that are at least 10 seconds old to prevent immediate resolution
        const incidentAge = Date.now() - incident.timestamp;
        if (incidentAge < 10000) return incident;

        // Auto-resolve incidents when appropriate conditions are met
        let shouldResolve = false;

        switch (incident.type) {
          case "flyd_stalled":
          case "memory_leak":
          case "config_corruption":
            // Resolve when flyd is running and not stalled
            shouldResolve = affectedWorker.flydStatus === "running";
            break;
          case "containerd_sync":
            // Resolve when containerd is healthy
            shouldResolve = affectedWorker.containerdHealth === "healthy";
            break;
          case "migration_stuck":
            // Resolve when no active FSMs or FSM progressed past hydrating
            shouldResolve =
              affectedWorker.activeFSMs.length === 0 ||
              affectedWorker.activeFSMs.every(
                (fsm) => fsm.state !== "hydrating" || fsm.progress > 80
              );
            break;
          case "network_partition":
          case "network_congestion":
          case "dns_failure":
            // Resolve when network is connected
            shouldResolve = affectedWorker.networkStatus === "connected";
            break;
          case "hardware_degradation":
          case "storage_spreading":
          case "network_hardware_failure":
            shouldResolve = false;
            break;
        }

        if (shouldResolve) {
          return { ...incident, resolved: true };
        }

        // Auto-resolve with time
        if (incident.autoResolveTime && Date.now() > incident.autoResolveTime) {
          return { ...incident, resolved: true };
        }

        return incident;
      });

      const shouldClearFeedback =
        state.actionFeedback &&
        Date.now() - state.actionFeedback.timestamp > 10000;

      return {
        ...state,
        timeInDay: resetTime,
        day: newDay,
        workers: updatedWorkers,
        incidents: updatedIncidents,
        gameEnded: newDay > 7,
        score: newScore,
        actionFeedback: shouldClearFeedback ? null : state.actionFeedback,
      };

    case "SELECT_WORKER":
      return { ...state, selectedWorker: action.workerId };

    case "SELECT_INCIDENT":
      return { ...state, selectedIncident: action.incidentId };

    case "RESTART_FLYD":
      // Resolve ALL flyd-related incidents on this worker when restart is initiated
      const resolvedIncidentsAfterRestart = state.incidents.map((incident) => {
        if (
          incident.workerId === action.workerId &&
          !incident.resolved &&
          [
            "flyd_stalled",
            "containerd_sync",
            "memory_leak",
            "config_corruption",
          ].includes(incident.type)
        ) {
          return { ...incident, resolved: true };
        }
        return incident;
      });

      return {
        ...state,
        incidents: resolvedIncidentsAfterRestart,
        workers: state.workers.map((worker) =>
          worker.id === action.workerId
            ? {
                ...worker,
                flydStatus: "restarting" as const,
                restartStartTime: Date.now(),
              }
            : worker
        ),
        score: { ...state.score, riskyActions: state.score.riskyActions + 1 },
        actionFeedback: {
          type: "action",
          title: "flyd Restart Initiated",
          message: `Restarting flyd process... This will take 3 seconds. All flyd-related incidents on this worker will be resolved.`,
          timestamp: Date.now(),
        },
      };

    case "DRAIN_WORKER":
      const drainSuccess = Math.random() > 0.1; // 90% success rate for basic drain

      if (!drainSuccess) {
        // Drain failed - FSM error state
        return {
          ...state,
          workers: state.workers.map((worker) =>
            worker.id === action.workerId
              ? {
                  ...worker,
                  status: "critical" as const,
                  activeFSMs: [
                    {
                      id: `migration-failed-${Date.now()}`,
                      type: "migration",
                      state: "error_recovery",
                      progress: 0,
                      machineId: `machine-${Math.floor(Math.random() * 1000)}`,
                      startTime: Date.now(),
                    },
                  ],
                }
              : worker
          ),
          score: {
            ...state.score,
            riskyActions: state.score.riskyActions + 1,
            failedMigrations: state.score.failedMigrations + 1,
          },
          actionFeedback: {
            type: "error",
            title: "Worker Drain Failed",
            message:
              "CRITICAL: Drain operation failed! FSM entered error_recovery state. dm-clone hydration failed due to storage corruption. Manual intervention required.",
            timestamp: Date.now(),
          },
        };
      }

      // Successful drain: resolve all incidents on this worker that require a drain
      const resolvedDrainIncidents = state.incidents.map((incident) =>
        incident.workerId === action.workerId &&
        incident.requires_drain &&
        !incident.resolved
          ? { ...incident, resolved: true }
          : incident
      );

      return {
        ...state,
        workers: state.workers.map((worker) =>
          worker.id === action.workerId
            ? {
                ...worker,
                status: "degraded" as const,
                networkStatus: "connected",
                activeFSMs: [
                  {
                    id: `migration-${Date.now()}`,
                    type: "migration",
                    state: "pending",
                    progress: 0,
                    machineId: `machine-${Math.floor(Math.random() * 1000)}`,
                    startTime: Date.now(),
                  },
                ],
              }
            : worker
        ),
        incidents: resolvedDrainIncidents,
        score: { ...state.score, riskyActions: state.score.riskyActions + 1 },
        actionFeedback: {
          type: "warning",
          title: "Worker Drain Started",
          message:
            "Initiating graceful worker drain. All 12 machines will migrate using dm-clone to other workers. This will take ~75 seconds. All incidents requiring a drain on this worker have been resolved.",
          timestamp: Date.now(),
        },
      };

    case "CHECK_CONTAINERD":
      const worker = state.workers.find((w) => w.id === action.workerId);
      const containerdStatus = worker?.containerdHealth || "unknown";
      return {
        ...state,
        actionFeedback: {
          type: "action",
          title: "containerd Health Check",
          message: `Status: ${containerdStatus}. ${
            containerdStatus === "healthy"
              ? "All container operations normal. Lease database synchronized."
              : containerdStatus === "degraded"
              ? "Some containers failing to start. Lease mismatch detected. Consider restarting flyd to resync."
              : "CRITICAL: containerd daemon not responding. All container operations failing. Immediate flyd restart required."
          }`,
          timestamp: Date.now(),
        },
      };

    case "INSPECT_LVM":
      const workerLvm = state.workers.find((w) => w.id === action.workerId);
      const diskUsage = workerLvm?.disk || 0;
      return {
        ...state,
        actionFeedback: {
          type:
            diskUsage > 90 ? "error" : diskUsage > 80 ? "warning" : "action",
          title: "LVM Health Inspection",
          message: `Disk usage: ${diskUsage.toFixed(1)}%. ${
            diskUsage > 90
              ? "CRITICAL: Volume group nearly full. Risk of write failures. Immediate worker drain recommended."
              : diskUsage > 80
              ? "WARNING: High disk usage. Monitor closely and consider proactive migration."
              : "LVM volumes healthy. Metadata intact, no corruption detected."
          }`,
          timestamp: Date.now(),
        },
      };

    case "INVESTIGATE_INCIDENT":
      const incident = state.incidents.find((i) => i.id === action.incidentId);
      if (!incident) return state;

      const investigations = {
        flyd_stalled: {
          title: "Investigation Complete",
          message:
            "Root cause: flyd FSM stuck in machine_boot transition for 300+ seconds. Worker has 8 pending FSM operations queued. Restart will clear the queue and resume normal operations.",
        },
        migration_stuck: {
          title: "Migration Analysis",
          message:
            "dm-clone hydration stalled at 45% for 12 minutes. Network throughput dropped to 0 MB/s. Target worker may have storage issues or network partition.",
        },
        containerd_sync: {
          title: "Sync Investigation",
          message:
            "flyd lease database shows 12 active containers, but containerd reports only 8 running. 4 containers in unknown state. Restart will force lease reconciliation.",
        },
        network_partition: {
          title: "Network Diagnosis",
          message:
            "Worker lost connectivity to coordination services. 5 consecutive connection failures detected. Local containers still running but no new deployments possible.",
        },
        storage_corruption: {
          title: "Storage Analysis",
          message:
            "LVM metadata corruption detected in volume group. 2 logical volumes affected. Data integrity at risk. Immediate evacuation required before total failure.",
        },
        memory_leak: {
          title: "Memory Analysis",
          message:
            "flyd process has grown to 2.8GB of memory usage. Leak detected in FSM state tracking. Restart will reclaim memory and reset the process heap.",
        },
        disk_io_bottleneck: {
          title: "I/O Analysis",
          message:
            "Disk I/O queue depth at 128+. Average latency 250ms. Multiple machines experiencing slow boot times. Consider migrating machines to reduce load.",
        },
        kernel_panic: {
          title: "Kernel Analysis",
          message:
            "Worker kernel panic detected in dmesg logs. Likely caused by faulty hardware or driver issue. Worker requires immediate reboot.",
        },
        network_congestion: {
          title: "Network Analysis",
          message:
            "Network interface showing 85% packet loss and high retransmit rate. Possible switch issue or NIC failure. Consider draining worker.",
        },
        dns_failure: {
          title: "DNS Analysis",
          message:
            "Worker unable to resolve internal DNS names. Local resolver cache corrupted. Restart networking services to rebuild cache.",
        },
        config_corruption: {
          title: "Config Analysis",
          message:
            "flyd configuration file corrupted with invalid JSON. Detected 3 syntax errors. Restart will reload from backup config.",
        },
        hardware_degradation: {
          title: "Hardware Analysis",
          message:
            "CRITICAL: ECC memory errors increasing exponentially. CPU thermal throttling detected. Hardware failure imminent within 2-4 hours. IMMEDIATE DRAIN REQUIRED.",
        },
        storage_spreading: {
          title: "Storage Analysis",
          message:
            "CRITICAL: LVM corruption spreading across volume group. 6 volumes now affected, up from 2. Filesystem errors detected. IMMEDIATE DRAIN REQUIRED to prevent total data loss.",
        },
        network_hardware_failure: {
          title: "Network Hardware Analysis",
          message:
            "CRITICAL: NIC firmware corruption detected. Switch port showing CRC errors. Connection drops every 30-60 seconds. IMMEDIATE DRAIN REQUIRED before total network failure.",
        },
      };

      const result = investigations[incident.type];
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.incidentId ? { ...i, investigated: true } : i
        ),
        actionFeedback: {
          type: "investigation",
          title: result.title,
          message: result.message,
          timestamp: Date.now(),
        },
      };

    case "VIEW_FLYD_LOGS":
      const logIncident = state.incidents.find(
        (i) => i.id === action.incidentId
      );
      if (!logIncident) return state;

      const logMessages = {
        flyd_stalled:
          "ERROR [FSM] machine_boot transition timeout after 300s. State: pending -> stuck. Queue depth: 8 operations",
        migration_stuck:
          "WARN [dm-clone] hydration stalled. Progress: 45%. Network throughput: 0 MB/s. Retry count: 15",
        containerd_sync:
          "ERROR [lease] mismatch detected. Expected: 12 containers, Actual: 8. Missing: [app-1, app-2, app-3, app-4]",
        network_partition:
          "ERROR [coordination] connection failed. Endpoint: coord.fly.io:443. Retry 5/5 failed. Backoff: 30s",
        storage_corruption:
          "FATAL [LVM] metadata read failed. VG: fly-volumes. Corrupted LVs: vol-abc123, vol-def456",
        memory_leak:
          "WARN [memory] Process memory usage: 2.8GB. Heap growth rate: +50MB/min. FSM tracker leaking references.",
        disk_io_bottleneck:
          "WARN [io] Disk I/O queue depth: 128. Average latency: 250ms. Throttling machine creation operations.",
        kernel_panic:
          "FATAL [kernel] Kernel panic detected. Call trace: [flyio_virtio_driver+0x1234]. Worker unstable.",
        network_congestion:
          "ERROR [network] Packet loss: 85%. RTT: 1250ms. TCP retransmits: 42%. Network interface degraded.",
        dns_failure:
          "ERROR [dns] Failed to resolve coord.fly.io. Error: SERVFAIL. Local resolver cache may be corrupted.",
        config_corruption:
          "ERROR [config] Failed to parse /etc/flyd/config.json: Unexpected token at line 42. Using fallback config.",
        hardware_degradation:
          "FATAL [hardware] ECC errors: 847 in last hour. CPU temp: 89°C (throttling). Memory test failures detected.",
        storage_spreading:
          "FATAL [storage] LVM corruption spreading. Affected LVs: 6/12. Filesystem errors: ext4 journal corruption detected.",
        network_hardware_failure:
          "FATAL [network] NIC firmware CRC mismatch. Switch port errors: 1247. Connection drops every 45s average.",
      };

      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.incidentId ? { ...i, logViewed: true } : i
        ),
        actionFeedback: {
          type: "action",
          title: "flyd Logs Retrieved",
          message:
            logMessages[logIncident.type] ||
            "No relevant errors found in recent logs.",
          timestamp: Date.now(),
        },
      };

    case "FORCE_FSM_TRANSITION":
      const fsmIncident = state.incidents.find(
        (i) => i.id === action.incidentId
      );
      if (!fsmIncident) return state;

      const success = Math.random() > 0.3;
      return {
        ...state,
        incidents: state.incidents.map((i) =>
          i.id === action.incidentId ? { ...i, resolved: success } : i
        ),
        score: {
          ...state.score,
          riskyActions: state.score.riskyActions + 2,
          failedMigrations: success
            ? state.score.failedMigrations
            : state.score.failedMigrations + 1,
        },
        actionFeedback: {
          type: success ? "success" : "error",
          title: success
            ? "FSM Force Transition Successful"
            : "FSM Force Transition Failed",
          message: success
            ? "Forced FSM state transition completed. Machine recovered to running state. Risk: potential data inconsistency."
            : "FAILED: Force transition caused data corruption. Machine lost! This is why force transitions are dangerous in production.",
          timestamp: Date.now(),
        },
      };

    case "QUICK_FIX_INCIDENT":
      const quickFixIncident = state.incidents.find(
        (i) => i.id === action.incidentId
      );
      if (!quickFixIncident) return state;

      const quickFixes = {
        flyd_stalled: {
          action: "Restart flyd",
          success: 0.2,
          takesTime: true,
          actionType: "RESTART_FLYD",
        },
        migration_stuck: {
          action: "Cancel migration",
          success: 0.15,
          takesTime: false,
          actionType: undefined,
        },
        containerd_sync: {
          action: "Restart flyd",
          success: 0.25,
          takesTime: true,
          actionType: "RESTART_FLYD",
        },
        network_partition: {
          action: "Restart networking",
          success: 0.2,
          takesTime: false,
          actionType: undefined,
        },
        storage_corruption: {
          action: "Mark volumes read-only",
          success: 0.1,
          takesTime: false,
          actionType: undefined,
        },
        memory_leak: {
          action: "Restart flyd",
          success: 0.2,
          takesTime: true,
          actionType: "RESTART_FLYD",
        },
        disk_io_bottleneck: {
          action: "Throttle I/O",
          success: 0.2,
          takesTime: false,
          actionType: undefined,
        },
        kernel_panic: {
          action: "Reboot worker",
          success: 0.15,
          takesTime: true,
          actionType: "RESTART_FLYD",
        },
        network_congestion: {
          action: "Reset NIC",
          success: 0.15,
          takesTime: false,
          actionType: undefined,
        },
        dns_failure: {
          action: "Flush DNS cache",
          success: 0.25,
          takesTime: false,
          actionType: undefined,
        },
        config_corruption: {
          action: "Restore config",
          success: 0.2,
          takesTime: true,
          actionType: "RESTART_FLYD",
        },
        hardware_degradation: {
          action: "Emergency drain",
          success: 0.1,
          takesTime: true,
          actionType: "DRAIN_WORKER",
        },
        storage_spreading: {
          action: "Emergency drain",
          success: 0.1,
          takesTime: true,
          actionType: "DRAIN_WORKER",
        },
        network_hardware_failure: {
          action: "Emergency drain",
          success: 0.1,
          takesTime: true,
          actionType: "DRAIN_WORKER",
        },
      } as const;

      const fix = quickFixes[quickFixIncident.type];
      const wasInvestigated = quickFixIncident.investigated;
      const successRate = wasInvestigated ? fix.success + 0.8 : fix.success;
      const fixSuccess = Math.random() < successRate;

      // If this quick fix maps to an actual action (like drain or restart), perform that action instead
      if (fix.actionType && quickFixIncident.workerId && fixSuccess) {
        if (fix.actionType === "DRAIN_WORKER") {
          const drainSuccess = Math.random() > 0.3;

          if (!drainSuccess) {
            return {
              ...state,
              workers: state.workers.map((worker) =>
                worker.id === quickFixIncident.workerId
                  ? {
                      ...worker,
                      status: "critical" as const,
                      activeFSMs: [
                        {
                          id: `migration-failed-${Date.now()}`,
                          type: "migration",
                          state: "error_recovery",
                          progress: 0,
                          machineId: `machine-${Math.floor(
                            Math.random() * 1000
                          )}`,
                          startTime: Date.now(),
                        },
                      ],
                    }
                  : worker
              ),
              incidents: state.incidents.map((i) =>
                i.id === action.incidentId ? { ...i, resolved: false } : i
              ),
              score: {
                ...state.score,
                riskyActions: state.score.riskyActions + 1,
                failedMigrations: state.score.failedMigrations + 1,
              },
              actionFeedback: {
                type: "error",
                title: "Emergency Drain Failed",
                message:
                  "CRITICAL: Drain operation failed! FSM entered error_recovery state. dm-clone hydration failed due to storage corruption. Manual intervention required.",
                timestamp: Date.now(),
              },
            };
          }

          // Successful drain
          return {
            ...state,
            workers: state.workers.map((worker) =>
              worker.id === quickFixIncident.workerId
                ? {
                    ...worker,
                    status: "degraded" as const,
                    networkStatus: "connected",
                    activeFSMs: [
                      {
                        id: `migration-${Date.now()}`,
                        type: "migration",
                        state: "pending",
                        progress: 0,
                        machineId: `machine-${Math.floor(
                          Math.random() * 1000
                        )}`,
                        startTime: Date.now(),
                      },
                    ],
                  }
                : worker
            ),
            incidents: state.incidents.map((i) =>
              i.id === action.incidentId ? { ...i, resolved: true } : i
            ),
            score: {
              ...state.score,
              riskyActions: state.score.riskyActions + 1,
              successfulMigrations: state.score.successfulMigrations + 1,
            },
            actionFeedback: {
              type: "warning",
              title: "Emergency Drain Started",
              message:
                "Initiating emergency worker drain. All 12 machines will migrate using dm-clone to other workers. This will take ~75 seconds.",
              timestamp: Date.now(),
            },
          };
        } else if (fix.actionType === "RESTART_FLYD") {
          // Directly call the restart flyd logic
          const resolvedIncidentsAfterRestart = state.incidents.map(
            (incident) => {
              if (
                incident.id === action.incidentId ||
                (incident.workerId === quickFixIncident.workerId &&
                  !incident.resolved &&
                  [
                    "flyd_stalled",
                    "containerd_sync",
                    "memory_leak",
                    "config_corruption",
                  ].includes(incident.type))
              ) {
                return { ...incident, resolved: true };
              }
              return incident;
            }
          );

          return {
            ...state,
            incidents: resolvedIncidentsAfterRestart,
            workers: state.workers.map((worker) =>
              worker.id === quickFixIncident.workerId
                ? {
                    ...worker,
                    flydStatus: "restarting" as const,
                    restartStartTime: Date.now(),
                  }
                : worker
            ),
            score: {
              ...state.score,
              riskyActions: state.score.riskyActions + 1,
            },
            actionFeedback: {
              type: "action",
              title: "flyd Restart Initiated",
              message: `Restarting flyd process... This will take 3 seconds. All flyd-related incidents on this worker will be resolved.`,
              timestamp: Date.now(),
            },
          };
        }
      }

      // For other quick fixes that don't map to specific actions
      let updatedWorkersForQuickFix = state.workers;
      if (fix.takesTime && quickFixIncident.workerId && fixSuccess) {
        updatedWorkersForQuickFix = state.workers.map((worker) =>
          worker.id === quickFixIncident.workerId
            ? {
                ...worker,
                flydStatus: "restarting" as const,
                restartStartTime: Date.now(),
              }
            : worker
        );
      }

      return {
        ...state,
        workers: updatedWorkersForQuickFix,
        incidents: state.incidents.map((i) =>
          i.id === action.incidentId ? { ...i, resolved: fixSuccess } : i
        ),
        score: {
          ...state.score,
          successfulMigrations: fixSuccess
            ? state.score.successfulMigrations + 1
            : state.score.successfulMigrations,
          failedMigrations: fixSuccess
            ? state.score.failedMigrations
            : state.score.failedMigrations + 1,
        },
        actionFeedback: {
          type: fixSuccess ? "success" : "warning",
          title: fixSuccess ? "Quick Fix Applied" : "Quick Fix Failed",
          message: fixSuccess
            ? `Applied quick fix: ${fix.action}. ${
                fix.takesTime
                  ? "Restart initiated - will take 3 seconds."
                  : "Incident resolved immediately."
              } ${
                wasInvestigated
                  ? "Investigation data helped improve success rate."
                  : "Consider investigating first for better outcomes."
              }`
            : `Quick fix (${fix.action}) failed to resolve the incident. ${
                wasInvestigated
                  ? "Try alternative approaches."
                  : "Investigation might reveal better solutions."
              }`,
          timestamp: Date.now(),
        },
      };

    case "NEXT_TUTORIAL_STEP":
      return { ...state, tutorialStep: state.tutorialStep + 1 };

    case "SKIP_TUTORIAL":
      return { ...state, showTutorial: false };

    case "ADD_INCIDENT":
      // Play sound when new incident is added
      playIncidentSound();

      // Apply incident effects to worker state
      const updatedWorkersForIncident = state.workers.map((worker) => {
        if (worker.id === action.incident.workerId) {
          const updates: Partial<Worker> = {};

          switch (action.incident.type) {
            case "flyd_stalled":
              updates.flydStatus = "stalled";
              break;
            case "containerd_sync":
              updates.containerdHealth = "degraded";
              break;
            case "migration_stuck":
              // Migration incidents don't directly affect worker status
              break;
            case "network_partition":
            case "network_congestion":
            case "dns_failure":
              updates.networkStatus = "degraded";
              break;
            case "storage_corruption":
            case "disk_io_bottleneck":
              updates.status = "degraded";
              break;
            case "memory_leak":
              // Memory leak affects flyd but doesn't stall it
              break;
            case "kernel_panic":
              updates.status = "critical";
              break;
            case "config_corruption":
              updates.flydStatus = "stalled";
              break;
            case "hardware_degradation":
            case "storage_spreading":
            case "network_hardware_failure":
              updates.status = "critical";
              break;
          }

          return { ...worker, ...updates };
        }
        return worker;
      });

      return {
        ...state,
        workers: updatedWorkersForIncident,
        incidents: [...state.incidents, action.incident],
        seenIncidentTypes: action.seenIncidentTypes || state.seenIncidentTypes,
      };

    case "UPDATE_WORKER":
      return {
        ...state,
        workers: state.workers.map((worker) =>
          worker.id === action.workerId
            ? { ...worker, ...action.updates }
            : worker
        ),
      };

    case "SHOW_HELP":
      return { ...state, showHelp: true };

    case "HIDE_HELP":
      return { ...state, showHelp: false };

    case "CLEAR_FEEDBACK":
      return { ...state, actionFeedback: null };

    case "MARK_INCIDENT_TYPE_SEEN":
      if (state.seenIncidentTypes.includes(action.incidentType)) return state;
      return {
        ...state,
        seenIncidentTypes: [...state.seenIncidentTypes, action.incidentType],
      };

    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    if (!state.gameStarted || state.paused || state.gameEnded) return;

    const interval = setInterval(() => {
      dispatch({ type: "TICK" });
    }, 1000 / state.gameSpeed);

    return () => clearInterval(interval);
  }, [state.gameStarted, state.paused, state.gameSpeed, state.gameEnded]);

  // Keep track of incident interval with a ref
  const incidentIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Setup and teardown incident generation
  useEffect(() => {
    // Clear any existing interval when dependencies change
    if (incidentIntervalRef.current) {
      clearInterval(incidentIntervalRef.current);
      incidentIntervalRef.current = null;
    }

    // Only create a new interval if the game is running
    if (!state.gameStarted || state.paused || state.gameEnded) return;

    console.log("Setting up incident interval...");

    incidentIntervalRef.current = setInterval(() => {
      console.log("Incident check running...");

      // Select a random worker for incident generation
      const workers = state.workers;
      if (!workers || workers.length === 0) {
        console.log("No workers found");
        return;
      }
      const worker = workers[Math.floor(Math.random() * workers.length)];
      if (!worker) {
        console.log("No worker found");
        return;
      }

      console.log("Worker state:", {
        flydStatus: worker.flydStatus,
        status: worker.status,
        activeFSMs: worker.activeFSMs.length,
      });

      // Check if any worker has active migrations (drain in progress)
      const hasMigrations =
        worker.activeFSMs.length > 0 &&
        worker.activeFSMs.some(
          (fsm) => fsm.type === "migration" && fsm.progress < 100
        );

      // Only pause incident generation for truly critical or degraded states
      const shouldPauseIncidents =
        worker.status === "critical" || worker.status === "degraded";

      if (shouldPauseIncidents) {
        console.log(
          "Pausing incidents due to worker state:",
          worker.status === "degraded" ? "Worker degraded" : "Critical state"
        );
        return;
      }

      const baseIncidentRate = 0.45;
      const stressMultiplier = worker.status === "degraded" ? 1.5 : 1.0;
      const incidentRate = baseIncidentRate * stressMultiplier;

      console.log("Incident rate:", incidentRate);

      const shouldCreateIncident = Math.random() < incidentRate;
      console.log("Should create incident:", shouldCreateIncident);

      if (shouldCreateIncident) {
        console.log("Creating incident...");

        // Context-aware incident selection
        const possibleIncidents = [];

        if (worker.flydStatus === "running" && !hasMigrations) {
          possibleIncidents.push(
            {
              type: "flyd_stalled" as const,
              severity: "high" as const,
              title: "flyd Process Stalled",
              description:
                "flyd process on worker has become unresponsive. FSM operations are backing up.",
              workerId: worker.id,
              uptime_impact: 15,
            },
            {
              type: "memory_leak" as const,
              severity: "high" as const,
              title: "flyd Memory Leak",
              description:
                "flyd process memory usage growing rapidly. FSM tracker leaking references.",
              workerId: worker.id,
              uptime_impact: 8,
            },
            {
              type: "config_corruption" as const,
              severity: "high" as const,
              title: "flyd Config Corruption",
              description:
                "flyd configuration file has become corrupted with invalid JSON syntax.",
              workerId: worker.id,
              uptime_impact: 12,
            }
          );
        }

        // Add containerd-related incidents
        if (worker.containerdHealth === "healthy") {
          possibleIncidents.push({
            type: "containerd_sync" as const,
            severity: "medium" as const,
            title: "containerd Sync Issue",
            description:
              "Lease database mismatch between flyd and containerd. Some containers in unknown state.",
            workerId: worker.id,
            uptime_impact: 10,
          });
        }

        // Add network-related incidents
        if (worker.networkStatus === "connected") {
          possibleIncidents.push(
            {
              type: "network_partition" as const,
              severity: "high" as const,
              title: "Network Partition",
              description:
                "Worker lost connectivity to coordination services. Local containers still running.",
              workerId: worker.id,
              uptime_impact: 14,
            },
            {
              type: "network_congestion" as const,
              severity: "medium" as const,
              title: "Network Congestion",
              description:
                "High packet loss and latency affecting machine operations and migrations.",
              workerId: worker.id,
              uptime_impact: 8,
            },
            {
              type: "network_hardware_failure" as const,
              severity: "critical" as const,
              title: "Network Hardware Failure",
              description:
                "NIC firmware corruption detected. Connection drops every 30-60 seconds.",
              workerId: worker.id,
              uptime_impact: 25,
              requires_drain: true,
            }
          );
        }

        // Add storage-related incidents
        possibleIncidents.push(
          {
            type: "storage_corruption" as const,
            severity: "high" as const,
            title: "Storage Corruption",
            description:
              "LVM metadata corruption detected. Data integrity at risk.",
            workerId: worker.id,
            uptime_impact: 18,
          },
          {
            type: "storage_spreading" as const,
            severity: "critical" as const,
            title: "Storage Corruption Spreading",
            description:
              "LVM corruption spreading across volume group. Immediate evacuation required.",
            workerId: worker.id,
            uptime_impact: 30,
            requires_drain: true,
          }
        );

        // Add hardware-related incidents
        possibleIncidents.push(
          {
            type: "hardware_degradation" as const,
            severity: "critical" as const,
            title: "Hardware Degradation",
            description:
              "ECC memory errors increasing exponentially. Hardware failure imminent.",
            workerId: worker.id,
            uptime_impact: 22,
            requires_drain: true,
          },
          {
            type: "kernel_panic" as const,
            severity: "critical" as const,
            title: "Kernel Panic",
            description:
              "Worker kernel panic detected. Likely caused by faulty hardware or driver issue.",
            workerId: worker.id,
            uptime_impact: 20,
          }
        );

        // Always add some basic incidents
        possibleIncidents.push(
          {
            type: "disk_io_bottleneck" as const,
            severity: "medium" as const,
            title: "Disk I/O Bottleneck",
            description:
              "High disk queue depth causing slow machine operations. I/O latency increasing.",
            workerId: worker.id,
            uptime_impact: 6,
          },
          {
            type: "dns_failure" as const,
            severity: "low" as const,
            title: "DNS Resolution Failure",
            description:
              "Worker unable to resolve internal DNS names. Local resolver cache may be corrupted.",
            workerId: worker.id,
            uptime_impact: 2,
          }
        );

        // Filter out incidents that require a restart or migration based on worker state
        const restartIncidentTypes = [
          "flyd_stalled",
          "containerd_sync",
          "memory_leak",
          "kernel_panic",
          "config_corruption",
        ];
        const migrationIncidentTypes = [
          "hardware_degradation",
          "storage_spreading",
          "network_hardware_failure",
        ];

        let filteredIncidents = possibleIncidents;
        if (worker.flydStatus === "restarting") {
          filteredIncidents = filteredIncidents.filter(
            (inc) => !restartIncidentTypes.includes(inc.type)
          );
        }
        if (hasMigrations) {
          filteredIncidents = filteredIncidents.filter(
            (inc) => !migrationIncidentTypes.includes(inc.type)
          );
        }

        console.log("Possible incidents:", filteredIncidents.length);

        if (filteredIncidents.length === 0) {
          console.log("No possible incidents!");
          return;
        }

        const incident =
          filteredIncidents[
            Math.floor(Math.random() * filteredIncidents.length)
          ];
        const isFirstTime = !state.seenIncidentTypes.includes(incident.type);
        // Only add to seenIncidentTypes if this is the first time
        let updatedSeenIncidentTypes = state.seenIncidentTypes;
        if (isFirstTime) {
          updatedSeenIncidentTypes = [
            ...state.seenIncidentTypes,
            incident.type,
          ];
        }
        const newIncident = {
          id: `incident-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          resolved: false,
          isFirstTime,
          investigated: false,
          logViewed: false,
          ...incident,
        };

        console.log("Dispatching incident:", newIncident);

        dispatch({
          type: "ADD_INCIDENT",
          incident: newIncident,
          seenIncidentTypes: updatedSeenIncidentTypes,
        });
      }
    }, 5000); // Reduced to 5 seconds for testing

    return () => {
      console.log("Clearing incident interval");
      if (incidentIntervalRef.current) {
        clearInterval(incidentIntervalRef.current);
        incidentIntervalRef.current = null;
      }
    };
  }, [
    state.gameStarted,
    state.paused,
    state.gameEnded,
    state.workers,
    state.seenIncidentTypes,
  ]); // Added workers and seenIncidentTypes

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
