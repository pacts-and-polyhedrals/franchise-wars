# v1.0.1 — Import Fix
- Fixed the import failure: Tallis Vend's HP formula held text ("see Entry 1"), which Foundry rejects. The import stopped there.
- One bad actor can no longer stop the import. Failures are skipped, counted in a warning and listed in the console; the rest of the campaign imports normally.
- Every reskinned creature now has a chain of free-SRD stand-ins. Death Knight, Beholder, Champion, Helmed Horror, Bheur Hag and the other non-SRD stat blocks resolve from the books you own; without those books the closest SRD creature is used, so no actor goes missing. The console says when a stand-in was used.

Includes everything in v1.0.0 (see RELEASE-v1.0.0.md).
