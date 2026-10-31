import { checkBalance } from "@tollbooth-dpyc/web";
import { BalanceAndTopUp } from "@tollbooth-dpyc/web/react";

// The shared top-up, in Optionality's sheet. Closing it tells the game the balance.

interface Props {
  onClose: () => void;
  onBalanceUpdated?: (newBalance: number) => void;
}

export default function TopUpModal({ onClose, onBalanceUpdated }: Props) {
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
        <button type="button" onClick={close} aria-label="Close" className="opt-tap opt-topup-close">×</button>
        <BalanceAndTopUp />
      </div>
    </div>
  );
}
