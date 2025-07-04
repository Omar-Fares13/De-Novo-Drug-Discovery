from pydantic import BaseModel

class MoleculeDTO(BaseModel):
    id: int
    SMILES: str
    run_id: int
    score: float

class MoleculeDetailDTO(MoleculeDTO):
    id : int
    SMILES : str
    run_id : int
    score : float
    view : str
