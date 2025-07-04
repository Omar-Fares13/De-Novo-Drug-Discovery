import os
import glob
import pandas as pd
from sqlalchemy.orm import Session
from backend.database.database import SessionLocal
from backend.models.molecule import Molecule
from molSimplify.Classes.mol3D import mol3D
from rdkit import Chem
from rdkit.Chem import AllChem
import py3Dmol
import pandas as pd
import subprocess
import toml

    
def save_molecules(path: str, agent_id: int) -> int:
    """
    Read a CSV of generated molecules and scores, then save them to the database.
    If `path` is not a full filename, treat it as a prefix and select the first matching file.
    """
    # Determine actual file to read
    csv_path = path
    if not os.path.isfile(csv_path):
        # Treat path as prefix, search for matching files
        matches = glob.glob(f"{path}*")
        if not matches:
            raise FileNotFoundError(f"No files found with prefix: {path}")
        csv_path = matches[0]

    # Load CSV
    df = pd.read_csv(csv_path)

    # Validate required columns
    for col in ("SMILES", "Score"):
        if col not in df.columns:
            raise ValueError(f"CSV is missing required column: '{col}'")

    # Open DB session and insert molecules
    session: Session = SessionLocal()
    try:
        molecules_to_add = []
        for _, row in df.iterrows():
            mol = Molecule(
                smiles=row["SMILES"],
                score=float(row["Score"]),
                agent_id=agent_id
            )
            molecules_to_add.append(mol)

        session.add_all(molecules_to_add)
        session.commit()
        return len(molecules_to_add)

    except Exception:
        session.rollback()
        raise

    finally:
        session.close()

def get_molecule(molecule_id: int) -> Molecule | None:
    """
    Retrieve a Molecule ORM object by its ID.
    Returns None if no such molecule exists.
    """
    session: Session = SessionLocal()
    try:
        # You can use session.get() in SQLAlchemy 1.4+
        molecule = session.query(Molecule).get(molecule_id)
        return molecule
    finally:
        session.close()    
def visualize_3d_from_smiles(smiles: str) -> str:
    mol = Chem.MolFromSmiles(smiles)
    if mol is None:
        raise ValueError(f"Invalid SMILES: {smiles}")

    mol = Chem.AddHs(mol)
    if AllChem.EmbedMolecule(mol, AllChem.ETKDG()) != 0:
        raise RuntimeError("3D embedding failed")
    AllChem.UFFOptimizeMolecule(mol)
    block = Chem.MolToMolBlock(mol)

    viewer = py3Dmol.view(width=400, height=400)
    viewer.addModel(block, 'mol')
    viewer.setStyle({'stick': {}})
    viewer.zoomTo()

    # use public API
    return viewer.html()
