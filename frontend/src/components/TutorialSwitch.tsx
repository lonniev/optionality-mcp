// The "Live tutorial" switch on the profile: on, every tab offers its tour
// once; off, nothing pops up anywhere. Its mechanics are the package's.

import { tourTarget, useTourSwitch } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";

export default function TutorialSwitch() {
  const tutorial = useTourSwitch();
  const t = useT();
  return (
    <div className="panel" {...tourTarget("account.tutorial")}>
      <span className="panel-label">{t("tutorial.label")}</span>
      <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input
          type="checkbox"
          checked={tutorial.on}
          onChange={(e) => tutorial.setOn(e.target.checked)}
          style={{ width: 20, height: 20, accentColor: "var(--amber)" }}
        />
        <span>
          <h2 className="serif" style={{ margin: 0 }}>{t("tutorial.title")}</h2>
          <span className="account-intro">{t("tutorial.note")}</span>
        </span>
      </label>
    </div>
  );
}
