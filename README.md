# TerraAid
**From Satellite Evidence to Faster, Fairer Farm Relief.**

After a flood, relief systems typically wait for farmers to file a claim before anyone investigates. But the farmers hardest hit — cut off, undocumented, unaware of the process — are often the ones least able to file one. They can be severely affected and still remain completely invisible to a claim-driven system.

TerraAid flips the direction of that search. Instead of only reacting to claims that arrive, it scans the affected agricultural region itself using satellite imagery, estimates farm-level flood damage, and cross-checks that evidence against existing claim records — surfacing severely affected farms that have **no matching claim at all**, and ranking every case so limited field-verification teams know where to go first.

Built for **Smart India Hackathon 2026** — Problem Statement SIH26206 (AICTE, Disaster Management, Student Innovation).

## What it does

- **Region-wide damage screening** — maps every farm in an affected district by severity (severely affected, moderately affected, no/minor damage, flooded area), using satellite imagery rather than waiting for reports.
- **Potentially Missed Beneficiary detection** — the core innovation: flags farms with strong satellite evidence of severe damage but no corresponding claim in the system, so they don't fall through the cracks.
- **Claim–evidence mismatch detection** — flags cases where a submitted claim's reported damage diverges significantly from the satellite/AI evidence, recommending closer review rather than assuming fraud.
- **Verification priority ranking** — combines flood exposure, vegetation decline, AI-estimated damage, and AI confidence into a clear priority (high/medium/low), so every ranking is explainable, not a black box.
- **Authority dashboard** — an interactive map and case view for government agriculture departments, disaster relief authorities, and insurance/field verification teams.

## What it deliberately does not do

TerraAid is a **decision-support tool**, not an approval system. It does not automatically approve or reject claims, calculate exact compensation, detect fraud, or replace field verification or human officials. It surfaces evidence and prioritizes cases — humans make the final call.

## Data note

Farm boundaries and claim records in this prototype are **synthetic demonstration data**, built to reflect realistic patterns — not official cadastral records or real farmer claims. This is stated explicitly because individual farmer-level land and claim data isn't publicly available; a real deployment would integrate authorised government/insurance data sources in their place.

## Tech

Satellite imagery via Esri World Imagery and NASA GIBS, farm boundary and damage overlays on an interactive map, with the underlying design built around a Sentinel-1 (flood/radar) + Sentinel-2 (vegetation/NDVI) + AI change-detection pipeline as the intended production data source.

## Team
Adwaith
Hrithika
Nived Krishna
Nived Ravi
Niveditha
Rishith
