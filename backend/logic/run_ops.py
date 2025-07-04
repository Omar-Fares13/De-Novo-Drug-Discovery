import subprocess
import toml
import pandas as pd 
from sqlalchemy.orm import Session
from backend.models.agent import Agent
from backend.database.database import SessionLocal
from backend.logic.data_proc import process_transfer_learning_csv
from pathlib import Path
from backend.models.DTOs.staging import StageConfigDTO
from backend.models.DTOs.molecules import MoleculeDetailDTO
from backend.logic.staged_learning import build_stage_config, perform_stage
from backend.logic.molecules import visualize_3d_from_smiles as smiles_to_3d, get_molecule
from backend.models.prior import Prior
from fastapi import UploadFile, HTTPException
import shutil


DIR = Path(__file__).resolve().parent

async def sample_molecules_logic(req):
    db: Session = SessionLocal()
    agent = db.query(Agent).get(req.agent_id)
    if not agent:
        raise ValueError(f"No agent with id={req.agent_id}")
    
    output_csv = DIR / '../../backend/results/sampling.csv'

    toml_config = {
        'run_type': 'sampling',
        'device': 'cpu',
        'json_out_config': '_sampling.json',
        'parameters': {
            'model_file': agent.agent_path,
            'output_file': str(output_csv),
            'num_smiles': req.num_smiles,
            'randomize_smiles': req.randomize_smiles,
            'unique_molecules': True
        }
    }

    with open('sampling.toml', 'w') as f:
        toml.dump(toml_config, f)

    process = subprocess.run(
        "conda run -n reinvent4 reinvent sampling.toml", 
        shell=True, 
        capture_output=True,
        text=True
    )

    if process.returncode != 0:
        raise Exception(f"Sampling failed: {process.stderr}")

    # Just return the path — the route handles reading it
    return output_csv



def get_molecule_logic(molecule_id: int) -> MoleculeDetailDTO | None:
        molecule = get_molecule(molecule_id)
        if not molecule:
            return None
        view = smiles_to_3d(molecule.smiles)
        return MoleculeDetailDTO(
            id=molecule.id,
            SMILES=molecule.smiles,
            run_id=molecule.agent_id,  # assuming agent_id == run_id
            score=molecule.score,
            view=view
        )
def stage_run_logic(stage: StageConfigDTO) -> None:
    """
    Build the TOML config for one stage and invoke REINVENT4.
    Runs synchronously, but we will dispatch it in the background.
    """
    config = build_stage_config(
        agent_id=stage.agent_id,
        max_score=stage.max_score,
        min_steps=stage.min_steps,
        max_steps=stage.max_steps,
        smarts_weight=stage.smarts_weight,
        use_custom_alerts=stage.use_custom_alerts,
        banned_smarts=stage.banned_smarts,
        use_molecular_weights=stage.use_molecular_weights,
        mw_weight=stage.mw_weight,
        mw_low=stage.mw_low,
        mw_high=stage.mw_high,
        target_substruct=stage.target_substruct,
        substruct_smarts=stage.substruct_smarts,
        use_chirality=stage.use_chirality,
        matching_weight=stage.matching_weight
    )
    perform_stage(stage.agent_id, config)

async def transfer_run_logic(prior_id: int, agent_name: str, epochs: int, file: UploadFile):

    # Save uploaded CSV
    upload_dir = Path("backend/uploads") / f"prior_{prior_id}_{agent_name}"
    upload_dir.mkdir(parents=True, exist_ok=True)
    csv_path = upload_dir / file.filename

    with open(csv_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process CSV: shuffle, split, write .smi files
    smi_paths = process_transfer_learning_csv(csv_path, upload_dir)

    # Create TOML config
    toml_config = {
        "run_type": "transfer_learning",
        "device": "cpu",
        "json_out_config": str(upload_dir / "transfer_config.json"),
        "parameters": {
            "num_epochs": epochs,
            "save_every_n_epochs": epochs,
            "batch_size": 50,
            "num_refs": 100,
            "sample_batch_size": 100,
            "input_model_file": f"REINVENT4/priors/reinvent.prior",
            "smiles_file": str(smi_paths["train_smi"]),
            "validation_smiles_file": str(smi_paths["val_smi"]),
            "output_model_file": str(upload_dir / f"{agent_name}.model"),
        }
    }

    toml_path = upload_dir / "transfer_learning.toml"
    with open(toml_path, "w") as f:
        toml.dump(toml_config, f)

    # Run REINVENT
    process = subprocess.run(
        f"conda run -n reinvent4 reinvent {toml_path}",
        shell=True,
        capture_output=True,
        text=True
    )

    if process.returncode != 0:
        raise HTTPException(status_code=500, detail=f"REINVENT failed: {process.stderr}")

    # Save agent to DB
    db = SessionLocal()
    prior = db.query(Prior).get(prior_id)
    if not prior:
        raise HTTPException(status_code=404, detail="Prior not found")

    agent = Agent(
        name=agent_name,
        prior_id=prior_id,
        takes_file=True,
        epochs=epochs,
        agent_path=str(upload_dir / f"{agent_name}.model")
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)

    return {
        "message": "Transfer learning completed and agent saved.",
        "agent_id": agent.id,
        "agent_name": agent.name,
        "model_path": agent.agent_path
    }

def get_run_molecules_logic(run_id: int) -> list[MoleculeDTO]:
    session: Session = SessionLocal()
    try:
        molecules = session.query(Molecule).filter(Molecule.agent_id == run_id).all()
        return [
            MoleculeDTO(
                id=m.id,
                SMILES=m.smiles,
                run_id=m.agent_id,
                score=m.score if m.score is not None else 0.0
            )
            for m in molecules
        ]
    finally:
        session.close()    