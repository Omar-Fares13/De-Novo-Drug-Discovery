from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.models.base import Base

class Agent(Base):
    __tablename__ = 'agents'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    prior_id = Column(Integer, ForeignKey('priors.id'), nullable=False)
    takes_file = Column(Boolean, default=True)
    epochs = Column(Integer, default=0)
    agent_path = Column(String, nullable=True)

    # ← Add this line
    molecules = relationship("Molecule", back_populates="agent")

    prior = relationship("Prior", back_populates="agents")
