"""
Directed adjacency-list graph for the career guidance system.

Edges point one way only: Skill -> Career and Interest -> Career
(see Stage 2 architecture: directed graph, Implementation Decision).

Two separate dictionaries are used instead of one merged graph because a
node name can exist as both a skill and an interest (e.g. "Creativity"),
so merging them into a single dict keyed by name would cause name
collisions between unrelated node types.

Both dictionaries are BUILT FROM careers.py, not maintained by hand, so
the graph can never disagree with the career data it's derived from.

This module is the PRIMARY discovery mechanism used by the recommendation
engine: candidate careers are found through direct dictionary lookups
here (e.g. SKILL_TO_CAREERS["Python"]), not through BFS/DFS traversal.
BFS and DFS are implemented separately in graph_algorithms.py purely for
algorithm demonstration, visualization, and comparison.
"""

from data.careers import CAREERS


def _build_skill_to_careers():
    graph = {}
    for career in CAREERS:
        for skill in career["required_skills"]:
            graph.setdefault(skill, []).append(career["name"])
    return graph


def _build_interest_to_careers():
    graph = {}
    for career in CAREERS:
        for interest in career["related_interests"]:
            graph.setdefault(interest, []).append(career["name"])
    return graph


# Skill -> [Career, Career, ...]
SKILL_TO_CAREERS = _build_skill_to_careers()

# Interest -> [Career, Career, ...]
INTEREST_TO_CAREERS = _build_interest_to_careers()


def get_careers_by_skill(skill):
    """Direct O(1) average-time dictionary lookup: careers connected to a skill."""
    return SKILL_TO_CAREERS.get(skill, [])


def get_careers_by_interest(interest):
    """Direct O(1) average-time dictionary lookup: careers connected to an interest."""
    return INTEREST_TO_CAREERS.get(interest, [])


def get_candidate_careers(skills, interests):
    """
    Direct adjacency-list lookup (the recommendation engine's primary
    discovery step): union of every career reachable from the student's
    skills or interests, found via dictionary lookups only - no traversal.
    """
    candidates = set()
    for skill in skills:
        candidates.update(get_careers_by_skill(skill))
    for interest in interests:
        candidates.update(get_careers_by_interest(interest))
    return candidates
