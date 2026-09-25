// Cloudflare Pages Function: /mcp → the optionality-mcp operator on Horizon.
import { makeMcpProxy } from "@tollbooth-dpyc/web/pages-proxy";

export const onRequest = makeMcpProxy("https://optionality-mcp.fastmcp.app/mcp");
