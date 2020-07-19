const { admin, db } = require('../util/admin');

const {
  validateBlockCreate,
  validateBlockUpdate,
  validateDocumentAccess,
} = require('../util/validators');

exports.blockCreate = async (req, res) => {
  const newBlock = {
    task: req.body.task,
    description: req.body.description,
    durationWork: req.body.durationWork,
    durationBreak: req.body.durationBreak,
    numBursts: req.body.numBursts,
    userId: req.user.uid,
    stackId: req.body.stackId,
    createdAt: new Date().toISOString(),
  };

  // validate body data
  const { errors, valid } = validateBlockCreate(newBlock);
  if (!valid) {
    console.error("[ERROR] Invalid body params");
    return res.status(400).json(errors);
  }

  const stackRequest = db.doc(`/stacks/${req.body.stackId}`);

  try {
    const stackDoc = await stackRequest.get();

    // validate access
    const { error, valid } = validateDocumentAccess(stackDoc, req.user.uid);
    if (!valid) {
      console.error("[ERROR]", error.message);
      return res.status(error.status).json(error.message);
    }

    stackData = stackDoc.data();
    stackData.id = stackDoc.id;

    // create the new block
    const blockRef = await db.collection('blocks').add(newBlock);

    newBlock.id = blockRef.id;
    stackData.order.push(blockRef.id);

    // update the stack's order
    await stackRequest.update({ order: stackData.order })

    // return both updated documents
    return res.status(200).json({ block: newBlock, stack: stackData });
  }
  catch (err) {
    console.error("[ERROR]", err);
    return res.status(500).json({ error: err.code });
  }
}

exports.blockUpdate = async (req, res) => {
  const update = {};
  if ("task" in req.body)
    update.task = req.body.task;
  if ("description" in req.body)
    update.description = req.body.description;
  if ("durationWork" in req.body)
    update.durationWork = req.body.durationWork;
  if ("durationBreak" in req.body)
    update.durationBreak = req.body.durationBreak;
  if ("numBursts" in req.body)
    update.numBursts = req.body.numBursts;

  const { errors, valid } = validateBlockUpdate(update);
  if (!valid) {
    console.error("[ERROR] Invalid body params");

    return res.status(400).json(errors);
  }

  const blockRequest = db.doc(`/blocks/${req.params.blockId}`);
  var blockData;

  try {
    const blockDoc = await blockRequest.get();

    // validate access
    const { error, valid } = validateDocumentAccess(blockDoc, req.user.uid);
    if (!valid) {
      console.error("[ERROR]", error.message);
      return res.status(error.status).json(error.message);
    }

    blockData = { id: blockDoc.id, ...blockDoc.data(), ...update };

    // update the block
    await blockRequest.update(update)

    return res.status(200).json(blockData);
  }
  catch (err) {
    console.error("[ERROR]", err);
    return res.status(500).json({ error: err.code });
  }
}

exports.blockDelete = async (req, res) => {
  const blockRequest = db.doc(`/blocks/${req.params.blockId}`);

  try {
    const blockDoc = await blockRequest.get();

    // validate access
    const { error, valid } = validateDocumentAccess(blockDoc, req.user.uid);
    if (!valid) {
      console.error("[ERROR]", error.message);
      return res.status(error.status).json(error.message);
    }

    // delete the block
    await blockRequest.delete()

    const stackRequest = db.doc(`/stacks/${blockDoc.data().stackId}`);
    const stackDoc = await stackRequest.get();

    // update the block's stack's order by removing the block from it
    await stackRequest.update({
      order: stackDoc.data().order.filter(blockId => blockId !== blockDoc.id),
    })

    return res.status(200).json({ result: 'Deleted document' });
  }
  catch (err) {
    console.error("[ERROR]", err);
    return res.status(500).json({ error: err.code });
  }
}
