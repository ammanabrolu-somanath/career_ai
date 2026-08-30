"""
Recommendation workflow orchestration.

Flow (approved Stage 2 architecture, corrected):

    Student Profile
        -> validate_profile()                      [validation.py]
        -> direct adjacency-list lookup             [graph.py]
        -> candidate career collection
        -> career-by-career scoring                 [scoring.py]
        -> final score calculation
        -> sort descending
        -> ranked recommendations with explanations

BFS/DFS are NOT used here. Candidate discovery uses only direct
dictionary lookups (get_candidate_careers), per the approved correction
to the architecture - BFS/DFS are implemented separately, later, purely
for algorithm demonstration.

This module only orchestrates; it delegates the actual work to
validation.py, graph.py, and scoring.py, so each concern stays in one
place and is easy to explain individually during a viva.
"""

from data.careers import get_career
from data.graph import get_candidate_careers
from services.scoring import score_career
from services.validation import validate_profile


def _join_with_and(items):
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    return ", ".join(items[:-1]) + " and " + items[-1]


def _generate_explanation(career_name, matched_skills, missing_skills, matched_interests):
    """
    Builds a human-readable explanation from the actual matching data for
    this specific career - never a hardcoded, career-specific string.
    """
    reasons = []
    if matched_skills:
        reasons.append(f"you match {_join_with_and(matched_skills)} in required skills")
    if matched_interests:
        reasons.append(f"you're interested in {_join_with_and(matched_interests)}")

    if reasons:
        explanation = f"Recommended for {career_name} because " + " and ".join(reasons) + "."
    else:
        explanation = (
            f"{career_name} appears as a possible match based on your overall profile, "
            "though no single skill or interest was a direct match."
        )

    if missing_skills:
        explanation += f" To strengthen this match, consider developing {_join_with_and(missing_skills)}."
    else:
        explanation += " You already have every required skill for this career."

    return explanation


def _build_no_candidates_response(validation_result):
    """
    Returned when the profile is valid but its skills/interests are not
    directly connected (in the graph) to any career. Handled explicitly
    so the caller never has to deal with an empty/crashing result.
    """
    return {
        "success": True,
        "errors": [],
        "warnings": validation_result["warnings"] + [
            "No careers were directly connected to the given skills and interests. "
            "Try adding more skills or interests to broaden the search."
        ],
        "suggestions": validation_result["suggestions"],
        "contradictory_preferences": validation_result["contradictory_preferences"],
        "normalized_profile": validation_result["normalized_profile"],
        "recommendations": [],
    }


def recommend_careers(profile):
    """
    Main entry point. Takes a raw student profile dict (e.g. straight from
    a request body) and returns a fully ranked, explained recommendation
    result - or a structured failure/empty result, never a crash.
    """
    validation_result = validate_profile(profile)

    if not validation_result["valid"]:
        return {
            "success": False,
            "errors": validation_result["errors"],
            "warnings": validation_result["warnings"],
            "suggestions": validation_result["suggestions"],
            "contradictory_preferences": validation_result["contradictory_preferences"],
            "normalized_profile": None,
            "recommendations": [],
        }

    normalized_profile = validation_result["normalized_profile"]

    candidate_names = get_candidate_careers(normalized_profile["skills"], normalized_profile["interests"])
    if not candidate_names:
        return _build_no_candidates_response(validation_result)

    recommendations = []
    for career_name in candidate_names:
        career = get_career(career_name)
        score_data = score_career(normalized_profile, career)

        explanation = _generate_explanation(
            career_name,
            score_data["skill"]["matched_skills"],
            score_data["skill"]["missing_skills"],
            score_data["interest"]["matched_interests"],
        )

        recommendations.append({
            "career_name": career_name,
            "description": career["description"],
            "final_score": score_data["final_score"],
            "final_score_percentage": score_data["final_score_percentage"],
            "skill_score": score_data["skill"]["match_score"],
            "skill_score_percentage": score_data["skill"]["match_percentage"],
            "interest_score": score_data["interest"]["match_score"],
            "interest_score_percentage": score_data["interest"]["match_percentage"],
            "academic_component": score_data["academic_component"],
            "weights_used": score_data["weights_used"],
            "matched_skills": score_data["skill"]["matched_skills"],
            "missing_skills": score_data["skill"]["missing_skills"],
            "matched_interests": score_data["interest"]["matched_interests"],
            "missing_interests": score_data["interest"]["missing_interests"],
            "explanation": explanation,
        })

    recommendations.sort(key=lambda item: item["final_score"], reverse=True)
    for rank, item in enumerate(recommendations, start=1):
        item["rank"] = rank

    return {
        "success": True,
        "errors": [],
        "warnings": validation_result["warnings"],
        "suggestions": validation_result["suggestions"],
        "contradictory_preferences": validation_result["contradictory_preferences"],
        "normalized_profile": normalized_profile,
        "recommendations": recommendations,
    }
