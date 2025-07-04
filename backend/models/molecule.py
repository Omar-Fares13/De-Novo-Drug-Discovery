from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.models.base import Base

class Molecule(Base):
    __tablename__ = 'molecules'

    id = Column(Integer, primary_key=True)
    smiles = Column(String, nullable=False)
    agent_id = Column(Integer, ForeignKey('agents.id'), nullable=True)
    score = Column(Float, nullable=True)

    # ← Rename this to match the FK and back_populates on Agent
    agent = relationship("Agent", back_populates="molecules")
