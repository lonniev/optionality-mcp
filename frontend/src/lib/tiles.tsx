/** Optionality's decoration on the shared top-up tiles: a trader's book, odd lot to market maker. */

import { Bird, Coins, Landmark, Layers, Ticket } from "lucide-react";
import type { DecorateTile } from "@tollbooth-dpyc/web/react";
import { tr, type MessageKey } from "../i18n/index.ts";

const LOOKS: Record<number, { name: MessageKey; Mark: typeof Coins }> = {
  100: { name: "tiles.oddLot", Mark: Coins },
  500: { name: "tiles.contract", Mark: Ticket },
  1_000: { name: "tiles.spread", Mark: Layers },
  5_000: { name: "tiles.condor", Mark: Bird },
  25_000: { name: "tiles.maker", Mark: Landmark },
};

export const decorateTile: DecorateTile = (sats) => {
  const look = LOOKS[sats];
  return look && { name: tr(look.name), mark: <look.Mark size={20} aria-hidden /> };
};
