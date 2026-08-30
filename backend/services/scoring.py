"""
Career match scoring (Session 6 requirement).

This module is pure calculation: given a normalized student profile and a
single career record (from data/careers.py), it computes how well they
match. It knows nothing about validation or graph traversal - those are
handled by validation.py and graph.py respectively.

Final Score = (Skill Score x SKILL_WEIGHT)
            + (Interest Score x INTEREST_WEIGHT)
            + (Academic Component x ACADEMIC_WEIGHT)

Implementation Decision:
The 70 / 20 / 10 weight split is NOT specified in the uploaded project
documents - Session 6 only specifies the skill match formula
(matched / required). The 70/20/10 split, and the academic-score handling
below, are an approved Implementation Decision, kept as named constants so
they can be changed in one place without touching the rest of the engine.
"""

SKILL_WEIGHT = 0.70
INTEREST_WEIGHT = 0.20
ACADEMIC_WEIGHT = 0.10


def calculate_skill_score(student_skills, required_skills):
    """
    matched_skills / total_required_skills, plus the supporting detail
    the frontend needs (matched, missing, percentage).
    """
    required_set = set(required_skills)
    student_set = set(student_skills)

    matched = sorted(required_set & student_set)
    missing = sorted(required_set - student_set)
    total_required = len(required_set)

    match_score = (len(matched) / total_required) if total_required > 0 else 0.0

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "total_required_skills": total_required,
        "match_score": match_score,
        "match_percentage": round(match_score * 100, 1),
    }


def calculate_interest_score(student_interests, related_interests):
    """
    matched_interests / total_related_interests, plus supporting detail.
    """
    related_set = set(related_interests)
    student_set = set(student_interests)

    matched = sorted(related_set & student_set)
    missing = sorted(related_set - student_set)
    total_related = len(related_set)

    match_score = (len(matched) / total_related) if total_related > 0 else 0.0

    return {
        "matched_interests": matched,
        "missing_interests": missing,
        "total_related_interests": total_related,
        "match_score": match_score,
        "match_percentage": round(match_score * 100, 1),
    }


def calculate_academic_component(academic_score):
    """
    Normalizes academic_score (0-100) to a 0-1 component.
    Returns None if academic_score is missing, so the caller can decide
    how to redistribute weight - this function never invents a score.
    """
    if academic_score is None:
        return None
    return academic_score / 100


def calculate_final_score(skill_score, interest_score, academic_component):
    """
    Combines the three component scores into one final score (0-1).

    Implementation Decision: if academic_component is None (student did not
    provide an academic score), we do NOT treat it as 0 - that would
    unfairly punish a profile simply for omitting an optional field.
    Instead, the 10% academic weight is redistributed proportionally
    between skill and interest, keeping their 70:20 (7:2) ratio, so the
    two remaining components still sum to 100% of the final score.
    """
    if academic_component is None:
        remaining_weight = SKILL_WEIGHT + INTEREST_WEIGHT  # 0.90
        adjusted_skill_weight = SKILL_WEIGHT / remaining_weight
        adjusted_interest_weight = INTEREST_WEIGHT / remaining_weight
        final_score = (skill_score * adjusted_skill_weight) + (interest_score * adjusted_interest_weight)
        weights_used = {
            "skill_weight": round(adjusted_skill_weight, 4),
            "interest_weight": round(adjusted_interest_weight, 4),
            "academic_weight": 0.0,
            "academic_score_provided": False,
        }
    else:
        final_score = (
            (skill_score * SKILL_WEIGHT)
            + (interest_score * INTEREST_WEIGHT)
            + (academic_component * ACADEMIC_WEIGHT)
        )
        weights_used = {
            "skill_weight": SKILL_WEIGHT,
            "interest_weight": INTEREST_WEIGHT,
            "academic_weight": ACADEMIC_WEIGHT,
            "academic_score_provided": True,
        }

    return final_score, weights_used


def score_career(normalized_profile, career):
    """
    Scores one career against one normalized student profile.
    Returns every component the recommendation engine and frontend need.
    """
    skill_result = calculate_skill_score(normalized_profile["skills"], career["required_skills"])
    interest_result = calculate_interest_score(normalized_profile["interests"], career["related_interests"])
    academic_component = calculate_academic_component(normalized_profile.get("academic_score"))

    final_score, weights_used = calculate_final_score(
        skill_result["match_score"], interest_result["match_score"], academic_component
    )

    return {
        "skill": skill_result,
        "interest": interest_result,
        "academic_component": academic_component,
        "final_score": final_score,
        "final_score_percentage": round(final_score * 100, 1),
        "weights_used": weights_used,
    }
