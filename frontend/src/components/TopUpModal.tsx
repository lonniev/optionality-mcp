import { checkBalance } from "@tollbooth-dpyc/web";
import { BalanceAndTopUp, useTour } from "@tollbooth-dpyc/web/react";
import { useT } from "../i18n";
import { decorateTile } from "../lib/tiles";

// The shared top-up, in Optionality's sheet. Closing it tells the game the balance.

interface Props {
  onClose: () => void;
  onBalanceUpdated?: (newBalance: number) => void;
}

export default function TopUpModal({ onClose, onBalanceUpdated }: Props) {
  const t = useT();
  useTour("wallet");
  function close() {
    onClose();
    checkBalance().then(
      (r) => { if (typeof r.balance_api_sats === "number") onBalanceUpdated?.(r.balance_api_sats); },
      () => undefined, // the game's own next read will tell
    );
  }

  return (
    <div className="opt-scrim opt-topup-scrim" onClick={close}>
      <div className="opt-modal-card opt-topup" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={close} aria-label={t("game.zoom.close")} className="opt-tap opt-topup-close">×</button>
        <BalanceAndTopUp decorateTile={decorateTile} />
      </div>
    </div>
  );
}
