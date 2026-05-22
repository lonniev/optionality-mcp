"""Neon persistence layer for Optionality.

Modules:

- :mod:`.neon`         — vault accessor, schema bootstrap, query helpers
- :mod:`.patrons`      — patron upsert, display-name
- :mod:`.journal`      — open/save/evaluate/list/get/delete journal entries
- :mod:`.leaderboard`  — write-through cache (recompute on every evaluation)

All public functions are async; callers should already be inside an event
loop (FastMCP tool handlers are async).
"""
