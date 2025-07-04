# backend/models/prior.py

from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from backend.models.base import Base

class Prior(Base):
    __tablename__ = 'priors'

    id         = Column(Integer, primary_key=True)
    name       = Column(String,  nullable=False)
    takes_file = Column(Boolean, default=True)
    prior_path = Column(String,  nullable=True)

    # ← Add this relationship to match Agent.prior.back_populates
    agents = relationship("Agent", back_populates="prior")
