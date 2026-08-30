"""
Career, skill, and interest data for the AI-Based Smart Career Guidance System.

This file is the single source of truth for all career definitions.
graph.py builds its adjacency lists directly from CAREERS below, so the
graph and the career data can never fall out of sync with each other.
"""

CAREERS = [
    {
        "name": "Software Developer",
        "description": "Designs, builds, and maintains software applications across platforms.",
        "required_skills": ["Python", "Java", "C++", "Data Structures", "Algorithms", "Problem Solving"],
        "related_interests": ["Technology"],
    },
    {
        "name": "Web Developer",
        "description": "Builds and maintains websites and web applications, covering both front-end and back-end.",
        "required_skills": ["HTML/CSS", "JavaScript", "Python", "Problem Solving", "Creativity"],
        "related_interests": ["Technology", "Design"],
    },
    {
        "name": "Data Scientist",
        "description": "Analyzes complex data using statistics and machine learning to generate insights.",
        "required_skills": ["Python", "Statistics", "Mathematics", "Machine Learning", "Data Analysis"],
        "related_interests": ["Data", "Artificial Intelligence"],
    },
    {
        "name": "Data Analyst",
        "description": "Interprets structured data to support business decisions and reporting.",
        "required_skills": ["SQL", "Data Analysis", "Statistics", "Communication"],
        "related_interests": ["Data", "Business"],
    },
    {
        "name": "AI Engineer",
        "description": "Builds intelligent systems and AI-driven applications using algorithmic and ML techniques.",
        "required_skills": ["Python", "Machine Learning", "Mathematics", "Data Structures", "Algorithms"],
        "related_interests": ["Artificial Intelligence", "Technology"],
    },
    {
        "name": "Machine Learning Engineer",
        "description": "Designs, trains, and deploys machine learning models into production systems.",
        "required_skills": ["Python", "Machine Learning", "Statistics", "Data Structures", "Cloud Computing"],
        "related_interests": ["Artificial Intelligence", "Data"],
    },
    {
        "name": "Cybersecurity Analyst",
        "description": "Protects systems and networks from security threats and vulnerabilities.",
        "required_skills": ["Networking", "Cybersecurity", "Problem Solving", "SQL"],
        "related_interests": ["Cybersecurity", "Technology"],
    },
    {
        "name": "Cloud Engineer",
        "description": "Designs and manages cloud infrastructure and deployment pipelines.",
        "required_skills": ["Cloud Computing", "Networking", "Python", "Problem Solving"],
        "related_interests": ["Technology"],
    },
    {
        "name": "UI/UX Designer",
        "description": "Designs user interfaces and experiences that are usable, accessible, and visually engaging.",
        "required_skills": ["Creativity", "HTML/CSS", "Communication", "Problem Solving"],
        "related_interests": ["Design", "Creativity"],
    },
    {
        "name": "Business Analyst",
        "description": "Bridges business needs and technical solutions using data-driven analysis.",
        "required_skills": ["Communication", "Data Analysis", "SQL", "Statistics"],
        "related_interests": ["Business", "Data"],
    },
    {
        "name": "DevOps Engineer",
        "description": "Automates and manages build, deployment, and infrastructure pipelines.",
        "required_skills": ["Cloud Computing", "Networking", "Python", "Problem Solving", "Java"],
        "related_interests": ["Technology"],
    },
    {
        "name": "Database Administrator",
        "description": "Manages, secures, and optimizes an organization's database systems.",
        "required_skills": ["SQL", "Data Structures", "Networking", "Problem Solving"],
        "related_interests": ["Data", "Technology"],
    },
]

# Hash-based O(1) average lookup by career name (dictionary => hash table),
# reused later by the recommendation engine and the Career Comparison page.
CAREER_LOOKUP = {career["name"]: career for career in CAREERS}

# Derived, not hand-duplicated: guarantees these always match what CAREERS actually uses.
ALL_SKILLS = sorted({skill for career in CAREERS for skill in career["required_skills"]})
ALL_INTERESTS = sorted({interest for career in CAREERS for interest in career["related_interests"]})


def get_career(name):
    """O(1) average-time career lookup by name using the hash table above."""
    return CAREER_LOOKUP.get(name)
