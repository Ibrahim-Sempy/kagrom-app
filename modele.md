 **Learner** (id, matricule, firstname, lastname, email ?, phone, gender, birthDate, birthPlace, photo, photoUrl, emergencyFirstname, emergencyLastname, emergencyPhone, status)

**OperatorType** (id, label)

**Module** (id, label, operatorTypeID)

**Session** (id, name, startDate, endDate)

**TrainingLocation** (id, label)

**DurationOption** (id, label, months)

**PayementModeOption** (id, lable)

**PaymentInstall** (id, label, sortOrder)

**Disponibilité** (id, Label)

**Enrollement** (id, learnerId, registrationDate, PayementModeOptionID, registrationFee, registrationFee, aimountPaid, payementStatus)

**Household** (firstname, lastname, adress, quartier, principalPhone, secondaryPhone, email, profession)

**Employe** (firstname, lastname, birthDate, birthPlace, nationnality, matrialStatus, adress, principalPhone, secondaryPhone, typeOfID, NumberPiece, ExpirationDate, pieceJointe(oui, non), guarantFirstname, guarantLastname, lienParante, guarantAdress, guarantPhone, completFolder(bool), entretienEffect(bool), avis(favorite, surveiller, refuse), observations, Disponibilite[], posteDemande[](ServiceEmploye), Competence[](servoeEmploye))

**Assignement** (id, employeId, householdeID, services[], lieu, horairs, startDate, numberPerson, missionDetail, status)

**Invoice**  (id, InvoiceNo, typeincvoice(client, learner), enrollementID?, AssignementID?, amount, description, dueDate)

**Payement** (id, payementNo, enrollementID?, invoiceID, amount, PaidAt, PayementModeOptionID, PaymentInstallID)

**Receipt** (id, receiptNo, payementId)

**CashEntry** (id, date, label, type(recette, depense), amount, payementID justification)

**Notes** (id, learnerID, moduleID, noteTheorique, notePratique, observations)


## INSTRUCTIONS

 - le hover des boutons dur sidebar en vert comme le mot kagrom
 - le header de chaque page doit etre dynamique avec le titres corespondant, tous les cards de l'application doivent etres quasy-rectangulaire(arondi 1%)
 - le sidebar doit etre scrollable differement de la page courante, et masquable, une fois masquer il faudrait afficher des icons


- un learner peut suivre plusieur module et il fera une evaluation dans chaque module , mais il aura un seul certificat, affichant l'ensemeble des module valider avec le operoatorType

- en faisant une inscription il faut enregistrer l'apprenant d'abord puis faire l'enrollment, le payement aussi s'il y'a un amountPaid avec une transaction(c'à d les 3 enregistrement ensemble, si un echou annulé), 

- quand y'a un paiment il faut alimenter CashEntry automatiquement et le Receipt

