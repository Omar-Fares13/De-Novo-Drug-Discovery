from pydantic import BaseModel
from typing import List

class ScorerDTO(BaseModel):
    id: int
    type_id: int
    type: str

class ScorerTypeDTO(BaseModel):
    id: int
    title: str

class ScorerCreateDTO(BaseModel):
    type_id: int
