from backend.models.DTOs.run import RunCreateDTO, RunDTO
from backend.models.agent import Agent
from backend.models.prior import Prior  # adjust imports based on your structure
from backend.database.database import SessionLocal
from backend.logic.staged_learning import initiate_CL  # assumes this is where initiate_CL is located

def create_run_logic(req: RunCreateDTO) -> int:
    """
    Creates a new Agent using a Prior and the specified model name.
    """
    db = SessionLocal()
    try:
        # Call helper function to initiate the Agent
        agent = initiate_CL(prior_id=req.prior_id, model_name=req.model_name, db=db)

        # You can return either the agent ID or run ID depending on your system design
        return agent.id
    finally:
        db.close()
   
def get_all_runs() -> list[RunDTO]:
    db = SessionLocal()
    try:
        agents = db.query(Agent).join(Agent.prior).all()

        runs = [
            RunDTO(
                id=agent.id,
                title=agent.name,
                prior_id=agent.prior_id,
                prior_name=agent.prior.name
            )
            for agent in agents
        ]

        return runs

    finally:
        db.close()