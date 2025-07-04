from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.models.base import Base

engine = create_engine('sqlite:///reinvent.db', echo=True)
SessionLocal = sessionmaker(bind=engine)


from backend.models import prior, agent, molecule
Base.metadata.create_all(bind=engine)

print("Database and tables created.")
