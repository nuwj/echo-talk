"""Seed the skills table with the 10 default skills used by BKT."""

from database import engine, SessionLocal
from models.db_models import Base, SkillModel


DEFAULT_SKILLS = [
    ("article_usage",          "Articles (a/an/the)",         "grammar"),
    ("verb_tense_past",        "Past Tense",                  "grammar"),
    ("verb_tense_present",     "Present Tense",               "grammar"),
    ("subject_verb_agreement", "Subject-Verb Agreement",      "grammar"),
    ("preposition",            "Prepositions",                "grammar"),
    ("vowel_sounds",           "Vowel Sounds",                "pronunciation"),
    ("consonant_clusters",     "Consonant Clusters",          "pronunciation"),
    ("word_stress",            "Word Stress",                 "pronunciation"),
    ("linking_sounds",         "Linking / Connected Speech",  "pronunciation"),
    ("th_sounds",              "TH Sounds (θ / ð)",           "pronunciation"),
]


def seed():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        for skill_id, name, category in DEFAULT_SKILLS:
            existing = session.get(SkillModel, skill_id)
            if not existing:
                session.add(SkillModel(id=skill_id, name=name, category=category))
        session.commit()
        print(f"Seeded {len(DEFAULT_SKILLS)} skills.")
    finally:
        session.close()


if __name__ == "__main__":
    seed()
