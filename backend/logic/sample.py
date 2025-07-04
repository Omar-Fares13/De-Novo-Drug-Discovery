from molSimplify.Classes.mol3D import mol3D
from rdkit import Chem
from rdkit.Chem import AllChem
import py3Dmol
import pandas as pd
import subprocess
import toml

    
def create_toml(num_smiles = 157, randomize_smiles = True):
   
    config = {}
    config['run_type'] = 'sampling'
    config['device'] = 'cpu'
    config['json_out_config'] = '_sampling.json'
    
    config['parameters'] = {}
    config['parameters']['model_file'] = '../../reinvent4/priors/reinvent.prior'
    config['parameters']['output_file'] = '../../backend/results/sampling.csv'
    config['parameters']['num_smiles'] = num_smiles
    config['parameters']['randomize_smiles'] = randomize_smiles
    config['parameters']['unique_molecules'] = True
    with open('sampling.toml', 'w') as f:
        toml.dump(config, f)

create_toml()
subprocess.run("reinvent sampling.toml")
mols = pd.read_csv('../../backend/results/sampling.csv')
mol = mols['SMILES'][0]
visualize_3d_from_smiles(mol, output_html = 'mol.html')
