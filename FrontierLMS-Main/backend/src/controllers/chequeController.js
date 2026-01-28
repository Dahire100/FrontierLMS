const Cheque = require('../models/Cheque');

exports.getAllCheques = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const cheques = await Cheque.find({ schoolId }).sort({ createdAt: -1 });
    res.json(cheques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addCheque = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const { student, chequeNo, bankName, amount, date, status } = req.body;
    
    const newCheque = new Cheque({
      schoolId,
      student,
      chequeNo,
      bankName,
      amount,
      date,
      status
    });
    
    await newCheque.save();
    res.status(201).json(newCheque);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCheque = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCheque = await Cheque.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedCheque);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCheque = async (req, res) => {
    try {
        const { id } = req.params;
        await Cheque.findByIdAndDelete(id);
        res.json({ message: 'Cheque deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
