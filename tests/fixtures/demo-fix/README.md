# demo-fix

Fixture repo for AI-EMPIRE pipeline. Expected verdict: **FIX**.

`index.js` contains a deliberate bug (`a - b` instead of `a + b`) so the test
suite fails. The pipeline should detect the failing test and route to the
fix/repair loop rather than rejecting outright.
