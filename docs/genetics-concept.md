# Genetics Concept

Status: Draft
Owner: @yourhandle
Last Updated: 2025-11-18

## Overview
This document explores the genetic foundation for fish traits in Fish Tycoon: Virtual Aquarium. The system aims to be simple enough for players to understand, but deep enough to create emergent, rewarding outcomes.

## Goals
- Allow players to breed fish with heritable traits.
- Enable discovery of rare patterns and colors.
- Support mutations and environment-influenced traits.

## Basic model
- Each fish has a genome of loci (e.g., color, pattern, size).
- Alleles are dominant/recessive with simple Mendelian rules.
- Introduce mutation probability per locus on reproduction.

## Loci examples
- Color: palette index with additive mixing.
- Pattern: enum { none, stripes, spots, gradient } with overlay rules.
- Growth rate: float modifier (0.5–2.0)

## Open questions
- How to visualize genes in UI? Tooltip or genetic lab?
- Should players be able to cross-breed species for hybrids? (Pro/con)
