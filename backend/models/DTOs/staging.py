from pydantic import BaseModel
from typing import List, Optional

class StageConfigDTO(BaseModel):
    agent_id: int

    max_score: float = 0.6
    min_steps: int   = 25
    max_steps: int   = 100

    smarts_weight: float             = 0.79
    use_custom_alerts: bool          = False
    banned_smarts: Optional[List[str]] = None

    use_molecular_weights: bool = False
    mw_weight: float            = 0.34
    mw_low: float               = 200.0
    mw_high: float              = 500.0

    target_substruct: bool         = False
    substruct_smarts: Optional[str] = None
    use_chirality: bool            = False
    matching_weight: float         = 1.0
