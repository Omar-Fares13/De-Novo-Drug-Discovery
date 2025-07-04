import toml
import subprocess
import os
import shutil
from datetime import datetime
from uuid import uuid4
from sqlalchemy.orm import Session
from backend.models.prior import Prior
from backend.models.agent import Agent
from backend.database.database import SessionLocal
from backend.logic.molecules import save_molecules

def initiate_CL(prior_id: int, model_name: str, db: Session = None) -> Agent:
    # 1) Acquire a session if none provided
    external_session = db is not None
    if not external_session:
        db = SessionLocal()

    try:
        # 2) Fetch the Prior record
        prior = db.query(Prior).get(prior_id)
        if not prior:
            raise ValueError(f"No Prior with ID {prior_id}")
        print(prior.prior_path)
        # 3) Ensure the .prior file exists
        if not os.path.isfile(prior.prior_path):
            raise FileNotFoundError(f"Missing prior file at {prior.prior_path}")

        # 4) Copy the prior file to create the agent checkpoint
        new_filename = f"agent_{uuid4().hex}.prior"
        os.makedirs("agents", exist_ok=True)
        dest_path = os.path.join("agents", new_filename)
        shutil.copy(prior.prior_path, dest_path)

        # 5) Create and save the Agent record
        agent = Agent(
            name=model_name,
            prior_id=prior.id,
            takes_file=prior.takes_file,
            epochs=0,
            agent_path=dest_path
        )
        db.add(agent)
        db.commit()
        db.refresh(agent)
        print(agent.agent_path)
        return agent

    finally:
        if not external_session:
            db.close()

global_params = {
    "run_type": "staged_learning",
    "device":   "cpu",

    "parameters": {
        "summary_csv_prefix": "my_curriculum_run",
        "batch_size":         64,
        "randomize_smiles":   True,
        "unique_sequences":   True,
    },
    "learning_strategy": {
        "type":  "dap",
        "sigma": 128,
        "rate":  1e-4,
    },
    "diversity_filter": {
        "type":        "IdenticalMurckoScaffold",
        "bucket_size": 25,
        "minscore":    0.4,
    },
}


CONFIG_DIR = "backend/configs"  # Change this to your actual config directory path

def perform_stage(
    agent_id : int,
    config: dict,
) -> str:
    db: Session = SessionLocal()
    agent: Agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise ValueError(f"Agent with ID {agent_id} not found in database.")

    unique_name = f"stage_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid4().hex}.toml"
    toml_path = os.path.join(CONFIG_DIR, unique_name)
    # Write TOML file
    with open(toml_path, 'w') as f:
        toml.dump(config, f)

    # Run REINVENT4
    subprocess.run(["reinvent", toml_path], check=True)
    
    agent.name = config['stage'][0]['chkpt_file']
    db.commit()
    db.close()
    res = config['parameters']['summary_csv_prefix']
    save_molecules(res, agent_id)
    return toml_path



from typing import List, Dict

def ban_smarts(name : str, weight : float, banned_smarts : list[str]) :
    comp = {}
    endpoint = {}
    endpoint['name'] = name
    endpoint['weight'] = weight
    endpoint['params'] = {'smarts' : banned_smarts}
    comp['endpoint'] = [endpoint]
    comp['comment'] = "Generic SMARTS filters"
    return comp

def weigh_molecules(low : float, high : float, weight):
    return {"MolecularWeight": {
    "endpoint": [{
    "name": "Molecular weight",
    "weight": weight,
    "transform": {
    "type": "double_sigmoid",
    "low": low,
    "high": high,
    "coef_div": 500.0,
    "coef_si": 20.0,
    "coef_se": 20.0,
    }
    }],
    "comment": "Drug-like MW range"
    }
    }
def re_seed(path : str):
    pref = path.split('.')[0]
    ext = path.split('.')[1]
    pref = pref[0:-32] + uuid4().hex
    return pref + '.' + ext

def match_substruct(matching_weight : float, chirality : bool, smarts : str):
    return {"MatchingSubstructure": {
    "endpoint" : [{
    "name" : "Scaffold Matching",
    "weight" : matching_weight,
    "params" : {
    "smarts" : smarts,
    "use_chirality" : chirality
    }
    }],
    "comment" : "Scaffold-Based scoring"
    }
    }

def build_stage_config(
    agent_id : int = 1,
    max_score: float = 0.6,
    min_steps: int = 25,
    max_steps: int = 100,
    smarts_weight: float = 0.79,
    use_custom_alerts : bool = False,
    banned_smarts : list[str] = None,
    use_molecular_weights : bool = False,
    mw_weight: float = 0.34,
    mw_low: float = 200.0,
    mw_high: float = 500.0,
    target_substruct : bool = False,
    substruct_smarts : str = None,
    use_chirality : bool = False,
    matching_weight : float= 1
) -> Dict:
    db: Session = SessionLocal()
    agent: Agent = db.query(Agent).filter(Agent.id == agent_id).first()
    prior: Prior = db.query(Prior).filter(Prior.id == agent.prior_id).first()
    if not agent:
        raise ValueError(f"Agent with ID {agent_id} not found in database.")
        
    db.close()
    config = global_params.copy() if global_params else {}
    config.setdefault('parameters', {})
    config['parameters']['prior_file'] = prior.prior_path
    config['parameters']['agent_file'] = agent.agent_path
    config['parameters']['summary_csv_prefix'] = "staged_learning_" + uuid4().hex
    print(config['parameters']['summary_csv_prefix'])
    params = {
        "chkpt_file": re_seed(agent.agent_path),
        "termination": "simple",
        "max_score": max_score,
        "min_steps": min_steps,
        "max_steps": max_steps
        }
    scoring = {"type" : "geometric_mean", "component" : []}
    if use_custom_alerts:
        scoring['component'].append(ban_smarts("Smarts Filter", smarts_weight, banned_smarts))
    if use_molecular_weights : 
        scoring['component'].append(weigh_molecules(mw_low, mw_high, mw_weight))
    if target_substruct :
        scoring['component'].append(match_substruct(matching_weight, use_chirality, substruct_smarts))
    params["scoring"] = scoring
    config = global_params
    config.setdefault('stage', [])
    config['stage'].append(params)
    print(config['run_type'])

    return config

def test():
    agent = initiate_CL(10, "BOLBOL")
    params = build_stage_config(agent.id, use_molecular_weights = True)
    perform_stage(params)