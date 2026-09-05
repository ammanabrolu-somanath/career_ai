"""
Sample student profiles for the AI-Based Smart Career Guidance System.

Profiles are stored in a Python dictionary keyed by student_id, giving
average O(1) lookup time (Session 6 requirement), instead of scanning a
list of profiles one by one (O(n)).

All skills/interests used here match the exact strings defined in
careers.py / graph.py so these sample profiles work correctly with the
recommendation engine.
"""

STUDENTS = {
    "STU001": {
        "student_id": "STU001",
        "name": "Aditi Sharma",
        "skills": ["Python", "Machine Learning", "Mathematics", "Statistics", "Data Analysis"],
        "interests": ["Artificial Intelligence", "Data"],
        "academic_score": 92,
    },
    "STU002": {
        "student_id": "STU002",
        "name": "Rahul Verma",
        "skills": ["HTML/CSS", "JavaScript", "Python", "Creativity"],
        "interests": ["Technology", "Design"],
        "academic_score": 78,
    },
    "STU003": {
        "student_id": "STU003",
        "name": "Sneha Iyer",
        "skills": ["Networking", "Cybersecurity", "Problem Solving", "SQL"],
        "interests": ["Cybersecurity", "Technology"],
        "academic_score": 81,
    },
    "STU004": {
        "student_id": "STU004",
        "name": "Karthik Reddy",
        "skills": ["SQL", "Data Analysis", "Statistics", "Communication"],
        "interests": ["Business", "Data"],
        "academic_score": 74,
    },
    "STU005": {
        "student_id": "STU005",
        "name": "Meera Nair",
        "skills": ["Python"],
        "interests": ["Technology"],
        "academic_score": 60,
    },
    "DEMO001": {
        "student_id": "DEMO001",
        "name": "Somanath",
        "skills": ["Python", "Machine Learning", "Statistics", "Data Analysis"],
        "interests": ["Technology", "Data", "Artificial Intelligence"],
        "academic_score": 90,
    },
}

# Captured once, at import time, before any dynamically-submitted profile
# is ever added via add_student_profile() below - this is exactly the
# fixed set of predefined demonstration profiles, and must never be
# silently overwritten by a student-submitted profile using the same ID.
RESERVED_STUDENT_IDS = frozenset(STUDENTS.keys())


def get_student_profile(student_id):
    """Average O(1) hash-table lookup by student_id."""
    return STUDENTS.get(student_id)


def get_all_student_ids():
    return list(STUDENTS.keys())


def add_student_profile(profile):
    """Insert or overwrite a profile, keyed by its student_id, same O(1) hashing."""
    STUDENTS[profile["student_id"]] = profile
