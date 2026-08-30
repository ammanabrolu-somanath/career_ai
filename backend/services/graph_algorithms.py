"""
BFS and DFS graph traversal - ALGORITHM DEMONSTRATION ONLY.

IMPORTANT - read this before touching recommendation_engine.py:
The actual recommendation engine (services/recommendation_engine.py) finds
candidate careers using DIRECT DICTIONARY LOOKUP in data/graph.py
(SKILL_TO_CAREERS / INTEREST_TO_CAREERS), e.g. SKILL_TO_CAREERS["Python"].
That is O(1) average time and needs no traversal at all, because the real
graph is only ever one hop deep: Skill -> Career or Interest -> Career.

This module exists purely to satisfy the project's requirement to
demonstrate BFS and DFS as graph algorithms (Sessions 1, 3, 4). It is
never imported by recommendation_engine.py and never affects
recommendation results.

Why a separate traversal graph?
The real graph (data/graph.py) is DIRECTED and only one hop deep
(skill/interest -> career, careers have no outgoing edges), so running
BFS/DFS on it directly would just return the start node plus its
directly connected careers - identical to the direct lookup, and not
very illustrative of level-by-level (BFS) vs depth-first (DFS) behaviour.

Implementation Decision: for this demonstration module only, we build a
BIDIRECTIONAL view of the same skill/interest <-> career relationships
(derived from data/graph.py, not hand-duplicated). This lets BFS/DFS
genuinely traverse multiple hops - e.g. from "Python" to the careers that
need it, and then onward to the *other* skills/interests those careers
require - which is what makes a BFS vs DFS comparison meaningful for a
viva. The PRIMARY recommendation graph in data/graph.py remains directed
and untouched; this bidirectional graph is used only inside this module.
"""

from collections import deque

from data.careers import CAREER_LOOKUP
from data.graph import SKILL_TO_CAREERS, INTEREST_TO_CAREERS


def _build_demo_traversal_graph():
    """Builds the bidirectional demonstration graph described above."""
    graph = {}

    def add_edge(node_a, node_b):
        graph.setdefault(node_a, set()).add(node_b)
        graph.setdefault(node_b, set()).add(node_a)

    for skill, careers in SKILL_TO_CAREERS.items():
        for career in careers:
            add_edge(skill, career)

    for interest, careers in INTEREST_TO_CAREERS.items():
        for career in careers:
            add_edge(interest, career)

    # Sorted lists (not sets) so traversal order is deterministic and
    # reproducible - important for demonstrating and explaining results.
    return {node: sorted(neighbors) for node, neighbors in graph.items()}


DEMO_TRAVERSAL_GRAPH = _build_demo_traversal_graph()


def get_node_type(node):
    """Classifies a node for display purposes: skill, interest, career, or unknown."""
    if node in CAREER_LOOKUP:
        return "career"
    if node in SKILL_TO_CAREERS:
        return "skill"
    if node in INTEREST_TO_CAREERS:
        return "interest"
    return "unknown"


def bfs_traversal(start_node):
    """
    Breadth-First Search: explores the graph level by level using a queue
    (collections.deque). All neighbours of the current node are visited
    before moving to the next level - this is what makes BFS well suited
    to finding the "closest" connections first.

    Returns None if start_node does not exist in the graph.
    """
    if start_node not in DEMO_TRAVERSAL_GRAPH:
        return None

    visited = {start_node}
    traversal_order = []
    queue = deque([start_node])

    while queue:
        current_node = queue.popleft()  # FIFO -> breadth-first
        traversal_order.append(current_node)
        for neighbor in DEMO_TRAVERSAL_GRAPH.get(current_node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    discovered_careers = [node for node in traversal_order if node in CAREER_LOOKUP and node != start_node]

    return {
        "algorithm": "BFS",
        "start_node": start_node,
        "start_node_type": get_node_type(start_node),
        "traversal_order": traversal_order,
        "visited_nodes": sorted(visited),
        "discovered_careers": discovered_careers,
    }


def dfs_traversal(start_node):
    """
    Depth-First Search: explores as far as possible down one path before
    backtracking, using recursion (chosen over an explicit stack because
    the recursive version reads almost exactly like its own definition,
    which is easier to explain in a viva).

    Returns None if start_node does not exist in the graph.
    """
    if start_node not in DEMO_TRAVERSAL_GRAPH:
        return None

    visited = set()
    traversal_order = []

    def _visit(node):
        visited.add(node)
        traversal_order.append(node)
        for neighbor in DEMO_TRAVERSAL_GRAPH.get(node, []):
            if neighbor not in visited:
                _visit(neighbor)

    _visit(start_node)

    discovered_careers = [node for node in traversal_order if node in CAREER_LOOKUP and node != start_node]

    return {
        "algorithm": "DFS",
        "start_node": start_node,
        "start_node_type": get_node_type(start_node),
        "traversal_order": traversal_order,
        "visited_nodes": sorted(visited),
        "discovered_careers": discovered_careers,
    }
