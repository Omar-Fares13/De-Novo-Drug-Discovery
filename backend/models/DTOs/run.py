from pydantic import BaseModel
from datetime import date


class RunDTO(BaseModel):
    id: int
    title: str
    prior_id: int
    prior_name : str


class RunCreateDTO(BaseModel):
    prior_id: int
    model_name: str
