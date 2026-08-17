import { useState, useEffect } from "react";
import {
  GeneralSettingsCard,
  DatabaseMaintenanceCard,
  AboutAppCard,
  PruneConfirmModal,
} from "../components/settings";

const invoke = (window as any).__TAURI__?.core?.invoke || (() => Promise.resolve());

export default function Settings() {
  const [autostart, setAutostart] = useState(false);
  const [filterActive, setFilterActive] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [prunedCount, setPrunedCount] = useState<number | null>(null);
  const [showPruneConfirm, setShowPruneConfirm] = useState(false);

  useEffect(() => {
    // Fetch settings state from Rust on load
    invoke("get_settings")
      .then((res: any) => {
        if (res) {
          setAutostart(res.autostart || false);
          setFilterActive(res.filter_active || false);
        }
      })
      .catch(() => {});
  }, []);

  const handleAutostartToggle = async () => {
    try {
      const nextVal = !autostart;
      await invoke("set_autostart", { enabled: nextVal });
      setAutostart(nextVal);
    } catch (e) {
      alert("Failed to toggle autostart.");
    }
  };

  const handleFilterToggle = async () => {
    try {
      const nextVal = !filterActive;
      await invoke("set_filter_active", { enabled: nextVal });
      setFilterActive(nextVal);
    } catch (e) {
      alert("Failed to toggle classification filter.");
    }
  };

  const executePruning = async () => {
    setShowPruneConfirm(false);
    setCleaning(true);
    setPrunedCount(null);
    try {
      // Manually trigger pruning old detailed visits older than Sunday
      const count = await invoke("trigger_manual_cleanup");
      setPrunedCount(count || 0);
    } catch (e) {
      alert("Pruning failed.");
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
      {/* General Settings */}
      <GeneralSettingsCard
        autostart={autostart}
        onAutostartToggle={handleAutostartToggle}
        filterActive={filterActive}
        onFilterToggle={handleFilterToggle}
      />

      {/* Database Pruning Control */}
      <DatabaseMaintenanceCard
        cleaning={cleaning}
        prunedCount={prunedCount}
        onTriggerPruning={() => setShowPruneConfirm(true)}
      />

      {/* App Info Card */}
      <AboutAppCard />

      {/* Pruning Confirmation Modal */}
      <PruneConfirmModal
        isOpen={showPruneConfirm}
        onConfirm={executePruning}
        onClose={() => setShowPruneConfirm(false)}
      />
    </div>
  );
}
