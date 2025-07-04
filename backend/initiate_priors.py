from sqlalchemy import create_engine
from backend.models.prior import Prior
from backend.models.base import Base
from backend.database.database import SessionLocal

# Define the full list of prior filenames (extension included)
prior_files = [
    "libinvent.prior",
    "linkinvent.prior",
    "mol2mol_high_similarity.prior",
    "mol2mol_medium_similarity.prior",
    "mol2mol_mmp.prior",
    "mol2mol_scaffold.prior",
    "mol2mol_scaffold_generic.prior",
    "mol2mol_similarity.prior",
    "pubchem_ecfp4_with_count_with_rank_reinvent4_dict_voc.prior",
    "reinvent.prior"
]

# Define the ones that require an external input file (e.g., .smi)
takes_file_models = {
    "linkinvent",
    "mol2mol_high_similarity",
    "mol2mol_medium_similarity",
    "mol2mol_mmp",
    "mol2mol_scaffold",
    "mol2mol_scaffold_generic",
    "mol2mol_similarity"
}

session = SessionLocal()


# Clear the priors table
session.query(Prior).delete()
session.commit()

# Create Prior instances and insert into DB
priors = []
for filename in prior_files:
    name = filename.removesuffix(".prior")
    prior = Prior(
        name=name,
        takes_file=name in takes_file_models,
        prior_path=f"backend/priors/{filename}"
    )
    print(prior.prior_path)
    priors.append(prior)

session.add_all(priors)
session.commit()
session.close()

print(f"✅ Inserted {len(priors)} Prior entries.")
