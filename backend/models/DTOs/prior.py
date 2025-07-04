from pydantic import BaseModel

class PriorDTO(BaseModel):
    id: int
    name: str
    takes_file : bool
