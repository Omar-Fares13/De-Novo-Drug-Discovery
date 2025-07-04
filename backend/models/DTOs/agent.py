from pydantic import BaseModel
from typing import Optional

class AgentDTO(BaseModel):
    id: int
    name: str
    description: str
    epochs: int
    parent_id: Optional[int]
    run_id: Optional[int]