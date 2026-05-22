"""Optionality-specific Tollbooth glue.

Standard auth, vault, proof, pricing, audit, and Lightning flows are
imported from the ``tollbooth-dpyc`` wheel — never reimplemented here.
This package only holds Optionality-specific helpers (e.g., custom
credential validators, project-specific ACL policies) once they exist.
"""
