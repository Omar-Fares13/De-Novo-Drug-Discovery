from typing import List
from backend.database.database import SessionLocal
from backend.models.prior import Prior
from backend.models.DTOs.prior import PriorDTO

def get_all_priors() -> List[PriorDTO]:
    db = SessionLocal()
    try:
        priors = db.query(Prior).all()

        return [
            PriorDTO(
                id=prior.id,
                name=prior.name,
                takes_file=prior.takes_file
            )
            for prior in priors
        ]

    finally:
        db.close()
