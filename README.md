<div align="center">

# MedEvo: Medical Reasoning Evolution<br>through Knowledge Navigation

**Minimal teacher guidance · Student-led repair · Feedback-driven self-distillation**

[📄 Paper](https://pork-pay.github.io/MedEvo/assets/medevo.pdf) · [🌐 Project website](https://pork-pay.github.io/MedEvo/)

</div>

## Overview

MedEvo improves medical multimodal reasoning by preserving the valid prefix of a failed student trajectory, repairing its suffix with a minimal teacher hint, and using medical feedback to select the next round of training data.

The teacher localizes the error and suggests what to recheck. The **same student** generates the correction. Accepted student trajectories become supervision for self-distillation.

![MedEvo method overview](https://pork-pay.github.io/MedEvo/assets/workflow.png)

## How it works

1. **Diagnose.** Step-level uncertainty proposes a failure region. An auditor identifies a safe rollback boundary and the current trajectory’s error type.
2. **Repair.** A brief, error-conditioned hint guides the original student to regenerate the suffix while retaining its supported prefix.
3. **Distill.** Correctness, quality, and learnability checks select repairs. Construction hints are removed before SFT; repaired samples supervise the regenerated suffix.
4. **Evolve.** Feedback over medical tags and error types prioritizes the next training candidates. Each round trains from the fixed base model on the updated dataset.

Questions carry four-dimensional medical tags: **modality, anatomy, disease, and difficulty**. Trajectory errors cover **visual misreading, reasoning errors, differential diagnosis errors, and knowledge gaps**.

## Main results

Seven-benchmark mean accuracy, as reported in the manuscript:

| Backbone | Base | MedEvo | Gain |
|---|---:|---:|---:|
| Qwen3.5-9B | 65.57 | 69.12 (R3) | +3.55 pp |
| Qwen3.5-35B | 67.91 | 73.04 (R3) | +5.13 pp |
| Qwen3.5-397B | 71.83 | 74.95 (R2) | +3.12 pp |

### Seven medical benchmarks · 9B

| Benchmark | Base | MedEvo R3 |
|---|---:|---:|
| PMC-VQA | 59.20 | 62.68 |
| VQA-RAD | 68.10 | 70.40 |
| SLAKE | 76.80 | 78.23 |
| PathVQA | 48.80 | 53.34 |
| OmniMedVQA | 82.20 | 85.41 |
| MedXpertQA-MM | 47.40 | 54.50 |
| MMMU-Med | 76.50 | 79.28 |

### Feedback-driven evolution

All configurations share the same R1 checkpoint result.

| Configuration | R1 | R2 | R3 |
|---|---:|---:|---:|
| Repair only | 67.22 | 66.39 | 66.67 |
| Without medical tags | 67.22 | 67.32 | 67.53 |
| Without error-type feedback | 67.22 | 67.01 | 66.21 |
| **Full MedEvo** | **67.22** | **67.42** | **69.12** |

## Repair analysis

Type-guided suffix continuation reaches **71.80% repair success** and **67.22% post-training mean accuracy**, exceeding generic-hint continuation by 7.30 and 3.02 percentage points.

![Repair ablation](https://pork-pay.github.io/MedEvo/assets/repair.png)

## Experimental setup

- **Training pool:** 81,293 questions from public medical training datasets.
- **Feedback set:** 5,000 fixed questions for capability diagnosis and data selection.
- **Generation:** eight initial rollouts per selected question; up to five repair continuation attempts per failed trajectory.
- **Training:** supervised fine-tuning from the fixed original checkpoint each round.
- **Evaluation:** seven benchmarks evaluated with MenUniEval.

The [paper](https://pork-pay.github.io/MedEvo/assets/medevo.pdf) includes training configuration, filtering thresholds, human audits, multi-seed results, taxonomy, prompts, and supplementary analyses.

## Available materials

| Material | Location |
|---|---|
| Full manuscript | [MedEvo.pdf](https://pork-pay.github.io/MedEvo/assets/medevo.pdf) |
| Method and result walkthrough | [Project website](https://pork-pay.github.io/MedEvo/) |
| Method figure | [method.png](https://pork-pay.github.io/MedEvo/assets/workflow.png) |
| Repair comparison | [repair-ablation.png](https://pork-pay.github.io/MedEvo/assets/repair.png) |

This repository presents the paper, method, and reported results. Training and evaluation implementation is not included in this release.
