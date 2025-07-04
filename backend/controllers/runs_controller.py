from fastapi import APIRouter, HTTPException, Query, Body, BackgroundTasks, UploadFile, File, Form
from typing import List, Optional, Any
from backend.models.DTOs.staging import StageConfigDTO
from backend.logic.run_ops import stage_run_logic
from backend.models.DTOs.run import RunCreateDTO, RunDTO
from fastapi.responses import StreamingResponse
from backend.logic.runs import get_all_runs, create_run_logic
from backend.models.DTOs.molecules import MoleculeDetailDTO, MoleculeDTO
from backend.logic.run_ops import (
    sample_molecules_logic,
    get_molecule_logic,
    stage_run_logic,
    transfer_run_logic,
    get_run_molecules_logic
)
from backend.schemas import (
    SampleRequest
)



router = APIRouter()

# ---- Runs Endpoints ----
@router.get("/runs", response_model=List[RunDTO], tags=["runs"])
def list_runs():
    return get_all_runs()

@router.post("/runs/create", tags=["runs"])
def create_run(req: RunCreateDTO):
    new_id = create_run_logic(req)
    return {"message": "Run created", "run_id": new_id}

# ---- Run Operations Endpoints ----
@router.post("/run/sample", tags=["run_operations"])
async def sample_run(req: SampleRequest):
    csv_path = await sample_molecules_logic(req)
    
    # Return the CSV file as a downloadable stream
    return StreamingResponse(
        open(csv_path, mode="rb"),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sampling_results.csv"}
    )


@router.get("/run/molecule/{molecule_id}", response_model=MoleculeDetailDTO, tags=["run_operations"])
def get_molecule(molecule_id: int):
    """
    Get detailed HTML view of a molecule.
    """
    m = get_molecule_logic(molecule_id)
    if not m:
        raise HTTPException(status_code=404, detail="Molecule not found")
    return m
    
@router.get("/run/{run_id}/molecules", response_model=MoleculeDetailDTO, tags=["run_operations"])
def get_molecule(molecule_id: int):
    """
    Get detailed HTML view of a molecule.
    """
    m = get_run_molecules_logic(run_id)
    if not m:
        raise HTTPException(status_code=404, detail="Molecule not found")
    return m
@router.post("/run/stage")
def stage_run(
    stage: StageConfigDTO = Body(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
    ):
    background_tasks.add_task(stage_run_logic, stage)
    return {"message": "Stage execution started"}

@router.post("/run/transfer", tags=["run_operations"])
async def transfer_run(
    prior_id: int = Form(...),
    agent_name: str = Form(...),
    epochs: int = Form(...),
    file: UploadFile = File(...)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    return await transfer_run_logic(prior_id, agent_name, epochs, file)
